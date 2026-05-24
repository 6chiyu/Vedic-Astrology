import { render, screen } from "@testing-library/react";

import Home from "../app/page";

describe("Home", () => {
  it("renders the landing page shell", () => {
    render(<Home />);

    expect(screen.getByText("Vedic Light")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link")
        .some((link) => link.getAttribute("href") === "/natal")
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link")
        .some((link) => link.getAttribute("href") === "/pricing")
    ).toBe(true);
    expect(screen.getAllByRole("article")).toHaveLength(5);
  });
});
