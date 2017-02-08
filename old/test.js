var ViewModel = function() {
	var self = this;

	self.data = ko.observableArray([])



	self.add = function() {
		var a = {
			width: Math.floor(Math.random()*400)
		}
		self.data.push(a)
		update()
	}

	self.remove = function()

	var update = function() {
		var selection = d3.select("#chart")
			.selectAll('.bar').data(self.data())
			.style('width', function(d) { return d.width+"px" })


		selection.enter()
			.append('div').attr('class', 'row')
			.each(function(d) {
				d3.select(this)
					.append('div')
					.attr('class', 'button')
					.text('remove')
					.on('click', function(e, i)) {

					}

				d3.select(this)
					.append('div')
					.attr('class', 'bar')
					.style('width', function(d) { return d.width+"px" })

			})

		selection.exit().remove()

	}

	update()

	// var render = function() {

	// 	var RofL = (100-gutterWidth)/2
	// 	var LofR = 100-RofL


	// 	d3.select(".timelineDiv")
	// 	   .append("div")
	// 	   .classed("svg-container", true) //container class to make it responsive
	// 	   .append("svg")
	// 	   .attr('id', 'timelineSVG')
	// 	   //class to make it responsive
	// 	   .classed("svg-content-responsive", true)

	// 	var timelineSVG = d3.select('#timelineSVG')

	// 	timelineSVG.append('rect')
	// 			.attr('class', 'backgroundRect')
	// 			.attr('x', '0%')
	// 			.attr('y', '0%')
	// 			.attr('width', RofL+'%')
	// 			.attr('height', '100%')

	// 	timelineSVG.append('rect')
	// 			.attr('class', 'backgroundRect')
	// 			.attr('x', LofR+'%')
	// 			.attr('y', '0%')
	// 			.attr('width', RofL+'%')
	// 			.attr('height', '100%')


	// 	var events = timelineSVG.selectAll('.event')
	// 			.data(data)
	// 		.enter()

	// 	// left
	// 	events.append('rect')
	// 			.attr('class', 'event')
	// 			.attr('fill', function(d) { return color(d.name) })
	// 			.attr('x', '1%')
	// 			.attr('y', function(d) { return d.yScheduled+'%' })
	// 			.attr('width', RofL-2+"%")
	// 			.attr('height', function(d) { return d.heightScheduled+'%' })

	// 	events.append('text')
	// 			.attr('class', 'eventText')
	// 			.text(function(d) { return d.displayNameScheduled })
	// 			.attr('x', '2%')
	// 			.attr('y', function(d) { return d.yScheduled+1+'%' })

	// 	events.append('text')
	// 			.attr('class', 'speakerText')
	// 			.text(function(d) { return d.speaker })
	// 			.attr('x', '2%')
	// 			.attr('y', function(d) { return d.yScheduled+3.5+'%' })

	// 	// right
	// 	events.append('rect')
	// 			.attr('id', 'actualEvent')
	// 			.attr('class', 'event')
	// 			.attr('fill', function(d) { return color(d.name) })
	// 			.attr('x', LofR+1+'%')
	// 			.attr('y', function(d) { return d.yActual+'%' })
	// 			.attr('width', RofL-2+"%")
	// 			.attr('height', function(d) { return d.heightActual+'%' })

	// 	events.append('text')
	// 			.attr('id', 'actualEvent')
	// 			.attr('class', 'eventText')
	// 			.text(function(d) { return d.displayNameActual })
	// 			.attr('x', LofR+2+'%')
	// 			.attr('y', function(d) { return d.yActual+1+'%' })

	// 	events.append('text')
	// 			.attr('id', 'actualEvent')
	// 			.attr('class', 'speakerText')
	// 			.text(function(d) { return d.speaker })
	// 			.attr('x', LofR+2+'%')
	// 			.attr('y', function(d) { return d.yActual+3.5+'%' })


	// 	var genPath = function(d) {
	// 		var path = d3.path()
	// 		path.moveTo(d.RofL-2+'%', d.yScheduled+'%')
	// 		path.lineTo(d.LofR+2+'%', d.yActual+'%')
	// 		path.lineTo(d.LofR+2+'%', d.yActual+d.heightActual+'%')
	// 		path.lineTo(d.RofL-2+'%', d.yScheduled+d.heightScheduled+'%')
	// 		path.closePath()
	// 		return path.toString()
	// 	}

	// 	events.append('path')
	// 			.attr('d', genPath )
	// 			.attr('fill', 'pink')



	// 	// time overlay
	// 	var majorLines = timelineSVG.selectAll('.majorLine')
	// 			.data(timeOverlayMajor)
	// 		.enter()

	// 	majorLines.append('text')
	// 			.attr('class', 'majorLineText')
	// 			.text(function (d) { return d.label })
	// 			.attr('x', '50%')
	// 			.attr('y', function(d) { return d.y })

	// 	// left lines
	// 	majorLines.append('line')
	// 			.attr('class', 'majorLine')
	// 			.attr('x1', '1%')
	// 			.attr('y1', function(d) { return d.y })
	// 			.attr('x2', RofL+3+"%")
	// 			.attr('y2', function(d) { return d.y })

	// 	// right lines
	// 	majorLines.append('line')
	// 			.attr('class', 'majorLine')
	// 			.attr('x1', LofR-3+"%")
	// 			.attr('y1', function(d) { return d.y })
	// 			.attr('x2', '99%')
	// 			.attr('y2', function(d) { return d.y })

	// 	// minor lines
	// 	var minorLines = timelineSVG.selectAll('.minorLine')
	// 			.data(timeOverlayMinor)
	// 		.enter()

	// 	// left lines
	// 	minorLines.append('line')
	// 			.attr('class', 'minorLine')
	// 			.attr('x1', '1%')
	// 			.attr('y1', function(d) { return d.y })
	// 			.attr('x2', RofL+1+"%")
	// 			.attr('y2', function(d) { return d.y })

	// 	// right lines
	// 	minorLines.append('line')
	// 			.attr('class', 'minorLine')
	// 			.attr('x1', LofR-1+"%")
	// 			.attr('y1', function(d) { return d.y })
	// 			.attr('x2', '99%')
	// 			.attr('y2', function(d) { return d.y })


	// 	// current time
	// 	timelineSVG.append('line')
	// 			.attr('class', 'currentTimeLine')
	// 			.attr('x1', '0%')
	// 			.attr('x2', '100%')
	// 			.attr('y1', timeScale(moment())+'%')
	// 			.attr('y2', timeScale(moment())+'%')

	// }


	// render()

	// setInterval(updateRunning, 10000)
}

ko.applyBindings(new ViewModel());


