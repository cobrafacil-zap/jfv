import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-api";

// GET /api/admin/lessons/[id]/materials
// Lista os materiais da aula
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { data, error } = await supabaseAdmin
    .from("lesson_materials")
    .select("*")
    .eq("lesson_id", params.id)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Erro ao listar materiais:", error);
    return NextResponse.json(
      { error: "Erro ao listar materiais." },
      { status: 500 }
    );
  }

  return NextResponse.json({ materials: data || [] });
}

const materialSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(["file", "link"]),
  file_path: z.string().optional().nullable(),
  file_url: z.string().url().optional().nullable(),
  file_size: z.number().int().optional().nullable(),
  order_index: z.number().int().min(0).default(0),
});

// POST /api/admin/lessons/[id]/materials
// Adiciona UM material
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const body = await req.json();
    const parsed = materialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("lesson_materials")
      .insert({
        lesson_id: params.id,
        title: parsed.data.title,
        type: parsed.data.type,
        file_path: parsed.data.file_path || null,
        file_url: parsed.data.file_url || null,
        file_size: parsed.data.file_size || null,
        order_index: parsed.data.order_index,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ material: data });
  } catch (err) {
    console.error("Erro ao criar material:", err);
    return NextResponse.json(
      { error: "Erro ao criar material." },
      { status: 500 }
    );
  }
}

const materialsListSchema = z.object({
  materials: z.array(
    z.object({
      title: z.string().min(1).max(200),
      type: z.enum(["file", "link"]),
      file_path: z.string().optional().nullable(),
      file_url: z.string().optional().nullable(),
      file_size: z.number().optional().nullable(),
    })
  ),
});

// PUT /api/admin/lessons/[id]/materials
// Substitui TODOS os materiais da aula (delete + insert)
// Usado pelo MaterialEditor pra salvar a lista inteira
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const body = await req.json();
    const parsed = materialsListSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    // 1) Apaga todos os materiais antigos
    const { error: delError } = await supabaseAdmin
      .from("lesson_materials")
      .delete()
      .eq("lesson_id", params.id);

    if (delError) throw delError;

    // 2) Insere os novos
    if (parsed.data.materials.length > 0) {
      const rows = parsed.data.materials.map((m, i) => ({
        lesson_id: params.id,
        title: m.title,
        type: m.type,
        file_path: m.file_path || null,
        file_url: m.file_url || null,
        file_size: m.file_size || null,
        order_index: i,
      }));

      const { error: insError } = await supabaseAdmin
        .from("lesson_materials")
        .insert(rows);

      if (insError) throw insError;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao salvar materiais:", err);
    return NextResponse.json(
      { error: "Erro ao salvar materiais." },
      { status: 500 }
    );
  }
}