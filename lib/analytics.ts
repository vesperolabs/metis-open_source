"use client";

import posthog from "posthog-js";

let initialized = false;

const USER_REF_KEY = "metis_user_ref";

/**
 * Initializes PostHog (EU cloud) and identifies the user from the ?u= URL param.
 * Privacy rules: no autocapture, no session recording, and NEVER send message
 * contents in events — metadata only.
 */
export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: "https://eu.i.posthog.com",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_performance: false,
    disable_session_recording: true,
    disable_surveys: true,
    advanced_disable_feature_flags: true,
    persistence: "memory",
    person_profiles: "identified_only",
  });
  initialized = true;

  const fromUrl = new URLSearchParams(window.location.search).get("u");
  if (fromUrl) localStorage.setItem(USER_REF_KEY, fromUrl);
  const ref = fromUrl || localStorage.getItem(USER_REF_KEY);
  if (ref) posthog.identify(ref);
}

export function track(
  event: string,
  props?: Record<string, string | number | boolean>
) {
  if (!initialized || typeof window === "undefined") return;
  const ref = localStorage.getItem(USER_REF_KEY);
  posthog.capture(event, { ...props, user_ref: ref ?? "anonymous" });
}
