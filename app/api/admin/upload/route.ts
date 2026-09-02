import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-api";

const MAX_SIZES: Record<string, number> = {
  video: 1024 * 1024 * 1024, // 1 GB
  bonus: 100 * 1024 * 1024, // 100 MB
  image: 10 * 1024 * 1024, // 10 MB
};

const BUCKETS: Record<string, string> = {
  video: "lessons",
  bonus: "bonuses",
  image: "course-assets",
};

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const type = form.get("type") as string | null;
    const folder = (form.get("folder") as string | null) || "";

    if (!file || !type) {
      return NextResponse.json(
        { error: "Arquivo ou tipo ausente." },
        { status: 400 }
      );
    }

    const bucket = BUCKETS[type];
    if (!bucket) {
      return NextResponse.json(
        { error: "Tipo inválido. Use video, bonus ou image." },
        { status: 400 }
      );
    }

    const maxSize = MAX_SIZES[type];
    if (file.size > maxSize) {
      const mb = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `Arquivo maior que ${mb} MB.` },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${folder ? folder + "/" : ""}${randomUUID()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Gera URL pública para imagens; signed URL para vídeo/bônus
    let url: string | null = null;
    let path = fileName;

    if (type === "image") {
      const { data: pub } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(fileName);
      url = pub.publicUrl;
    } else {
      const { data: signed } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 ano
      url = signed?.signedUrl ?? null;
    }

    return NextResponse.json({ url, path });
  } catch (err) {
    console.error("Erro no upload:", err);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo." },
      { status: 500 }
    );
  }
}
