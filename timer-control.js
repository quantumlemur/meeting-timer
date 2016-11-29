var ViewModel = function() {
	var self = this;

	var gutterWidth = 15

	var color = d3.scale.category20c()



	// assumed to be sorted by scheduledStart
	var data = [
			{"id":"a", "scheduledStart":"2016-11-29 09:15:00", "scheduledEnd":"2016-11-29 10:15:00", "actualStart":"2016-11-29 09:15:00", "actualEnd":"2016-11-29 10:15:00", "done":true, "active":false, "name":"lunch", "speaker":""},
			{"id":"b", "scheduledStart":"2016-11-29 10:15:00", "scheduledEnd":"2016-11-29 11:15:00", "actualStart":"2016-11-29 10:15:00", "actualEnd":"2016-11-29 11:15:00", "done":false, "active":true, "name":"meeting", "speaker":"speaker"},
			{"id":"c", "scheduledStart":"2016-11-29 11:15:00", "scheduledEnd":"2016-11-29 12:15:00", "actualStart":"2016-11-29 11:15:00", "actualEnd":"2016-11-29 12:15:00", "done":false, "active":false, "name":"another meeting", "speaker":"another speaker"},
			{"id":"d", "scheduledStart":"2016-11-29 12:15:00", "scheduledEnd":"2016-11-29 13:15:00", "actualStart":"2016-11-29 12:15:00", "actualEnd":"2016-11-29 13:15:00", "done":false, "active":false, "name":"coffee break", "speaker":""},
			{"id":"e", "scheduledStart":"2016-11-29 13:15:00", "scheduledEnd":"2016-11-29 14:15:00", "actualStart":"2016-11-29 13:15:00", "actualEnd":"2016-11-29 14:15:00", "done":false, "active":false, "name":"networking", "speaker":""},
			{"id":"f", "scheduledStart":"2016-11-29 14:15:00", "scheduledEnd":"2016-11-29 15:15:00", "actualStart":"2016-11-29 14:15:00", "actualEnd":"2016-11-29 15:15:00", "done":false, "active":false, "name":"yet another meeting", "speaker":"the pope"},
			{"id":"g", "scheduledStart":"2016-11-29 15:15:00", "scheduledEnd":"2016-11-29 16:15:00", "actualStart":"2016-11-29 15:15:00", "actualEnd":"2016-11-29 16:15:00", "done":false, "active":false, "name":"watching paint dry", "speaker":"Mario the Painter"},
			{"id":"h", "scheduledStart":"2016-11-29 16:15:00", "scheduledEnd":"2016-11-29 17:15:00", "actualStart":"2016-11-29 16:15:00", "actualEnd":"2016-11-29 17:15:00", "done":false, "active":false, "name":"evaporating into thin air", "speaker":"a water molecule"},
			{"id":"i", "scheduledStart":"2016-11-29 17:15:00", "scheduledEnd":"2016-11-29 18:15:00", "actualStart":"2016-11-29 17:15:00", "actualEnd":"2016-11-29 18:15:00", "done":false, "active":false, "name":"unicycle practice", "speaker":"a clown car full of clowns"}
		]

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
	var maxHour = maxTime.startOf('hour')

	var timeScale = d3.scale.linear()
		.domain([minTime.valueOf(), maxTime.valueOf()])
		.range([1,99])


	var timeOverlayMajor = []
	var timeOverlayMinor = []

	var stepTime = minHour
	while (stepTime <= maxHour) {
		timeOverlayMajor.push({
			label: stepTime.format('h:mm A'),
			y: timeScale(stepTime.valueOf()) + '%'
		})
		// half hour
		stepTime.add(30, 'minutes')
		timeOverlayMinor.push({
			label: stepTime.format('h:mm A'),
			y: timeScale(stepTime.valueOf()) + '%'
		})
		stepTime.add(30, 'minutes')
	}


	data.map(function(d) {
		d.startTime = moment(d.scheduledStart)
		d.endTime = moment(d.scheduledEnd)
		d.actualStartTime = moment(d.actualStart)
		d.actualEndTime = moment(d.actualEnd)

		d.duration = d.actualEndTime.diff(d.actualStartTime)
		d.yScheduled = timeScale(d.startTime.valueOf())
		d.heightScheduled = timeScale(d.endTime.valueOf()) - timeScale(d.startTime.valueOf())
		d.yActual = timeScale(d.actualStartTime.valueOf())
		d.heightActual = timeScale(d.actualEndTime.valueOf()) - timeScale(d.actualStartTime.valueOf())

		d.displayNameScheduled = d.name + ' (' + d.endTime.diff(d.startTime, 'minutes') + 'm)'
		d.displayNameActual = d.name + ' (' + d.actualEndTime.diff(d.actualStartTime, 'minutes') + 'm)'

	})




	self.currentEventName = ko.observable('')
	self.scheduledStart = ko.observable('')
	self.actualStart = ko.observable('')
	self.startDifference = ko.observable('')







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
				.attr('class', 'event')
				.attr('fill', function(d) { return color(d.name) })
				.attr('x', '1%')
				.attr('y', function(d) { return d.yScheduled+'%' })
				.attr('width', RofL-2+"%")
				.attr('height', function(d) { return d.heightScheduled+'%' })

		events.append('text')
				.attr('class', 'eventText')
				.text(function(d) { return d.displayNameScheduled })
				.attr('x', '2%')
				.attr('y', function(d) { return d.yScheduled+1+'%' })

		events.append('text')
				.attr('class', 'speakerText')
				.text(function(d) { return d.speaker })
				.attr('x', '2%')
				.attr('y', function(d) { return d.yScheduled+3.5+'%' })

		// right
		events.append('rect')
				.attr('class', 'event')
				.attr('fill', function(d) { return color(d.name) })
				.attr('x', LofR+1+'%')
				.attr('y', function(d) { return d.yActual+'%' })
				.attr('width', RofL-2+"%")
				.attr('height', function(d) { return d.heightActual+'%' })

		events.append('text')
				.attr('class', 'eventText')
				.text(function(d) { return d.displayNameActual })
				.attr('x', LofR+2+'%')
				.attr('y', function(d) { return d.yActual+1+'%' })

		events.append('text')
				.attr('class', 'speakerText')
				.text(function(d) { return d.speaker })
				.attr('x', LofR+2+'%')
				.attr('y', function(d) { return d.yScheduled+3.5+'%' })




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


	render()

	var updateCurrentTimeLine = function() {
		d3.select('.currentTimeLine').transition()
			.duration(100)
			.attr('y1', timeScale(moment())+'%')
			.attr('y2', timeScale(moment())+'%')
	}

	setInterval(updateCurrentTimeLine, 10000)
}

ko.applyBindings(new ViewModel());


