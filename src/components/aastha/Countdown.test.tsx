import { render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Countdown from "./Countdown";

describe("Countdown", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders countdown numbers on the first render when a target is available", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T06:00:00.000Z"));

    render(<Countdown target={new Date("2026-06-28T05:30:00.000Z")} variant="hero" />);

    expect(screen.queryByText("--")).not.toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("00")).toBeInTheDocument();
  });
});
