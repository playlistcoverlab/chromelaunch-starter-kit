import { z } from "zod";

/**
 * Zod Validation Schemas (Vibecoding Studio Pillar #3)
 */

export const apiKeySchema = z
  .string()
  .trim()
  .refine(
    (val) => val === "" || (val.length >= 16 && /^[a-zA-Z0-9_-]+$/.test(val)),
    {
      message:
        "La API Key debe tener al menos 16 caracteres alfanuméricos válidos (ej. sk-...) o dejarse vacía.",
    }
  );

export const noteSchema = z.object({
  id: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(2, "El título debe tener al menos 2 caracteres.")
    .max(60, "El título no puede exceder 60 caracteres."),
  content: z
    .string()
    .trim()
    .min(3, "El contenido debe tener al menos 3 caracteres.")
    .max(1000, "El contenido no puede exceder 1,000 caracteres."),
  createdAt: z.string(),
});

export const promptInputSchema = z
  .string()
  .trim()
  .min(2, "Escribe una instrucción de al menos 2 caracteres.")
  .max(500, "La instrucción es demasiado larga (máx. 500 caracteres).");

export const storageBackupSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).default("dark"),
  apiKey: z.string().optional(),
  notes: z.array(noteSchema).default([]),
  quickPrompts: z.array(z.string().min(1)).default([]),
  autoAnalyze: z.boolean().default(true),
});

export type ValidatedNote = z.infer<typeof noteSchema>;
export type ValidatedStorage = z.infer<typeof storageBackupSchema>;
