Drinking Buddy
==============

## Deployment

This app is deployed to a Linode that uses an apache proxy to access the beer.braican.com domain. The app can be started on the server by running the following command in the app's directory:

```sh
nohup node index.js &
```

See https://coderwall.com/p/hqamtg/run-node-and-apache-sites-from-one-ip for more info.