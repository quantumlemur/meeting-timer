from django.conf.urls import url

from . import views
from . import timerControl

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^api/', views.api, name='api'),
    url(r'^currentTimerInfo', timerControl.currentTimerInfo, name='currentTimerInfo'),
    url(r'^updateCurrentTimer', timerControl.updateCurrentTimer, name='updateCurrentTimer'),
]