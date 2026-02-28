"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { login } from "../actions";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { LogIn, Mail, Lock } from "lucide-react";

export default function LoginPage() {
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register: registerField,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(data: LoginFormData) {
        setServerError(null);
        const result = await login(data);
        if (result?.error) {
            setServerError(result.error);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <Card className="border-surface-200 shadow-md bg-surface-0">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-h2 text-surface-900">Войти</CardTitle>
                    <CardDescription className="text-body-sm text-surface-500">
                        Войди в свой аккаунт, чтобы продолжить
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-body-sm font-medium text-surface-700"
                            >
                                Email
                            </Label>
                            <div className="relative">
                                <Mail
                                    size={16}
                                    strokeWidth={1.75}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
                                />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    className="h-11 pl-10 rounded-lg border-surface-200 bg-surface-50 focus:bg-surface-0 transition-colors"
                                    {...registerField("email")}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-caption text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-body-sm font-medium text-surface-700"
                            >
                                Пароль
                            </Label>
                            <div className="relative">
                                <Lock
                                    size={16}
                                    strokeWidth={1.75}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
                                />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-11 pl-10 rounded-lg border-surface-200 bg-surface-50 focus:bg-surface-0 transition-colors"
                                    {...registerField("password")}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-caption text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {serverError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="p-3 rounded-lg bg-red-50 border border-red-200 text-body-sm text-red-600"
                            >
                                {serverError}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 rounded-lg font-semibold text-white cursor-pointer"
                            style={{
                                background: isSubmitting
                                    ? "var(--color-surface-300)"
                                    : "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                            }}
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Входим...</span>
                            ) : (
                                <>
                                    <LogIn size={16} strokeWidth={1.75} />
                                    Войти
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-body-sm text-surface-500">
                        Нет аккаунта?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
                        >
                            Зарегистрироваться
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
