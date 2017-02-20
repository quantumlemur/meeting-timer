import uuid
from base64 import urlsafe_b64encode


from django.shortcuts import render, redirect
from django.http import HttpResponse

from .models import schedulerInstance

# Create your views here.

def timer(request, url=''):
    isNew = 'true'
    try:
        instance = schedulerInstance.objects.get(url=url)
        name = instance.name
        date = instance.date.date()
        isNew = 'false'
    except schedulerInstance.DoesNotExist:
        if len(url) == 0:
            return redirect('/scheduleEditor/' + urlsafe_b64encode(uuid.uuid4().bytes)[:5].decode('utf-8'))
        name = 'Event Name'
        date = '2016-02-15'
    return render(request, 'timer/timer.html', {'url': url, 'name': name, 'date': date, 'isNew': isNew})

def timerControl(request, url=''):
    isNew = 'true'
    try:
        instance = schedulerInstance.objects.get(url=url)
        name = instance.name
        date = instance.date.date()
        isNew = 'false'
    except schedulerInstance.DoesNotExist:
        if len(url) == 0:
            return redirect('/scheduleEditor/' + urlsafe_b64encode(uuid.uuid4().bytes)[:5].decode('utf-8'))
        name = 'Event Name'
        date = '2016-02-15'
    return render(request, 'timer/timerControl.html', {'url': url, 'name': name, 'date': date, 'isNew': isNew})

def scheduleEditor(request, url=''):
    isNew = 'true'
    try:
        instance = schedulerInstance.objects.get(url=url)
        name = instance.name
        date = instance.date.date()
        isNew = 'false'
    except schedulerInstance.DoesNotExist:
        if len(url) == 0:
            return redirect('/scheduleEditor/' + urlsafe_b64encode(uuid.uuid4().bytes)[:5].decode('utf-8'))
        name = 'Event Name'
        date = '2016-02-15'
    return render(request, 'timer/scheduleEditor.html', {'url': url, 'name': name, 'date': date, 'isNew': isNew})