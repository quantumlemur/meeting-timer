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

		var minTime = data[0].scheduledStart
		var maxTime = data[data.length-1].scheduledEnd

		var timeScale = d3.scale.linear()
			.domain([minTime, maxTime])
			.range([0,100])

		var color = d3.scale.category20c();

		// var stack = d3.layout.stack()

		var div = d3.select('#scheduled').selectAll('.event')
				.data(data)
			.enter().append('div')
				.attr('class', 'event')
				.call(position)
				.style('background', function(d) { return color(d.name) })
				.text(function(d) { return d.name })

		function position() {
			this.style('left', function(d) { return "0%"; })
					.style('width', function(d) { return "100%"; })
					.style('top', function(d) { return timeScale(d.scheduledStart) + '%'; })
					.style('height', function(d) { return timeScale(d.scheduledEnd) - timeScale(d.scheduledStart) + '%'; })
		}
	}



















	// decrement timer
	setInterval(function() { self.timeLeft(self.timeLeft() - 1) }, 1000)

}

ko.applyBindings(new ViewModel());


