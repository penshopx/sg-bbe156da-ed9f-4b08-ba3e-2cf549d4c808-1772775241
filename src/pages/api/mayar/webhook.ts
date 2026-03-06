import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

type TransactionMetadata = {
  plan_id: string;
  start_date: string;
  end_date: string;
  billing_cycle?: string;
  plan_name?: string;
  mayar_id?: string;
  mayar_status?: string;
  payment_type?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const notification = req.body;
    const event = notification?.event;
    const data = notification?.data;

    if (!event || !data) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const mayarId = data?.id;
    const status = data?.status;

    if (!mayarId) {
      return res.status(400).json({ error: "Missing transaction ID" });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: transactionData, error: fetchError } = await (supabase.from("payment_transactions") as any)
      .select("user_id, metadata, transaction_id")
      .or(`metadata->>mayar_id.eq.${mayarId},transaction_id.eq.${mayarId}`)
      .single();

    if (fetchError || !transactionData) {
      console.error("Transaction not found for mayar_id:", mayarId);
      return res.status(404).json({ error: "Transaction not found" });
    }

    const metadata = transactionData.metadata as TransactionMetadata;

    let finalStatus: "pending" | "completed" | "failed" = "pending";
    if (event === "payment.received" || status === "paid" || status === "completed") {
      finalStatus = "completed";
    } else if (status === "failed" || status === "expired" || status === "cancelled") {
      finalStatus = "failed";
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: any = {
      status: finalStatus,
      payment_method: "mayar",
      metadata: {
        ...metadata,
        mayar_status: status,
        mayar_event: event,
      },
    };

    const { error: updateError } = await (supabase.from("payment_transactions") as any)
      .update(updatePayload)
      .eq("transaction_id", transactionData.transaction_id);

    if (updateError) {
      console.error("Failed to update transaction:", updateError);
      return res.status(500).json({ error: "Failed to update transaction" });
    }

    if (finalStatus === "completed") {
      const { data: existingSub } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", transactionData.user_id)
        .single();

      if (existingSub) {
        await supabase
          .from("user_subscriptions")
          .update({
            plan_id: metadata.plan_id,
            status: "active",
            current_period_start: metadata.start_date,
            current_period_end: metadata.end_date,
          })
          .eq("user_id", transactionData.user_id);
      } else {
        await supabase.from("user_subscriptions").insert({
          user_id: transactionData.user_id,
          plan_id: metadata.plan_id,
          status: "active",
          current_period_start: metadata.start_date,
          current_period_end: metadata.end_date,
          billing_cycle: metadata.billing_cycle === "annual" ? "yearly" : "monthly",
        });
      }
    }

    return res.status(200).json({
      success: true,
      status: finalStatus,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({
      error: "Webhook processing failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
