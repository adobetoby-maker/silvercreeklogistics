import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Silver Creek Dispatch",
    short_name: "SCL Dispatch",
    description: "Silver Creek Logistics dispatch board",
    start_url: "/admin/dispatch",
    display: "standalone",
    background_color: "#1a2744",
    theme_color: "#1a2744",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["business", "productivity"],
    shortcuts: [
      {
        name: "New Requests",
        url: "/admin/dispatch",
        description: "View pending load requests",
      },
    ],
  };
}
