const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 80;
const dataPath = path.join(__dirname, 'data');

if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

app.use('/public', express.static('./'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
})
	.get('/img/:name', (req, res) => {
		res.sendFile(path.join(dataPath, req.params.name));
	})
	.post('/save-file', (req, res) => {
		const form = formidable({ uploadDir: dataPath, filename: (name, ext, part) => part.originalFilename });

		form.parse(req, (err, fields, files) => {
			let success = true;
			if (err) {
				console.log(err);
				success = false;
			}
			res.json({ success, fields, files });
		});
	});

app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
