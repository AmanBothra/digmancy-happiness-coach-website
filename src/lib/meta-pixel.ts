export const META_PIXEL_ID = "564905278069325";

type MetaPixelPayload = Record<string, string | number | boolean | null | undefined>;
type MetaPixelCommand = "track" | "trackCustom";
type MetaPixelFunction = (
  command: MetaPixelCommand,
  eventName: string,
  parameters?: MetaPixelPayload,
) => void;

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
  }
}

function sendMetaPixelEvent(
  command: MetaPixelCommand,
  eventName: string,
  parameters?: MetaPixelPayload,
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq(command, eventName, parameters);
}

export function trackRegisterButtonClick() {
  sendMetaPixelEvent("trackCustom", "RegisterButtonClick", {
    content_name: "Registration CTA",
    content_category: "Authentic Leadership Circle Masterclass",
  });
}

export function trackRegistrationLead() {
  sendMetaPixelEvent("track", "Lead", {
    content_name: "Masterclass Registration",
    content_category: "Authentic Leadership Circle Masterclass",
  });
}
