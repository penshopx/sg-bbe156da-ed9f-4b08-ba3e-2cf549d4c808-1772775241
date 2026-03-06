import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import crypto from "crypto";

/* eslint-disable @typescript-eslint/no-require-imports */
const midtransClient = require("midtrans-client");

// Initialize API client for verification
const apiClient = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

function generateSignatureKey(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string
): string {
  const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  return crypto.createHash("sha512").update(signatureString).digest("hex");
}

type TransactionMetadata = {
  plan_id: string;
  start_date: string;
  end_date: string;
  billing_cycle?: string;
  plan_name?: string;
  midtrans_status?: string;
  fraud_status?: string;
  payment_type?: string;
  settlement_time?: string;
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

    // Verify signature
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = notification;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const expectedSignature = generateSignatureKey(
      order_id,
      status_code,
      gross_amount,
      serverKey
    );

    if (signature_key !== expectedSignature) {
      console.error("Invalid signature");
      return res.status(403).json({ error: "Invalid signature" });
    }

    // Get transaction status from Midtrans
    const statusResponse = await apiClient.transaction.status(order_id);

    // Determine final status
    let finalStatus: "pending" | "completed" | "failed" = "pending";

    if (transaction_status === "capture") {
      if (fraud_status === "accept") {
        finalStatus = "completed";
      }
    } else if (transaction_status === "settlement") {
      finalStatus = "completed";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      finalStatus = "failed";
    }

    // Update transaction status in database
    const { data: transactionData, error: fetchError } = await supabase
      .from("payment_transactions")
      .select("user_id, metadata")
      .eq("transaction_id", order_id)
      .single();

    if (fetchError || !transactionData) {
      console.error("Transaction not found:", order_id);
      return res.status(404).json({ error: "Transaction not found" });
    }

    const metadata = transactionData.metadata as TransactionMetadata;

    // Fix: Use explicit any type for payload to prevent deep type instantiation error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: any = {
      status: finalStatus,
      payment_method: payment_type,
      metadata: {
        ...metadata,
        midtrans_status: transaction_status,
        fraud_status: fraud_status,
        payment_type: payment_type,
        settlement_time: statusResponse.settlement_time,
      },
    };

    // Update transaction status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from("payment_transactions") as any)
      .update(updatePayload)
      .eq("transaction_id", order_id);

    if (updateError) {
      console.error("Failed to update transaction:", updateError);
      return res.status(500).json({ error: "Failed to update transaction" });
    }

    // If payment successful, activate subscription
    if (finalStatus === "completed") {
      // Check if subscription already exists
      const { data: existingSub } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", transactionData.user_id)
        .single();

      if (existingSub) {
        // Update existing subscription
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
        // Create new subscription
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