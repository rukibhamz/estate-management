export const SUBSCRIPTION_PLANS = ["TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"] as const;
export const SUBSCRIPTION_STATUSES = ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED"] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
