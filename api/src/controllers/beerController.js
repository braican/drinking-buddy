require('dotenv').config();
const { ApiError } = require('../handlers');
const FaunaClient = require('../lib/FaunaClient');

const client = new FaunaClient(process.env.FAUNA_SECRET);

const getAll = async (req, res, next) => {
  try {
    const { user } = req.params;
    const checkins = await client.getCheckins(user);

    res.status(200).json(checkins);
  } catch (e) {
    const err = new ApiError(e.status || 500, e.message || 'Could not fetch all checkins.');

    if (e.status === 404) {
      res.status(404).json(e);
    }

    next(err);
  }
};

module.exports = {
  getAll,
};
