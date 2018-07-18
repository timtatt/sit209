(function($) {
	var self, table;

	var devices = [];
	var users = JSON.parse(localStorage.getItem('users')) || [];
	var isAuth = JSON.parse(localStorage.getItem('isAuth')) || false;
	
	$.get('http://localhost:3001/devices').then(response => {
		devices = response;
		devices.forEach(function(device) {
			table.find('tbody').append(`<tr><td>${device.user}</td><td>${device.name}</td></tr>`);
		});
	}).catch(error => {
		console.error(`Error ${error}`);
	});

	$(function(e) {
		self = $(document);
		table = $('#devices');
		

		_init();
		_events();
	});

	function _init() {
		$('#navbar').load('navbar.html', function() {
			if (isAuth) {
				$('#navbar a#login').hide();
			} else {
				$('#navbar a#logout').hide();
			}
		});
		$('#footer').load('footer.html');

	}

	function _events() {
		self.on('click', '#add-device', events.onClick.addDevice);
		self.on('click', '#send-command', events.onClick.sendCommand);
		self.on('click', '#register', events.onClick.registerAccount);
		self.on('click', 'button#login', events.onClick.loginToAccount);
		self.on('click', 'a#logout', events.onClick.logoutOfAccount);
	}

	var events = {
		onClick: {
			addDevice: function(event) {
				var user = $('#user');
				var name = $('#name');
				var sensorData = [];

				var body = {
					name: name.val(),
					user: user.val(),
					sensorData: sensorData,
				};

				user.val('');
				name.val('');

				$.post('http://localhost:3001/devices', body).then(response => {
					location.href = '/';
				}).catch(error => {
					console.error(`Error ${error}`);
				});
			},
			sendCommand: function(event) {
				var command = $('#command');
				console.log(`command is: ${command.val()}`);
			},
			logoutOfAccount: function(event) {
				localStorage.setItem('isAuth', false);

				location.href = '/login';
			},
			loginToAccount: function(event) {
				$('#error-login').remove();

				var username = $('#username');
				var password = $('#password');

				var existingUser = users.find(user => user.username == username.val() && user.password == password.val());

				if (typeof existingUser === 'undefined') {
					$('#navbar + .container').prepend('<div class="alert alert-danger" id="error-login">Incorrect username or password. Please try again.</div>');
					return;
				}

				localStorage.setItem('isAuth', true);

				location.href = '/';
			},
			registerAccount: function(event) {
				$('#error-register').remove();

				var username = $('#username');
				var password = $('#password');
				var confirmPassword = $('#confirm-password');

				var existingUser = users.find(user => user.username == username.val());

				if (username.val() == '' || password.val() == '') {
					$('#navbar + .container').prepend('<div class="alert alert-danger" id="error-register">Please fill in all fields</div>');
					return;
				}

				if (typeof existingUser !== 'undefined') {
					$('#navbar + .container').prepend('<div class="alert alert-danger" id="error-register">Sorry, that username already exists. Please try again</div>');
					return;
				}

				if (password.val() != confirmPassword.val()) {
					$('#navbar + .container').prepend('<div class="alert alert-danger" id="error-register">Passwords do not match, please try again</div>');
					return;
				}

				users.push({
					username: username.val(),
					password: password.val(),
				});

				localStorage.setItem('isAuth', true);
				localStorage.setItem('users', JSON.stringify(users));

				$('#navbar + .container').prepend('<div class="alert alert-success" id="error-register">User successfully created</div>');

				username.val('');
				password.val('');
				confirmPassword.val('');
			},
		}
	};
})(jQuery);