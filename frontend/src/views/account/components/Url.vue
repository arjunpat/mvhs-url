<template>
  <tr class="url">
    <td><a :href="shortenedUrl" target="_blank">{{ shortened }}</a></td>
    <td>{{ redirectsTo }}</td>
    <td>{{ dateToString(url.created_time) }}</td>
    <td>{{ dateToString(url.expires) }}</td>
    <td>{{ url.clicks }}</td>
  </tr>
</template>

<script>
export default {
  props: ['url'],
  methods: {
    dateToString(date) {
      let now = Date.now();

      let distance = Date.now() - date;

      if (3600000 > distance && distance > 0) {
        return Math.round(distance / 60000) + ' minutes ago';
      } else if (86400000 > distance && distance > 0) {
        return Math.round((now - date) / 3600000) + ' hours ago';
      }

      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'America/Los_Angeles'
      });
    }
  },
  computed: {
    shortened() {
      let shortened = 'url.mvhs.io/u/' + this.url.shortened;

      return shortened;
    },
    shortenedUrl() {
      let origin = window.location.origin;

      if (origin.includes('localhost'))
        origin = 'http://localhost:8000';

      let shortened = origin + '/u/' + this.url.shortened;

      return shortened;
    },
    redirectsTo() {
      let redirectsTo = this.url.redirects_to;

      if (redirectsTo.length > 25) {
        redirectsTo = redirectsTo.substring(0, 25) + '...';
      }

      return redirectsTo;
    }
  }
}
</script>

<style scoped>

.url {
  cursor: pointer;
}

.url:hover {
  background: #eee;
}

td {
  text-align: left;
  padding: 12px 4px;
}

</style>


