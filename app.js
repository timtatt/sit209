(function($) {
	const devices = [];

	devices.push({
		user: "Mary",
		name: "Mary's iPhone",
	});

	devices.push({
		user: "Alex",
		name: "Alex's Surface Pro",
	});

	devices.push({
		user: "Mary",
		name: "Mary's Macbook",
	});

	$(function(e) {
		var table = $('#devices');
		devices.forEach(function(device) {
			table.find('tbody').append(`<tr><td>${device.user}</td><td>${device.name}</td></tr>`);
		});
	});
})(jQuery);