import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "./",
    name: "Fleurie Personal Planner",
    short_name: "Fleurie",
    description:
      "A calm, vintage-floral personal planner for daily life, wellbeing, style, finances, journaling, and lists.",
    start_url: "./",
    scope: "./",
    display: "standalone",
    background_color: "#eee7dd",
    theme_color: "#70702e",
    categories: ["lifestyle", "productivity"],
    icons: [
      {
        src: "icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
