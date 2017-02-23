from django.db import models

# Create your models here.
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
    activeEvent = models.IntegerField()

class Event(models.Model):
    instanceUrl = models.CharField(max_length=5)
    scheduledStart = models.IntegerField()
    actualStart = models.IntegerField()
    scheduledEnd = models.IntegerField()
    actualEnd = models.IntegerField()
    done = models.BooleanField()
    name = models.CharField(max_length=200)
    speaker = models.CharField(max_length=200)