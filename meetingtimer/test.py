from django.http import HttpResponse



def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")


def db(request):

    greeting = Greeting()
    greeting.save()

    greetings = Greeting.objects.all()

    return render(request, 'db.html', {'greetings': greetings})