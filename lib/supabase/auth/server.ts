import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    throw new Error("Unauthorized");
  }

  const appUser = await prisma.user.upsert({
    where: { supabaseId: user.id },
    update: {
      email: user.email,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? undefined,
    },
    create: {
      supabaseId: user.id,
      email: user.email,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name,
    },
    select: {
      id: true,
      supabaseId: true,
      email: true,
      name: true,
    },
  });

  return { authUser: user, appUser };
}