/**
 * GigaChat SDK PoC — проверка работоспособности
 *
 * Запуск: npx tsx scripts/gigachat-poc.ts
 *
 * Требуется: GIGACHAT_API_KEY и GIGACHAT_SCOPE в .env.local
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const API_KEY = process.env.GIGACHAT_API_KEY;
const SCOPE = process.env.GIGACHAT_SCOPE || "GIGACHAT_API_B2B";

if (!API_KEY) {
    console.error("❌ GIGACHAT_API_KEY не найден в .env.local");
    process.exit(1);
}

const AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const API_URL = "https://gigachat.devices.sberbank.ru/api/v1";

interface AuthResponse {
    access_token: string;
    expires_at: number;
}

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface ChatResponse {
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

const results: Record<string, { status: string; details: string; latency?: number }> = {};

async function getAccessToken(): Promise<string> {
    console.log("🔑 Получение access token...");

    const response = await fetch(AUTH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            RqUID: crypto.randomUUID(),
            Authorization: `Basic ${API_KEY}`,
        },
        body: `scope=${SCOPE}`,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Auth failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as AuthResponse;
    console.log("✅ Access token получен");
    return data.access_token;
}

async function testChatCompletion(token: string): Promise<void> {
    console.log("\n💬 Тест: Chat Completion...");
    const startTime = Date.now();

    try {
        const messages: ChatMessage[] = [
            { role: "system", content: "Ты — помощник для молодых предпринимателей. Отвечай кратко." },
            { role: "user", content: "Что такое MVP? Объясни в одном предложении." },
        ];

        const response = await fetch(`${API_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                model: "GigaChat",
                messages,
                temperature: 0.7,
                max_tokens: 100,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`${response.status}: ${text}`);
        }

        const data = (await response.json()) as ChatResponse;
        const latency = Date.now() - startTime;

        console.log(`✅ Ответ: "${data.choices[0].message.content}"`);
        console.log(`   Токены: ${data.usage.total_tokens}, Latency: ${latency}ms`);

        results["chat_completion"] = {
            status: "✅ Работает",
            details: `Latency: ${latency}ms, Tokens: ${data.usage.total_tokens}`,
            latency,
        };
    } catch (error) {
        const latency = Date.now() - startTime;
        results["chat_completion"] = {
            status: "❌ Ошибка",
            details: String(error),
            latency,
        };
        console.error("❌ Ошибка:", error);
    }
}

async function testStreaming(token: string): Promise<void> {
    console.log("\n🌊 Тест: Streaming...");
    const startTime = Date.now();

    try {
        const response = await fetch(`${API_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                model: "GigaChat",
                messages: [
                    { role: "user", content: "Перечисли 3 этапа создания стартапа" },
                ],
                stream: true,
                max_tokens: 200,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`${response.status}: ${text}`);
        }

        const firstTokenTime = Date.now() - startTime;
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let chunkCount = 0;

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                chunkCount++;
                // Extract content from SSE data
                const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
                for (const line of lines) {
                    const jsonStr = line.replace("data: ", "");
                    if (jsonStr === "[DONE]") continue;
                    try {
                        const parsed = JSON.parse(jsonStr);
                        const delta = parsed.choices?.[0]?.delta?.content || "";
                        fullText += delta;
                    } catch {
                        // skip parse errors
                    }
                }
            }
        }

        const totalLatency = Date.now() - startTime;
        console.log(`✅ Streaming: ${chunkCount} чанков, TTFT: ${firstTokenTime}ms`);
        console.log(`   Текст: "${fullText.substring(0, 100)}..."`);

        results["streaming"] = {
            status: "✅ Работает",
            details: `TTFT: ${firstTokenTime}ms, Total: ${totalLatency}ms, Chunks: ${chunkCount}`,
            latency: firstTokenTime,
        };
    } catch (error) {
        results["streaming"] = {
            status: "❌ Ошибка",
            details: String(error),
        };
        console.error("❌ Ошибка:", error);
    }
}

async function testModels(token: string): Promise<void> {
    console.log("\n📋 Тест: Список моделей...");

    try {
        const response = await fetch(`${API_URL}/models`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`${response.status}: ${text}`);
        }

        const data = (await response.json()) as { data: Array<{ id: string }> };
        const models = data.data.map((m) => m.id);
        console.log(`✅ Доступные модели: ${models.join(", ")}`);

        results["models"] = {
            status: "✅ Работает",
            details: `Модели: ${models.join(", ")}`,
        };
    } catch (error) {
        results["models"] = {
            status: "❌ Ошибка",
            details: String(error),
        };
        console.error("❌ Ошибка:", error);
    }
}

async function testEmbeddings(token: string): Promise<void> {
    console.log("\n🔗 Тест: Embeddings...");

    try {
        const response = await fetch(`${API_URL}/embeddings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                model: "Embeddings",
                input: ["Стартап — это временная организация для поиска бизнес-модели"],
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`${response.status}: ${text}`);
        }

        const data = (await response.json()) as {
            data: Array<{ embedding: number[] }>;
        };
        const dims = data.data[0].embedding.length;
        console.log(`✅ Embeddings: ${dims} dimensions`);

        results["embeddings"] = {
            status: "✅ Работает",
            details: `Dimensions: ${dims}`,
        };
    } catch (error) {
        results["embeddings"] = {
            status: "❌ Ошибка",
            details: String(error),
        };
        console.error("❌ Ошибка:", error);
    }
}

function generateReport(): string {
    const lines: string[] = [
        "# GigaChat SDK PoC — Результаты",
        "",
        `**Дата:** ${new Date().toISOString().split("T")[0]}`,
        `**Scope:** ${SCOPE}`,
        "",
        "## Результаты тестов",
        "",
        "| Тест | Статус | Детали |",
        "|------|--------|--------|",
    ];

    for (const [test, result] of Object.entries(results)) {
        lines.push(
            `| ${test} | ${result.status} | ${result.details} |`
        );
    }

    lines.push("");
    lines.push("## Выводы");
    lines.push("");

    const allPassed = Object.values(results).every((r) =>
        r.status.includes("✅")
    );
    if (allPassed) {
        lines.push(
            "✅ Все тесты пройдены. GigaChat API готов к использованию в Sprint 2."
        );
    } else {
        lines.push("⚠️ Некоторые тесты не прошли. Требуется дополнительная проработка.");
    }

    lines.push("");
    lines.push("## Рекомендации для Sprint 2");
    lines.push("");
    lines.push("1. Использовать REST API напрямую (не LangChain SDK) для лучшего контроля");
    lines.push("2. Реализовать кэширование access token (expires_at)");
    lines.push("3. Обработка SSL через NODE_TLS_REJECT_UNAUTHORIZED=0 для dev (!) или установку сертификата НУЦ");
    lines.push("4. Для Function Calling использовать формат GigaChat (если поддерживается)");

    return lines.join("\n");
}

async function main() {
    console.log("🚀 GigaChat PoC — Старт\n");
    console.log(`API Key: ${API_KEY?.substring(0, 10)}...`);
    console.log(`Scope: ${SCOPE}`);
    console.log(`Auth URL: ${AUTH_URL}`);
    console.log(`API URL: ${API_URL}`);

    try {
        // SSL workaround for Russian CA certificates
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        const token = await getAccessToken();

        await testModels(token);
        await testChatCompletion(token);
        await testStreaming(token);
        await testEmbeddings(token);
    } catch (error) {
        console.error("\n❌ Критическая ошибка:", error);
        results["auth"] = {
            status: "❌ Ошибка",
            details: String(error),
        };
    }

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 ИТОГО:");
    console.log("=".repeat(60));
    for (const [test, result] of Object.entries(results)) {
        console.log(`  ${result.status} ${test}: ${result.details}`);
    }

    // Save report
    const report = generateReport();
    const fs = await import("fs");
    const reportPath = path.resolve(
        process.cwd(),
        ".backlog/mvp/v1/gigachat-poc-results.md"
    );
    fs.writeFileSync(reportPath, report);
    console.log(`\n📝 Отчёт сохранён: ${reportPath}`);
}

main().catch(console.error);
