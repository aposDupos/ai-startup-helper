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
import { register as registerAction } from "../actions";
import {
    registerSchema,
    type RegisterFormData,
} from "@/lib/validations/auth";
import { UserPlus, Mail, Lock, User } from "lucide-react";

export default function RegisterPage() {
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register: registerField,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    async function onSubmit(data: RegisterFormData) {
        setServerError(null);
        const result = await registerAction(data);
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
                    <CardTitle className="text-h2 text-surface-900">
                        Создать аккаунт
                    </CardTitle>
                    <CardDescription className="text-body-sm text-surface-500">
                        Начни свой путь основателя стартапа
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className="text-body-sm font-medium text-surface-700"
                            >
                                Как тебя зовут?
                            </Label>
                            <div className="relative">
                                <User
                                    size={16}
                                    strokeWidth={1.75}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
                                />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Имя"
                                    className="h-11 pl-10 rounded-lg border-surface-200 bg-surface-50 focus:bg-surface-0 transition-colors"
                                    {...registerField("name")}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-caption text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

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
                                    placeholder="Минимум 6 символов"
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
                                <span className="animate-pulse">Создаём аккаунт...</span>
                            ) : (
                                <>
                                    <UserPlus size={16} strokeWidth={1.75} />
                                    Зарегистрироваться
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-body-sm text-surface-500">
                        Уже есть аккаунт?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
                        >
                            Войти
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
