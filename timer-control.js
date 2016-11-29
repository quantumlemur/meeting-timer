var ViewModel = function() {
	var self = this;

	var gutterWidth = 20

	var color = d3.scale.category20c();




	self.rawData = ko.observableArray([
			{"id":"a", "name":"lunch", "scheduledStart":"50400", "scheduledEnd":"51400", "actualStart":"50400", "actualEnd":"52400", "done":true, "active":false},
			{"id":"b", "name":"meeting", "scheduledStart":"51400", "scheduledEnd":"52400", "actualStart":"52400", "actualEnd":"54400", "done":false, "active":true},
			{"id":"c", "name":"another meeting", "scheduledStart":"52400", "scheduledEnd":"53400", "actualStart":"54400", "actualEnd":"56400", "done":false, "active":false},
			{"id":"d", "name":"coffee break", "scheduledStart":"53400", "scheduledEnd":"54400", "actualStart":"56400", "actualEnd":"58400", "done":false, "active":false},
			{"id":"e", "name":"networking", "scheduledStart":"54400", "scheduledEnd":"55400", "actualStart":"58400", "actualEnd":"62400", "done":false, "active":false},
			{"id":"f", "name":"yet another meeting", "scheduledStart":"55400", "scheduledEnd":"56400", "actualStart":"62400", "actualEnd":"64400", "done":false, "active":false},
			{"id":"g", "name":"watching paint dry", "scheduledStart":"56400", "scheduledEnd":"57400", "actualStart":"64400", "actualEnd":"66400", "done":false, "active":false},
			{"id":"h", "name":"evaporating into thin air", "scheduledStart":"57400", "scheduledEnd":"58400", "actualStart":"66400", "actualEnd":"68400", "done":false, "active":false},
			{"id":"i", "name":"unicycle practice", "scheduledStart":"58400", "scheduledEnd":"59400", "actualStart":"68400", "actualEnd":"70400", "done":false, "active":false}
		])

	// $.ajax({
	// 	url: 'api.html',
	// 	type: 'GET',
	// 	datatype: 'json',
	// 	success: function(msg){
	// 		self.rawData(JSON.parse(msg))
	// 		self.render()
	// 	}
	// })



	self.render = function() {
		var data = self.rawData()

		var RofL = (100-gutterWidth)/2
		var LofR = 100-RofL

		var minTime = Math.min(data[0].scheduledStart, data[0].actualStart)
		var maxTime = Math.max(data[data.length-1].scheduledEnd, data[data.length-1].actualEnd)

		var timeScale = d3.scale.linear()
			.domain([minTime, maxTime])
			.range([1,99])

		var minHour = Math.floor(minTime / 3600)
		var maxHour = Math.floor(maxTime / 3600)

		var timeOverlayMajor = []
		for (var i=0; i<maxHour-minHour+1; i++) {
			var hour = i + minHour
			timeOverlayMajor.push({label: hour+":00", hour:hour*3600, y:timeScale(hour*3600)+"%"})
		}


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
				.data(self.rawData())
			.enter()

		// left
		events.append('rect')
				.attr('class', 'event')
				.attr('fill', function(d) { return color(d.name) })
				.attr('x', '1%')
				.attr('y', function(d) { return timeScale(d.scheduledStart)+'%' })
				.attr('width', RofL-2+"%")
				.attr('height', function(d) { return timeScale(d.scheduledEnd) - timeScale(d.scheduledStart) + '%' })

		events.append('text')
				.attr('class', 'eventText')
				.text(function(d) { return d.name })
				.attr('x', '2%')
				.attr('y', function(d) { return timeScale(d.scheduledStart)+2+'%' })

		// right
		events.append('rect')
				.attr('class', 'event')
				.attr('fill', function(d) { return color(d.name) })
				.attr('x', LofR+1+'%')
				.attr('y', function(d) { return timeScale(d.actualStart)+'%' })
				.attr('width', RofL-2+"%")
				.attr('height', function(d) { return timeScale(d.actualEnd) - timeScale(d.actualStart) + '%' })

		events.append('text')
				.attr('class', 'eventText')
				.text(function(d) { return d.name })
				.attr('x', LofR+2+'%')
				.attr('y', function(d) { return timeScale(d.actualStart)+2+'%' })





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
				.attr('x1', '0%')
				.attr('y1', function(d) { return d.y })
				.attr('x2', RofL+3+"%")
				.attr('y2', function(d) { return d.y })

		// right lines
		majorLines.append('line')
				.attr('class', 'majorLine')
				.attr('x1', LofR-3+"%")
				.attr('y1', function(d) { return d.y })
				.attr('x2', '100%')
				.attr('y2', function(d) { return d.y })


	}



	self.render()
}

ko.applyBindings(new ViewModel());


