(function($) {
	const devices = JSON.parse(localStorage.getItem('devices')) || [];

	$(function(e) {
		var table = $('#devices');
		devices.forEach(function(device) {
			table.find('tbody').append(`<tr><td>${device.user}</td><td>${device.name}</td></tr>`);
		});

		_init();
		_events();
	});

	function _init() {
		$('#navbar').load('navbar.html');
		$('#footer').load('footer.html');
	}

	function _events() {
		$('#add-device').on('click', events.onClick.addDevice);
		$('#send-command').on('click', events.onClick.sendCommand);
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

				user.val('');
				name.val('');

				localStorage.setItem('devices', JSON.stringify(devices));
				
				location.href = '/';
			},
			sendCommand: function(event) {
				var command = $('#command');
				console.log(`command is: ${command.val()}`);
			},
		}
	};
})(jQuery);