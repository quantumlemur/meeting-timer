import datetime
import dateutil.parser

from django.http import JsonResponse
from django.http import HttpResponse

from .models import CurrentEvent

from django.views.decorators.csrf import csrf_exempt


def currentTimerInfo(request):
    print(request.POST)
    url = request.POST['scheduleURL'][0]
    try:
        event = CurrentEvent.objects.get(url=url)
        o = {
            'active': 'true' if event.active else 'false',
            'name': event.name,
            'start': event.start.isoformat(),
            'end': event.end.isoformat(),
            'warn': event.warn.isoformat(),
            'flash': 'true' if event.flash else 'false'
        }
        return JsonResponse(o)
    except schedulerInstance.DoesNotExist:
        return JsonResponse({'error': 'no current event'})

def updateCurrentTimer(request):
    data = request.POST
    event = CurrentEvent(
        active = data['active'] == 'true',
        name = data['name'],
        start = dateutil.parser.parse(data['start']),
        warn = dateutil.parser.parse(data['warn']),
        end = dateutil.parser.parse(data['end']),
        flash = data['flash'] == 'true'
        )
    event.save()
    return JsonResponse(data)