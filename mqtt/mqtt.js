const mqtt = require('mqtt');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

var {url, username, password} = process.env;
var port = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
}));

var client = mqtt.connect(url, {username, password});

client.on('connect', () => {
	console.log('connected to mqtt');

	client.publish('/test/hello', 'Hello MQTT World', () => {
		console.log('message sent');
	});
});

app.post('/send-command', (req, res) => {
	var {deviceId, command} = req.body;
	client.publish(`/command/${deviceId}`, command, () => {
		res.send('published new message');
	});
});

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});