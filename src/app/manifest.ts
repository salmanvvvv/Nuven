import type { MetadataRoute } from "next";
import { getDictionary } from "@/content";

export default function manifest(): MetadataRoute.Manifest {
  const { site } = getDictionary();
  return {
    name: site.name,
    short_name: "Nuven",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
