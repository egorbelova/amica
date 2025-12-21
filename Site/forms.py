from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.core.exceptions import ValidationError
from django import forms
from .models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    # first_name = forms.CharField(max_length=30, label='', required=True, widget=forms.TextInput(attrs={'placeholder': 'Your Name'}), error_messages={'required': 'Please enter your name'})
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
        error_messages={"invalid": "INVALID!!11", "null": "NULL11!"},
    )
    email = forms.EmailField(
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
        password1 = self.cleaned_data["password1"]
        password2 = self.cleaned_data["password2"]

        if password1 and password2 and password1 != password2:
            raise ValidationError("Password don't match")
        return password2

    class Meta:
        model = CustomUser
        fields = ("username", "email", "password1", "password2")


class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = CustomUser
        fields = ("email",)
