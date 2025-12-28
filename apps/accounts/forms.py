from django import forms
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.core.exceptions import ValidationError

from .models.models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    username = forms.CharField(
        label="Username",
        max_length=100,
        required=True,
        widget=forms.TextInput(
            attrs={
                "autofocus": "on",
                "autocomplete": "new-password",
                "class": "form-input",
                "placeholder": "Enter username",
            }
        ),
        error_messages={
            "invalid": "Enter a valid username",
            "required": "Username is required",
        },
    )
    email = forms.EmailField(
        required=True,
        label="Email address",
        max_length=254,
        help_text="",
        widget=forms.EmailInput(
            attrs={"placeholder": "Enter email-address", "autocomplete": "off"}
        ),
    )
    password1 = forms.CharField(
        label="Password",
        required=True,
        widget=forms.PasswordInput(
            attrs={"placeholder": "Enter password", "autocomplete": "new-password"}
        ),
    )
    password2 = forms.CharField(
        label="Repeat password",
        required=True,
        widget=forms.PasswordInput(
            attrs={
                "placeholder": "Enter the same password",
                "autocomplete": "new-password",
            }
        ),
    )

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            raise ValidationError("Passwords do not match")
        return password2

    def clean_email(self):
        email = self.cleaned_data.get("email").lower()
        qs = CustomUser.objects.filter(email=email)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise ValidationError("User with this email already exists")
        return email

    class Meta:
        model = CustomUser
        fields = ("username", "email", "password1", "password2")


class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = CustomUser
        fields = ("username", "email", "is_active", "is_staff")
