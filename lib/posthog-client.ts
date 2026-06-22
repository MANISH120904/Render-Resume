import posthog from "posthog-js";

export { posthog };

export function identifyUser(
  userId: string,
  properties?: Record<string, string>,
): void {
  posthog.identify(userId, properties);
}

export function resetUser(): void {
  posthog.reset();
}
