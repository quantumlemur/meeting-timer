from django.conf.urls import url

from . import views
from . import timerControl

urlpatterns = [
    url(r'^$', views.scheduleEditor, name='scheduleEditor'),
    url(r'^control/([0-9a-zA-Z_-]*)$', views.timerControl, name='timerControl'),
    url(r'^scheduleEditor/([0-9a-zA-Z_-]*)$', views.scheduleEditor, name='scheduleEditor'),
    url(r'^timer/([0-9a-zA-Z_-]*)$', views.timer, name='timer'),
    url(r'^currentTimerInfo', timerControl.currentTimerInfo, name='currentTimerInfo'),
    url(r'^updateCurrentTimer', timerControl.updateCurrentTimer, name='updateCurrentTimer'),
    url(r'^saveSchedule', views.saveSchedule, name='saveSchedule'),
    url(r'^saveEvent', views.saveEvent, name='saveEvent'),
    url(r'^deleteEvent', views.deleteEvent, name='deleteEvent'),
    url(r'^loadScheduleEvents', views.loadScheduleEvents, name='loadScheduleEvents'),
]