import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { notifyOwner } from "./_core/notification";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { commerceRouter } from "./routers/commerce";
import { CONTACT_EMAIL, buildOwnerContactContent } from "@shared/contact";
import { cloudinaryRouter } from "./routers/cloudinary";
import { storefrontContentRouter } from "./routers/storefrontContent";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  commerce: commerceRouter,
  cloudinary: cloudinaryRouter,
  storefrontContent: storefrontContentRouter,
  contact: publicProcedure
    .input(z.object({
      name: z.string().trim().min(2).max(120),
      email: z.string().email().max(320),
      subject: z.string().trim().min(2).max(180),
      message: z.string().trim().min(10).max(5000),
      channel: z.enum(["email", "whatsapp"]),
    }))
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner({
        title: `Liverton contact: ${input.subject}`,
        content: buildOwnerContactContent(input, input.channel),
      });
      return { delivered, destination: input.channel === "email" ? CONTACT_EMAIL : "+256705954597" };
    }),
  hanna: router({
    chat: publicProcedure
      .input(z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string() })).min(1).max(30) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are Hanna, the warm and practical AI support guide for Liverton, a modern consumer technology store. Help customers with products, shopping, delivery, returns, warranty, and accessibility. Be concise, friendly, and never invent order-specific information. If you are unsure, direct the customer to Liverton Support." },
            ...input.messages,
          ],
        });
        return response.choices?.[0]?.message?.content ?? "I’m here to help with Liverton products and support. Could you rephrase that?";
      }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
