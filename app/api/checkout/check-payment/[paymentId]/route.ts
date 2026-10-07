import { NextResponse } from "next/server";
import { getPayment } from "@/lib/mercadopago";

// Consulta usada pelo polling do Pix. Leitura pura, então pode repetir sem
// risco.
export const maxDuration = 15;

export async function GET(
  req: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID ausente." },
        { status: 400 }
      );
    }

    const result = await getPayment(paymentId);

    return NextResponse.json({
      id: result.id,
      status: result.status,
      statusDetail: result.status_detail,
    });
  } catch (error: any) {
    console.error("Check payment error:", error);

    // O polling chama isto a cada 3s. Responder erro definitivo aqui faz o
    // front tratar uma falha temporária do MP como pagamento rejeitado e
    // limpar o QR Code — que ainda estava válido. Então 503, e o front segue
    // aguardando.
    return NextResponse.json(
      { error: "Não foi possível consultar o pagamento. Tentando de novo." },
      { status: 503, headers: { "Retry-After": "3" } }
    );
  }
}