var ViewModel = function() {
	var self = this;

	var gutterWidth = 150
	var edgePadding = 10

	var color = d3.scale.category20c()

	self.scheduleName = ko.observable(window._initialScheduleName)
	self.scheduleDate = ko.observable(window._initialScheduleDate)
	self.scheduleUrl = ko.observable(window._initialScheduleUrl)
	self.scheduleActiveEvent = ko.observable(window._initialActiveEvent)
	self.scheduleUnsaved = ko.observable(window._isNew == 'true')

	self.RofL = (100-gutterWidth)/2
	self.LofR = 100-self.RofL

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





	var dragScheduled = d3.behavior.drag()
		.origin(function(d) { return {x:0, y:self.timeScale(d.scheduledStart) } })
		.on('dragstart', dragstarted)
		.on('drag', draggedSchedule)
		.on('dragend', dragend)
	function dragstarted(d) {
		d3.event.sourceEvent.stopPropagation()
		d3.select(this).style('opacity', '.5')
		self.scheduleUnsaved(true)
	}
	function draggedSchedule(d) {
		var duration = d.scheduledEnd - d.scheduledStart
		d.scheduledStart = Math.floor(self.timeScale.invert(d3.event.y)/60)*60
		d.actualStart = d.scheduledStart
		d.scheduledEnd = d.scheduledStart + duration
		d.actualEnd = d.scheduledEnd
		d3.select(this)
			.attr('transform', function(d) { return 'translate(0,' + d3.event.y + ')' })
	}
	function dragend(d) {
		d3.select(this).style('opacity', '1')
		updateTimings()
	}


	var resizeTop = d3.behavior.drag()
		.origin(function(d) { return {x:0, y:self.timeScale(d.scheduledStart) } })
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
		d.scheduledStart = Math.floor(self.timeScale.invert(d3.event.y)/60)*60
		d.actualStart = d.scheduledStart
		d3.select(this.parentNode)
			.attr('transform', function(d) { return 'translate(0,' + d3.event.y + ')' })
		d3.select(this.parentNode).select('.eventRect')
			.attr('height', function(d) { return self.timeScale(d.scheduledEnd) - d3.event.y })
		d3.select(this.parentNode).select('.eventText')
			.text(function(d) { return d.name + ' (' + ((d.scheduledEnd - d.scheduledStart)/60) + ' m)' })
	}
	function resizeEnd(d) {
		d3.select(this.parentNode)
			.style('opacity', '1')
			.style('z-index', '0')

		updateTimings()
	}


	var resizeBottom = d3.behavior.drag()
		.origin(function(d) { return {x:0, y:self.timeScale(d.scheduledEnd) } })
		.on('dragstart', resizeStarted)
		.on('drag', resizedBottom)
		.on('dragend', resizeEnd)
	function resizedBottom(d) {
		console.log(d3.event.y)
		d.scheduledEnd = Math.floor(self.timeScale.invert(d3.event.y)/60)*60
		d.actualEnd = d.scheduledEnd
		d3.select(this.parentNode).select('.eventRect')
			.attr('height', function(d) { return d3.event.y - self.timeScale(d.scheduledStart) })
		d3.select(this.parentNode).select('.eventText')
			.text(function(d) { return d.name + ' (' + ((d.scheduledEnd - d.scheduledStart)/60) + ' m)' })
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
			.attr('y', edgePadding*2.5)
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



	var updateTimings = function() {
		data.sort(function(a,b) {
			return a.scheduledStart - b.scheduledStart
		})

		// go through all the events and update their timings and durations here
		for (var i=0; i<data.length; i++) {
			e = data[i]
			// see if there's overlap between events
			var diff = 0
			if (i>0) {
				diff = data[i-1].scheduledEnd - e.scheduledStart
				if (diff > 0) {
					e.scheduledStart += diff
					e.actualStart = e.scheduledStart
					e.scheduledEnd += diff
					e.actualEnd = e.scheduledEnd
					self.scheduleUnsaved(true)
					// console.log('new time', e.scheduledStart/60)
				}
			}

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
			var minTime = Math.min(data[0].scheduledStart)
			var maxTime = Math.max(data[data.length-1].scheduledEnd)
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
		var events = self.eventLayer.selectAll('.event')
				.data(data, function(d) { return d.pk })

		events.enter()
			.append('g')
			.attr('id', 'scheduledEvent')
			.attr('class', 'event')
			.attr('transform', function(d) { return 'translate(0,' + self.timeScale(d.scheduledStart) + ')' })
			.call(dragScheduled)
			.each(function(d) {
				d3.select(this)
					.append('rect')
					.attr('class', 'eventRect')
					.attr('fill', function(d) { return color(d.pk).substring(0,5) })
					.attr('x', edgePadding)
					.attr('width', RofL-(2*edgePadding))
					.attr('height', function(d) { return self.timeScale(d.scheduledEnd) - self.timeScale(d.scheduledStart) })
					.style('cursor', 'move')

				d3.select(this)
					.append('rect')
					.style('opacity', 0)
					.attr('x', edgePadding)
					.attr('width', RofL-(2*edgePadding))
					.attr('height', edgePadding)
					.style('cursor', 'n-resize')
					.call(resizeTop)

				d3.select(this)
					.append('rect')
					.attr('class', 'resizeBottom')
					.style('opacity', 0)
					.attr('x', edgePadding)
					.attr('y', function(d) { return self.timeScale(d.scheduledEnd) - self.timeScale(d.scheduledStart) - edgePadding })
					.attr('width', RofL-(2*edgePadding))
					.attr('height', edgePadding)
					.style('cursor', 'n-resize')
					.call(resizeBottom)
				
				d3.select(this)
					.append('text')
					.attr('class', 'eventText')
					.text(function(d) { return d.name + ' (' + Math.floor((d.scheduledEnd - d.scheduledStart)/60) + ' m)' })
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

			
		self.timeScale = d3.scale.linear()
			.domain([minHour, maxHour])
			.rangeRound([edgePadding, self.height-edgePadding])


		// go through all the events and update the timeline display here
		events.transition()
			.duration(250)
			.attr('transform', function(d) { return 'translate(0,' + self.timeScale(d.scheduledStart) + ')' })

		events.select('.eventRect').transition()
			.duration(250)
			.attr('height', function(d) { return self.timeScale(d.scheduledEnd) - self.timeScale(d.scheduledStart) })
			.attr('fill', function(d) { return color(d.pk) })


		events.select('.eventText')
			.text(function(d) { return d.name + ' (' + Math.floor((d.scheduledEnd - d.scheduledStart)/60) + ' m)' })

		events.select('.resizeBottom')
			.attr('y', function(d) { return self.timeScale(d.scheduledEnd) - self.timeScale(d.scheduledStart) - edgePadding })



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

			})


		overlayLines.transition()
			.duration(250)
			.attr('transform', function(d) { return 'translate(0,' + self.timeScale(d.time) + ')'})

		events.exit().remove()
		overlayLines.exit().remove()

	}



	var render = function() {
		d3.selectAll('#timelineSVG').remove()

		self.width = $('.timelineDiv').width()
		self.height = $('.timelineDiv').height()

		self.RofL = (self.width - gutterWidth)/2
		self.LofR = self.height - self.RofL



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


		updateTimelineDisplay()

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
				activeEvent: self.scheduleActiveEvent(),
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
					pk: d.pk,
					scheduledStart: d.scheduledStart,
					actualStart: d.actualStart,
					scheduledEnd: d.scheduledEnd,
					actualEnd: d.actualEnd,
					done: d.done,
					name: d.name,
					speaker: d.speaker,
					csrfmiddlewaretoken: window.CSRF_TOKEN,
				},
				success: function(msg) {
					d.pk = msg.pk
					updateTimelineDisplay()
				}
			})
		})

		self.scheduleUnsaved(false)
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
				console.log(msg)
				render()
				updateTimings()
			}
		})
	}
	
	self.loadScheduleEvents()

	window.onresize = function() {
		render()
	}


}

ko.applyBindings(new ViewModel());


