import { supabase } from "@/integrations/supabase/client";

/**
 * Subscription Access Control Middleware
 * Checks if user has required subscription plan to access features
 */

export type SubscriptionPlan = "free" | "pro" | "business" | "yearly";

export interface SubscriptionStatus {
  plan: SubscriptionPlan;
  isActive: boolean;
  expiresAt: string | null;
  canAccess: {
    aiCourseGenerator: boolean;
    liveSalesCTA: boolean;
    unlimitedMeetings: boolean;
    studioMode: boolean;
    analytics: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
  };
}

/**
 * Get user's subscription status and feature access
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("subscription_plan, subscription_expires_at")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      console.error("Error fetching subscription:", error);
      return null;
    }

    const plan = profile.subscription_plan as SubscriptionPlan;
    const expiresAt = profile.subscription_expires_at;
    
    // Check if subscription is active
    const isActive = !expiresAt || new Date(expiresAt) > new Date();

    // Define feature access based on plan
    const canAccess = {
      aiCourseGenerator: plan !== "free" && isActive,
      liveSalesCTA: plan !== "free" && isActive,
      unlimitedMeetings: plan !== "free" && isActive,
      studioMode: plan !== "free" && isActive,
      analytics: ["business", "yearly"].includes(plan) && isActive,
      customBranding: ["business", "yearly"].includes(plan) && isActive,
      prioritySupport: plan !== "free" && isActive,
    };

    return {
      plan,
      isActive,
      expiresAt,
      canAccess,
    };
  } catch (error) {
    console.error("Error in getSubscriptionStatus:", error);
    return null;
  }
}

/**
 * Check if user can access a specific feature
 */
export async function canAccessFeature(
  userId: string,
  feature: keyof SubscriptionStatus["canAccess"]
): Promise<boolean> {
  const status = await getSubscriptionStatus(userId);
  if (!status) return false;
  return status.canAccess[feature];
}

/**
 * Require subscription middleware for API routes
 */
export async function requireSubscription(
  userId: string,
  minimumPlan: SubscriptionPlan = "pro"
): Promise<{ allowed: boolean; message?: string }> {
  const status = await getSubscriptionStatus(userId);

  if (!status) {
    return {
      allowed: false,
      message: "Could not verify subscription status",
    };
  }

  if (!status.isActive) {
    return {
      allowed: false,
      message: "Your subscription has expired. Please renew to continue using this feature.",
    };
  }

  const planHierarchy: SubscriptionPlan[] = ["free", "pro", "business", "yearly"];
  const userPlanLevel = planHierarchy.indexOf(status.plan);
  const requiredPlanLevel = planHierarchy.indexOf(minimumPlan);

  if (userPlanLevel < requiredPlanLevel) {
    return {
      allowed: false,
      message: `This feature requires ${minimumPlan} plan or higher. Please upgrade your subscription.`,
    };
  }

  return { allowed: true };
}

/**
 * Check meeting time limits based on user plan
 */
export async function checkMeetingLimits(
  meetingId: string,
  userId: string
): Promise<{
  shouldEnd: boolean;
  reason?: "duration" | "participants";
  timeRemaining?: number;
  maxDuration?: number;
  isPro?: boolean;
} | null> {
  try {
    const { data, error } = await supabase.rpc("check_meeting_limits", {
      p_meeting_id: meetingId,
      p_user_id: userId,
    });

    if (error) {
      console.error("Error checking meeting limits:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in checkMeetingLimits:", error);
    return null;
  }
}

/**
 * Get feature limits based on plan
 */
export function getFeatureLimits(plan: SubscriptionPlan) {
  const limits = {
    free: {
      meetingDuration: 40, // minutes
      maxParticipants: 100,
      aiCourseGeneration: 0,
      liveSalesCTA: 0,
      storage: 1, // GB
      recordings: 0,
    },
    pro: {
      meetingDuration: null, // unlimited
      maxParticipants: 100,
      aiCourseGeneration: null, // unlimited
      liveSalesCTA: null, // unlimited
      storage: 10, // GB
      recordings: null, // unlimited
    },
    business: {
      meetingDuration: null,
      maxParticipants: 300,
      aiCourseGeneration: null,
      liveSalesCTA: null,
      storage: 100, // GB
      recordings: null,
    },
    yearly: {
      meetingDuration: null,
      maxParticipants: 100,
      aiCourseGeneration: null,
      liveSalesCTA: null,
      storage: 50, // GB
      recordings: null,
    },
  };

  return limits[plan];
}