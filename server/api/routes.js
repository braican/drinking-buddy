const express = require('express');

// Route controllers.
const allBreweries = require('./allBreweries');
const brewery = require('./brewery');
const checkinData = require('./checkinData');
const fetch = require('./fetch');
const globalStats = require('./globalStats');
const latestCheckins = require('./latestCheckins');
const userData = require('./userData');

const router = express.Router();

router.route('/api/allBreweries').get(allBreweries.get);
router.route('/api/brewery').get(brewery.get);
router.route('/api/fetch').post(fetch.post);
router.route('/api/globalStats').get(globalStats.get);
router.route('/api/checkinData').get(checkinData.get);
router.route('/api/latestCheckins').get(latestCheckins.get);
router.route('/api/userData').get(userData.get);

module.exports = router;
