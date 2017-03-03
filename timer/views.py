import uuid
import datetime
import dateutil.parser

from base64 import urlsafe_b64encode

from django.core import serializers
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render, redirect

from .models import schedulerInstance
from .models import Event

# Create your views here.

def clearOldSchedules():
    oldSchedules = schedulerInstance.objects.filter(lastAccessed)


def timer(request, url=''):
    isNew = 'true'
    try:
        instance = schedulerInstance.objects.get(url=url)
        name = instance.name
        date = instance.date.date()
        activeEvent = instance.activeEvent
        isNew = 'false'
        # update last access time
        instance.lastAccessed = datetime.date.today()
        instance.save()
    except schedulerInstance.DoesNotExist:
        if len(url) == 0:
            return redirect('/scheduleEditor/' + urlsafe_b64encode(uuid.uuid4().bytes)[:5].decode('utf-8'))
        name = 'Event Name'
        activeEvent = '-1'
        date = '2016-02-15'
    return render(request, 'timer/timer.html', {'url': url, 'name': name, 'date': date, 'isNew': isNew, 'activeEvent': activeEvent})


def timerControl(request, url=''):
    isNew = 'true'
    try:
        instance = schedulerInstance.objects.get(url=url)
        name = instance.name
        date = instance.date.date()
        activeEvent = instance.activeEvent
        isNew = 'false'
        # update last access time
        instance.lastAccessed = datetime.date.today()
        instance.save()
    except schedulerInstance.DoesNotExist:
        if len(url) == 0:
            return redirect('/scheduleEditor/' + urlsafe_b64encode(uuid.uuid4().bytes)[:5].decode('utf-8'))
        name = 'Event Name'
        activeEvent = '-1'
        date = '2016-02-15'
    return render(request, 'timer/timerControl.html', {'url': url, 'name': name, 'date': date, 'isNew': isNew, 'activeEvent': activeEvent})


def scheduleEditor(request, url=''):
    isNew = 'true'
    try:
        instance = schedulerInstance.objects.get(url=url)
        name = instance.name
        date = instance.date.date()
        activeEvent = instance.activeEvent
        isNew = 'false'
        # update last access time
        instance.lastAccessed = datetime.date.today()
        instance.save()
    except schedulerInstance.DoesNotExist:
        if len(url) == 0:
            return redirect('/scheduleEditor/' + urlsafe_b64encode(uuid.uuid4().bytes)[:5].decode('utf-8'))
        name = 'Event Name'
        activeEvent = '-1'
        date = '2016-02-15'
    return render(request, 'timer/scheduleEditor.html', {'url': url, 'name': name, 'date': date, 'isNew': isNew, 'activeEvent': activeEvent})


def saveSchedule(request):
    url = request.POST['url']
    name = request.POST['name']
    date = request.POST['date']
    activeEvent = request.POST['activeEvent']
    try:
        instance = schedulerInstance.objects.get(url=url)
        instance.name = name
        instance.date = dateutil.parser.parse(date)
        instance.activeEvent = activeEvent
        instance.lastAccessed = datetime.date.today()
    except schedulerInstance.DoesNotExist:
        instance = schedulerInstance(url=url, name=name, date=dateutil.parser.parse(date), activeEvent=activeEvent, lastAccessed=datetime.date.today())
    instance.save()
    return HttpResponse('I think it worked')


def saveEvent(request):
    p = request.POST
    try:
        event = Event.objects.get(pk=int(p['pk']))
    except (Event.DoesNotExist, ValueError):
        event = Event()
        event.instanceUrl = schedulerInstance.objects.get(url=p['instanceUrl'])
    event.scheduledStart = int(p['scheduledStart'])
    event.actualStart = int(p['actualStart'])
    event.scheduledEnd = int(p['scheduledEnd'])
    event.actualEnd = int(p['actualEnd'])
    event.done = p['done'] == 'true'
    event.name = p['name']
    event.speaker = p['speaker']
    event.save()
    return JsonResponse({'pk': event.pk})

def deleteEvent(request):
    p = request.POST
    try:
        event = Event.objects.get(pk=int(p['pk']))
        event.delete()
    except (Event.DoesNotExist, ValueError):
        pass
    return JsonResponse({'ok': 'ok'})


def loadScheduleEvents(request):
    url = request.POST['url']
    try:
        instance = schedulerInstance.objects.get(url=url)
        events = instance.event_set.all()
    except schedulerInstance.DoesNotExist:
        events = []
    # out = []
    # for event in events:
    #     out.append(serializers.serialize('json', [event, ]))
    # print('============================================')
    # print(out)
    return HttpResponse(serializers.serialize('json', events), content_type='application/json')



