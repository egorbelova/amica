from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import *


class MessageAdmin(admin.ModelAdmin):
    list_display = ["id", "value", "room", "user", "date"]
    list_filter = ["room", "user", "date"]


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = "Profile"
    fk_name = "user"


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    inlines = (ProfileInline,)

    list_display = ("username", "email", "is_staff", "is_active")
    list_filter = ("email", "is_staff", "is_active")

    fieldsets = (
        (None, {"fields": ("username", "email", "password", "rooms")}),
        ("Permissions", {"fields": ("is_staff", "is_active")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "password",
                    "is_staff",
                    "is_active",
                    "rooms",
                ),
            },
        ),
    )
    search_fields = ("email",)
    ordering = ("email",)

    # def get_image(self, obj):
    #     if hasattr(obj, 'profile') and obj.profile.image:
    #         return obj.profile.image.url
    #     return "No image"
    # get_image.short_description = 'Image'

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super().get_inline_instances(request, obj)


# class FileInline(admin.TabularInline):
#     model = Message.file.through
#     extra = 0
#     readonly_fields = ['file', 'file_size', 'width', 'height']

# class MessageAdmin(admin.ModelAdmin):
#     list_display = ['id', 'value', 'room', 'user', 'date']
#     list_filter = ['room', 'user', 'date']
#     inlines = [FileInline]


# @admin.register(ImageFile)
# class ImageFileAdmin(admin.ModelAdmin):
#     list_display = ['id', 'original_name', 'category', 'file_size', 'width', 'height', 'thumbnail_small_preview']
#     readonly_fields = ['width', 'height', 'thumbnail_small', 'thumbnail_medium']

# @admin.register(VideoFile)
# class VideoFileAdmin(admin.ModelAdmin):
#     list_display = ['id', 'original_name', 'category', 'file_size']
#     readonly_fields = ['width', 'height']


admin.site.register(Message, MessageAdmin)
admin.site.register(Room)
admin.site.register(File)
admin.site.register(UserSetting)
admin.site.register(Sticker)
admin.site.register(StickerCollection)
admin.site.register(MessageReaction)
admin.site.register(MessageRecipient)
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(ImageFile)
admin.site.register(VideoFile)
admin.site.register(ProfilePhoto)
admin.site.register(ProfileVideo)
