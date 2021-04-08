require('dotenv').config();
import express from 'express';
import path from 'path';
import apiRoutes from './server/api/routes';

import untappd from './server/untappd';
untappd.setAccessToken(process.env.UNTAPPD_ACCESS_TOKEN);

const app = express();

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(express.json());

app.use(express.static(path.join(`${__dirname}/dist`)));

app.use(apiRoutes);

// Frontend.
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/src/pages/index.html`));
});

// Listen.
app.listen(3000, () => {
  // eslint-disable-next-line
  console.log('Example app listening on port 3000!');
});
