import { NextResponse } from "next/server";
import { createPaymentPreference } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase";
import { isValidCPF, getCPFForMP } from "@/lib/cpf";

const PRICE = 4.99;

// Detecta se estamos em modo de teste do MP
const IS_TEST_MODE =
  (process.env.MERCADOPAGO_ACCESS_TOKEN || "").startsWith("TEST-");

export async function POST(req: Request) {
  try {
    // Verifica se as credenciais do MP estão configuradas
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error("MERCADOPAGO_ACCESS_TOKEN não configurado");
      return NextResponse.json(
        {
          error:
            "Pagamento temporariamente indisponível. Entre em contato com o suporte.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { fullName, email, phone, cpf } = body;

    // Validação
    if (!fullName || !email || !cpf) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    // Validação de e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "E-mail inválido." },
        { status: 400 }
      );
    }

    // Validação de CPF (11 dígitos e dígitos verificadores válidos)
    const cpfClean = cpf.replace(/\D/g, "");
    if (cpfClean.length !== 11 || !isValidCPF(cpfClean)) {
      return NextResponse.json(
        { error: "CPF inválido. Verifique os números." },
        { status: 400 }
      );
    }

    // CPF que será enviado pro MP (em teste, usa CPF de teste se inválido)
    const cpfForMP = getCPFForMP(cpfClean, IS_TEST_MODE);

    // Cria aluno no Supabase com status pending
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .insert({
        full_name: fullName,
        email,
        phone: phone || null,
        cpf: cpfClean,
        status: "pending",
        amount_paid: PRICE,
      })
      .select()
      .single();

    if (studentError) {
      console.error("Supabase error:", studentError);
      // Possível duplicado (e-mail ou CPF já cadastrado)
      if (studentError.code === "23505") {
        return NextResponse.json(
          { error: "Este e-mail ou CPF já está cadastrado." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Erro ao processar cadastro. Tente novamente." },
        { status: 500 }
      );
    }

    // Limpa telefone
    const phoneClean = phone?.replace(/\D/g, "") || "";

    // Cria preferência no Mercado Pago
    let preference;
    try {
      preference = await createPaymentPreference({
        items: [
          {
            id: "curso-priscila-videos",
            title: "Como gravar bons vídeos pelo celular",
            description: "Curso completo com 6 módulos + bônus exclusivos",
            quantity: 1,
            unit_price: PRICE,
          },
        ],
        payer: {
          name: fullName,
          email,
          phone: phoneClean
            ? {
                area_code: phoneClean.slice(0, 2),
                number: phoneClean.slice(2),
              }
            : undefined,
          identification: {
            type: "CPF",
            number: cpfForMP,
          },
        },
        external_reference: student.id,
      });
    } catch (mpError: any) {
      console.error("MercadoPago error:", mpError);
      // Remove o aluno pending já que o pagamento falhou
      await supabaseAdmin.from("students").delete().eq("id", student.id);

      return NextResponse.json(
        {
          error:
            "Não foi possível iniciar o pagamento. Verifique os dados e tente novamente.",
        },
        { status: 502 }
      );
    }

    // Salva ID da preferência no aluno
    await supabaseAdmin
      .from("students")
      .update({ mercadopago_preference_id: preference.id })
      .eq("id", student.id);

    return NextResponse.json({
      preferenceId: preference.id,
      studentId: student.id,
    });
  } catch (error: any) {
    console.error("Create preference error:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar. Tente novamente em alguns instantes.",
      },
      { status: 500 }
    );
  }
}
