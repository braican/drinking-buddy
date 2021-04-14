import { post, get } from '../util/req';

class Fetcher {
  constructor(el) {
    el.addEventListener('click', this.fetch.bind(this));
  }

  fetchUser() {
    return new Promise((resolve, reject) => {
      // get('/api/userData') // DEBUG ONLY for local ref.
      post('/api/fetch', { userOnly: 1 })
        .then(({ success, data }) => {
          if (!success) {
            throw new Error('Error');
          }

          console.warn(`[Fetcher] You've checked in ${data.stats.total_checkins} beers`);
          return data.stats.total_checkins;
        })
        .then(userCheckinCount => get('/api/checkinData', { userCheckinCount }))
        .then(({ data }) => resolve(data))
        .catch(reject);
    });
  }

  fetchCheckins(latestCheckin) {
    return post('api/fetch', {
      checkinsOnly: 1,
      latestCheckin,
    }).then(({ data }) => {
      console.warn(`[Fetcher] ${data.newCheckinsAdded} checkins added!`);
    });
  }

  fetch() {
    console.warn(`[Fetcher] Fetching beers from Untappd, if necessary...`);

    this.fetchUser()
      .then(({ missingCheckins, latestCheckin }) => {
        if (missingCheckins > 0) {
          console.warn(
            `[Fetcher] Getting your most recent ${missingCheckins} checkins from Untappd...`,
          );
          return this.fetchCheckins(latestCheckin.checkin_id);
        }

        console.warn(`[Fetcher] All checkins accounted for - nothing new to fetch from Untappd.`);
      })
      .catch(console.error);
  }
}

export default Fetcher;
