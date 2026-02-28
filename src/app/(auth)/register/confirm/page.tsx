"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";

export default function ConfirmEmailPage() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <Card className="border-surface-200 shadow-md bg-surface-0">
                <CardHeader className="text-center pb-2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.2,
                        }}
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))",
                        }}
                    >
                        <Mail
                            size={28}
                            strokeWidth={1.75}
                            className="text-primary-500"
                        />
                    </motion.div>
                    <CardTitle className="text-h2 text-surface-900">
                        Проверь почту! 📧
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-body text-surface-500">
                        Мы отправили письмо с ссылкой для подтверждения на твой email.
                    </p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 rounded-xl bg-primary-50 border border-primary-100"
                    >
                        <p className="text-body-sm text-primary-700 font-medium">
                            👉 Перейди по ссылке в письме, чтобы активировать аккаунт
                        </p>
                    </motion.div>
                    <div className="space-y-2 text-body-sm text-surface-400">
                        <p>Не получил письмо? Проверь папку «Спам»</p>
                        <p>
                            Письмо может прийти в течение нескольких минут
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/login">
                        <Button
                            variant="ghost"
                            className="cursor-pointer text-surface-500"
                        >
                            <ArrowLeft size={16} strokeWidth={1.75} />
                            Вернуться к входу
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
