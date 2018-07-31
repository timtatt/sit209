const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

var {apiUrl} = process.env;

test('test device array', () => {
	expect.assertions(1);
	axios.get(`${apiUrl}/devices`).then(res => res.data).then(res => {
		console.log(res[0]);
		expect(res[0].user).toEqual('not-a-user');
	});
});