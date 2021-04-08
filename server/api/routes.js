import express from 'express';
import * as fetch from './fetch';
import * as latestCheckins from './latestCheckins';

const router = express.Router();

router.route('/api/fetch').post(fetch.post);
router.route('/api/latestCheckins').get(latestCheckins.get);

export default router;
