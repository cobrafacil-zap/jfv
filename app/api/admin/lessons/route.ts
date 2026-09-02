import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-api";

const lessonSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  video_url: z.string().url().optional().or(z.literal("")),
  video_path: z.string().optional().or(z.literal("")),
  duration_seconds: z.number().int().min(0).optional(),
  order_index: z.number().int().min(0).default(0),
  is_published: z.boolean().default(false),
});

export async function GET(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("course_id");

  let query = supabaseAdmin
    .from("lessons")
    .select("*, course:courses(id, title)")
    .order("order_index");

  if (courseId) query = query.eq("course_id", courseId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ lessons: data });
}

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const body = await req.json();
    const parsed = lessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("lessons")
      .insert({
        course_id: parsed.data.course_id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        video_url: parsed.data.video_url || null,
        video_path: parsed.data.video_path || null,
        duration_seconds: parsed.data.duration_seconds || 0,
        order_index: parsed.data.order_index,
        is_published: parsed.data.is_published,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ lesson: data });
  } catch (err) {
    console.error("Erro ao criar aula:", err);
    return NextResponse.json(
      { error: "Erro ao criar aula." },
      { status: 500 }
    );
  }
}
