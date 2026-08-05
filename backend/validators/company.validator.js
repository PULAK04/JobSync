import { z } from "zod";

export const createCompanySchema = z.object({
    companyName: z.string().trim().min(2).max(150)
});

export const updateCompanySchema = z.object({
    name: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().max(3000).optional(),
    website: z.string().trim().url().or(z.literal("")).optional(),
    location: z.string().trim().max(200).optional()
});
