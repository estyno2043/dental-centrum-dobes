import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Hero } from "./Hero";

test("renders the approved hero copy and patient contact details", () => {
  const { container } = render(<Hero />);

  expect(screen.getByRole("navigation")).toBeInTheDocument();
  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "Sme dôvod, prečo sa už zubárom nemusíte vyhýbať.",
  );
  expect(screen.getByRole("link", { name: /0918 800 002/ })).toHaveAttribute(
    "href",
    "tel:+421918800002",
  );
  expect(screen.getByText("4,5")).toBeInTheDocument();
  expect(screen.getByText("Google hodnotenie")).toBeInTheDocument();
  expect(screen.getByText("parkovanie pre pacientov")).toBeInTheDocument();
  expect(screen.getByText("ošetrujeme aj deti")).toBeInTheDocument();

  const video = container.querySelector("video");
  expect(video).toHaveAttribute("poster", "/media/hero-poster.jpg");
  expect(video).toHaveTextContent("Váš prehliadač nepodporuje video.");
  expect(video?.querySelector("source")).toHaveAttribute(
    "src",
    "/media/hero-video.mp4",
  );
});
