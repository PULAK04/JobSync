import { z } from "zod";

export const generateReportSchema = z.object({
    jobTitle: z.string().trim().min(2).max(200),
    jobDescription: z.string().trim().min(10).max(20000),
    selfDescription: z.string().trim().max(5000).optional().default(""),
    resumeUrl: z.string().url().optional()
});
