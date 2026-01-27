// src/sanity/client.js
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

// Configura tu cliente
export const client = createClient({
  projectId: "fgnqmgk1", // copia EXACTAMENTE de Sanity
  dataset: "production",
  apiVersion: "2026-01-08",
  useCdn: true, // true para contenido público
});

// Builder para generar URLs de imagen
const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);
