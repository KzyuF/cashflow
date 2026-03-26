import type { Context, SessionFlavor } from "grammy";

export interface SessionData {
  step:
    | null
    | "income_waiting"
    | "income_account"
    | "debt_direction"
    | "debt_waiting";
  data: Record<string, unknown>;
}

export interface BotContext extends Context, SessionFlavor<SessionData> {
  dbUser?: {
    id: number;
    telegramId: bigint;
    currency: string;
    onboardingDone: boolean;
  };
}
