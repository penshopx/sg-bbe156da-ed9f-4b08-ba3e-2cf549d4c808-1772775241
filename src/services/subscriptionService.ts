import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];
type UserSubscription = Database["public"]["Tables"]["user_subscriptions"]["Row"];
type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];
type PaymentTransaction = Database["public"]["Tables"]["payment_transactions"]["Row"];

export const subscriptionService = {
  // Get all active subscription plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (error) {
      console.error("Error fetching plans:", error);
      throw error;
    }

    return data || [];
  },

  // Get user's current subscription
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user subscription:", error);
      throw error;
    }

    return data || null;
  },

  // Create or update subscription
  async subscribe(
    userId: string,
    planId: string,
    billingCycle: "monthly" | "yearly"
  ): Promise<UserSubscription> {
    const periodEnd = new Date();
    if (billingCycle === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const { data, error } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: userId,
        plan_id: planId,
        billing_cycle: billingCycle,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }

    return data;
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId);

    if (error) {
      console.error("Error canceling subscription:", error);
      throw error;
    }
  },

  // Log usage event
  async logUsage(
    userId: string | null,
    meetingId: string,
    eventType: UsageLog["event_type"],
    metadata?: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase.from("usage_logs").insert({
      user_id: userId,
      meeting_id: meetingId,
      event_type: eventType,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error logging usage:", error);
      // Don't throw - usage logging should not break the app
    }
  },

  // Get user usage statistics
  async getUserUsage(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalMinutes: number;
    totalMeetings: number;
    averageParticipants: number;
  }> {
    let query = supabase
      .from("usage_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("event_type", "meeting_ended");

    if (startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }
    if (endDate) {
      query = query.lte("created_at", endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching usage:", error);
      throw error;
    }

    const logs = data || [];
    const totalMinutes = logs.reduce(
      (sum, log) => sum + (log.duration_minutes || 0),
      0
    );
    const totalMeetings = logs.length;
    const averageParticipants =
      logs.length > 0
        ? logs.reduce((sum, log) => sum + (log.participant_count || 0), 0) /
          logs.length
        : 0;

    return {
      totalMinutes,
      totalMeetings,
      averageParticipants: Math.round(averageParticipants),
    };
  },

  // Check if user can create meeting based on subscription limits
  async canCreateMeeting(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    maxParticipants?: number;
    maxDuration?: number;
  }> {
    const subscription = await this.getUserSubscription(userId);

    // No subscription = free tier
    if (!subscription) {
      return {
        allowed: true,
        maxParticipants: 100,
        maxDuration: 40,
        reason: "Free tier limits",
      };
    }

    const plan = subscription.subscription_plans as unknown as SubscriptionPlan;

    return {
      allowed: true,
      maxParticipants: plan.max_participants,
      maxDuration: plan.max_duration_minutes || undefined,
    };
  },

  // Create payment transaction
  async createTransaction(
    userId: string,
    amount: number,
    currency: string,
    paymentMethod: PaymentTransaction["payment_method"],
    metadata?: Record<string, any>
  ): Promise<PaymentTransaction> {
    const { data, error } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: userId,
        amount,
        currency,
        payment_method: paymentMethod,
        status: "pending",
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }

    return data;
  },

  // Update transaction status
  async updateTransactionStatus(
    transactionId: string,
    status: PaymentTransaction["status"],
    paymentId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from("payment_transactions")
      .update({
        status,
        payment_id: paymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId);

    if (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },
};