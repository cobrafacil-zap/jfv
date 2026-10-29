import { NextResponse } from "next/server";
// `supabase-js` reexporta o tipo do Auth como `AuthUser` (não existe um
// export chamado `User`).
import type { AuthUser } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { getSiteUrl } from "@/lib/urls";

/** Usuários por página na listagem do Auth. O limite do GoTrue é 1000. */
const PER_PAGE = 1000;

/**
 * Teto de páginas na varredura. 20 páginas x 1000 = 20 000 usuários.
 * Existe só para o laço não ser infinito se a API devolver uma página
 * vazia sem erro — nesse caso paramos no próprio `users.length === 0`.
 */
const MAX_PAGES = 20;

/** E-mails são comparados sem caixa e sem espaço nas pontas. */
const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Procura um usuário do Auth por e-mail, varrendo **todas** as páginas.
 *
 * `listUsers()` sem argumentos devolve só a primeira página (50 usuários).
 * A partir do 51º aluno o `.find()` numa página só não achava mais ninguém,
 * e o resultado silencioso dessa falha era pior que o erro.
 */
async function findAuthUserByEmail(email: string): Promise<AuthUser | null> {
  const target = normalizeEmail(email);

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: PER_PAGE,
    });

    if (error) {
      console.error(
        `[create-student-user] falha ao listar usuários (página ${page}):`,
        error
      );
      return null;
    }

    const users = data?.users ?? [];

    const found = users.find(
      (user) => user.email && normalizeEmail(user.email) === target
    );

    if (found) return found;

    // Página vazia (ou parcial) significa que não há mais o que ver.
    if (users.length < PER_PAGE) return null;
  }

  console.error(
    `[create-student-user] ${email} não encontrado em ${MAX_PAGES} páginas`
  );
  return null;
}

// Chamado pelo webhook do Mercado Pago quando um pagamento é aprovado.
// Cria o user em auth.users (se não existir), vincula ao student,
// e envia magic link para o aluno definir a senha.
export async function POST(req: Request) {
  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId é obrigatório." },
        { status: 400 }
      );
    }

    // 1) Buscar o aluno
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    // 2) Se já tem auth_user_id, não faz nada
    if (student.auth_user_id) {
      return NextResponse.json({
        ok: true,
        message: "Aluno já tem conta de acesso.",
        alreadyExists: true,
      });
    }

    // 3) Garante que exista um usuário no Auth para este e-mail.
    //
    // A ordem importa: tentamos CRIAR primeiro e só procuramos se a criação
    // for recusada. Para a maioria dos alunos (conta nova) isso é uma única
    // chamada. A busca paginada só roda no caminho raro de quem já tinha
    // conta — e é exatamente o caminho onde a busca antiga quebrava.
    //
    // Por que a criação vem primeiro: o Supabase recusa e-mail já
    // cadastrado com 422 `email_exists`. A versão anterior fazia o inverso —
    // procurava numa única página de 50 usuários, não achava e caía no
    // createUser, que retornava 422. O aluno pagava e ficava sem acesso
    // nenhum, sem nenhuma pista do motivo.
    let authUserId: string;
    let userCreated = false;

    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: student.email,
        email_confirm: true,
        user_metadata: {
          full_name: student.full_name,
          student_id: student.id,
        },
      });

    if (!createError && newUser?.user) {
      authUserId = newUser.user.id;
      userCreated = true;
    } else {
      const reason = [
        createError?.code,
        createError?.message,
      ]
        .filter(Boolean)
        .join(" ");

      // Só tratamos como "e-mail já existe" quando o erro realmente fala
      // disso. Qualquer outra falha é infraestrutura e precisa de 500.
      const emailTaken = /already|exists|registered|duplicate|taken/i.test(
        reason
      );

      if (!emailTaken) {
        console.error("Erro ao criar user:", createError);
        return NextResponse.json(
          { error: "Erro ao criar usuário de acesso." },
          { status: 500 }
        );
      }

      console.log(
        `[create-student-user] ${student.email} já existe no Auth; buscando id`
      );

      const existingUser = await findAuthUserByEmail(student.email);

      if (!existingUser) {
        // A conta existe, mas não achamos em nenhuma página. Isso significa
        // e-mail duplicado no Auth ou um volume acima do limite de varredura.
        // Vinculamos um id errado seria pior que falhar: o aluno ficaria
        // apontando para a conta de outra pessoa.
        console.error(
          `[create-student-user] e-mail ${student.email} consta como cadastrado mas não foi encontrado na varredura`
        );
        return NextResponse.json(
          {
            error:
              "Conta de e-mail duplicada no banco de autenticação. Contate o suporte.",
          },
          { status: 409 }
        );
      }

      authUserId = existingUser.id;
    }

    console.log(
      `[create-student-user] aluno ${student.id} -> auth user ${authUserId} (${
        userCreated ? "criado" : "já existente"
      })`
    );

    // 5) Vincular auth_user_id ao student
    const { error: updateError } = await supabaseAdmin
      .from("students")
      .update({ auth_user_id: authUserId })
      .eq("id", student.id);

    if (updateError) {
      console.error("Erro ao vincular user:", updateError);
      return NextResponse.json(
        { error: "Erro ao vincular usuário ao aluno." },
        { status: 500 }
      );
    }

    // 6) Enviar email de acesso
    const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const siteUrl = getSiteUrl();
    const callbackUrl = `${siteUrl}/auth/callback`;
    const firstName = student.full_name?.split(" ")[0] || "aluna";

    console.log(
      `[create-student-user] RAW env NEXT_PUBLIC_SITE_URL: ${JSON.stringify(rawSiteUrl)}`
    );
    console.log(
      `[create-student-user] Site URL (limpa): ${siteUrl}`
    );
    console.log(
      `[create-student-user] Callback URL: ${callbackUrl}`
    );

    // Gera o link de definição de senha
    // redirectTo aponta pro callback que processa os tokens
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: student.email,
        options: {
          redirectTo: callbackUrl,
        },
      });

    let emailSent = false;
    let actionLink: string | undefined;

    if (!linkError && linkData) {
      // O Supabase retorna:
      // - action_link: URL completa do Supabase com tokens (verify/v1/...)
      // - O usuário clica e o Supabase Auth faz redirect pro nosso redirectTo
      //   passando os tokens via hash (#access_token=...)
      actionLink = linkData.properties?.action_link;

      // Fallback: se não tiver action_link, monta manualmente
      // usando o verify URL do Supabase + redirectTo pro nosso callback
      if (!actionLink && linkData.properties?.hashed_token) {
        const token = linkData.properties.hashed_token;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        actionLink = `${supabaseUrl}/auth/v1/verify?type=magiclink&token=${token}&redirect_to=${encodeURIComponent(callbackUrl)}`;
      }

      console.log(
        `[create-student-user] Action link gerado para ${student.email}: ${actionLink?.substring(0, 80)}...`
      );

      if (actionLink && process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const fromAddress =
            process.env.RESEND_FROM ||
            "Priscila Sinópolis <contato@jeitofacildevender.online>";

          // Template otimizado pra não cair em spam:
          // - Texto alternativo (não só imagem)
          // - Poucos emojis
          // - Subject sem palavras gatilho
          // - From com nome real
          // - Reply-To válido
          // - Versão text/plain
          await resend.emails.send({
            from: fromAddress,
            replyTo: "priscila@jeitofacildevender.online",
            to: student.email,
            subject: `Seu acesso ao curso está pronto, ${firstName}`,
            text: `Olá, ${firstName}!

Seu pagamento foi confirmado e seu acesso ao curso "Como gravar bons vídeos pelo celular" está disponível.

Para acessar a área de membros e definir sua senha, clique no link abaixo:

${actionLink}

Este link é válido por 1 hora. Se expirar, você pode solicitar um novo na página de login.

Qualquer dúvida, é só responder este email.

Te espero lá!
Priscila Sinópolis

--
Você recebeu este email porque fez uma compra em jeitofacildevender.online.
Para não receber mais emails transacionais, entre em contato.`,
            html: `
              <!DOCTYPE html>
              <html lang="pt-BR">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Seu acesso ao curso</title>
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f5f5f5; color: #1a1a1a;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
                  <tr>
                    <td align="center" style="padding: 40px 20px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">

                        <!-- Header -->
                        <tr>
                          <td style="padding: 32px 40px 24px; border-bottom: 1px solid #eee;">
                            <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #1a1a1a;">
                              Olá, ${firstName}
                            </h1>
                          </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                          <td style="padding: 32px 40px;">
                            <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #1a1a1a;">
                              Seu pagamento foi confirmado e seu acesso ao curso <strong>Como gravar bons vídeos pelo celular</strong> está disponível.
                            </p>
                            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #1a1a1a;">
                              Para acessar a área de membros e definir sua senha, clique no botão abaixo:
                            </p>

                            <!-- Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td align="center" style="padding: 8px 0 32px;">
                                  <a href="${actionLink}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #ff2d87; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">
                                    Acessar o curso
                                  </a>
                                </td>
                              </tr>
                            </table>

                            <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.5; color: #666;">
                              Este link é válido por 1 hora. Se expirar, você pode solicitar um novo na página de login.
                            </p>
                            <p style="margin: 0 0 4px; font-size: 13px; line-height: 1.5; color: #666;">
                              Qualquer dúvida, é só responder este email.
                            </p>
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="padding: 24px 40px 32px; border-top: 1px solid #eee; background-color: #fafafa;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a;">
                              Priscila Sinópolis
                            </p>
                            <p style="margin: 0 0 16px; font-size: 12px; color: #999;">
                              Como gravar bons vídeos pelo celular
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #999;">
                              Você recebeu este email porque fez uma compra em jeitofacildevender.online.
                            </p>
                          </td>
                        </tr>

                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
            headers: {
              "X-Entity-Ref-ID": `course-access-${student.id}`,
            },
            tags: [
              { name: "category", value: "course-access" },
              { name: "student_id", value: student.id },
            ],
          });
          emailSent = true;
        } catch (resendError) {
          console.error("Erro ao enviar via Resend:", resendError);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: emailSent
        ? "Usuário criado e email de acesso enviado."
        : "Usuário criado. Aluno pode usar /login para acessar.",
      authUserId,
      magicLink: actionLink,
      siteUrl,
      callbackUrl,
    });
  } catch (error) {
    console.error("create-student-user error:", error);
    return NextResponse.json(
      { error: "Erro ao processar criação de usuário." },
      { status: 500 }
    );
  }
}