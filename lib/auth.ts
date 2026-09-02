import { createSupabaseServerClient } from "./supabase-server";
import { supabaseAdmin } from "./supabase";

export async function getSession() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentStudent() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: student } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  return student;
}

export async function getCurrentAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: admin } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  return admin;
}

export async function isAdmin() {
  const admin = await getCurrentAdmin();
  return !!admin;
}

export async function isActiveStudent() {
  const student = await getCurrentStudent();
  return student?.status === "active";
}