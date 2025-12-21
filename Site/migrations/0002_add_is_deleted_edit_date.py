from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Site", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="message",
            name="is_deleted",
            field=models.BooleanField(default=False),
        ),
    ]
