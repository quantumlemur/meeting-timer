var ViewModel = function() {
	var self = this;

	var gutterWidth = 150
	var edgePadding = 10
	var buttonSize = 30

	var color = d3.scale.category20c()

	self.scheduleName = ko.observable(window._initialScheduleName)
	self.scheduleDate = ko.observable(window._initialScheduleDate)
	self.scheduleUrl = ko.observable(window._initialScheduleUrl)
	self.activeEvent = ko.observable(window._initialActiveEvent)
	self.scheduleUnsaved = ko.observable(window._isNew == 'true')

	self.RofL = (100-gutterWidth)/2
	self.LofR = 100-self.RofL

	self.controlAutoStart = ko.observable(false)
	self.controlMaintainDayEnd = ko.observable(false)


	self.parsedTime = ko.observable('')
	self.warningTime = ko.observable('')
	self.supposedToEnd = ko.observable('')
	self.timeStatusClass = ko.observable('normalTime')
	self.upcomingEvent = ko.observable('')

	self.active = ko.computed(function() {
		return self.activeEvent() != -1
	})
	self.flash = ko.observable(true)


	self.updateParsedTime = function() {
		if (!!self.currentEvent()) {
			var time
			if (self.active()) {
				var d = new Date()
				var now = d.getHours()*3600 + d.getMinutes()*60 + d.getSeconds()
				time = self.currentEvent().actualEnd - now
			} else {
				time = self.currentEvent().actualEnd - self.currentEvent().actualStart
			}

			var negative = time < 0 ? "-" : ""
			time = Math.abs(time)
			var seconds = time % 60
			var minutes = (time - seconds)/60 % 60
			var hours = (time - minutes*60 - seconds)/3600
			var s = ("0" + seconds).slice(-2)
			var m = ("0" + minutes + ":").slice(-3)
			var h = hours > 0 ? hours+":" : ""
			self.parsedTime(negative + h + m + s)

			if (negative == '-') {
				self.timeStatusClass("overTime")
			} else if (time < self.warningTime()) {
				self.timeStatusClass("warningTime")
			} else {
				self.timeStatusClass("normalTime")
			}
		} else {
			self.parsedTime('')
			self.timeStatusClass('normalTime')
		}
	}



	var data = []



	function formatTime(s) {
		var hour = Math.floor(s/3600)
		var minute = '0' + Math.floor((s - hour*3600) / 60)
		minute = minute.slice(-2)
		var am = ' AM'
		if (hour == 12) {
			am = ' PM'
		} else if (hour > 12) {
			am = ' PM'
			hour -= 12
		}
		return hour + ':' + minute + am
	}


	var formatDifference = function(diff) {
		diff = Math.floor(diff/1000/60)
		var out = ''
		if (diff == 0) {
			out = '--'
		} else if (diff < 0) {
			out = diff + 'm early'
			out = out.slice(1)
		} else {
			out = diff + 'm late'
		}
		return out
	}

	self.controlSetAutoStart = function() {
		self.controlAutoStart(!self.controlAutoStart())
	}

	self.controlSetMaintainDayEnd = function() {
		self.controlMaintainDayEnd(!self.controlMaintainDayEnd())
	}

	self.controlResetDay = function() {
		data.forEach(function(d) {
			d.actualStart = d.scheduledStart
			d.actualEnd = d.scheduledEnd
			d.done = false
		})
		updateTimings()
	}



	self.currentEvent = ko.observable()

	self.currentEventName = ko.computed(function() { return !!self.currentEvent() ? self.currentEvent().name : '' })
	self.currentSpeaker = ko.computed(function() { return !!self.currentEvent() ? self.currentEvent().speaker : '' })
	self.scheduledStart = ko.computed(function() { return !!self.currentEvent() ? formatTime(self.currentEvent().scheduledStart) : '' })
	self.scheduledEnd = ko.computed(function() { return !!self.currentEvent() ? formatTime(self.currentEvent().scheduledEnd) : '' })
	self.scheduledDuration = ko.computed(function() { return !!self.currentEvent() ? (self.currentEvent().scheduledEnd - self.currentEvent().scheduledStart)/60 : '' })
	self.actualStart = ko.computed(function() { return !!self.currentEvent() ? formatTime(self.currentEvent().actualStart) : '' })
	self.actualEnd = ko.computed(function() { return !!self.currentEvent() ? formatTime(self.currentEvent().actualEnd) : '' })
	self.actualDuration = ko.computed(function() { return !!self.currentEvent() ? (self.currentEvent().actualEnd - self.currentEvent().actualStart)/60 : '' })
	self.differenceStart = ko.computed(function() {	return !!self.currentEvent() ? formatDifference(self.currentEvent().actualStart - self.currentEvent().scheduledStart) : '' })
	self.differenceEnd = ko.computed(function() { return !!self.currentEvent() ? formatDifference(self.currentEvent().actualEnd - self.currentEvent().scheduledEnd) : '' })
	self.differenceDuration = ko.computed(function() {
		var diff = self.actualDuration() - self.scheduledDuration()
		return diff==0 ? '--' : diff+'m'
	})



	var dragActual = d3.behavior.drag()
		.origin(function(d) { return {x:0, y:self.timeScale(d.actualStart) } })
		.on('dragstart', dragstarted)
		.on('drag', draggedSchedule)
		.on('dragend', dragend)
	function dragstarted(d) {
		d3.event.sourceEvent.stopPropagation()
		d3.select(this).style('opacity', '.5')
		self.scheduleUnsaved(true)
	}
	function draggedSchedule(d) {
		if (d.pk != self.activeEvent()) {
			var duration = d.actualEnd - d.actualStart
			d.actualStart = Math.floor(self.timeScale.invert(d3.event.y)/60)*60
			d.actualEnd = d.actualStart + duration
			d3.select(this)
				.attr('transform', function(d) { return 'translate(' + self.LofR + ',' + d3.event.y + ')' })
		}
	}
	function dragend(d) {
		d3.select(this).style('opacity', '1')
		updateTimings()
	}


	var resizeTop = d3.behavior.drag()
		.origin(function(d) { return {x:0, y:self.timeScale(d.actualStart) } })
		.on('dragstart', resizeStarted)
		.on('drag', resizedTop)
		.on('dragend', resizeEnd)
	function resizeStarted(d) {
		d3.event.sourceEvent.stopPropagation()
		d3.select(this.parentNode)
			.style('opacity', '.5')
			.style('z-index', '1')
		self.scheduleUnsaved(true)
	}
	function resizedTop(d) {
		console.log(d3.event.y)
		if (d.pk != self.activeEvent()) {
			d.actualStart = Math.floor(self.timeScale.invert(d3.event.y)/60)*60
			d3.select(this.parentNode)
				.attr('transform', function(d) { return 'translate(1,' + d3.event.y + ')' })
			d3.select(this.parentNode).select('.eventRect')
				.attr('height', function(d) { return self.timeScale(d.actualEnd) - d3.event.y })
			d3.select(this.parentNode).select('.eventText')
				.text(function(d) { return d.name + ' (' + ((d.actualEnd - d.actualStart)/60) + ' m)' })
		}
	}
	function resizeEnd(d) {
		d3.select(this.parentNode)
			.style('opacity', '1')
			.style('z-index', '0')

		updateTimings()
	}


	var resizeBottom = d3.behavior.drag()
		.origin(function(d) { return {x:0, y:self.timeScale(d.actualEnd) } })
		.on('dragstart', resizeStarted)
		.on('drag', resizedBottom)
		.on('dragend', resizeEnd)
	function resizedBottom(d) {
		console.log(d3.event.y)
		d.actualEnd = Math.floor(self.timeScale.invert(d3.event.y)/60)*60
		d3.select(this.parentNode).select('.eventRect')
			.attr('height', function(d) { return d3.event.y - self.timeScale(d.actualStart) })
		d3.select(this.parentNode).select('.eventText')
			.text(function(d) { return d.name + ' (' + ((d.actualEnd - d.actualStart)/60) + ' m)' })
	}



	var newEvent = function(d) {
		d3.event.stopPropagation()
		var y = d3.mouse(this)[1]
		console.log(d3.mouse(this))
		console.log(d3.event.y, self.timeScale.invert(y)/60/60)
		var time = Math.floor(self.timeScale.invert(y)/60) * 60
		data.push({
			pk: 'dummy' + Math.floor(Math.random()*999999999),
			scheduledStart: time,
			actualStart: time,
			scheduledEnd: time + 60*60,
			actualEnd: time + 60*60,
			done: false,
			name: 'Event Name',
			speaker: 'Event Speaker',
		})

		updateTimings()
	}

	self.startEvent = function() {

		e = self.currentEvent()
		self.activeEvent(e.pk)
		var duration = e.actualEnd - e.actualStart
		var d = new Date()
		var t =  d.getHours()*3600 + d.getMinutes()*60 + d.getSeconds()
		var diff = t - e.actualStart
		if (diff > 0) {

			if (self.controlMaintainDayEnd()) {
				// if we want to maintain the day ending time, then shorten the event the correct proportional amount
				var dayEndTime = data[data.length-1].scheduledEnd
				var remainingDayTime = dayEndTime - e.actualStart
				var timeProportion = (e.actualEnd - e.actualStart) / remainingDayTime
				var endShift = diff*timeProportion
				e.actualEnd -= endShift
			} 
			// if we aren't maintaining the day ending time, then just shift the ending back to maintain the event duration
			e.actualEnd += diff
			// shift the event start back to remove the overlap
			e.actualStart += diff
		} else {
			e.actualStart = t
			e.actualEnd = e.actualStart + duration
		}


		self.supposedToEnd(e.actualEnd)
		self.updateParsedTime()
		self.currentEvent(e)
		for (var i=0; i<data.length; i++) {
			if (data[i].pk == e.pk) {
				data[i] = e
			}
		}
		updateTimings()

		self.saveSchedule()

		console.log(data)
	}


	self.endEvent = function() {
		if (self.active()) {
			e = self.currentEvent()
			self.activeEvent(-1)
			var d = new Date()
			e.actualEnd = d.getHours()*3600 + d.getMinutes()*60 + d.getSeconds()
			e.done = true

			self.supposedToEnd(e.actualEnd)
			self.updateParsedTime()
			self.currentEvent(e)
			for (var i=0; i<data.length; i++) {
				if (data[i].pk == e.pk) {
					data[i] = e
					if (i+1<data.length) {
						self.currentEvent(data[i+1])
						self.upcomingEvent(data[i+1].pk)
					} else {
						self.currentEvent(null)
						self.upcomingEvent(null)
					}
				}
			}
			updateTimings()

			if (self.controlAutoStart()) {
				self.startEvent()
			}
			self.saveSchedule()
		}
	}

	var textClick = function(d) {
		d3.event.stopPropagation()
		var eventBase = d3.select(this.parentNode)
		var form = eventBase.append('foreignObject').attr('class', 'textEditorBox')
			.attr('x', edgePadding*2)
			.attr('y', edgePadding/2)
			.attr('font-size', '.9em')
		var input = form.append('xhtml:form')
			.append('input')
				.style('width', (self.RofL-(4*edgePadding))+'px')
				.on('mousedown', function(d) { d3.event.stopPropagation() })
				.attr('value', function() {
					this.focus()
					return d.name
				})
				.on('blur', function() {
					d.name = input.node().value
					eventBase.select('.eventText')
						.text(function(d) { return d.name + ' (' + ((d.scheduledEnd - d.scheduledStart)/60) + ' m)' })
					d3.select('.textEditorBox').remove()
				})
				.on('keypress', function() {
					if (d3.event.keyCode == 13) {
						d3.event.preventDefault()
						d.name = input.node().value
						eventBase.select('.eventText')
							.text(function(d) { return d.name + ' (' + ((d.scheduledEnd - d.scheduledStart)/60) + ' m)' })
						d3.select('.textEditorBox').remove()
					}
				})
	}

	var speakerClick = function(d) {
		d3.event.stopPropagation()
		var eventBase = d3.select(this.parentNode)
		var form = eventBase.append('foreignObject').attr('class', 'textEditorBox')
			.attr('x', edgePadding*2)
			.attr('y', edgePadding + 40)
			.attr('font-size', '.9em')
		var input = form.append('xhtml:form')
			.append('input')
				.style('width', (self.RofL-(4*edgePadding))+'px')
				.on('mousedown', function(d) { d3.event.stopPropagation() })
				.attr('value', function() {
					this.focus()
					return d.speaker
				})
				.on('blur', function() {
					d.speaker = input.node().value
					eventBase.select('.speakerText')
						.text(function(d) { return d.speaker })
					d3.select('.textEditorBox').remove()
				})
				.on('keypress', function() {
					if (d3.event.keyCode == 13) {
						d3.event.preventDefault()
						d.speaker = input.node().value
						eventBase.select('.speakerText')
							.text(function(d) { return d.speaker })
						d3.select('.textEditorBox').remove()
					}
				})
	}

	var startTimeClick = function(d) {
		d3.event.stopPropagation()
		var eventBase = d3.select(this.parentNode)
		var form = eventBase.append('foreignObject').attr('class', 'textEditorBox')
			.attr('x', edgePadding*2)
			.attr('y', edgePadding + 18)
			.attr('font-size', '.9em')
		var input = form.append('xhtml:form')
			.append('input')
				.style('width', '100px')
				.on('mousedown', function(d) { d3.event.stopPropagation() })
				.attr('value', function() {
					this.focus()
					return formatTime(d.actualStart)
				})
				.on('blur', function() {
					var i = new Date('2000-01-01 ' + input.node().value)
					var newtime = i.getHours()*3600 + i.getMinutes()*60 + i.getSeconds()
					if (!isNaN(newtime)) {
						d.actualStart = newtime
					}
					eventBase.select('.startTimeText')
						.text(function(d) { return formatTime(d.actualStart) })
					d3.select('.textEditorBox').remove()
					updateTimings()
				})
				.on('keypress', function() {
					if (d3.event.keyCode == 13) {
						d3.event.preventDefault()
						var i = new Date('2000-01-01 ' + input.node().value)
						var newtime = i.getHours()*3600 + i.getMinutes()*60 + i.getSeconds()
						if (!isNaN(newtime)) {
							d.actualStart = newtime
						}
						eventBase.select('.startTimeText')
							.text(function(d) { return formatTime(d.actualStart) })
						d3.select('.textEditorBox').remove()
						updateTimings()
					}
				})
	}

	var endTimeClick = function(d) {
		d3.event.stopPropagation()
		var eventBase = d3.select(this.parentNode)
		var form = eventBase.append('foreignObject').attr('class', 'textEditorBox')
			.attr('x', edgePadding*2 + 100)
			.attr('y', edgePadding + 18)
			.attr('font-size', '.9em')
		var input = form.append('xhtml:form')
			.append('input')
				.style('width', '100px')
				.on('mousedown', function(d) { d3.event.stopPropagation() })
				.attr('value', function() {
					this.focus()
					return formatTime(d.actualEnd)
				})
				.on('blur', function() {
					var i = new Date('2000-01-01 ' + input.node().value)
					var newtime = i.getHours()*3600 + i.getMinutes()*60 + i.getSeconds()
					if (!isNaN(newtime)) {
						d.actualEnd = newtime
					}
					eventBase.select('.endTimeText')
						.text(function(d) { return formatTime(d.actualEnd) })
					d3.select('.textEditorBox').remove()
					updateTimings()
				})
				.on('keypress', function() {
					if (d3.event.keyCode == 13) {
						d3.event.preventDefault()
						var i = new Date('2000-01-01 ' + input.node().value)
						var newtime = i.getHours()*3600 + i.getMinutes()*60 + i.getSeconds()
						if (!isNaN(newtime)) {
							d.actualEnd = newtime
						}
						eventBase.select('.endTimeText')
							.text(function(d) { return formatTime(d.actualEnd) })
						d3.select('.textEditorBox').remove()
						updateTimings()
					}
				})
	}

	d3.selection.prototype.moveToFront = function() {
		return this.each(function() {
			this.parentNode.appendChild(this)
		})
	}



	var updateTimings = function() {
		data.sort(function(a,b) {
			return a.actualStart - b.actualStart
		})

		// if we're running over time, update the actual end time of the current event
		var d = new Date()
		var t = d.getHours()*3600 + d.getMinutes()*60 + d.getSeconds()
		var e = self.currentEvent()
		if (self.active()) {
			if (e.actualEnd - t < 0) {
				e.actualEnd = t
				self.currentEvent.valueHasMutated()
			}
		}
		// go through all the events and update their timings and durations here
		for (var i=0; i<data.length; i++) {
			e = data[i]
			// see if there's overlap between events
			var diff = 0
			if (i>0) {
				diff = data[i-1].actualEnd - e.actualStart
				// console.log(i, diff)
			}

			if (diff < 0) {
				// if we have an open gap
				var endDiff = data[data.length-1].scheduledEnd - data[data.length-1].actualEnd
				if (endDiff < 0) {
					// and we're running behind schedule
					// then move the event up to fill in the gap
					// console.log('running behind', diff/1000/60, endDiff/1000/60)
					e.actualStart += Math.max(diff, endDiff)
					e.actualEnd += Math.max(diff, endDiff)
				}
			}
			if (diff > 0) {

				if (self.controlMaintainDayEnd()) {
					// if we want to maintain the day ending time, then shorten the event the correct proportional amount
					var dayEndTime = data[data.length-1].scheduledEnd
					var remainingDayTime = dayEndTime - e.actualStart
					var timeProportion = (e.actualEnd - e.actualStart) / remainingDayTime
					var endShift = diff*timeProportion
					e.actualEnd -= endShift
				} 
				// if we aren't maintaining the day ending time, then just shift the ending back to maintain the event duration
				e.actualEnd += diff
				// shift the event start back to remove the overlap
				e.actualStart += diff
			}
			self.saveEvent(e)
		}

		updateTimelineDisplay()
		// for (var i=0; i<data.length; i++) {
		// 	console.log(data[i].actualStartTime.format('LT'), "     ", data[i].actualEndTime.format('LT'))
		// }
	}


	var updateTimelineDisplay = function() {
		RofL = self.RofL
		LofR = self.LofR

		var minTime = 9*60*60
		var maxTime = 17*60*60


		if (data.length > 0) {
			var minTime = Math.min(data[0].scheduledStart, data[0].actualStart)
			var maxTime = Math.max(data[data.length-1].scheduledEnd, data[data.length-1].actualEnd)
		}
		var minHour = Math.floor(minTime / 3600) * 3600
		var maxHour = Math.ceil(maxTime / 3600) * 3600
		


		var timeOverlay = []

		var stepTime = minHour
		var major = true
		while (stepTime <= maxHour) {
			timeOverlay.push({
				label: formatTime(stepTime),
				time: stepTime,
				major: major
			})
			// half hour
			stepTime += 30*60
			major = !major
		}



		// create the new events
		var scheduledEvents = self.eventLayer.selectAll('#scheduledEvent')
				.data(data, function(d) { return d.pk })

		scheduledEvents.enter()
			.append('g')
			.attr('id', 'scheduledEvent')
			.attr('class', 'event')
			.attr('transform', function(d) { return 'translate(0,' + self.timeScale(d.scheduledStart) + ')' })
			.each(function(d) {
				d3.select(this)
					.append('rect')
					.attr('class', 'eventRect')
					.attr('fill', function(d) { return color(d.pk).substring(0,5) })
					.attr('x', edgePadding)
					.attr('width', RofL-(2*edgePadding))
					.attr('height', function(d) { return self.timeScale(d.scheduledEnd) - self.timeScale(d.scheduledStart) })
					.style('opacity', function(d) { return d.done ? 0.3 : 1 })
					.style('stroke', 'black')
					.style('stroke-width', function(d) { return d.pk==self.activeEvent()||d.pk==self.upcomingEvent() ? 5 : 0 })

				d3.select(this)
					.append('rect')
					.style('opacity', 0)
					.attr('x', edgePadding)
					.attr('width', RofL-(2*edgePadding))
					.attr('height', edgePadding)

				d3.select(this)
					.append('rect')
					.attr('class', 'resizeBottom')
					.style('opacity', 0)
					.attr('x', edgePadding)
					.attr('y', function(d) { return self.timeScale(d.scheduledEnd) - self.timeScale(d.scheduledStart) - edgePadding })
					.attr('width', RofL-(2*edgePadding))
					.attr('height', edgePadding)
				
				d3.select(this)
					.append('text')
					.attr('class', 'eventText')
					.text(function(d) { return d.name + ' (' + Math.floor((d.scheduledEnd - d.scheduledStart)/60) + ' m) ' + formatTime(d.scheduledStart) + ' - ' + formatTime(d.scheduledEnd) })
					.attr('x', 2*edgePadding)
					.attr('y', edgePadding)
					.style('cursor', 'text')
					.on('click', textClick)
				
				d3.select(this)
					.append('text')
					.attr('class', 'speakerText')
					.text(function(d, i) { return d.speaker })
					.attr('x', 2*edgePadding)
					.attr('y', 3*edgePadding)
					.style('cursor', 'text')
					.on('click', speakerClick)
			})

		var actualEvents = self.eventLayer.selectAll('#actualEvent')
				.data(data, function(d) { return d.pk })
		actualEvents.enter()
			.append('g')
			.attr('id', 'actualEvent')
			.attr('class', 'event')
			.attr('transform', function(d) { return 'translate(' + self.LofR + ',' + self.timeScale(d.actualStart) + ')' })
			.each(function(d) {
				d3.select(this)
					.append('rect')
					.attr('class', 'eventRect')
					.attr('fill', function(d) { return color(d.pk).substring(0,5) })
					.attr('x', edgePadding)
					.attr('width', RofL-(2*edgePadding))
					.attr('height', function(d) { return self.timeScale(d.actualEnd) - self.timeScale(d.actualStart) })
					.style('opacity', function(d) { return d.done ? 0.3 : 1 })
					.style('stroke', 'black')
					.style('stroke-width', function(d) { return d.pk==self.activeEvent()||d.pk==self.upcomingEvent() ? 5 : 0 })
				
				d3.select(this)
					.append('text')
					.attr('class', 'eventText')
					.text(function(d) { return d.name + ' (' + Math.floor((d.actualEnd - d.actualStart)/60) + ' m)' })
					.attr('x', 2*edgePadding)
					.attr('y', edgePadding)
					.style('cursor', 'text')
					.on('click', textClick)
				d3.select(this)
					.append('text')
					.attr('class', 'startTimeText')
					.text(function(d) { return formatTime(d.actualStart)})
					.attr('x', 2*edgePadding)
					.attr('y', edgePadding + 23)
					.style('cursor', 'text')
					.on('click', startTimeClick)
				d3.select(this)
					.append('text')
					.attr('class', 'timeText')
					.text('-')
					.attr('x', 2*edgePadding + 80)
					.attr('y', edgePadding + 23)
				d3.select(this)
					.append('text')
					.attr('class', 'endTimeText')
					.text(function(d) { return formatTime(d.actualEnd) })
					.attr('x', 2*edgePadding + 100)
					.attr('y', edgePadding + 23)
					.style('cursor', 'text')
					.on('click', endTimeClick)
				
				d3.select(this)
					.append('text')
					.attr('class', 'speakerText')
					.text(function(d, i) { return d.speaker })
					.attr('x', 2*edgePadding)
					.attr('y', edgePadding + 45)
					.style('cursor', 'text')
					.on('click', speakerClick)
			})

			
		self.timeScale = d3.scale.linear()
			.domain([minHour, maxHour])
			.rangeRound([edgePadding, self.height-edgePadding])


		// go through all the events and update the timeline display here
		scheduledEvents.transition()
			.duration(250)
			.attr('transform', function(d) { return 'translate(0,' + self.timeScale(d.scheduledStart) + ')' })
		actualEvents.transition()
			.duration(250)
			.attr('transform', function(d) { return 'translate(' + self.LofR + ',' + self.timeScale(d.actualStart) + ')' })

		scheduledEvents.select('.eventRect').transition()
			.duration(250)
			.attr('height', function(d) { return self.timeScale(d.scheduledEnd) - self.timeScale(d.scheduledStart) })
			.attr('fill', function(d) { return color(d.pk) })
			.style('opacity', function(d) { return d.done ? 0.3 : 1 })
			.style('stroke-width', function(d) { return d.pk==self.activeEvent()||d.pk==self.upcomingEvent() ? 5 : 0 })
		actualEvents.select('.eventRect').transition()
			.duration(250)
			.attr('height', function(d) { return self.timeScale(d.actualEnd) - self.timeScale(d.actualStart) })
			.attr('fill', function(d) { return color(d.pk) })
			.style('opacity', function(d) { return d.done ? 0.3 : 1 })
			.style('stroke-width', function(d) { return d.pk==self.activeEvent()||d.pk==self.upcomingEvent() ? 5 : 0 })


		scheduledEvents.select('.eventText')
			.text(function(d) { return d.name + ' (' + Math.floor((d.scheduledEnd - d.scheduledStart)/60) + ' m)' })
		scheduledEvents.select('.resizeBottom')
			.attr('y', function(d) { return self.timeScale(d.scheduledEnd) - self.timeScale(d.scheduledStart) - edgePadding })
		actualEvents.select('.eventText')
			.text(function(d) { return d.name + ' (' + Math.floor((d.actualEnd - d.actualStart)/60) + ' m)' })
		actualEvents.select('.startTimeText')
			.text(function(d) { return formatTime(d.actualStart)})
		actualEvents.select('.endTimeText')
			.text(function(d) { return formatTime(d.actualEnd) })





		// time overlay
		var overlayLines = self.timeLineLayer.selectAll('.overlayLine')
			.data(timeOverlay, function(d) { return d.label })

		overlayLines.enter()
			.append('g')
			.attr('class', 'overlayLine')
			.attr('transform', function(d) { return 'translate(0,' + self.timeScale(d.time) + ')'})
			.each(function(d) {
				if (d.major) {
					d3.select(this).append('text')
						.attr('class', 'majorLineText')
						.text(function (d) { return d.label })
						.attr('x', self.width/2)
				}

				d3.select(this).append('line')
					.attr('class', function(d) { return d.major ? 'majorLine' : 'minorLine' })
					.attr('x1', edgePadding)
					.attr('y1', 0)
					.attr('x2', self.RofL + 20)
					.attr('y2', 0)

				d3.select(this).append('line')
					.attr('class', function(d) { return d.major ? 'majorLine' : 'minorLine' })
					.attr('x1', self.width - edgePadding)
					.attr('y1', 0)
					.attr('x2', self.LofR - 20)
					.attr('y2', 0)

			})


		overlayLines.transition()
			.duration(250)
			.attr('transform', function(d) { return 'translate(0,' + self.timeScale(d.time) + ')'})

		var d = new Date()
		var t = d.getHours()*3600+d.getMinutes()*60+d.getSeconds()
		d3.select('.currentTimeLine').transition()
			.duration(250)
			.attr('y1', self.timeScale(t))
			.attr('y2', self.timeScale(t))

		scheduledEvents.exit().remove()
		actualEvents.exit().remove()
		overlayLines.exit().remove()

	}



	var render = function() {
		d3.selectAll('#timelineSVG').remove()

		self.width = $('.timelineDiv').width()
		self.height = $('.timelineDiv').height()

		self.RofL = (self.width - gutterWidth)/2
		self.LofR = self.width - self.RofL



		d3.select(".timelineDiv")
			.append("svg")
			.attr('id', 'timelineSVG')
			.attr('width', self.width)
			.attr('height', self.height)

		self.timelineSVG = d3.select('#timelineSVG')

		self.timelineSVG.append('rect')
				.attr('class', 'backgroundRect')
				.attr('width', self.RofL)
				.attr('height', self.height)
				.on('click', newEvent)

		self.timelineSVG.append('rect')
				.attr('class', 'backgroundRect')
				.attr('x', self.LofR)
				.attr('width', self.RofL)
				.attr('height', self.height)
				.on('click', newEvent)

		self.eventLayer = self.timelineSVG.append('g')
			.attr('id', 'eventLayer')

		self.timeLineLayer = self.timelineSVG.append('g')
			.attr('id', 'timeLineLayer')


		var minTime = 9*60*60
		var maxTime = 17*60*60

		var minHour = Math.floor(minTime / 3600) * 3600
		var maxHour = Math.ceil(maxTime / 3600) * 3600
		
		self.timeScale = d3.scale.linear()
			.domain([minHour, maxHour])
			.rangeRound([edgePadding, self.height-edgePadding])

		// current time
		var d = new Date()
		var t = d.getHours()*3600+d.getMinutes()*60+d.getSeconds()
		self.timeLineLayer.append('line')
			.attr('class', 'currentTimeLine')
			.attr('x1', 0)
			.attr('x2', self.width)
			.attr('y1', self.timeScale(t))
			.attr('y2', self.timeScale(t))


		updateTimelineDisplay()

	}

	self.postCurrentEventInfo = function() {
		$.ajax({
			url: '../updateCurrentTimer',
			type: 'POST',
			datatype: 'json',
			data: {
				active: self.active(),
				name: self.currentEventName(),
				start: self.currentEvent().actualStart,
				warn: self.currentEvent().actualEnd,
				end: self.currentEvent().actualEnd,
				flash: self.flash(),
				csrfmiddlewaretoken: window.CSRF_TOKEN,
			}
		})
	}

	self.saveEvent = function(e) {
		$.ajax({
			url: '../saveEvent',
			type: 'POST',
			datatype: 'json',
			data: {
				instanceUrl: self.scheduleUrl(),
				pk: e.pk,
				scheduledStart: e.scheduledStart,
				actualStart: e.actualStart,
				scheduledEnd: e.scheduledEnd,
				actualEnd: e.actualEnd,
				done: e.done,
				name: e.name,
				speaker: e.speaker,
				csrfmiddlewaretoken: window.CSRF_TOKEN,
			}
		})
	}

	self.saveSchedule = function() {
		$.ajax({
			url: '../saveSchedule',
			type: 'POST',
			datatype: 'json',
			data: {
				name: self.scheduleName(),
				date: self.scheduleDate(),
				url: self.scheduleUrl(),
				activeEvent: self.activeEvent(),
				csrfmiddlewaretoken: window.CSRF_TOKEN,
			}
		})
	}


	self.loadScheduleEvents = function() {
		$.ajax({
			url: '../loadScheduleEvents',
			type: 'POST',
			datatype: 'json',
			data: {
				csrfmiddlewaretoken: window.CSRF_TOKEN,
				url: self.scheduleUrl(),
			},
			success: function(msg) {
				data = msg.map(function(d) {
					var out = { pk: d.pk }
					Object.keys(d.fields).forEach(function(k) {
						out[k] = d.fields[k]
					})
					return out
				})
				data.sort(function(a,b) {
					return a.actualStart - b.actualStart
				})
				self.currentEvent(data[0])
				self.upcomingEvent(data[0].pk)
				render()

				updateTimings()
			}
		})
	}
	
	self.loadScheduleEvents()

	// decrement timer
	setInterval(function() { self.updateParsedTime() }, 1000)	
	// general update timer
	setInterval(function() { updateTimings() }, 10000)	

	window.onresize = function() {
		render()
	}


}

ko.applyBindings(new ViewModel());


