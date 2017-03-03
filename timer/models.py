from datetime import date

from django.db import models

# Create your models here.

class schedulerInstance(models.Model):
    date = models.DateTimeField()
    name = models.CharField(max_length=200)
    url = models.CharField(max_length=5)
    activeEvent = models.IntegerField()
    lastAccessed = models.DateField()


class Event(models.Model):
    instanceUrl = models.ForeignKey(schedulerInstance, on_delete=models.CASCADE)
    scheduledStart = models.IntegerField()
    actualStart = models.IntegerField()
    scheduledEnd = models.IntegerField()
    actualEnd = models.IntegerField()
    done = models.BooleanField()
    name = models.CharField(max_length=200)
    speaker = models.CharField(max_length=200)


class CurrentEvent(models.Model):
    instanceUrl = models.ForeignKey(schedulerInstance, on_delete=models.CASCADE)
    active = models.BooleanField()
    name = models.CharField(max_length=200)
    start = models.DateTimeField()
    warn = models.DateTimeField()
    end = models.DateTimeField()
    flash = models.BooleanField()