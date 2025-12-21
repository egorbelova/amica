# tasks.py
from celery import shared_task
from django.core.files import File
from django.core.exceptions import ObjectDoesNotExist
import subprocess
import tempfile
import os
import logging
from .models import ProfileVideo

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, retry_backoff=True)
def compress_video(self, video_id):
    video = None
    temp_output = None

    try:
        video = ProfileVideo.objects.get(id=video_id)

        if video.status == "done":
            logger.info(f"Video {video_id} already done")
            return {"status": "done"}

        # Ставим статус processing
        video.status = "processing"
        video.save(update_fields=["status"])

        # Создаём временный файл
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            temp_output = tmp.name

        cmd = [
            "ffmpeg", "-y",
            "-i", video.video.path,
            "-vf", "crop='min(iw,ih)':'min(iw,ih)',scale=640:640",
            "-vcodec", "libx264",
            "-preset", "fast",
            "-crf", "28",
            "-an",
            "-movflags", "+faststart",
            temp_output,
        ]


        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

        if os.path.exists(temp_output) and os.path.getsize(temp_output) > 0:
            with open(temp_output, "rb") as f:
                video.video.save(os.path.basename(video.video.name), File(f), save=True)

            video.status = "done"
            video.save(update_fields=["status"])
            logger.info(f"Video {video_id} compressed successfully")
            return {"status": "done"}

    except ObjectDoesNotExist:
        logger.error(f"Video {video_id} not found")
        return {"status": "not_found"}

    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode("utf-8") if e.stderr else str(e)
        logger.error(f"FFmpeg failed: {error_msg}")
        if video:
            video.status = f"failed: {error_msg[:100]}"
            video.save(update_fields=["status"])
        raise self.retry(countdown=5)

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        if video:
            video.status = "failed"
            video.save(update_fields=["status"])
        raise self.retry(countdown=5)

    finally:
        if temp_output and os.path.exists(temp_output):
            try:
                os.remove(temp_output)
            except:
                pass
