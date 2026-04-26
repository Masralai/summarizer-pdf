import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

vi.mock("@/lib/utils", () => ({ cn: (...args: unknown[]) => args.filter(Boolean).join(" ") }));

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "Summarizer." })).toBeTruthy();
  });

  it("renders all four algorithm buttons", () => {
    render(<Home />);
    expect(screen.getByText("Frequency")).toBeTruthy();
    expect(screen.getByText("TF-IDF")).toBeTruthy();
    expect(screen.getByText("TextRank")).toBeTruthy();
    expect(screen.getByText("Neural")).toBeTruthy();
  });

  it("renders the upload zone placeholder", () => {
    render(<Home />);
    expect(screen.getByText("Drop a PDF or click to select")).toBeTruthy();
  });

  it("renders the generate summary button", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: "Generate Summary" })).toBeDisabled();
  });

  it("renders precision range endpoints", () => {
    render(<Home />);
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
  });
});