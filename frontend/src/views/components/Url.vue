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
    <td>{{ url.clicks ? url.clicks : '0' }}</td>
    <td v-if="url.registered_to">{{ url.registered_to }}</td>
    <td>
      <div @click="$router.push({ path: '/account/url/' + url.id })" class="more">More Info</div>
    </td>
  </tr>
</template>

<script>
import { dateToString } from '@/constants';

export default {
  props: ['url'],
  created() {
    this.url.expired = !(this.url.expires > Date.now() || this.url.expires === null);
  },
  methods: {
    dateToString
  },
  computed: {
    shortened() {
      let shortened = 'url.mvhs.io/' + this.url.shortened;

      return shortened;
    },
    shortenedUrl() {
      let origin = window.location.origin;

      if (this.url.expired) {
        return origin + '/expired?shortened=' + encodeURIComponent(this.url.shortened);
      }

      return origin + '/' + this.url.shortened;
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
  border: none;
}

.more:hover {
  color: #0049a8;
  background: rgb(220, 220, 220);
}

</style>


