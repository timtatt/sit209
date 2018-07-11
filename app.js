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

		_events()
	});

	function _events() {
		$('#add-device').on('click', events.onClick.addDevice);
	}

	var events = {
		onClick: {
			addDevice: function(event) {
				var user = $('#user');
				var name = $('#name');
				devices.push({
					user: user.val(),
					name: name.val(),
				});
				console.log(devices);
			},
		}
	};
})(jQuery);