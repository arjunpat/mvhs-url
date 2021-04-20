<template>
  <div>
    <span class="title">url.mvhs.io/{{ url.shortened }}</span>
    <div style="padding: 20px;">
      <div style="display: flex; justify-content: space-around; flex-wrap: wrap; align-items: center;">
        <div style="max-width: 285px;">
          <p v-if="url.expired" style="background: #ddd; color: #ff0000; padding: 6px 10px; margin-bottom: 20px; font-weight: bold; border-radius: 4px;">This shortened URL has already expired and may now be in use by another user</p>
          <div class="info-display">
            <h1 style="display: block; margin-bottom: 6px;">Details</h1>
            <p><strong>Total clicks:</strong> {{ url.clicks }}</p>
            <p><strong>Clicks from QR Code:</strong> {{ url.qrcode_clicks }}</p>
            <p v-if="!url.expired"><strong>Expires:</strong> {{ toDateString(this.url.expires) }}</p>
            <p v-else><strong>Expired on:</strong> {{ toDateString(this.url.expires) }}</p>
            <p><strong>Created:</strong> {{ toDateString(this.url.created_time) }}</p>
            <p><strong>Redirects to:</strong></p>
            <div><textarea :value="url.redirects_to" class="code" disabled="true"></textarea></div>
            <div v-if="!url.expired" style="margin-top: 10px;">
              <button @click="downloadQR()" style="width: 100%;"><span style="font-size: 16px;">Download QR Code</span><i class="material-icons" style="font-size: 30px; vertical-align: middle; margin-left: 8px;">qr_code_2</i></button>
              <br><br>
              <button @click="cancel()">Cancel URL Now</button>
              <button @click="change()" style="margin-left: 20px;">Change Link</button>
            </div>
          </div>
        </div>
        <div style="width: 70vw;">
          <canvas id="graph"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js';
import { serverHost, genQRCodeURL, toDataURL } from '@/constants';

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
      if (!date)
        return "Never";

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
    change() {
      alert('In order to change the link of this URL, do the following:\n\n1. Cancel this current URL by clicking the \'Cancel URL now\' button\n2. Go to the home page and create a new URL under the same name, this time using your new link');
    },
    cancel() {

      let question = prompt(`To confirm you want to delete this, type url.mvhs.io/${this.url.shortened} below:`);

      if (question !== 'url.mvhs.io/' + this.url.shortened)
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
        if (Object.keys(this.url.hitsByDay).length !== 0)
          this.drawChart();
      });
    },
    async downloadQR() {
      let anchor = document.createElement('a');
      anchor.href = await toDataURL(genQRCodeURL(`https://url.mvhs.io/${this.url.shortened}?qrcode=true`));
      anchor.download = this.url.shortened + '.png';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    },
    drawChart() {
      let hitsByDay = this.url.hitsByDay;
      let datesInOrder = Object.keys(hitsByDay).sort((a, b) => {
        if (a > b) {
          return 1;
        }
        return -1;
      });

      let labels = [];
      let start = new Date(datesInOrder[datesInOrder.length - 1]).getTime();

      for (let i = 0; i <= 7; i++) {
        let d = new Date(start + ((i - 7) * 86400000));
        labels.push(d.toISOString().split('T')[0]);
      }

      this.chart = new Chart(document.getElementById('graph').getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Total Clicks',
              fill: true,
              data: (() => {
                let arr = [];

                for (let i = 0; i < labels.length; i++) {
                  arr.push(hitsByDay[labels[i]] || 0);
                }

                return arr;
              })(),
              backgroundColor: 'rgba(252, 204, 11, 0.3)',
              borderColor: '#fccb0b'
            }
          ]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
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
  border: none;
  width: calc(100% - 12px);
  height: 40px;
  outline: none;
  color: black;
  resize: none;
  font-size: 14px;
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

.info-display {
  /*border: 1px solid #ccc;*/
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2);
  padding: 16px;
  border-radius: 6px;
}

.info-display > p {
  font-size: 18px;
}

</style>
