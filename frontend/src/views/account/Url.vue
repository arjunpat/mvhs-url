<template>
    <div>
        <span class="title">url.mvhs.io/u/{{ url.shortened }}</span>
        <div style="padding: 20px;">
            <p v-if="url.expired" style="background: #ddd; color: #ff0000; display: inline-block; padding: 6px 10px; margin-bottom: 20px; font-weight: bold; border-radius: 4px;">This shortened URL has already expired and may now be in use by another user</p>
            <p>Redirects to: <span class="code">{{ url.redirects_to }}</span></p>
            <p>Total clicks: {{ url.clicks }}</p>
            <p v-if="!url.expired">Expires: {{ toDateString(this.url.expires) }}</p>
            <p v-else>Already expired: {{ toDateString(this.url.expires) }}</p>
            <p>Created: {{ toDateString(this.url.created_time) }}</p>
        </div>
    </div>
</template>

<script>
import { serverHost } from '@/constants';

export default {
    data() {
        return {
            url: {},
            id: this.$route.params.id
        }
    },
    mounted() {

        window.fetch(`${serverHost}/api/details/${this.id}`, {
            credentials: 'include'
        }).then(res => res.json()).then(res => {
            this.url = res.data;
            this.url.expired = !(this.url.expires > Date.now() || this.url.expires === null)
        });
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

</style>
