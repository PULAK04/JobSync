export const CREDIT_PLANS = Object.freeze({
    starter: Object.freeze({ id: "starter", name: "Starter", credits: 10, amount: 4900, currency: "INR" }),
    popular: Object.freeze({ id: "popular", name: "Popular", credits: 30, amount: 9900, currency: "INR" }),
    pro: Object.freeze({ id: "pro", name: "Pro", credits: 100, amount: 24900, currency: "INR" })
});

export const publicCreditPlans = () => Object.values(CREDIT_PLANS).map((plan) => ({
    ...plan,
    displayAmount: plan.amount / 100
}));
