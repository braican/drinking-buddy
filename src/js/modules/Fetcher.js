import { post, get } from '../../../util/req';

class Fetcher {
  constructor(el) {
    el.addEventListener('click', this.fetch.bind(this));
  }

  fetch() {
    // post('api/fetch', { userOnly: 1 })
    get('api/userData', { userOnly: 1 })
      .then(({ success, data }) => {
        if (!success) {
          throw new Error('Error');
        }

        console.log(`You've checked in ${data.stats.total_checkins} beers`);
        return data.stats.total_checkins;
      })
      .then(userCheckinCount => get('api/checkinData', { userCheckinCount }))
      .then(({ data }) => {
        console.log(`Fetching the most recent ${data.missingCheckins} checkins...`);
        return data.latestCheckin.checkin_id;
      })
      .then(latestCheckin => post('api/fetch', { checkinsOnly: 1, latestCheckin }))
      .then(({ data }) => {
        console.log(`${data.newCheckinsAdded} checkins added!`);
      })
      .catch(console.error);
  }
}

export default Fetcher;
