import datetime
import dateutil.parser

from django.http import JsonResponse
from django.http import HttpResponse

from .models import CurrentEvent

from django.views.decorators.csrf import csrf_exempt


def currentTimerInfo(request):
    events = CurrentEvent.objects.all()
    if len(events) > 0:
        e = events.latest('id')
        o = {
            'active': 'true' if e.active else 'false',
            'name': e.name,
            'start': e.start.isoformat(),
            'end': e.end.isoformat(),
            'warn': e.warn.isoformat(),
            'flash': 'true' if e.flash else 'false'
        }
        return JsonResponse(o)
    else:
        return JsonResponse({'error': 'no current event'})

@csrf_exempt
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