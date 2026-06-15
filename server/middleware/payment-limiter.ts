import type { Request, Response } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";

export const PAYMENT_LIMITER_CONFIG = {
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many payment attempts, please try again in 15 minutes" },
  standardHeaders: true as const,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  keyGenerator: (req: Request, res: Response) => {
    const user = req.user as { id?: string; claims?: { sub?: string } } | undefined;
    const userId = user?.id ?? user?.claims?.sub;
    if (userId) return `payment:${userId}`;
    return `payment:${ipKeyGenerator(req.ip ?? "unknown")}`;
  },
};

export function createPaymentLimiter() {
  return rateLimit(PAYMENT_LIMITER_CONFIG);
}

export const paymentLimiter = createPaymentLimiter();
