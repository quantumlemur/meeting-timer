from django.conf.urls import url

from . import views
from . import timerControl
from . import scheduleControl

urlpatterns = [
    url(r'^control/([0-9a-zA-Z_]*)$', views.timerControl, name='timerControl'),
    url(r'^scheduleEditor/([0-9a-zA-Z_]*)$', views.scheduleEditor, name='scheduleEditor'),
    url(r'^timer/([0-9a-zA-Z_]*)$', views.timer, name='timer'),
    url(r'^currentTimerInfo', timerControl.currentTimerInfo, name='currentTimerInfo'),
    url(r'^updateCurrentTimer', timerControl.updateCurrentTimer, name='updateCurrentTimer'),
    url(r'^saveSchedule', scheduleControl.saveSchedule, name='saveSchedule'),
    url(r'^saveEvent', scheduleControl.saveEvent, name='saveEvent'),
    url(r'^loadScheduleEvents', scheduleControl.loadScheduleEvents, name='loadScheduleEvents'),
]