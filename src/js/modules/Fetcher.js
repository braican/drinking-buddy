import { post, get } from '../util/req';

class Fetcher {
  constructor(el) {
    el.addEventListener('click', this.fetch.bind(this));

    this.loadingMessage = null;
  }

  fetchUser() {
    return new Promise((resolve, reject) => {
      // get('/api/userData') // DEBUG ONLY for local ref.
      post('/api/fetch', { userOnly: 1 })
        .then(data => {
          console.warn(`[Fetcher] You've checked in ${data.stats.total_checkins} beers`);
          return data.stats.total_checkins;
        })
        .then(userCheckinCount => get('/api/checkinData', { userCheckinCount }))
        .then(data => resolve(data))
        .catch(reject);
    });
  }

  fetchCheckins(latestCheckin) {
    return post('/api/fetch', {
      checkinsOnly: 1,
      latestCheckin,
    }).then(data => {
      console.warn(`[Fetcher] ${data.newCheckinsAdded} checkins added!`);
    });
  }

  fetch(event) {
    console.warn(`[Fetcher] Fetching beers from Untappd, if necessary...`);

    if (!this.loadingMessage) {
      const loadingMessage = document.createElement('p');
      loadingMessage.innerText = 'Loading...';
      loadingMessage.classList.add('user__loading-msg');
      this.loadingMessage = loadingMessage;
    }

    event.target.parentElement.appendChild(this.loadingMessage);

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
      .then(() => {
        if (this.loadingMessage) {
          this.loadingMessage.remove();
        }
      })
      .catch(console.error);
  }
}

export default Fetcher;
