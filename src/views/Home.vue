<template>
  <div class="home">
    <ul>
      <li v-for="checkin in checkins">
        <pre>{{ checkin }}</pre>
      </li>
    </ul>
  </div>
</template>

<script>
// import data from '../../data/BASE_braican.json';
// console.log(data);

export default {
  name: 'Home',

  data() {
    return {
      checkins: [],
    };
  },
};
</script>
