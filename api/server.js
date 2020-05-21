const config = require('./config');
const app = require('./src/app.js');

const { log, ExpressAPILogMiddleware } = require('@rama41222/node-logger');

const logger = log({ console: true, file: false, label: config.name });
app.use(ExpressAPILogMiddleware(logger, { request: true }));

// Fire up the server.
app.listen(config.port, config.host, e => {
  if (e) {
    throw new Error('Internal Server Error');
  }
  logger.info(`${config.name} running on ${config.host}:${config.port}`);
});
