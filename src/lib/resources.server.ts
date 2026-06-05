import { z } from "zod";
import { prisma } from "./prisma";
import { resources, type ResourceConfig } from "./resourceConfig";

// Mapowanie nazwy zasobu -> delegat Prisma
const delegates = {
  rooms: prisma.room,
  mobile: prisma.mobileOffer,
  gallery: prisma.galleryImage,
  videos: prisma.video,
  reviews: prisma.review,
  pricing: prisma.pricingPlan,
  faq: prisma.faqItem,
  messages: prisma.contactMessage,
} as const;

export type ResourceName = keyof typeof delegates;

export function isResource(name: string): name is ResourceName {
  return name in delegates;
}

export function getDelegate(name: ResourceName) {
  return delegates[name] as any;
}

export function getConfig(name: ResourceName): ResourceConfig {
  return resources[name];
}

// Buduje schemat walidacji z konfiguracji pól
export function buildSchema(config: ResourceConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of config.fields) {
    let s: z.ZodTypeAny;
    switch (f.type) {
      case "number":
        s = z.coerce.number();
        break;
      case "boolean":
        s = z.coerce.boolean();
        break;
      default:
        s = z.string();
    }
    if (f.type === "gallery" || f.type === "zones") {
      s = z.string().optional().nullable(); // JSON (string)
    } else if (f.required && (f.type === "text" || f.type === "textarea" || f.type === "select" || f.type === "image" || f.type === "video")) {
      s = (s as z.ZodString).min(1, `Pole "${f.label}" jest wymagane`);
    } else if (!f.required) {
      s = s.optional().nullable();
    }
    shape[f.name] = s;
  }
  return z.object(shape);
}

// Czyści dane wejściowe do pól zdefiniowanych w konfiguracji
export function pickFields(config: ResourceConfig, data: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const f of config.fields) {
    if (f.name in data) {
      let v = data[f.name];
      if (f.type === "text" || f.type === "textarea" || f.type === "select" || f.type === "image" || f.type === "video") {
        if (v === "" ) v = f.required ? "" : null;
      }
      out[f.name] = v;
    }
  }
  return out;
}
