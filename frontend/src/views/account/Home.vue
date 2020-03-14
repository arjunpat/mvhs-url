<template>
  <div>
    <span class="title">Your Account</span>
    <div style="padding: 25px; box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2); margin: 18px 16px; border-radius: 8px;">
      <span style="font-weight: bold; font-size: 22px;">Your Shortened URLs</span>
      <br>
      <span style="color: red; font-size: 14px;">Red signifies an expired URL</span>
      <br><br>
      <div class="url-container">
        <table style="width: 100%;">
          <tr style="border-bottom: 1px solid #ccc;">
            <th>Shortened</th>
            <th>Redirects To</th>
            <th>Created</th>
            <th>Expires</th>
            <th>Clicks</th>
            <th>More</th>
          </tr>
          <Url v-for="url of urlsToShow" :key="url.id" v-bind:url="url"></Url>
        </table>
      </div>
    </div>
    <div style="padding: 25px; box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2); margin: 18px 16px; border-radius: 8px;">
      <span style="font-weight: bold; font-size: 22px;">Other Options</span>
      <br><br>
      <button @click="$router.push({ path: '/account/history' })" class="click-history">View your click history</button>
      <button style="margin-left: 18px;" @click="$router.push({ path: '/about' })" class="click-history">About</button>
    </div>
  </div>
</template>

<script>
import { serverHost } from '@/constants';
import Url from '@/views/components/Url.vue';

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
      this.urlsToShow = val.data.sort((a, b) => b.created_time - a.created_time);

      this.isLoading = false;
    });
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
  padding: 8px;
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


.click-history {
  color: #1a73e8;
  cursor: pointer;
  transition: all 150ms ease;
  background: rgb(238, 238, 238);
  padding: 10px 15px;
  margin: 2px;
  font-size: 18px;
  border: none;
  border-radius: 6px;
  outline: none;
}

.click-history:hover {
  color: #0049a8;
  background: rgb(220, 220, 220);
}

.url-container {
  max-height: 390px;
  overflow: scroll;
  border: 2px solid #fccb0b;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 6px 4px 12px 1px rgba(0, 0, 0, .1);
}

</style>
