var ViewModel = function() {
	var self = this;

	self.startTime = ko.observable(0)
	self.endTime = ko.observable(0)
	self.timeLeft = ko.observable(444)

	self.rawData = ko.observableArray([])

	$.ajax({
		url: 'api.html',
		type: 'GET',
		datatype: 'json',
		success: function(msg){
			self.rawData(JSON.parse(msg))
			self.render()
		}
	})

	self.render = function() {
		var data = self.rawData()

		var minTime = Math.min(data[0].scheduledStart, data[0].actualStart)
		var maxTime = Math.max(data[data.length-1].scheduledEnd, data[data.length-1].actualEnd)

		var minHour = Math.floor(minTime / 3600)
		var maxHour = Math.floor(maxTime / 3600)

		var overlay = []

		for (var i=0; i<maxHour-minHour; i++) {
			var hour = i + minHour
			overlay.push({label: hour+":00", y:hour*3600})
		}

		var timeScale = d3.scale.linear()
			.domain([minTime, maxTime])
			.range([0,100])

		var color = d3.scale.category20c();

		// var stack = d3.layout.stack()

		var div = d3.select('#scheduled').select('.actualSchedule').selectAll('.event')
				.data(data)
			.enter().append('div')
				.attr('class', 'event')
				.style('background', function(d) { return color(d.name) })
				.style('left', function(d) { return "0%"; })
				.style('width', function(d) { return "100%"; })
				.style('top', function(d) { return timeScale(d.scheduledStart) + '%'; })
				.style('height', function(d) { return timeScale(d.scheduledEnd) - timeScale(d.scheduledStart) + '%'; })
				.text(function(d) { return d.name })

		var div = d3.select('#actual').select('.actualSchedule').selectAll('.event')
				.data(data)
			.enter().append('div')
				.attr('class', 'event')
				.style('background', function(d) { return color(d.name) })
				.style('left', function(d) { return "0%"; })
				.style('width', function(d) { return "100%"; })
				.style('top', function(d) { return timeScale(d.actualStart) + '%'; })
				.style('height', function(d) { return timeScale(d.actualEnd) - timeScale(d.actualStart) + '%'; })
				.text(function(d) { return d.name })


		var timeSVGs = d3.selectAll('.schedule').select('.actualSchedule').append('svg')
				.attr('class', 'svgOverlay')
				.attr('width', '100%')
				.attr('height', '100%')
				.attr('fill', 'pink')

	}


	// decrement timer
	setInterval(function() { self.timeLeft(self.timeLeft() - 1) }, 1000)

}

ko.applyBindings(new ViewModel());


