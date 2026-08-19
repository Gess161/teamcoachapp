import { getAuthUserId } from "@convex-dev/auth/server";
import {
  internalMutation,
  query,
  QueryCtx,
  MutationCtx,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export async function requireCoach(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");

  const coach = await ctx.db
    .query("coaches")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (!coach) throw new Error("No coach profile linked to this account");

  return coach;
}

// Перевіряє, що спортсмен належить саме цьому тренеру.
export async function assertOwnsAthlete(
  ctx: QueryCtx | MutationCtx,
  athleteId: Id<"athletes">,
  coachId: Id<"coaches">,
) {
  const athlete = await ctx.db.get(athleteId);
  if (!athlete || athlete.coachId !== coachId) {
    throw new Error("Athlete not found");
  }
  return athlete;
}

export const getCurrentCoach = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("coaches")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

// Admin-only: змінює вид спорту тренера (виправлення після заведення реальної команди).
export const updateSport = internalMutation({
  args: { email: v.string(), sport: v.string() },
  handler: async (ctx, { email, sport }) => {
    const coach = await ctx.db
      .query("coaches")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!coach) throw new Error("Coach not found");
    await ctx.db.patch(coach._id, { sport });
  },
});

// Admin-only: створює або знаходить профіль тренера і прив'язує його до
// облікового запису Convex Auth з даним email. Викликається через
// `npx convex run` під час ручного заведення тренера, не з клієнта.
export const provisionCoachForUser = internalMutation({
  args: { email: v.string(), name: v.string(), sport: v.string() },
  handler: async (ctx, { email, name, sport }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();
    if (!user) throw new Error("No auth user found for this email");

    const existing = await ctx.db
      .query("coaches")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { userId: user._id });
      return existing._id;
    }

    return await ctx.db.insert("coaches", {
      userId: user._id,
      name,
      email,
      sport,
    });
  },
});
