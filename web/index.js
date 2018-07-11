var express = require('express');
var app = express();

var port = 3000;
var base = `${__dirname}/public`;

app.use(express.static('public'));

var availablePaths = [
	{
		url: 'register-device',
		file: 'reigster-device.html',
	},
	{
		url: 'send-command',
		file: 'send-command.html',
	},
	{
		url: 'about',
		file: 'about-me.html',
	},
	{
		url: '',
		file: 'device-list.html',
	}
];

availablePaths.forEach(path => {
	app.get(`/${path.url}`, (req, res) => {
		res.sendFile(`${base}/${path.file}`);
	});
});

app.get('*', (req, res) => {
	res.sendFile(`${base}/404.html`);
});

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});