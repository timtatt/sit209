(function($) {
	var self, table;

	var apiUrl = 'https://217-288-933-sit-209.now.sh/api';
	var mqttUrl = 'https://mqtt-217-288-933-sit-209.now.sh';
	var devices = [];
	var currentUser = localStorage.getItem('user') || false;
	var isAdmin = localStorage.getItem('isAdmin') || false;
	var modals = {};
	var tables = {};

	$(function(e) {
		self = $(document);
		
		tables = {
			devices: self.find('#table-devices'),
			deviceHistory: self.find('#table-device-history'),
		};
		modals = {
			deviceHistory: self.find('#modal-device-history'),
		};
		

		_init();
		_events();
	});

	function _init() {
		self.find('#navbar').load('navbar.html', function() {
			if (currentUser) {
				self.find('#navbar a#login').hide();
			} else {
				self.find('#navbar a#logout').hide();
			}
		});
		self.find('#footer').load('footer.html');

		if (currentUser) {
			$.get(`${apiUrl}/users/${currentUser}/devices`).then(res => {
				res.forEach(device => {
					tables.devices.find('tbody').append(`
						<tr data-device-id="${device._id}">
							<td>${device.user}</td>
							<td>${device.name}</td>
						</tr>
					`);
				});
			}).catch(err => {
				console.error('Error:', err);
			});
		} else if (window.location.pathname != '/login' && window.location.pathname != '/register') {
			location.href = '/login';
		}
	}

	function _events() {
		self.on('click', '#add-device', events.onClick.addDevice);
		self.on('click', '#send-command', events.onClick.sendCommand);
		self.on('click', '#register', events.onClick.registerAccount);
		self.on('click', 'button#login', events.onClick.loginToAccount);
		self.on('click', 'a#logout', events.onClick.logoutOfAccount);

		tables.devices.on('click', 'tbody tr', events.onClick.openDeviceHistory);
	}

	var events = {
		onClick: {
			openDeviceHistory: function(event) {
				var button = $(event.currentTarget);
				var deviceId = button.data('device-id');
				$.get(`${apiUrl}/devices/${deviceId}/device-history`).then(res => {
					tables.deviceHistory.find('tbody').html('');
					res.forEach(row => {
						tables.deviceHistory.find('tbody').append(`
							<tr>
								<td>${row.ts}</td>
								<td>${row.temp}</td>
								<td>${row.loc.lat}</td>
								<td>${row.loc.lng}</td>
							</tr>
						`);
					});
					modals.deviceHistory.modal('show');
				});
			},
			addDevice: function(event) {
				var user = $('#user');
				var name = $('#name');
				var sensorData = [];

				var body = {
					name: name.val(),
					user: user.val(),
					sensorData: sensorData,
				};

				$.ajax({
					url: `${apiUrl}/devices`,
					method: 'post',
					data: JSON.stringify(body),
					contentType: 'application/json',
					dataType: 'json',
				}).then(res => {
					location.href = '/';
				}).catch(error => {
					console.error('Error:', error);
				});

				user.val('');
				name.val('');
			},
			sendCommand: function(event) {
				var deviceId = $('#deviceId');
				var command = $('#command');

				$.ajax({
					url: `${mqttUrl}/send-command`,
					method: 'post',
					data: JSON.stringify({
						user: username.val(),
						password: password.val(),
					}),
					contentType: 'application/json',
					dataType: 'json',
				}).then(res => {
					if (res.status == 'error') {
						$('#navbar + .container').prepend(`<div class="alert alert-danger" id="error-login">${res.message}</div>`);
						return;
					}

					location.href = '/';
				}).catch(error => {
					console.error('Error:', error);
				});
				
				console.log(`command is: ${command.val()}`);
			},
			logoutOfAccount: function(event) {
				localStorage.setItem('isAuth', false);
				localStorage.removeItem('user');

				location.href = '/login';
			},
			loginToAccount: function(event) {
				$('#error-login').remove();

				var username = $('#username');
				var password = $('#password');

				$.ajax({
					url: `${apiUrl}/authenticate`,
					method: 'post',
					data: JSON.stringify({
						command: command.val(),
						deviceId: deviceId.val(),
					}),
					contentType: 'application/json',
					dataType: 'json',
				}).then(res => {
					if (res.status == 'error') {
						$('#navbar + .container').prepend(`<div class="alert alert-danger" id="error-login">${res.message}</div>`);
						return;
					}

					localStorage.setItem('user', res.user);
					localStorage.setItem('isAdmin', res.isAdmin);

					location.href = '/';
				}).catch(error => {
					console.error('Error:', error);
				});
			},
			registerAccount: function(event) {
				$('#error-register').remove();

				var username = $('#username');
				var password = $('#password');
				var confirmPassword = $('#confirm-password');

				if (username.val() == '' || password.val() == '') {
					$('#navbar + .container').prepend('<div class="alert alert-danger" id="error-register">Please fill in all fields</div>');
					return;
				}

				if (password.val() != confirmPassword.val()) {
					$('#navbar + .container').prepend('<div class="alert alert-danger" id="error-register">Passwords do not match, please try again</div>');
					return;
				}

				$.ajax({
					url: `${apiUrl}/register`,
					method: 'post',
					data: JSON.stringify({
						user: username.val(),
						password: password.val(),
						isAdmin: false,
					}),
					contentType: 'application/json',
					dataType: 'json',
				}).then(res => {
					if (res.status == 'error') {
						$('#navbar + .container').prepend(`<div class="alert alert-danger" id="error-login">${res.message}</div>`);
						return;
					}

					localStorage.setItem('user', res.user);
					localStorage.setItem('isAdmin', res.isAdmin);

					location.href = '/';
				}).catch(error => {
					console.error('Error:', error);
				});				

				localStorage.setItem('isAuth', true);
				localStorage.setItem('isAdmin', false);
				localStorage.setItem('user', username.val());

				$('#navbar + .container').prepend('<div class="alert alert-success" id="error-register">User successfully created</div>');

				username.val('');
				password.val('');
				confirmPassword.val('');
			},
		}
	};
})(jQuery);