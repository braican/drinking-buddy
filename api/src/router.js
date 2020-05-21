const express = require('express');
const { catchErrors } = require('./handlers');
const { beerController } = require('./controllers');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send('api');
});

router.get('/beers/all/:user', catchErrors(beerController.getAll));

module.exports = router;
