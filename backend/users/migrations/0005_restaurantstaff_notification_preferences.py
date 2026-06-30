from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_restaurantstaff_restaurants'),
    ]

    operations = [
        migrations.AddField(
            model_name='restaurantstaff',
            name='notification_preferences',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
