import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || "fgnqmgk1",
  dataset: import.meta.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2024-10-01",
  useCdn: true,
});

const builder = createImageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);
