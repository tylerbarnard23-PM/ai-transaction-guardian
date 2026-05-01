const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || "G-5WF4K8N2EE";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return;
  }

  const existingScript = document.querySelector(
    `script[src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`
  );

  if (!existingScript) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    page_title: document.title,
  });
}

export function trackEvent(
  eventName: string,
  parameters?: Record<string, string | number | boolean>
) {
  if (!GA_MEASUREMENT_ID || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, parameters);
}
