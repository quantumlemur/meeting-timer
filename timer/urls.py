from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^control/([0-9a-zA-Z_]*)$', views.timerControl, name='timerControl'),
    url(r'^timer$', views.timer, name='timer'),
]