<template>
  <tr class="url" :class="url.expired ? 'expired' : ''">
    <td>
      <a
        :href="shortenedUrl"
        target="_blank"
      >{{ shortened }}</a>
    </td>
    <td>{{ redirectsTo }}</td>
    <td>{{ dateToString(url.created_time) }}</td>
    <td :style="{ color: url.expired ? 'red' : 'green'}">{{ expires }}</td>
    <td>{{ url.clicks }}</td>
    <td>
      <div @click="$router.push({ path: '/account/url/' + url.id })" class="more">More Info</div>
    </td>
  </tr>
</template>

<script>
export default {
  props: ['url'],
  created() {
    this.url.expired = !(this.url.expires > Date.now() || this.url.expires === null);
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

      if (this.url.expired) {
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
  transition: all 150ms ease;
}

.expired {
}

.url:hover {
  background: rgb(238, 238, 238);
}

td {
  text-align: left;
  padding: 12px 4px;
}

.more {
  color: #1a73e8;
  cursor: pointer;
  transition: all 150ms ease;
  background: rgb(238, 238, 238);
  padding: 4px 8px;
  margin: 2px;
  width: 70px;
  border-radius: 6px;
}

.more:hover {
  color: #0049a8;
  background: rgb(220, 220, 220);
}

</style>


