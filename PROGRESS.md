# Тима и Глюк — прогресс (урок 500 «Что такое информация и компьютер»)
Возобновляемая сборка: читать этот файл, продолжать с первого незакрытого пункта. Концепт: CONCEPT.md (утверждён).
Репо: /workspace/info500 → github mboger777-arch/tima-i-glyuk (Pages main /). Сервер тестов: `python3 -m http.server 18691`.
Арт-генерации: файлы появляются в /cursor/stores/store-f8d02424-1d41-4697-9393-3c21b26375b6/grok-bot/agents/*/attachments/ (по mtime) → refs/*.jpg
- [x] концепт, refs heroes_v1/villain_v1/world_v1 (утверждены)
- [x] арт: позы, UI, фоны зон, реквизит (refs/*.jpg)
- [x] нарезка (tools/cut.py + tools/cut_boxes.py для многорядных листов, rbvenv); bubble/plank/sign3/sign4 — key-cut
- [x] движок js/core.js, scenes.js, z1-z5.js, fin.js написаны (отладка в процессе)
- [x] зоны 1-5 + финал: test_touch 0 fails ×3 размера, test_drag (CDP) ok
- [ ] голос (Qwen + ASR)
- [ ] тесты test_touch + audit, 3 размера
- [ ] публикация
- репо создан: github.com/mboger777-arch/tima-i-glyuk, Pages включены. Голос: OOM если запускать вместе с cut.py — запускать по очереди (NT=6 /home/box/tts/qw/bin/python tools/voicegen.py)
- 22:40 прерывание; голос идёт (tools/voice_asr.jsonl, 47/123). После голоса: voice_verify (WM=medium), тесты ×3, live-check, финальный отчёт.
