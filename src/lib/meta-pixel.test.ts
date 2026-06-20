import { afterEach, describe, expect, it, vi } from "vitest";
import { trackRegisterButtonClick, trackRegistrationLead } from "./meta-pixel";

describe("meta pixel tracking", () => {
  afterEach(() => {
    delete window.fbq;
    vi.restoreAllMocks();
  });

  it("tracks register CTA clicks as a custom event", () => {
    const fbq = vi.fn();
    window.fbq = fbq;

    trackRegisterButtonClick();

    expect(fbq).toHaveBeenCalledWith("trackCustom", "RegisterButtonClick", {
      content_name: "Registration CTA",
      content_category: "Authentic Leadership Circle Masterclass",
    });
  });

  it("tracks submitted registrations as Meta leads", () => {
    const fbq = vi.fn();
    window.fbq = fbq;

    trackRegistrationLead();

    expect(fbq).toHaveBeenCalledWith("track", "Lead", {
      content_name: "Masterclass Registration",
      content_category: "Authentic Leadership Circle Masterclass",
    });
  });

  it("does nothing before the Pixel script has loaded", () => {
    expect(() => {
      trackRegisterButtonClick();
      trackRegistrationLead();
    }).not.toThrow();
  });
});
