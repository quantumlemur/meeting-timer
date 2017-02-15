from django.conf.urls import url

from . import views
from . import timerControl
from . import scheduleControl

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^api/', views.api, name='api'),
    url(r'^currentTimerInfo', timerControl.currentTimerInfo, name='currentTimerInfo'),
    url(r'^updateCurrentTimer', timerControl.updateCurrentTimer, name='updateCurrentTimer'),
    url(r'^saveSchedule', scheduleControl.saveSchedule, name='saveSchedule'),
    url(r'^saveEvent', scheduleControl.saveEvent, name='saveEvent'),
]