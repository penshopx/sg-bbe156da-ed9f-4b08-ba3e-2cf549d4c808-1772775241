import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

const midtransClient = require("midtrans-client");

// Initialize Snap API client
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

type CreateSubscriptionRequest = {
  planId: string;
  planName: string;
  planPrice: number;
  billingCycle: "monthly" | "annual";
  userId: string;
  userEmail: string;
  userName: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      planId,
      planName,
      planPrice,
      billingCycle,
      userId,
      userEmail,
      userName,
    } = req.body as CreateSubscriptionRequest;

    // Validate required fields
    if (!planId || !planName || !planPrice || !userId || !userEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create order ID
    const orderId = `CHAESA-${Date.now()}-${userId.substring(0, 8)}`;

    // Calculate end date based on billing cycle
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === "annual") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create transaction record in database
    const { error: dbError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: userId,
        subscription_plan_id: planId,
        amount: planPrice,
        currency: "IDR",
        payment_method: "midtrans",
        status: "pending",
        transaction_id: orderId,
        metadata: {
          billing_cycle: billingCycle,
          plan_name: planName,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        },
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({ error: "Failed to create transaction" });
    }

    // Create Midtrans transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: planPrice,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: userName || "User",
        email: userEmail,
      },
      item_details: [
        {
          id: planId,
          price: planPrice,
          quantity: 1,
          name: `${planName} - ${billingCycle === "annual" ? "Annual" : "Monthly"}`,
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?order_id=${orderId}`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?order_id=${orderId}`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending?order_id=${orderId}`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return res.status(200).json({
      success: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId,
    });
  } catch (error) {
    console.error("Midtrans error:", error);
    return res.status(500).json({
      error: "Failed to create payment",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}