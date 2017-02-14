from django.shortcuts import render

from django.http import HttpResponse

from .models import Hit

import random

def index(request):
    return HttpResponse("Hello, world. You're at the api index.")

def api(request):
    hit = Hit(hit_id=str(random.random()))
    hit.save()

    hits = Hit.objects.all()

    return render(request, 'api/api.html', {'hits': hits})