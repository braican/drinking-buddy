import express from 'express';
import * as fetch from './fetch';
import * as latestCheckins from './latestCheckins';
import * as userData from './userData';

const router = express.Router();

router.route('/api/fetch').post(fetch.post);
router.route('/api/latestCheckins').get(latestCheckins.get);
router.route('/api/userData').get(userData.get);

export default router;
