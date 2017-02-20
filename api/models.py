from django.db import models

class Hit(models.Model):
    hit_id = models.CharField(max_length=200)
    time = models.DateTimeField('timestamp', auto_now_add=True)

class CurrentEvent(models.Model):
    instanceUrl = models.CharField(max_length=5)
    active = models.BooleanField()
    name = models.CharField(max_length=200)
    start = models.DateTimeField()
    warn = models.DateTimeField()
    end = models.DateTimeField()
    flash = models.BooleanField()

class schedulerInstance(models.Model):
    date = models.DateTimeField()
    name = models.CharField(max_length=200)
    url = models.CharField(max_length=5)

class Event(models.Model):
    instanceUrl = models.CharField(max_length=5)
    scheduledStart = models.DateTimeField()
    actualStart = models.DateTimeField()
    scheduledEnd = models.DateTimeField()
    actualEnd = models.DateTimeField()
    done = models.BooleanField()
    active = models.BooleanField()
    name = models.CharField(max_length=200)
    speaker = models.CharField(max_length=200)