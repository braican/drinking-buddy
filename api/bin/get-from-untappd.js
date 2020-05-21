#!/usr/bin/env node

require('dotenv').config();
const argv = require('yargs')
  .usage('Usage: $0 --user [string]')
  .alias('u', 'user')
  .demandOption(['user']).argv;
const UntappdClient = require('../src/lib/UntappdClient');
const FaunaClient = require('../src/lib/FaunaClient');

const utClient = new UntappdClient(process.env.UNTAPPD_TOKEN);
const fClient = new FaunaClient(process.env.FAUNA_SECRET);

const { user } = argv;

utClient
  .getAllCheckins(user)
  .then(data => fClient.add(user, data).then(() => console.log('Added from Untappd.')))
  .catch(error => console.error(error));
