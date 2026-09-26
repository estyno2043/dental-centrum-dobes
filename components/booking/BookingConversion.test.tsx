import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReviewsProvider } from "@/components/reviews/ReviewsProvider";
import { clinicPhone } from "@/components/site/siteContent";
import { BookingPanel } from "./BookingPanel";
import { ServiceCta } from "./ServiceCta";
import { StickyBookingBar } from "./StickyBookingBar";

describe("booking panel", () => {
  it("is the #booking target, with the phone and the form", () => {
    const { container } = render(
      <ReviewsProvider>
        <BookingPanel serviceName="Endodoncia pod mikroskopom" service="endodoncia" showEntryOffer />
      </ReviewsProvider>,
    );

    expect(container.querySelector("#booking")).not.toBeNull();
    expect(screen.getByRole("heading", { name: /Ozveme sa vám/ })).toBeInTheDocument();
    expect(
      screen.getAllByRole("link").some((a) => a.getAttribute("href") === clinicPhone.href),
    ).toBe(true);
    expect(screen.getByTestId("service-booking-form")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /vstupnou prehliadkou/ })).toHaveAttribute(
      "href",
      "/sluzby/vstupna-prehliadka",
    );
  });

  /* The entry page does not suggest itself. */
  it("leaves out the entry offer where asked", () => {
    render(
      <ReviewsProvider>
        <BookingPanel serviceName="Vstupná prehliadka" service="vstupna-prehliadka" showEntryOffer={false} />
      </ReviewsProvider>,
    );
    expect(screen.queryByRole("link", { name: /vstupnou prehliadkou/ })).toBeNull();
  });
});

describe("sticky booking bar", () => {
  /*
   * Non-invasive: absent at the top of the page, present once the reader has
   * scrolled past half a screen, gone again when the booking panel is in view.
   * Inert while hidden so nobody tabs onto an invisible button.
   */
  it("appears after the first half-screen and leaves at the booking panel", async () => {
    const booking = document.createElement("div");
    booking.id = "booking";
    document.body.append(booking);
    let bookingTop = 5000;
    booking.getBoundingClientRect = () => ({ top: bookingTop }) as DOMRect;
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });

    render(<StickyBookingBar serviceName="Parodontológia" />);
    const bar = screen.getByRole("region", { name: "Objednanie" });
    expect(bar).toHaveAttribute("data-visible", "false");

    const scrollTo = async (y: number) => {
      Object.defineProperty(window, "scrollY", { configurable: true, value: y });
      await act(async () => {
        fireEvent.scroll(window);
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      });
    };

    await scrollTo(1200);
    expect(bar).toHaveAttribute("data-visible", "true");

    bookingTop = 300;
    await scrollTo(4000);
    expect(bar).toHaveAttribute("data-visible", "false");

    booking.remove();
  });
});

describe("mid-page call to action", () => {
  it("points at the booking panel and the phone", () => {
    render(<ServiceCta heading="Chýba vám zub?" text="Text." />);
    expect(screen.getByRole("link", { name: /Objednať sa/ })).toHaveAttribute("href", "#booking");
    expect(screen.getByRole("link", { name: clinicPhone.label })).toHaveAttribute(
      "href",
      clinicPhone.href,
    );
  });
});
