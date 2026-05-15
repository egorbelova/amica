# utils/waveform_utils.py
import numpy as np
from pydub import AudioSegment


def generate_waveform(audio: AudioSegment, samples: int = 120) -> list[float]:
    """Build a normalised waveform from an already-loaded AudioSegment.

    Accepts the segment directly so callers that already have it in memory
    avoid a second full PCM decode of the file.
    """
    data = np.array(audio.get_array_of_samples())
    if audio.channels == 2:
        data = data.reshape((-1, 2))
        data = data.mean(axis=1)

    block_size = max(1, len(data) // samples)
    waveform = [
        float(np.abs(data[i * block_size : (i + 1) * block_size]).max())
        for i in range(samples)
    ]

    max_val = max(waveform) or 1
    waveform = [v / max_val for v in waveform]

    return waveform
