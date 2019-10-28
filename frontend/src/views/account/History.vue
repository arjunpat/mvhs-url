<template>
  <div>
    <span class="title">Your Click History</span>
    <br>
    <br>
    <div style="margin: 0 auto; max-width: 750px;">
      <span>Here, you can see all shortened links you have used recently, so you can refer back to them if needed.</span>
      <br><br>
      <div v-for="entry of tableValues" style="padding: 15px; border-bottom: 1px solid #ccc; margin: 0px 16px 0px 16px;">
        <div style="display: flex;">
          <div style="flex: 3;">
            <span style="color: #666; font-size: 14px;">Clicked on {{ entry.first_name }} {{ entry.last_name }}'s URL:</span><br>
            <span style="font-size: 22px; font-weight: bold;">url.mvhs.io/{{ entry.shortened }}</span><span style="color: red;" v-if="typeof entry.expires === 'number' && Date.now() > entry.expires"> (expired)</span><br>
            <div style="height: 3px;"></div>
            <span v-if="typeof entry.expires === 'number' && Date.now() > entry.expires">which redirected to </span>
            <span v-else>which redirects to </span>
            <a style="word-break: break-all;" :href="entry.redirects_to">{{ entry.redirects_to }}</a>
            <div style="height: 8px;"></div>

            <span style="font-size: 10px; color: #555;">
              {{ new Date(entry.time).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'America/Los_Angeles',
                hour12: true,
                hour: 'numeric',
                minute: 'numeric',
              }) }}
            </span>
          </div>
          <div style="padding: 5px; display: flex; align-items: center; justify-content: center;">
            <button class="more-btn" style="color: red; margin: 0; font-size: 16px; padding: 4px 8px; border-radius: 3px;" @click="deleteHistory(entry.time)">X</button>
          </div>
        </div>
      </div>
    </div>
    <br><br>
    <button @click="loadMore" class="more-btn" v-if="status === 'are_more'">Load more</button>
    <span style="text-align: center; display: block; font-size: 24px;" v-if="status === 'no_more'">There is no more data</span>
    <br><br><br>
  </div>
</template>

<script>
import { serverHost } from '@/constants';

export default {
  data() {
    return {
      isLoading: true,
      tableValues: [],
      status: 'empty'
    }
  },
  mounted() {
    window.fetch(`${serverHost}/api/account-history/${Date.now()}`, {
      credentials: 'include',
    }).then(res => res.json()).then(val => {
      this.tableValues = val.data;

      if (val.data.length === 5) {
        this.status = 'are_more';
      } else {
        this.status = 'no_more';
      }
    });
  },
  methods: {
    loadMore() {
      window.fetch(`${serverHost}/api/account-history/${this.tableValues[this.tableValues.length - 1].time}`, {
        credentials: 'include',
      }).then(res => res.json()).then(val => {
        this.tableValues = [...this.tableValues, ...val.data]

        this.status = (val.data.length === 5) ? 'are_more' : 'no_more';
      });
    },
    deleteHistory(time) {
      if (!confirm('Are you sure you want to remove this from your history?')) {
        return;
      }

      window.fetch(`${serverHost}/api/remove-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          time
        })
      }).then(res => res.json()).then(val => {
        if (val.success)
          this.tableValues = this.tableValues.filter(e => e.time !== time);
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

.more-btn {
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
  display: block;
  margin: 0 auto;
}

.more-btn:hover {
  color: #0049a8;
  background: rgb(220, 220, 220);
}
</style>