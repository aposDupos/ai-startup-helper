import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Введи email")
        .email("Некорректный email"),
    password: z
        .string()
        .min(6, "Минимум 6 символов"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    name: z
        .string()
        .min(2, "Минимум 2 символа")
        .max(50, "Максимум 50 символов"),
    email: z
        .string()
        .min(1, "Введи email")
        .email("Некорректный email"),
    password: z
        .string()
        .min(6, "Минимум 6 символов")
        .max(72, "Максимум 72 символа"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
