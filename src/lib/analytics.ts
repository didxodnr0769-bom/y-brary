import { assetUrl } from "@/lib/urls";

type AnalyticsOptions = {
  measurementId: string;
  siteUrl: string;
  basePath: string;
  production: boolean;
};

type AnalyticsWindow = Window & typeof globalThis & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean | undefined;
};

const exclusionKey = "ybrary.analytics.disabled";

// Keep free-form searches, filters, fragments and URL credentials out of GA.
function cleanUrl(value: string) {
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) ? `${url.origin}${url.pathname}` : "";
  } catch {
    return "";
  }
}

export function createAnalytics(options: AnalyticsOptions) {
  const id = options.measurementId.trim();
  const site = cleanUrl(options.siteUrl);
  const base = `/${options.basePath.replace(/^\/+|\/+$/g, "")}`.replace(/\/?$/, "/");
  let initialized = false;
  let preferenceApplied = false;
  let pagePreference: boolean | undefined;
  let excluded = false;
  let currentPage: { page_location: string; page_referrer: string; page_title: string } | undefined;

  function allowed() {
    if (!options.production || !site.startsWith("https://")) return false;
    const browser = window as AnalyticsWindow;
    if (browser.location.origin !== new URL(site).origin
      || !(browser.location.pathname.startsWith(base) || browser.location.pathname === base.slice(0, -1))) return false;

    if (!preferenceApplied) {
      const preference = new URLSearchParams(browser.location.search).get("analytics");
      if (preference === "off" || preference === "on") {
        excluded = preference === "off";
        pagePreference = excluded;
        try {
          if (excluded) browser.localStorage.setItem(exclusionKey, "1");
          else browser.localStorage.removeItem(exclusionKey);
        } catch { /* The choice still applies to this page if storage is blocked. */ }
      }
      preferenceApplied = true;
    }
    try {
      if (pagePreference === undefined) excluded = browser.localStorage.getItem(exclusionKey) === "1";
    }
    catch { /* Retain the in-memory choice. */ }
    if (!/^G-[A-Z0-9]+$/.test(id)) return false;
    browser[`ga-disable-${id}`] = excluded;
    return !excluded;
  }

  function pageView(pathname: string, title: string) {
    if (!allowed()) return;
    const browser = window as AnalyticsWindow;
    const location = cleanUrl(new URL(assetUrl(pathname, base), browser.location.origin).href);
    if (currentPage?.page_location === location) return;

    const page = {
      page_location: location,
      page_referrer: currentPage?.page_location ?? cleanUrl(document.referrer),
      page_title: title,
    };
    browser.dataLayer ??= [];
    browser.gtag ??= function () {
      // Preserve the standard Google tag arguments-based command queue.
      // eslint-disable-next-line prefer-rest-params
      browser.dataLayer!.push(arguments);
    };
    if (!initialized) browser.gtag("js", new Date());
    // Update defaults too, so GA's automatic engagement events use clean URLs.
    browser.gtag("set", page);
    browser.gtag("config", id, {
      ...page,
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ...(initialized ? { update: true } : {}),
    });
    browser.gtag("event", "page_view", { ...page, send_to: id });
    currentPage = page;

    if (!initialized) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      script.referrerPolicy = "no-referrer";
      document.head.append(script);
      initialized = true;
    }
  }

  function projectLink(slug: string, kind: "github" | "site", destination: string) {
    if (!allowed() || !currentPage) return;
    const url = cleanUrl(destination);
    if (!url) return;
    const browser = window as AnalyticsWindow;
    browser.gtag?.("event", "click", {
      ...currentPage,
      send_to: id,
      link_id: `${slug}:${kind}`,
      link_domain: new URL(url).hostname,
      link_url: url,
      outbound: new URL(url).origin !== browser.location.origin,
    });
  }

  return { pageView, projectLink };
}

export const analytics = createAnalytics({
  measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || "",
  siteUrl: import.meta.env.VITE_SITE_URL || "",
  basePath: import.meta.env.BASE_URL,
  production: import.meta.env.PROD,
});
