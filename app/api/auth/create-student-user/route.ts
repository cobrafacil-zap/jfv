import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { getSiteUrl } from "@/lib/urls";

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

    // 3) Verificar se já existe user com esse email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === student.email
    );

    let authUserId: string;

    if (existingUser) {
      authUserId = existingUser.id;
    } else {
      // 4) Criar novo user em auth.users (já confirmado, sem verificação)
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: student.email,
          email_confirm: true,
          user_metadata: {
            full_name: student.full_name,
            student_id: student.id,
          },
        });

      if (createError || !newUser.user) {
        console.error("Erro ao criar user:", createError);
        return NextResponse.json(
          { error: "Erro ao criar usuário de acesso." },
          { status: 500 }
        );
      }

      authUserId = newUser.user.id;
    }

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