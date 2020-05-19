require('dotenv').config();
const UntappdGetter = require('../lib/UntappdGetter');

const getter = new UntappdGetter(process.env.UNTAPPD_TOKEN);

getter.run();
