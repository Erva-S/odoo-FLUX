"use server";

import { revalidatePath } from "next/cache";
import {
  getSubscriptionsService,
  getSubscriptionByIdService,
  createSubscriptionService,
  advanceSubscriptionStageService,
  CreateSubscriptionInput,
  SubscriptionListParams,
} from "@/lib/services/subscriptions";
import { SubscriptionStatus } from "@/lib/data/types";

export async function getSubscriptionsAction(params?: SubscriptionListParams) {
  return await getSubscriptionsService(params);
}

export async function getSubscriptionByIdAction(id: string) {
  return await getSubscriptionByIdService(id);
}

export async function createSubscriptionAction(input: CreateSubscriptionInput) {
  const result = await createSubscriptionService(input);
  if (result.success) {
    revalidatePath("/subscriptions");
    revalidatePath("/dashboard");
    revalidatePath("/portal");
  }
  return result;
}

export async function advanceSubscriptionStageAction(
  id: string,
  nextStage: SubscriptionStatus,
  reason?: string
) {
  const result = await advanceSubscriptionStageService(id, nextStage, reason);
  if (result.success) {
    revalidatePath("/subscriptions");
    revalidatePath(`/subscriptions/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/portal");
  }
  return result;
}

