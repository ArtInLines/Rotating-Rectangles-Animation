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
		const form = formidable({
			uploadDir: dataPath,
			filename: (name, ext, part) => {
				let fnameExt = part.originalFilename.split('.');
				fnameExt = '.' + fnameExt[fnameExt.length - 1];
				let fname = name;
				let i = 0;
				while (fs.existsSync(path.join(dataPath, fname + fnameExt))) fname = name + '_' + i++;

				setTimeout(() => {
					fs.rmSync(path.join(dataPath, fname + fnameExt));
					console.log('Deleting ' + fname + fnameExt + '...');
				}, 1000 * 60 * 3);

				return fname + fnameExt;
			},
		});

		form.parse(req, (err, fields, files) => {
			let success = true;
			if (err) {
				console.log(err);
				success = false;
			}
			let fname = files?.file?.newFilename;
			res.json({ success, fname, fpath: '/img/' + fname });
		});
	});

app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
