const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(`${__dirname}/dist`)));

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/src/pages/index.html`));
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
