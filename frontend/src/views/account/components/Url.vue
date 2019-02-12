<template>
  <tr class="url" :class="expired ? 'expired' : ''">
    <td>
      <a
        :href="shortenedUrl"
        target="_blank"
      >{{ shortened }}</a>
    </td>
    <td>{{ redirectsTo }}</td>
    <td>{{ dateToString(url.created_time) }}</td>
    <td :style="{ color: expired ? 'red' : 'green'}">{{ expires }}</td>
    <td>{{ url.clicks }}</td>
    <td class="more" @click="$router.push({ path: '/account/url/' + url.id })">More Info</td>
  </tr>
</template>

<script>
export default {
  props: ['url'],
  created() {
    this.expired = this.url.expires < Date.now();
  },
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

      if (this.expired) {
        return origin + '/expired?shortened=' + encodeURIComponent(this.url.shortened);
      }

      if (origin.includes('localhost'))
        origin = 'http://localhost:8000';

      return origin + '/u/' + this.url.shortened;
    },
    redirectsTo() {
      let redirectsTo = this.url.redirects_to;

      if (redirectsTo.length > 25) {
        redirectsTo = redirectsTo.substring(0, 25) + '...';
      }

      return redirectsTo;
    },
    expires() {
      if (this.url.expires) {
        return this.dateToString(this.url.expires);
      }
      
      return 'Never';
    }
  }
}
</script>

<style scoped>

.url {
  transition: background 150ms ease;
}

.expired {
}

.url:hover {
  background: #eee;
}

td {
  text-align: left;
  padding: 12px 4px;
}

.more {
  color: #1a73e8;
  cursor: pointer;
  transition: color 150ms ease;
}

.more:hover {
  color: #0049a8;
}

</style>


