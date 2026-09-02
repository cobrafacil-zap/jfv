import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { mpClient } from "@/lib/mercadopago";

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

    const paymentClient = new Payment(mpClient);
    const result = await paymentClient.get({ id: paymentId });

    return NextResponse.json({
      id: result.id,
      status: result.status,
      statusDetail: result.status_detail,
    });
  } catch (error: any) {
    console.error("Check payment error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar pagamento." },
      { status: 500 }
    );
  }
}
