<template>
  <div>
    <span class="title" :class="isLoading ? 'loading': ''">Your Account</span>
    <div style="padding: 25px; box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2); margin: 18px 16px; border-radius: 8px;">
      <span style="font-weight: bold; font-size: 20px;">Your Shortened URLs</span>
      <br><br>
      <table style="width: 100%;">
        <tr style="border-bottom: 1px solid #ccc;">
          <th>Shortened</th>
          <th>Long</th>
          <th>Created</th>
          <th>Expires</th>
          <th>Clicks</th>
        </tr>
        <Url v-for="url of urlsToShow" :key="url.shortened" v-bind:url="url"></Url>
      </table>
    </div>
  </div>
</template>

<script>
import { serverHost } from '@/constants';
import { getCookie } from '@/utils.js';
import Url from './components/Url.vue';

export default {
  components: {
    Url
  },
  data() {
    return {
      urlsToShow: [],
      isLoading: true
    }
  },
  mounted() {
    window.fetch(`${serverHost}/api/account-urls`, {
      credentials: 'include',
    }).then(res => res.json()).then(val => {
      setTimeout(() => {
        this.urlsToShow = val.data;

        this.isLoading = false;
      }, 1300);
    });
  },
  beforeCreate() {
    if (!getCookie('mvhs_url')) {
      this.$router.push({ path: '/' });
    }
  }
}
</script>

<style scoped>

.title {
  background: #fccb0b;
  padding: 15px 20px;
  display: block;
  font-family: 'Product Sans';
  font-size: 28px;
  transition: background .2s ease;
}

.loading {
  animation: rainbowColors 2s infinite;
}

table {
	border-collapse: collapse;
}

th {
  text-align: left;
  padding: 4px;
}

@keyframes rainbowColors {
	0% {
		background: #d62d20;
    color: white;
	}
	25% {
		background: #0057e7;
    color: white;
	}
	50% {
		background: #008744;
    color: white;
	}
	75% {
		background: #ffa700;
    color: black;
	}
	100% {
		background: red;
    color: white;
	}
}

</style>
