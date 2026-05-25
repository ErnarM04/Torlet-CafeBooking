import uuid

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cafes', '0002_table_height_table_radius_table_rotation_table_shape_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Review',
            fields=[
                ('review_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True, verbose_name='Review ID')),
                ('name', models.CharField(max_length=100, verbose_name='Customer name')),
                ('rating', models.IntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)], verbose_name='Rating')),
                ('text', models.TextField(verbose_name='Review text')),
                ('is_approved', models.BooleanField(default=True, verbose_name='Approved')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('restaurant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='cafes.restaurant', verbose_name='Restaurant')),
            ],
            options={
                'verbose_name': 'Review',
                'verbose_name_plural': 'Reviews',
                'db_table': 'reviews',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='review',
            index=models.Index(fields=['restaurant', 'is_approved', '-created_at'], name='reviews_restaur_b3f15e_idx'),
        ),
    ]
