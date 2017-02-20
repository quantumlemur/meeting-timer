# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-02-14 20:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_auto_20170214_1412'),
    ]

    operations = [
        migrations.CreateModel(
            name='CurrentEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('active', models.BooleanField()),
                ('name', models.CharField(max_length=200)),
                ('start', models.DateTimeField()),
                ('warn', models.DateTimeField()),
                ('end', models.DateTimeField()),
                ('flash', models.BooleanField()),
            ],
        ),
    ]