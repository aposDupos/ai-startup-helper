/**
 * Quick test: invoke GigaChat with native function format.
 * Run with: NODE_TLS_REJECT_UNAUTHORIZED=0 npx tsx scripts/test-tools.ts
 */

import { GigaChat } from "langchain-gigachat";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { config } from "dotenv";

config({ path: ".env.local" });

const model = new GigaChat({
    credentials: process.env.GIGACHAT_API_KEY,
    model: "GigaChat",
    temperature: 0.7,
    maxTokens: 2048,
    streaming: false,
} as ConstructorParameters<typeof GigaChat>[0]);

const functions = [
    {
        name: "save_idea",
        description: "Сохраняет идею стартапа. Используй когда пользователь описал идею.",
        parameters: {
            type: "object",
            properties: {
                title: { type: "string", description: "Краткое название идеи" },
                description: { type: "string", description: "Описание идеи" },
            },
            required: ["title", "description"],
        },
    },
];

async function main() {
    try {
        console.log("1️⃣ Invoking with native functions...");
        const modelWithTools = model.bind({ tools: functions } as Record<string, unknown>);

        const response = await modelWithTools.invoke([
            new SystemMessage("Ты — AI-наставник. Когда пользователь описывает идею, ОБЯЗАТЕЛЬНО используй инструмент save_idea."),
            new HumanMessage("У меня есть идея — маркетплейс для репетиторов. Соединяет учеников с репетиторами."),
        ]);

        console.log("2️⃣ Content:", typeof response.content === "string" ? response.content.slice(0, 300) : response.content);
        console.log("3️⃣ Tool calls:", JSON.stringify(response.tool_calls, null, 2));
        console.log("4️⃣ Additional kwargs:", JSON.stringify(response.additional_kwargs, null, 2));
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

main();
