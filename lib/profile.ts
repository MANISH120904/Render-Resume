import { createInsforgeServer } from "@/lib/insforge-server";

export type UserProfile = {
  currentCredits: number;
  fullName: string | null;
};

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const insforge = await createInsforgeServer();
    const { data, error } = await insforge.database
      .from("profiles")
      .select("current_credits, full_name")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("[lib/profile]", error);
      return null;
    }

    return {
      currentCredits: data.current_credits ?? 0,
      fullName: data.full_name,
    };
  } catch (error) {
    console.error("[lib/profile]", error);
    return null;
  }
}
