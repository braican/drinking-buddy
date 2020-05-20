#!/usr/bin/env node

require('dotenv').config();
const argv = require('yargs')
  .usage('Usage: $0 --user [string] --file [path]')
  .alias('u', 'user')
  .alias('f', 'file')
  .demandOption(['file', 'user']).argv;
const Fauna = require('../lib/Fauna');

const { user, file } = argv;

const client = new Fauna(process.env.FAUNA_SECRET);

client.import(user, file);
