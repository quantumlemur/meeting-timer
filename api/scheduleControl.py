import dateutil.parser

from django.http import HttpResponse

from .models import schedulerInstance

def saveSchedule(request):
    url = request.POST['url']
    name = request.POST['name']
    date = request.POST['date']
    try:
        instance = schedulerInstance.objects.get(url=url)
        instance.name = name
        instance.date = dateutil.parser.parse(date)
    except schedulerInstance.DoesNotExist:
        instance = schedulerInstance(url=url, name=name, date=dateutil.parser.parse(date))
    instance.save()
    return HttpResponse('I think it worked')

def saveEvent(request):
    return HttpResponse('WIP')