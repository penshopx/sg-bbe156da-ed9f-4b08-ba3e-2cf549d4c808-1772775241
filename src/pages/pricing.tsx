import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { Check, X, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { subscriptionService } from "@/services/subscriptionService";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await subscriptionService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error("Error loading plans:", error);
      toast({
        title: "Error",
        description: "Failed to load pricing plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    if (billingCycle === "monthly") {
      return plan.price_monthly;
    }
    return plan.price_yearly;
  };

  const getPricePerMonth = (plan: SubscriptionPlan) => {
    if (billingCycle === "monthly") {
      return plan.price_monthly;
    }
    return plan.price_yearly ? (plan.price_yearly / 12).toFixed(2) : 0;
  };

  const getSavings = (plan: SubscriptionPlan) => {
    if (!plan.price_yearly || billingCycle === "monthly") return 0;
    const yearlyMonthly = plan.price_monthly * 12;
    const savings = yearlyMonthly - plan.price_yearly;
    return Math.round((savings / yearlyMonthly) * 100);
  };

  const getFeatures = (plan: SubscriptionPlan): string[] => {
    if (Array.isArray(plan.features)) {
      return plan.features as string[];
    }
    return [];
  };

  const featureLabels: Record<string, string> = {
    unlimited_1on1: "Unlimited 1-on-1 meetings",
    screen_sharing: "Screen sharing",
    chat: "Group chat",
    reactions: "Reactions & emojis",
    local_recording: "Local recording",
    unlimited_duration: "Unlimited meeting duration",
    cloud_recording: "Cloud recording",
    breakout_rooms: "Breakout rooms",
    polls: "Live polls",
    whiteboard: "Collaborative whiteboard",
    priority_support: "Priority support",
    custom_backgrounds: "Custom virtual backgrounds",
    custom_branding: "Custom branding",
    advanced_analytics: "Advanced analytics",
    api_access: "API access",
    unlimited_participants: "Unlimited participants",
    unlimited_storage: "Unlimited cloud storage",
    dedicated_server: "Dedicated server",
    sla_guarantee: "SLA guarantee",
    white_label: "White-label solution",
    custom_integration: "Custom integrations",
    dedicated_support: "Dedicated support manager",
  };

  return (
    <>
      <Head>
        <title>Pricing - Chaesa Live</title>
        <meta name="description" content="Choose the perfect plan for your video conferencing needs" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        {/* Header */}
        <div className="border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Chaesa Live</span>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Choose the plan that fits your needs. Start free, upgrade anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-white" : "text-gray-400"}`}>
                Monthly
              </span>
              <Switch
                checked={billingCycle === "yearly"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
              />
              <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-white" : "text-gray-400"}`}>
                Yearly
                <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                  Save up to 20%
                </Badge>
              </span>
            </div>
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="text-center text-white">Loading plans...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, index) => {
                const features = getFeatures(plan);
                const price = getPrice(plan);
                const pricePerMonth = getPricePerMonth(plan);
                const savings = getSavings(plan);
                const isPopular = plan.name === "Pro";
                const isFree = plan.price_monthly === 0 && plan.name === "Free";
                const isEnterprise = plan.name === "Enterprise";

                return (
                  <Card
                    key={plan.id}
                    className={`relative ${
                      isPopular
                        ? "border-2 border-blue-500 shadow-xl shadow-blue-500/20"
                        : "border-white/10"
                    } bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Price */}
                      <div>
                        {isEnterprise ? (
                          <div className="text-4xl font-bold text-white">Custom</div>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold text-white">
                                ${pricePerMonth}
                              </span>
                              <span className="text-gray-400">/month</span>
                            </div>
                            {billingCycle === "yearly" && !isFree && (
                              <div className="text-sm text-gray-400 mt-1">
                                Billed ${price}/year
                                {savings > 0 && (
                                  <span className="text-green-400 ml-1">
                                    (Save {savings}%)
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Limits */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-300">
                          <span>Max Participants</span>
                          <span className="font-semibold text-white">
                            {plan.max_participants === 1000 ? "Unlimited" : plan.max_participants}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Meeting Duration</span>
                          <span className="font-semibold text-white">
                            {plan.max_duration_minutes ? `${plan.max_duration_minutes} min` : "Unlimited"}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Cloud Storage</span>
                          <span className="font-semibold text-white">
                            {plan.cloud_storage_gb === 100 ? "Unlimited" : `${plan.cloud_storage_gb}GB`}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-white">Features:</p>
                        {features.slice(0, 5).map((feature) => (
                          <div key={feature} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <span className="text-sm text-gray-300">
                              {featureLabels[feature] || feature}
                            </span>
                          </div>
                        ))}
                        {features.length > 5 && (
                          <p className="text-sm text-gray-400">
                            + {features.length - 5} more features
                          </p>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Link href={isFree ? "/" : "/dashboard"} className="w-full">
                        <Button
                          className={`w-full ${
                            isPopular
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-white/10 hover:bg-white/20 text-white"
                          }`}
                        >
                          {isFree ? "Get Started Free" : isEnterprise ? "Contact Sales" : "Upgrade Now"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4 text-left">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Can I upgrade or downgrade anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the charges.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">What payment methods do you accept?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and local payment methods through Midtrans (for Indonesian users: BCA, Mandiri, GoPay, etc).
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Is there a free trial for paid plans?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Yes! All paid plans come with a 14-day free trial. No credit card required to start your trial.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">What happens if I exceed my plan limits?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    We'll notify you when you're approaching your limits. You can upgrade at any time to continue without interruption. We never cut you off mid-meeting!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}