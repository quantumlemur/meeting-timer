from django.db import models

class Hit(models.Model):
    hit_id = models.CharField(max_length=200)
    time = models.DateTimeField('timestamp', auto_now_add=True)