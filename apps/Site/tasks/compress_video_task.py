import logging
import os
import subprocess
import tempfile

from celery import shared_task
from django.core.files import File

from apps.media_files.models.models import DisplayVideo, VideoFile

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, retry_backoff=True)
def compress_video_task(self, model_name: str, video_id: int):
    print(f"Compressing {model_name} id={video_id}")
    model_map = {
        "DisplayVideo": DisplayVideo,
        "VideoFile": VideoFile,
    }

    ModelClass = model_map.get(model_name)
    if not ModelClass:
        logger.error(f"Unknown model: {model_name}")
        return {"status": "error", "reason": "unknown model"}

    video_instance = None
    temp_output = None

    try:
        video_instance = ModelClass.objects.get(id=video_id)

        if model_name == "DisplayVideo":
            video_field = getattr(video_instance, "video", None)
        else:
            video_field = getattr(video_instance, "file", None)

        if not video_field or not getattr(video_field, "path", None):
            logger.error(f"Video file does not exist for {model_name} id={video_id}")
            return {"status": "error", "reason": "file missing"}

        video_path = video_field.path

        if model_name == "DisplayVideo":
            duration_option = ["-ss", "0", "-t", "10"]
            scale_option = ["-vf", "crop='min(iw,ih)':'min(iw,ih)',scale=800:800"]
            audio_option = ["-an"]
        else:
            duration_option = []
            scale_option = ["-vf", "scale=800:-2"]
            audio_option = []

        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            temp_output = tmp.name

        cmd = (
            ["ffmpeg", "-y", "-i", video_path]
            + duration_option
            + scale_option
            + audio_option
            + [
                "-vcodec",
                "libx264",
                "-preset",
                "veryfast",
                "-crf",
                "20",
                "-movflags",
                "+faststart",
                "-max_muxing_queue_size",
                "9999",
                temp_output,
            ]
        )

        subprocess.run(
            cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE
        )

        with open(temp_output, "rb") as f:
            video_field.save(os.path.basename(video_field.name), File(f), save=True)

        if hasattr(video_instance, "status"):
            video_instance.status = "done"
            video_instance.save(update_fields=["status"])

        logger.info(f"Video {video_id} compressed successfully")
        return {"status": "done"}

    except Exception as e:
        logger.error(f"Failed to compress video {model_name} id={video_id}: {e}")
        if video_instance and hasattr(video_instance, "status"):
            video_instance.status = "failed"
            video_instance.save(update_fields=["status"])
        raise self.retry(countdown=5)

    finally:
        if temp_output and os.path.exists(temp_output):
            try:
                os.remove(temp_output)
            except Exception as e:
                logger.warning(f"Could not remove temp file: {e}")
