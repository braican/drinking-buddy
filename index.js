require('dotenv').config();

const express = require('express');
const path = require('path');
const apiRoutes = require('./server/api/routes');
const untappd = require('./server/untappd');

untappd.setAccessToken(process.env.UNTAPPD_ACCESS_TOKEN);

const app = express();

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(express.json());
app.use(express.static(path.join(`${__dirname}/dist`)));
app.use(express.static(path.join(`${__dirname}/src/public`)));
app.use(apiRoutes);

// Route everything through the index file.
app.use((req, res) => {
  res.sendFile(path.join(`${__dirname}/src/index.html`));
});

// Listen.
app.listen(3000, () => {
  // eslint-disable-next-line
  console.log('Example app listening on port 3000!');
});
