var ViewModel = function() {
	var self = this;

	var gutterWidth = 15

	var color = d3.scale.category20c()

	self.scheduleName = ko.observable(window._initialScheduleName)
	self.scheduleDate = ko.observable(window._initialScheduleDate)
	self.scheduleUrl = ko.observable(window._initialScheduleUrl)
	self.scheduleUnsaved = ko.observable(window._isNew == 'true')


	self.warningTime = ko.observable(120) // seconds

	self.controlAutoStart = ko.observable(false)
	// self.controlMoveEventsUp = ko.observable(true)
	self.controlMaintainDayEnd = ko.observable(false)

	self.active = ko.observable(false)
	self.flash = ko.observable(true)

	self.parsedTime = ko.observable('')
	self.timeStatusClass = ko.observable('normalTime')

	self.supposedToEnd = moment()

	self.updateParsedTime = function() {
		var time
		if (self.active()) {
			time = self.supposedToEnd.diff(moment(), 'seconds')
		} else {
			time = self.currentEvent().actualEndTime.diff(self.currentEvent().actualStartTime, 'seconds')
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
	}


	// decrement timer
	setInterval(function() { self.updateParsedTime() }, 1000)	







	// assumed to be sorted by scheduledStart
	var data = [
			// {"id":"a", "scheduledStart":"2016-11-30 17:17:00", "scheduledEnd":"2016-11-30 17:18:00", "actualStart":"2016-11-30 17:17:00", "actualEnd":"2016-11-30 17:18:00", "done":true, "active":false, "name":"lunch", "speaker":""},
			// {"id":"b", "scheduledStart":"2016-11-30 17:18:00", "scheduledEnd":"2016-11-30 18:19:00", "actualStart":"2016-11-30 17:18:00", "actualEnd":"2016-11-30 18:19:00", "done":false, "active":true, "name":"meeting", "speaker":"speaker"}
			// {"id":"c", "scheduledStart":"2016-11-30 11:17:00", "scheduledEnd":"2016-11-30 12:17:00", "actualStart":"2016-11-30 11:17:00", "actualEnd":"2016-11-30 12:17:00", "done":false, "active":false, "name":"another meeting", "speaker":"another speaker"},
			// {"id":"d", "scheduledStart":"2016-11-30 12:17:00", "scheduledEnd":"2016-11-30 13:17:00", "actualStart":"2016-11-30 12:17:00", "actualEnd":"2016-11-30 13:17:00", "done":false, "active":false, "name":"coffee break", "speaker":""},
			// {"id":"e", "scheduledStart":"2016-11-30 13:17:00", "scheduledEnd":"2016-11-30 14:17:00", "actualStart":"2016-11-30 13:17:00", "actualEnd":"2016-11-30 14:17:00", "done":false, "active":false, "name":"networking", "speaker":""},
			// {"id":"f", "scheduledStart":"2016-11-30 14:17:00", "scheduledEnd":"2016-11-30 15:17:00", "actualStart":"2016-11-30 14:17:00", "actualEnd":"2016-11-30 15:17:00", "done":false, "active":false, "name":"yet another meeting", "speaker":"the pope"},
			// {"id":"g", "scheduledStart":"2016-11-30 15:17:00", "scheduledEnd":"2016-11-30 16:17:00", "actualStart":"2016-11-30 15:17:00", "actualEnd":"2016-11-30 16:17:00", "done":false, "active":false, "name":"watching paint dry", "speaker":"Mario the Painter"},
			// {"id":"h", "scheduledStart":"2016-11-30 16:17:00", "scheduledEnd":"2016-11-30 17:17:00", "actualStart":"2016-11-30 16:17:00", "actualEnd":"2016-11-30 17:17:00", "done":false, "active":false, "name":"evaporating into thin air", "speaker":"a water molecule"},
			// {"id":"i", "scheduledStart":"2016-11-30 17:17:00", "scheduledEnd":"2016-11-30 18:17:00", "actualStart":"2016-11-30 17:17:00", "actualEnd":"2016-11-30 18:17:00", "done":false, "active":false, "name":"unicycle practice", "speaker":"a clown car full of clowns"}
		]

	var tstart = moment().subtract(1, 'minutes')
	var tnumEvents = 3
	var tlenEvents = 20
	for (var i=0; i<tnumEvents; i++) {
		var a = {}

		a.id = Math.floor(Math.random()*99999)
		a.scheduledStart = tstart.toISOString()
		a.actualStart = tstart.toISOString()
		a.scheduledEnd = tstart.add(tlenEvents, 'minutes').toISOString()
		a.actualEnd = tstart.toISOString()
		a.done = false
		a.active = false
		a.name = a.id
		a.speaker = a.name

		data.push(a)
	}


	// $.ajax({
	// 	url: 'api.html',
	// 	type: 'GET',
	// 	datatype: 'json',
	// 	success: function(msg){
	// 		self.rawData(JSON.parse(msg))
	// 		self.render()
	// 	}
	// })

	var minTime = moment.min(moment(data[0].scheduledStart), moment(data[0].actualStart))
	var maxTime = moment.max(moment(data[data.length-1].scheduledEnd), moment(data[data.length-1].actualEnd))

	var minHour = minTime.startOf('hour')
	var maxHour = maxTime.startOf('hour').add(1, 'hour')

	var timeScale = d3.scale.linear()
		.domain([minTime.valueOf(), maxTime.valueOf()])
		.range([1,99])


	var timeOverlayMajor = []
	var timeOverlayMinor = []

	var stepTime = minHour
	while (stepTime <= maxHour) {
		timeOverlayMajor.push({
			label: stepTime.format('h:mm A'),
			y: timeScale(stepTime) + '%'
		})
		// half hour
		stepTime.add(30, 'minutes')
		timeOverlayMinor.push({
			label: stepTime.format('h:mm A'),
			y: timeScale(stepTime) + '%'
		})
		stepTime.add(30, 'minutes')
	}


	data.map(function(d) {
		d.scheduledStartTime = moment(d.scheduledStart)
		d.scheduledEndTime = moment(d.scheduledEnd)
		d.actualStartTime = moment(d.actualStart)
		d.actualEndTime = moment(d.actualEnd)

		d.scheduledDuration = d.scheduledEndTime.diff(d.scheduledStartTime)
		d.actualDuration = d.actualEndTime.diff(d.actualStartTime)

		d.yScheduled = timeScale(d.scheduledStartTime)
		d.heightScheduled = timeScale(d.scheduledEndTime) - timeScale(d.scheduledStartTime)
		d.yActual = timeScale(d.actualStartTime)
		d.heightActual = timeScale(d.actualEndTime) - timeScale(d.actualStartTime)

		d.displayNameScheduled = d.name + ' (' + d.scheduledEndTime.diff(d.scheduledStartTime, 'minutes') + 'm)'
		d.displayNameActual = d.name + ' (' + d.actualEndTime.diff(d.actualStartTime, 'minutes') + 'm)'

	})


	var formatDifference = function(diff) {
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


	self.currentEvent = ko.observable(data[0])


	self.currentEventName = ko.computed(function() { return self.currentEvent().name })
	self.currentSpeaker = ko.computed(function() { return self.currentEvent().speaker })
	self.scheduledStart = ko.computed(function() { return self.currentEvent().scheduledStartTime.format('LT') })
	self.scheduledEnd = ko.computed(function() { return self.currentEvent().scheduledEndTime.format('LT') })
	self.scheduledDuration = ko.computed(function() { return self.currentEvent().scheduledEndTime.diff(self.currentEvent().scheduledStartTime, 'minutes')})
	self.actualStart = ko.computed(function() { return self.currentEvent().actualStartTime.format('LT') })
	self.actualEnd = ko.computed(function() { return self.currentEvent().actualEndTime.format('LT') })
	self.actualDuration = ko.computed(function() { return self.currentEvent().actualEndTime.diff(self.currentEvent().actualStartTime, 'minutes')})
	self.differenceStart = ko.computed(function() {	return formatDifference(self.currentEvent().actualStartTime.diff(self.currentEvent().scheduledStartTime, 'minutes')) })
	self.differenceEnd = ko.computed(function() { return formatDifference(self.currentEvent().actualEndTime.diff(self.currentEvent().scheduledEndTime, 'minutes')) })
	self.differenceDuration = ko.computed(function() {
		var diff = self.actualDuration() - self.scheduledDuration()
		return diff==0 ? '--' : diff+'m'
	})


	var updateTimelineDisplay = function() {
		// go through all the events and update the timeline display here
		d3.selectAll('.event#actualEvent').transition()
			.duration(1000)
			.attr('y', function(d) { return d.yActual+'%' })
			.attr('height', function(d) { return d.heightActual+'%' })

		d3.selectAll('.eventText#actualEvent').transition()
			.duration(1000)
			.attr('y', function(d) { return d.yActual+1+'%' })

		d3.selectAll('.speakerText#actualEvent').transition()
			.duration(1000)
			.attr('y', function(d) { return d.yActual+3.5+'%' })

		d3.selectAll('.event#scheduledEvent').transition()
			.duration(1000)
			.attr('y', function(d) { return d.yScheduled+'%' })
			.attr('height', function(d) { return d.heightScheduled+'%' })

		d3.selectAll('.eventText#scheduledEvent').transition()
			.duration(1000)
			.attr('y', function(d) { return d.yScheduled+1+'%' })

		d3.selectAll('.speakerText#scheduledEvent').transition()
			.duration(1000)
			.attr('y', function(d) { return d.yScheduled+3.5+'%' })
	}


	var updateTimings = function() {
		// console.log('=======================')
		data.sort()

		// go through all the events and update their timings and durations here
		for (var i=0; i<data.length; i++) {
			e = data[i]
			// see if there's overlap between events
			var diff = 0
			if (i>0) {
				diff = data[i-1].actualEndTime.diff(e.actualStartTime)
				// console.log(i, diff)
			}

			if (diff < 0) {
				// if we have an open gap
				var endDiff = data[data.length-1].scheduledEndTime.diff(data[data.length-1].actualEndTime)
				if (endDiff < 0) {
					// and we're running behind schedule
					// then move the event up to fill in the gap
					// console.log('running behind', diff/1000/60, endDiff/1000/60)
					e.actualStartTime.add(Math.max(diff, endDiff))
					e.actualStart = e.actualStartTime.format('YYYY-MM-DD HH:MM:SS')
					e.actualEndTime.add(Math.max(diff, endDiff))
					e.actualEnd = e.actualEndTime.format('YYYY-MM-DD HH:MM:SS')
					e.yActual = timeScale(e.actualStartTime)
				}
			}
			if (diff > 0) {

				if (self.controlMaintainDayEnd()) {
					// if we want to maintain the day ending time, then shorten the event the correct proportional amount
					var dayEndTime = data[data.length-1].scheduledEndTime
					var remainingDayTime = dayEndTime.diff(e.actualStartTime)
					var timeProportion = e.actualDuration / remainingDayTime
					var endShift = diff*timeProportion
					e.actualEndTime.subtract(endShift)
					e.actualEnd = e.actualEndTime.format('YYYY-MM-DD HH:MM:SS')

					e.heightActual = timeScale(e.actualEndTime) - timeScale(e.actualStartTime)
					e.displayNameActual = e.name + ' (' + e.actualEndTime.diff(e.actualStartTime, 'minutes') + 'm)'
				} 
				// if we aren't maintaining the day ending time, then just shift the ending back to maintain the event duration
				e.actualEndTime.add(diff)
				e.actualEnd = e.actualEndTime.format('YYYY-MM-DD HH:MM:SS')
				// shift the event start back to remove the overlap
				e.actualStartTime.add(diff)
				e.actualStart = e.actualStartTime.format('YYYY-MM-DD HH:MM:SS')

				e.yActual = timeScale(e.actualStartTime)
			}
		}
		updateTimelineDisplay()
		// for (var i=0; i<data.length; i++) {
		// 	console.log(data[i].actualStartTime.format('LT'), "     ", data[i].actualEndTime.format('LT'))
		// }
	}


	self.startEvent = function() {
		self.active(true)
		if ($('#endButton').attr('disabled')=='disabled') {
			$('#endButton').removeAttr('disabled')
		}

		e = self.currentEvent()
		e.active = true
		e.actualStartTime = moment()
		e.actualStart = e.actualStartTime.format('YYYY-MM-DD HH:MM:SS')
		e.actualEndTime = moment().add(e.actualDuration)
		e.actualEnd = e.actualEndTime.format('YYYY-MM-DD HH:MM:SS')

		e.yActual = timeScale(e.actualStartTime)

		self.supposedToEnd = e.actualEndTime
		self.updateParsedTime()
		self.currentEvent(e)
		for (var i=0; i<data.length; i++) {
			if (data[i].id == e.id) {
				data[i] = e
			}
		}

		updateTimings()

		self.postCurrentEventInfo()

		console.log(data)
	}


	self.endEvent = function() {
		if (self.active()) {
			self.active(false)
			$('#endButton').attr('disabled', 'disabled')

			e = self.currentEvent()
			e.active = false
			e.actualEndTime = moment()
			e.actualEnd = e.actualEndTime.format('YYYY-MM-DD HH:MM:SS')
			console.log(e.actualDuration)
			e.actualDuration = e.actualEndTime.diff(e.actualStartTime)
			console.log('asdasd')
			console.log(e.actualDuration)
			e.heightActual = timeScale(e.actualEndTime) - timeScale(e.actualStartTime)

			self.supposedToEnd = e.actualEndTime
			self.updateParsedTime()
			self.currentEvent(e)
			for (var i=0; i<data.length; i++) {
				if (data[i].id == e.id) {
					data[i] = e
					if (i+1<data.length) {
						self.currentEvent(data[i+1])
					}
				}
			}

			updateTimings()

			if (self.controlAutoStart()) {
				self.startEvent()
			}
		}
	}

	self.controlSetAutoStart = function() {
		self.controlAutoStart(!self.controlAutoStart())
	}

	// self.controlSetMoveEventsUp = function() {
	// 	self.controlMoveEventsUp(!self.controlMoveEventsUp())
	// }

	self.controlSetMaintainDayEnd = function() {
		self.controlMaintainDayEnd(!self.controlMaintainDayEnd())
	}


	var updateRunning = function() {
		// console.log(self.currentEvent().actualEndTime.format())
		// update current time line and the current event
		d3.select('.currentTimeLine').transition()
			.duration(100)
			.attr('y1', timeScale(moment())+'%')
			.attr('y2', timeScale(moment())+'%')

		// if we're running over time, update the actual end time of the current event
		e = self.currentEvent()
		if (self.active() && e.actualEndTime.diff(moment())<0) {
			e.actualEndTime = moment()
			e.actualEnd = e.actualEndTime.format('YYYY-MM-DD HH:MM:SS')

			e.actualDuration = e.actualEndTime.diff(e.actualStartTime)

			e.heightActual = timeScale(e.actualEndTime) - timeScale(e.actualStartTime)

			e.displayNameActual = e.name + ' (' + e.actualEndTime.diff(e.actualStartTime, 'minutes') + 'm)'

			self.currentEvent.valueHasMutated()
			updateTimings()
		}

		// if we aren't running an event and it hasn't started, move it back
		e = self.currentEvent()
		if (!self.active() && e.actualStartTime.diff(moment())<0) {
			var diff = moment().diff(e.actualStartTime)
			e.actualEndTime.add(diff)
			e.actualStartTime = moment()
			e.yActual = timeScale(e.actualStartTime)
			self.currentEvent.valueHasMutated()
			updateTimings()
		}
	}


	var render = function() {

		var RofL = (100-gutterWidth)/2
		var LofR = 100-RofL


		d3.select(".timelineDiv")
		   .append("div")
		   .classed("svg-container", true) //container class to make it responsive
		   .append("svg")
		   .attr('id', 'timelineSVG')
		   //class to make it responsive
		   .classed("svg-content-responsive", true)

		var timelineSVG = d3.select('#timelineSVG')

		timelineSVG.append('rect')
				.attr('class', 'backgroundRect')
				.attr('x', '0%')
				.attr('y', '0%')
				.attr('width', RofL+'%')
				.attr('height', '100%')

		timelineSVG.append('rect')
				.attr('class', 'backgroundRect')
				.attr('x', LofR+'%')
				.attr('y', '0%')
				.attr('width', RofL+'%')
				.attr('height', '100%')


		var events = timelineSVG.selectAll('.event')
				.data(data)
			.enter()



		// left
		events.append('rect')
				.attr('id', 'scheduledEvent')
				.attr('class', 'event')
				.attr('fill', function(d) { return color(d.name) })
				.attr('x', '1%')
				.attr('y', function(d) { return d.yScheduled+'%' })
				.attr('width', RofL-2+"%")
				.attr('height', function(d) { return d.heightScheduled+'%' })

		events.append('text')
				.attr('id', 'scheduledEvent')
				.attr('class', 'eventText')
				.text(function(d) { return d.displayNameScheduled })
				.attr('x', '2%')
				.attr('y', function(d) { return d.yScheduled+1+'%' })

		events.append('text')
				.attr('id', 'scheduledEvent')
				.attr('class', 'speakerText')
				.text(function(d) { return d.speaker })
				.attr('x', '2%')
				.attr('y', function(d) { return d.yScheduled+3.5+'%' })

		// right
		events.append('rect')
				.attr('id', 'actualEvent')
				.attr('class', 'event')
				.attr('fill', function(d) { return color(d.name) })
				.attr('x', LofR+1+'%')
				.attr('y', function(d) { return d.yActual+'%' })
				.attr('width', RofL-2+"%")
				.attr('height', function(d) { return d.heightActual+'%' })

		events.append('text')
				.attr('id', 'actualEvent')
				.attr('class', 'eventText')
				.text(function(d) { return d.displayNameActual })
				.attr('x', LofR+2+'%')
				.attr('y', function(d) { return d.yActual+1+'%' })

		events.append('text')
				.attr('id', 'actualEvent')
				.attr('class', 'speakerText')
				.text(function(d) { return d.speaker })
				.attr('x', LofR+2+'%')
				.attr('y', function(d) { return d.yActual+3.5+'%' })







		var dragScheduled = d3.behavior.drag()
			.origin(function(d) { return {x:0, y:d.yScheduled } })
			.on('dragstart', dragstarted)
			.on('drag', draggedSchedule)
			.on('dragend', dragend)

		var dragActual = d3.behavior.drag()
			.origin(function(d) { return {x:0, y:d.yActual } })
			.on('dragstart', dragstarted)
			.on('drag', draggedActual)
			.on('dragend', dragend)

		function dragstarted(d) {
			d3.event.sourceEvent.stopPropagation()
		}

		function draggedSchedule(d) {
			d.scheduledStartTime = moment(timeScale.invert(d3.event.y))
			d.yScheduled = timeScale(d.scheduledStartTime)
			d.scheduledEndTime = d.scheduledStartTime.add(d.scheduledDuration)

			d3.selectAll('.event#scheduledEvent')
				.attr('y', function(d) { return d.yScheduled+'%' })
				.attr('height', function(d) { return d.heightScheduled+'%' })

			d3.selectAll('.eventText#scheduledEvent')
				.attr('y', function(d) { return d.yScheduled+1+'%' })

			d3.selectAll('.speakerText#scheduledEvent')
				.attr('y', function(d) { return d.yScheduled+3.5+'%' })
		}

		function draggedActual(d) {
			d.actualStartTime = moment(timeScale.invert(d3.event.y))
			d.yActual = timeScale(d.actualStartTime)
			d.actualEndTime = d.actualStartTime.add(d.actualDuration)

			d3.selectAll('.event#actualEvent')
				.attr('y', function(d) { return d.yActual+'%' })
				.attr('height', function(d) { return d.heightActual+'%' })

			d3.selectAll('.eventText#actualEvent')
				.attr('y', function(d) { return d.yActual+1+'%' })

			d3.selectAll('.speakerText#actualEvent')
				.attr('y', function(d) { return d.yActual+3.5+'%' })
		}

		function dragend(d) {
			updateTimings()
		}
		d3.selectAll('.event#scheduledEvent').call(dragScheduled)
		d3.selectAll('.event#actualEvent').call(dragActual)










		var genPath = function(d) {
			var path = d3.path()
			path.moveTo(d.RofL-2+'%', d.yScheduled+'%')
			path.lineTo(d.LofR+2+'%', d.yActual+'%')
			path.lineTo(d.LofR+2+'%', d.yActual+d.heightActual+'%')
			path.lineTo(d.RofL-2+'%', d.yScheduled+d.heightScheduled+'%')
			path.closePath()
			return path.toString()
		}

		events.append('path')
				.attr('d', genPath )
				.attr('fill', 'pink')



		// time overlay
		var majorLines = timelineSVG.selectAll('.majorLine')
				.data(timeOverlayMajor)
			.enter()

		majorLines.append('text')
				.attr('class', 'majorLineText')
				.text(function (d) { return d.label })
				.attr('x', '50%')
				.attr('y', function(d) { return d.y })

		// left lines
		majorLines.append('line')
				.attr('class', 'majorLine')
				.attr('x1', '1%')
				.attr('y1', function(d) { return d.y })
				.attr('x2', RofL+3+"%")
				.attr('y2', function(d) { return d.y })

		// right lines
		majorLines.append('line')
				.attr('class', 'majorLine')
				.attr('x1', LofR-3+"%")
				.attr('y1', function(d) { return d.y })
				.attr('x2', '99%')
				.attr('y2', function(d) { return d.y })

		// minor lines
		var minorLines = timelineSVG.selectAll('.minorLine')
				.data(timeOverlayMinor)
			.enter()

		// left lines
		minorLines.append('line')
				.attr('class', 'minorLine')
				.attr('x1', '1%')
				.attr('y1', function(d) { return d.y })
				.attr('x2', RofL+1+"%")
				.attr('y2', function(d) { return d.y })

		// right lines
		minorLines.append('line')
				.attr('class', 'minorLine')
				.attr('x1', LofR-1+"%")
				.attr('y1', function(d) { return d.y })
				.attr('x2', '99%')
				.attr('y2', function(d) { return d.y })


		// current time
		timelineSVG.append('line')
				.attr('class', 'currentTimeLine')
				.attr('x1', '0%')
				.attr('x2', '100%')
				.attr('y1', timeScale(moment())+'%')
				.attr('y2', timeScale(moment())+'%')

	}


	self.postCurrentEventInfo = function() {
		$.ajax({
			url: '../updateCurrentTimer',
			type: 'POST',
			datatype: 'json',
			data: {
				active: self.active(),
				name: self.currentEventName(),
				start: self.currentEvent().actualStartTime.format(),
				warn: self.currentEvent().actualEndTime.format(),
				end: self.currentEvent().actualEndTime.format(),
				flash: self.flash(),
				csrfmiddlewaretoken: window.CSRF_TOKEN,
			}
		})
	}

	self.saveSchedule = function() {
		console.log(self.scheduleName())
		$.ajax({
			url: '../saveSchedule',
			type: 'POST',
			datatype: 'json',
			data: {
				name: self.scheduleName(),
				date: self.scheduleDate(),
				url: self.scheduleUrl(),
				csrfmiddlewaretoken: window.CSRF_TOKEN,
			}
		})

		data.forEach(function(d) {
			$.ajax({
				url: '../saveEvent',
				type: 'POST',
				datatype: 'json',
				data: {
					instanceUrl: self.scheduleUrl(),
					id: d.id,
					scheduledStart: d.scheduledStart,
					actualStart: d.actualStart,
					scheduledEnd: d.scheduledEnd,
					actualEnd: d.actualEnd,
					done: d.done,
					active: d.active,
					name: d.name,
					speaker: d.speaker,
					csrfmiddlewaretoken: window.CSRF_TOKEN,
				}
			})
		})

		self.scheduleUnsaved(false)
	}

	render()

	setInterval(updateRunning, 10000)
}

ko.applyBindings(new ViewModel());


