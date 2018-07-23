const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');

const Device = require('./models/device');
const User = require('./models/user');

const app = express();
const port = process.env.port || 5000;

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");
	next();
});
app.use(bodyParser.json());
app.use('/', express.static('public/generated-docs'));

mongoose.connect(process.env.mongoUrl);

app.get('/docs', (req, res) => {
	res.sendFile(`${__dirname}/public/generated-docs/index.html`);
});

app.get('/api/test', (req, res) => {
	res.send('The API is working');
});

/**
* @api {get} /api/devices An array of all devices
* @apiName GetDevices
* @apiGroup Device
* @apiSuccessExample {json} Success Response:
* [
* 	{
* 		"sensorData": [
* 			{
* 				"ts":"152945935",
* 				"temp":14,
* 				"loc": {
* 					"lat":-37.839587,
* 					"lng":145.101386
* 				}
* 			}
* 		],
* 		"_id":"5b4eb7fb3e180a90fcb1eb96",
* 		"name":"Bob's Samsung Galaxy",
* 		"user":"bob",
* 		"id":"4"
* 	},
* ]
* @apiErrorExample {json} Error Response:
* {
* 	"status": "error",
* }
*/

app.get('/api/devices', (req, res) => {
	Device.find({}, (err, devices) => {
		return err ? res.send(err) : res.send(devices);
	});
});

/**
* @api {get} /api/devices/:deviceId/device-history Get the sensor data of a device
* @apiName GetDeviceHistory
* @apiParam {Number} deviceId Devices unique id
* @apiGroup Device
* @apiSuccessExample {json} Success Response:
* [
* 	{
* 		"ts":"152945935",
* 		"temp":14,
* 		"loc":{
* 			"lat":-37.839587,
* 			"lng":145.101386
* 		}
* 	}
* ]
* @apiErrorExample {json} Error Response:
* {
* 	"status": "error",
* }
*/

app.get('/api/devices/:deviceId/device-history', (req, res) => {
	var {deviceId} = req.params;
	Device.findOne({
		_id: deviceId
	}, (err, foundDevice) => {
		return err ? res.send(err) : res.send(foundDevice.sensorData);
	});
});

/**
* @api {get} /api/users/:userId/devices Get an array of a users devices
* @apiName GetUsersDevices
* @apiParam {Number} userId Users unique id
* @apiGroup User
* @apiSuccessExample {json} Success Response:
* [
* 	{
* 		"sensorData": [
* 			{
* 				"ts":"152945935",
* 				"temp":14,
* 				"loc": {
* 					"lat":-37.839587,
* 					"lng":145.101386
* 				}
* 			}
* 		],
* 		"_id":"5b4eb7fb3e180a90fcb1eb96",
* 		"name":"Bob's Samsung Galaxy",
* 		"user":"bob",
* 		"id":"4"
* 	},
* ]
* @apiErrorExample {json} Error Response:
* {
* 	"status": "error",
* }
*/

app.get('/api/users/:user/devices', (req, res) => {
	var {user} = req.params;
	console.log(user);
	Device.find({
		user: user
	}, (err, foundDevices) => {
		return err ? res.send(err) : res.send(foundDevices);
	});
});

/**
* @api {post} /api/devices Adds a devices
* @apiName AddDevice
* @apiGroup Device
* @apiSuccessExample {json} Success Response:
* {
* 	"status": "success",
* }
* @apiErrorExample {json} Error Response:
* {
* 	"status": "error",
* }
*/

app.post('/api/devices', (req, res) => {
	if (!req.body.name) return res.send({status: 'error'});

	var {name, user, sensorData} = req.body;
	var newDevice = new Device({name, user, sensorData});
	newDevice.save(err => {
		return err ? res.send(err) : res.send({status: 'success'});
	});
});

/**
* @api {post} /api/register Registers a new user
* @apiName AddUser
* @apiGroup User
* @apiSuccessExample {json} Success Response:
* {
* 	"status": "success",
* }
* @apiErrorExample {json} Error Response:
* {
* 	"status": "error",
* }
*/

app.post('/api/register', (req, res) => {
	var {user, password, isAdmin} = req.body;

	User.findOne({
		name: user,
	}, (err, foundUser) => {
		if (foundUser != null) {
			return res.send({
				status: 'error',
				message: 'User already exists',
			});
		}
		var newUser = new User({
			name: user,
			password,
			isAdmin
		});

		newUser.save(err => {
			return err ? res.send(err) : res.send({
				status: 'success',
				message: 'Created new user',
			});
		});
	});
});

/**
* @api {post} /api/authenticate Check if user login is valid
* @apiName AuthUser
* @apiGroup User
* @apiSuccessExample {json} Success Response:
* {
* 	"status": "success",
*	"message": "Authenticated Successfully",
*	"user": "timtatt",
*	"isAdmin": "false"
* }
* @apiErrorExample {json} Error Response:
* {
* 	"status": "error",
*	"message": "User does not exist in the system"
* }
*/

app.post('/api/authenticate', (req, res) => {
	var {user, password} = req.body;
	
	User.findOne({
		name: user,
	}, (err, foundUser) => {
		if (err) {
			return res.send(err);
		} else if (foundUser == null) {
			return res.send({
				status: 'error',
				message: 'User does not exist in the system',
			});
		} else if (foundUser.password != password) {
			return res.send({
				status: 'error',
				message: `Password is incorrect for user: ${foundUser.name}`,
			});
		}
		return res.send({
			status: 'success',
			message: 'Authenticated Successfully',
			user: foundUser.name,
			isAdmin: foundUser.isAdmin,
		});
	});
});


/**
* @api {post} /api/send-command Sends a command to NodeJS server
* @apiName SendCommand
* @apiGroup Command
* @apiSuccessExample {json} Success Response:
* {
* 	"status": "success"
* }
* @apiErrorExample {json} Error Response:
* {
* 	"status": "error"
* }
*/
app.post('/api/send-command', (req, res) => {
	console.log(req.body.command);
	res.send({status: 'success'});
});

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});