import { z } from "zod";

const requirements = z.union([z.string(), z.array(z.string())]);

export const createJobSchema = z.object({
    title: z.string().trim().min(2).max(150),
    description: z.string().trim().min(10).max(10000),
    requirements,
    salary: z.coerce.number().nonnegative(),
    experienceLevel: z.coerce.number().nonnegative(),
    location: z.string().trim().min(2).max(150),
    jobType: z.string().trim().min(2).max(80),
    position: z.coerce.number().int().positive(),
    companyId: z.string().min(1)
});

export const statusSchema = z.object({
    status: z.enum(["pending", "accepted", "rejected"])
});
