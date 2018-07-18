const express = require('express');

const app = express();
const port = 5000;
app.get('/api/test', (req, res) => {
	res.send('The API is working');
});

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});