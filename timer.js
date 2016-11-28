var ViewModel = function() {
	var self = this;


	self.active = ko.observable(false)
	self.name = ko.observable("")
	self.start = new Date()
	self.warn = new Date()
	self.end = new Date()
	self.flash = ko.observable(false)

	self.timeLeft = ko.observable(0)

	self.parsedTime = ko.computed(function() {
		var time = self.timeLeft()

		var negative = time < 0 ? "-" : ""
		time = Math.abs(time)
		var seconds = time % 60
		var minutes = (time - seconds)/60 % 60
		var hours = (time - minutes*60 - seconds)/3600
		var s = ("0" + seconds).slice(-2)
		var m = ("0" + minutes + ":").slice(-3)
		var h = hours > 0 ? hours+":" : ""
		return negative + h + m + s
	})

	self.timeStatusClass = ko.pureComputed(function() {
		var timeLeft = self.timeLeft()
		var now = new Date()
		if (now > self.end) {
			return "overTime"
		} else if (now > self.warn) {
			return "warningTime"
		} else {
			return "normalTime"
		}
	})

	var refreshData = function() {
		$.ajax({
			url: 'control.html',
			type: 'GET',
			datatype: 'json',
			success: function(msg){
				var data = JSON.parse(msg)
				self.active(data.active)
				if (data.active) {
					self.name(data.name)
					self.start = new Date(data.start)
					self.warn = new Date(data.warn)
					self.end = new Date(data.end)
					self.flash(data.flash)

					self.timeLeft(Math.floor((self.end - new Date())/1000))
				}
			}
		})
	}

	// decrement timer
	setInterval(function() { self.timeLeft(self.timeLeft() - 1) }, 1000)

	// refresh timer every ten seconds
	setInterval(refreshData, 5000)
}

ko.applyBindings(new ViewModel());


