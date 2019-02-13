<template>
  <div>
    <span class="title">url.mvhs.io/u/{{ url.shortened }}</span>
    <div style="padding: 20px;">
      <p v-if="url.expired" style="background: #ddd; color: #ff0000; display: inline-block; padding: 6px 10px; margin-bottom: 20px; font-weight: bold; border-radius: 4px;">This shortened URL has already expired and may now be in use by another user</p>
      <div v-if="!url.expired" style="margin-bottom: 10px;">
        <span style="display: block; font-weight: bold; font-size: 20px; margin-bottom: 4px;">Your options</span>
        <button @click="cancel()" style="margin-left: 20px;">Cancel</button>
      </div>
      <p>Redirects to: <span class="code">{{ url.redirects_to }}</span></p>
      <p>Total clicks: {{ url.clicks }}</p>
      <p v-if="!url.expired">Expires: {{ toDateString(this.url.expires) }}</p>
      <p v-else>Already expired: {{ toDateString(this.url.expires) }}</p>
      <p>Created: {{ toDateString(this.url.created_time) }}</p>
      <canvas id="graph"></canvas>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js';
import { serverHost } from '@/constants';

export default {
  data() {
    return {
      url: {},
      id: this.$route.params.id,
      chart: null
    }
  },
  created() {
    this.init();
  },
  methods: {
    toDateString(date) {
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
    },
    cancel() {

      prompt(`To confirm you want to delete this, type /u/${this.url.shortened} below:`);

      if (prompt !== '/u/' + this.url.shortened)
        return;

      window.fetch(`${serverHost}/api/cancel`,{
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url_id: this.id })
      }).then(res => res.json()).then(res => {
        this.init();
      });
    },
    init() {
      window.fetch(`${serverHost}/api/details/${this.id}`, {
        credentials: 'include'
      }).then(res => res.json()).then(res => {
        this.url = res.data;
        this.url.expired = !(this.url.expires > Date.now() || this.url.expires === null);

        this.drawChart();
      });
    },
    drawChart() {

      if (this.url.expired)
        return;

      let hitsByDay = this.url.hitsByDay;
      let labels = [];

      for (let i = 0; i < 7; i++) {
        let d = new Date(Date.now() + ((i - 7) * 86400000));
        labels.push(d.toISOString().split('T')[0]);
      }

      this.chart = new Chart(document.getElementById('graph').getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Hits',
              data: (() => {
                let arr = [];

                for (let i = 0; i < labels.length; i++) {
                  arr.push(hitsByDay[labels[i]] || 0);
                }

                return arr;
              })(),
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderColor: '#ff0000'
            }
          ]
        }
      });

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

.code {
  background: #ddd;
  margin: 3px 0;
  padding: 4px 6px;
  display: inline-block;
  border-radius: 3px;
}

button {
  background: #fccb0b;
  padding: 8px 14px;
  display: inline-block;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: 'Product Sans', sans-serif;
  cursor: pointer;
  border-radius: 4px;
}

</style>
