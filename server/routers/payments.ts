import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2026-07-29.dahlia" });

export const paymentsRouter = router({
  createCheckout: publicProcedure
    .input(z.object({
      planId: z.string(),
      planName: z.string(),
      amount: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const origin = ctx.req.headers.origin || "https://whatsapptaxi-jkudqcvs.manus.space";
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `WhatsAppTaxi — Plan ${input.planName}`,
              description: `Suscripción mensual al Plan ${input.planName} de WhatsApp Taxi SaaS`,
            },
            unit_amount: input.amount * 100,
            recurring: { interval: "month" },
          },
          quantity: 1,
        }],
        mode: "subscription",
        allow_promotion_codes: true,
        success_url: `${origin}/payments?success=true&plan=${input.planId}`,
        cancel_url: `${origin}/payments?cancelled=true`,
        metadata: {
          plan_id: input.planId,
          plan_name: input.planName,
        },
      });
      return { url: session.url };
    }),
});
