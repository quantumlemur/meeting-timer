import dateutil.parser

from django.core import serializers
from django.http import HttpResponse
from django.http import JsonResponse


from .models import schedulerInstance
from .models import Event

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
    except schedulerInstance.DoesNotExist:
        instance = schedulerInstance(url=url, name=name, date=dateutil.parser.parse(date), activeEvent=activeEvent)
    instance.save()
    return HttpResponse('I think it worked')

def saveEvent(request):
    p = request.POST
    try:
        instance = schedulerInstance.objects.get(url=url)
    except schedulerInstance.DoesNotExist:
        instance = schedulerInstance(url=url, name=name, date=dateutil.parser.parse(date), activeEvent=activeEvent)
    instance.save()
    try:
        event = Event.objects.get(pk=int(p['pk']))
    except (Event.DoesNotExist, ValueError):
        event = Event()
    event.instanceUrl = p['instanceUrl']
    event.scheduledStart = int(p['scheduledStart'])
    event.actualStart = int(p['actualStart'])
    event.scheduledEnd = int(p['scheduledEnd'])
    event.actualEnd = int(p['actualEnd'])
    event.done = p['done'] == 'true'
    event.name = p['name']
    event.speaker = p['speaker']
    event.save()
    return JsonResponse({'pk': event.pk})

def loadScheduleEvents(request):
    url = request.POST['url']
    events = Event.objects.filter(instanceUrl=url)
    # out = []
    # for event in events:
    #     out.append(serializers.serialize('json', [event, ]))
    # print('============================================')
    # print(out)
    return HttpResponse(serializers.serialize('json', events), content_type='application/json')



