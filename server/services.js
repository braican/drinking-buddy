import UntappdClient from './lib/UntappdClient';

const untappd = new UntappdClient();
untappd.setClientId(process.env.UNTAPPD_CLIENT_ID);
untappd.setClientSecret(process.env.UNTAPPD_SECRET);

export default untappd;
