from django.shortcuts import render

from django.http import HttpResponse

from .models import Hit

import random

def index(request):
    return HttpResponse("Hello, world. You're at the db index.")

def db(request):
    hit = Hit(hit_id=str(random.random()))
    hit.save()

    hits = Hit.objects.all()

    return render(request, 'db/db.html', {'hits': hits})