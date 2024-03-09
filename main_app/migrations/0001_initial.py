# Generated by Django 4.2.10 on 2024-02-20 19:38

from django.db import migrations, models
import main_app.custom_storage


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='TestProduct',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pro_name', models.CharField(max_length=100)),
                ('pro_size', models.CharField(max_length=14)),
                ('pro_price', models.DecimalField(decimal_places=2, max_digits=8)),
                ('pro_image', models.FileField(storage=main_app.custom_storage.MediaStorage, upload_to='test_folder')),
            ],
        ),
    ]