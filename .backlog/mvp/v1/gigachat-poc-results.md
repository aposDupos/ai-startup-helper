# GigaChat SDK PoC — Результаты

**Дата:** 2026-02-28
**Scope:** GIGACHAT_API_PERS

## Результаты тестов

| Тест | Статус | Детали |
|------|--------|--------|
| models | ✅ Работает | Модели: GigaChat, GigaChat-2, GigaChat-2-Max, GigaChat-2-Pro, GigaChat-Max, GigaChat-Max-preview, GigaChat-Plus, GigaChat-Pro, GigaChat-Pro-preview, GigaChat-preview, Embeddings, Embeddings-2, EmbeddingsGigaR, GigaEmbeddings-3B-2025-09 |
| chat_completion | ✅ Работает | Latency: 695ms, Tokens: 63 |
| streaming | ✅ Работает | TTFT: 152ms, Total: 1481ms, Chunks: 17 |
| embeddings | ❌ Ошибка | Error: 402: {"status":402,"message":"Payment Required"}
 |

## Выводы

⚠️ Некоторые тесты не прошли. Требуется дополнительная проработка.

## Рекомендации для Sprint 2

1. Использовать REST API напрямую (не LangChain SDK) для лучшего контроля
2. Реализовать кэширование access token (expires_at)
3. Обработка SSL через NODE_TLS_REJECT_UNAUTHORIZED=0 для dev (!) или установку сертификата НУЦ
4. Для Function Calling использовать формат GigaChat (если поддерживается)