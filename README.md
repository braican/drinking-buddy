# Drinking Buddy

An Untappd companion app to help identify deeper stats around beer data. This app is built with Svelte and Sveltekit; data is stored in [Tigris](https://console.preview.tigrisdata.cloud/region/aws-us-west-2/project/drinking_buddy/); data is sourced from the [Untappd API](https://untappd.com/api/docs).

## Installation

1. Create an `.env` file with `cp .env.sample .env`, then add the relevant values.
2. Run `nvm install`.
3. Run `npm install`.

## Development

1. Run `nvm install`.
2. Run `npm run dev` to start the development server.

## Architecture

This app is hosted on [hosting option here], with data stored in Tigris.

## Scripts

You can run the scripts in the `/scripts` directory with `npx ts-node`:

### Setup

Sets up the database with the `checkins` and `users` schemas:

```sh
npx ts-node scripts/setup.ts
```

### Seed

Seeds the database with the latest user data from Untappd and checkin data from the `data/checkins-backup-2023.05.31.json` file, which contains 5570 checkins, accurate up until May 31, 2023.

```sh
npx ts-node scripts/seed.ts
```

### Update

Updates the database with the latest data from Untappd.

```sh
npx ts-node scripts/update.ts
```

### Tigris info

Gets stats about the Tigris database.

```sh
npx ts-node scripts/tigris-info.ts
```
