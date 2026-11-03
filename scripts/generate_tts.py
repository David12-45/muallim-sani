# -*- coding: utf-8 -*-
"""
Генерация озвучки арабских слов и слогов для «Му'аллим Сани».

1. npm run tts:collect            -> scripts/tts_texts.json
2. python scripts/generate_tts.py -> public/audio/tts/<id>.mp3 + src/data/ttsManifest.js

Уже существующие файлы не перезаписываются, поэтому любой MP3 можно заменить
записью живого чтеца с тем же именем — он сохранится при повторной генерации.
"""
import asyncio
import json
import os
import sys
import unicodedata

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEXTS = os.path.join(ROOT, 'scripts', 'tts_texts.json')
OUT_DIR = os.path.join(ROOT, 'public', 'audio', 'tts')
MANIFEST = os.path.join(ROOT, 'src', 'data', 'ttsManifest.js')

VOICE = 'ar-SA-HamedNeural'   # саудовский мужской голос, чёткое литературное произношение
RATE = '-25%'                  # медленнее для учеников
CONCURRENCY = 6


def tts_id(text):
    """FNV-1a 32 бита — должна совпадать с ttsId() в src/services/audio.js"""
    h = 0x811c9dc5
    for ch in unicodedata.normalize('NFC', text):
        h ^= ord(ch)
        h = (h * 16777619) & 0xffffffff
    return '%08x' % h


async def synth(item, sem, stats):
    path = os.path.join(OUT_DIR, item['id'] + '.mp3')
    if os.path.exists(path) and os.path.getsize(path) > 0:
        stats['skipped'] += 1
        return
    async with sem:
        for attempt in range(3):
            try:
                tmp = path + '.part'
                await edge_tts.Communicate(item['text'], VOICE, rate=RATE).save(tmp)
                if os.path.getsize(tmp) == 0:
                    raise RuntimeError('пустой файл')
                os.replace(tmp, path)
                stats['done'] += 1
                if stats['done'] % 50 == 0:
                    print('  сгенерировано', stats['done'], flush=True)
                return
            except Exception as e:  # noqa: BLE001
                if attempt == 2:
                    stats['failed'].append(item['id'])
                    print('  ошибка', item['id'], repr(e), flush=True)
                await asyncio.sleep(1.5 * (attempt + 1))


async def main():
    with open(TEXTS, encoding='utf-8') as f:
        items = json.load(f)
    for it in items:
        if tts_id(it['text']) != it['id']:
            sys.exit('Хэш не совпадает с JS для: ' + it['id'])
    os.makedirs(OUT_DIR, exist_ok=True)

    stats = {'done': 0, 'skipped': 0, 'failed': []}
    sem = asyncio.Semaphore(CONCURRENCY)
    await asyncio.gather(*(synth(it, sem, stats) for it in items))

    ids = sorted(it['id'] for it in items
                 if os.path.exists(os.path.join(OUT_DIR, it['id'] + '.mp3')))
    with open(MANIFEST, 'w', encoding='utf-8', newline='\n') as f:
        f.write('// Автоматически генерируется scripts/generate_tts.py — не редактировать вручную\n')
        f.write('// Озвучено текстов: %d\n' % len(ids))
        f.write('export const TTS_IDS = %s;\n' % json.dumps(ids))

    print('Готово: новых %d, пропущено %d, ошибок %d, в манифесте %d' % (
        stats['done'], stats['skipped'], len(stats['failed']), len(ids)))


if __name__ == '__main__':
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
