import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProductGallery } from "./ProductGallery";

describe("ProductGallery", () => {
  it("shows a placeholder without images", () => {
    const { container } = render(<ProductGallery images={[]} name="Agneau" />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("shows a single image without controls", () => {
    render(<ProductGallery images={["/a.jpg"]} name="Agneau" />);
    expect(screen.getByAltText("Agneau")).toHaveAttribute("src", "/a.jpg");
    expect(screen.queryByRole("button", { name: "Photo suivante" })).toBeNull();
  });

  it("navigates with arrows, wraps around and picks a thumbnail", async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={["/a.jpg", "/b.jpg", "/c.jpg"]} name="Agneau" />);

    expect(screen.getByAltText("Agneau, photo 1 sur 3")).toHaveAttribute("src", "/a.jpg");
    await user.click(screen.getByRole("button", { name: "Photo suivante" }));
    expect(screen.getByAltText("Agneau, photo 2 sur 3")).toHaveAttribute("src", "/b.jpg");

    await user.click(screen.getByRole("button", { name: "Photo précédente" }));
    await user.click(screen.getByRole("button", { name: "Photo précédente" }));
    expect(screen.getByAltText("Agneau, photo 3 sur 3")).toHaveAttribute("src", "/c.jpg");

    await user.click(screen.getByRole("button", { name: "Afficher la photo 2" }));
    expect(screen.getByAltText("Agneau, photo 2 sur 3")).toBeInTheDocument();
  });
});
