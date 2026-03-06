import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

type CreatePaymentRequest = {
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

  const apiKey = process.env.MAYAR_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Payment gateway not configured" });
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
    } = req.body as CreatePaymentRequest;

    if (!planId || !planName || !planPrice || !userId || !userEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const orderId = `CHAESA-${Date.now()}-${userId.substring(0, 8)}`;

    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === "annual") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const { error: dbError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: userId,
        amount: planPrice,
        currency: "IDR",
        payment_method: "mayar",
        status: "pending",
        transaction_id: orderId,
        metadata: {
          plan_id: planId,
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

    const isProduction = process.env.MAYAR_IS_PRODUCTION === "true";
    const baseApiUrl = isProduction
      ? "https://api.mayar.id/hl/v1"
      : "https://api.mayar.club/hl/v1";

    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

    const mayarResponse = await fetch(`${baseApiUrl}/invoice`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userName || "User",
        email: userEmail,
        mobile: "0000000000",
        redirectUrl: `${siteUrl}/payment/success?order_id=${orderId}`,
        description: `Chaesa Live - ${planName} (${billingCycle === "annual" ? "Annual" : "Monthly"})`,
        items: [
          {
            quantity: 1,
            rate: planPrice,
            description: `${planName} - ${billingCycle === "annual" ? "Annual" : "Monthly"} Subscription`,
          },
        ],
      }),
    });

    const mayarData = await mayarResponse.json();

    if (!mayarResponse.ok) {
      console.error("Mayar API error:", mayarData);
      return res.status(500).json({ error: "Failed to create payment" });
    }

    const paymentLink = mayarData?.data?.link || mayarData?.link;

    // @ts-expect-error Supabase type instantiation too deep for metadata JSON field
    await supabase
      .from("payment_transactions")
      .update({
        metadata: {
          plan_id: planId,
          billing_cycle: billingCycle,
          plan_name: planName,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          mayar_id: mayarData?.data?.id || null,
        },
      })
      .eq("transaction_id", orderId);

    return res.status(200).json({
      success: true,
      paymentLink,
      orderId,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({
      error: "Failed to create payment",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
