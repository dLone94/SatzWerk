"""
Record every German phrase the app reads aloud, with Piper.

    node scripts/audio/phrases.ts > phrases.json
    python scripts/audio/generate.py phrases.json de_DE-thorsten-high.onnx public/audio/de

Only phrases without a recording are synthesised, so a run after a lesson
edit takes seconds, not the full hour. Recordings of phrases the course no
longer contains are deleted. The manifest lists what exists, and the app
plays a recording only when the manifest says it is there.

Piper (https://github.com/OHF-Voice/piper1-gpl) is used as a tool here: the
recordings are its output, and the app ships the recordings, not Piper.
"""

import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

from piper import PiperVoice, SynthesisConfig

VOICE_LABEL = "Thorsten (Piper)"
# A touch slower than Piper's default: these are sentences for a learner.
LENGTH_SCALE = 1.1


def main() -> None:
    phrases_path, model_path, out_dir = sys.argv[1], sys.argv[2], Path(sys.argv[3])
    out_dir.mkdir(parents=True, exist_ok=True)
    phrases = json.loads(Path(phrases_path).read_text(encoding="utf-8"))
    wanted = {item["key"]: item["text"] for item in phrases}

    # Anything no longer in the course goes.
    removed = 0
    for clip in out_dir.glob("*.mp3"):
        if clip.stem not in wanted:
            clip.unlink()
            removed += 1

    missing = [(key, text) for key, text in wanted.items() if not (out_dir / f"{key}.mp3").exists()]
    print(f"{len(wanted)} phrases, {len(missing)} to record, {removed} removed", flush=True)

    if missing:
        voice = PiperVoice.load(model_path)
        config = SynthesisConfig(length_scale=LENGTH_SCALE)
        with tempfile.TemporaryDirectory() as tmp:
            for index, (key, text) in enumerate(missing, start=1):
                wav_path = Path(tmp) / f"{key}.wav"
                with wave.open(str(wav_path), "wb") as wav_file:
                    voice.synthesize_wav(text, wav_file, syn_config=config)
                # Mono MP3 plays everywhere, iPhone included; 48 kbit/s is
                # plenty for one voice.
                subprocess.run(
                    [
                        "ffmpeg", "-loglevel", "error", "-y", "-i", str(wav_path),
                        "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "48k",
                        str(out_dir / f"{key}.mp3"),
                    ],
                    check=True,
                )
                if index % 100 == 0:
                    print(f"  {index}/{len(missing)}", flush=True)

    keys = sorted(clip.stem for clip in out_dir.glob("*.mp3"))
    manifest = {"voice": VOICE_LABEL, "keys": keys}
    (out_dir / "manifest.json").write_text(json.dumps(manifest, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"manifest: {len(keys)} recordings", flush=True)


if __name__ == "__main__":
    main()
