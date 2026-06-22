import { PostHog } from "posthog-node";

export function createPostHogServer(): PostHog {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!token || !host) {
    throw new Error(
      "[posthog-server] NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN and NEXT_PUBLIC_POSTHOG_HOST are required",
    );
  }

  return new PostHog(token, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });
}
