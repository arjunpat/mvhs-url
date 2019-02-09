<template>
  <div>
    My account page
    <div v-for="url of urlsToShow" :key="url.shortened">
      {{ url.shortened }}
      {{ url.redirects_to }}
      {{ url.created_time }}
    </div>
  </div>
</template>

<script>
import { serverHost } from '@/constants';
import { getCookie } from '@/utils.js';

export default {
  data() {
    return {
      urlsToShow: []
    }
  },
  mounted() {
    window.fetch(`${serverHost}/api/account-details`, {
      credentials: 'include',
    }).then(res => res.json()).then(val => {
      this.urlsToShow = val.data;
    });
  },
  beforeCreate() {
    if (!getCookie('mvhs_url')) {
      this.$router.push({ path: '/' });
    }
  }
}
</script>

