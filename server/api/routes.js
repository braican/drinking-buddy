const express = require('express');
const fetch = require('./fetch');
const latestCheckins = require('./latestCheckins');
const userData = require('./userData');
const checkinData = require('./checkinData');

const router = express.Router();

router.route('/api/fetch').post(fetch.post);
router.route('/api/latestCheckins').get(latestCheckins.get);
router.route('/api/userData').get(userData.get);
router.route('/api/checkinData').get(checkinData.get);

module.exports = router;
