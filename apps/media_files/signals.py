# from django.db.models.signals import pre_save
# from django.dispatch import receiver
# from .models import DisplayPhoto, DisplayVideo

# @receiver(pre_save, sender=DisplayPhoto)
# @receiver(pre_save, sender=DisplayVideo)
# def unset_old_primary(sender, instance, **kwargs):
#     if instance.is_primary and instance.content_type and instance.object_id:
#         sender.objects.filter(
#             content_type=instance.content_type,
#             object_id=instance.object_id,
#             is_primary=True
#         ).exclude(pk=instance.pk).update(is_primary=False)
