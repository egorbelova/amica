from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import DisplayPhoto, DisplayVideo
from .serializers import DisplayMediaCreateSerializer, DisplayMediaSerializer


class DisplayMediaViewSet(viewsets.ViewSet):
    def get_object_instance(self):
        content_type = self.request.query_params.get("content_type")
        object_id = self.request.query_params.get("object_id")
        if not content_type or not object_id:
            return None
        from django.contrib.contenttypes.models import ContentType

        model = ContentType.objects.get(model=content_type).model_class()
        return get_object_or_404(model, pk=object_id)

    def list(self, request, *args, **kwargs):
        obj = self.get_object_instance()
        if not obj:
            return Response({"detail": "Missing content_type or object_id"}, status=400)

        photos = DisplayPhoto.objects.filter(content_object=obj)
        videos = DisplayVideo.objects.filter(content_object=obj)
        media = list(photos) + list(videos)

        serializer = DisplayMediaSerializer(
            media, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        obj = self.get_object_instance()
        if not obj:
            return Response({"detail": "Missing content_type or object_id"}, status=400)

        serializer = DisplayMediaCreateSerializer(
            data=request.data, context={"object": obj}
        )
        serializer.is_valid(raise_exception=True)
        media = serializer.save()
        output_serializer = DisplayMediaSerializer(media, context={"request": request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def set_primary(self, request, pk=None):
        media_photo = DisplayPhoto.objects.filter(pk=pk).first()
        media_video = DisplayVideo.objects.filter(pk=pk).first()
        media = media_photo or media_video
        if not media:
            return Response({"detail": "Media not found"}, status=404)

        media.is_primary = True
        media.save()
        serializer = DisplayMediaSerializer(media, context={"request": request})
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        media_photo = DisplayPhoto.objects.filter(pk=pk).first()
        media_video = DisplayVideo.objects.filter(pk=pk).first()
        media = media_photo or media_video
        if not media:
            return Response({"detail": "Media not found"}, status=404)
        media.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
