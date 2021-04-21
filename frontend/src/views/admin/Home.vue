<template>
    <div>
      <span class="title">Admin Portal</span>
      <div class="card">
        <span style="font-weight: bold; font-size: 22px;">Quick Facts</span>
        <br><br>
        <p>URL Clicks Today: {{  urlClicksToday }}</p>
        <p>URL Clicks from QR Code Today: {{  qrClicksToday }}</p>
        <p>Number of users: {{ users.length }}</p>
        <p>Number of urls: {{ urls.length }}</p>
      </div>
      <div class="card">
        <span style="font-weight: bold; font-size: 22px;">All Shortened URLs</span>
        <br>
        <span style="color: red; font-size: 14px;">Red signifies an expired URL</span>
        <br><br>
        <hot-table
          :data="urls"
          :colHeaders="['Shortened', 'Redirects To', 'Created', 'Expires', 'Name', 'User', 'More']"
          :editor="false"
          :columnSorting="true"
          :dropdownMenu="true"
          :filters="true"
          :columns="[
            {data: '__shortened', renderer: 'html'},
            {data: '__redirects_to'},
            {data: '__created_time'},
            {data: '__expires', renderer: 'html'},
            {data: '__name'},
            {data: 'registered_to'},
            {data: '__more', renderer: 'html'}
          ]"
          licenseKey="non-commercial-and-evaluation"
          height="300"
          stretchH="all"
        ></hot-table>
      </div>
      <div class="card">
        <span style="font-weight: bold; font-size: 22px;">All Accounts</span>
        <br><br>
        <div>
          <span>Enable or suspend an account</span><br>
          <input placeholder="Email" v-model="emailToSuspend" style="padding: 10px; width: 200px;">
          <button style="padding: 10px;" class="main-button" @click="suspendUser(users.filter(u => u.email === emailToSuspend)[0])">Toggle Account Suspension</button>
        </div>
        <br>
        <hot-table
          :data="users"
          :colHeaders="['Profile Picture', 'Name', 'Email', 'Creation', '# of URLs', 'Is Active']"
          :editor="false"
          :columnSorting="true"
          :dropdownMenu="true"
          :filters="true"
          :columns="[
            {data: '__pic', renderer: 'html'},
            {data: '__name'},
            {data: 'email'},
            {data: '__time'},
            {data: '__url_amount'},
            {data: '__suspend'},
          ]"
          height="300"
          stretchH="all"
          licenseKey="non-commercial-and-evaluation"
        ></hot-table>
      </div>
    </div>
</template>

<script>
import { serverHost, dateToString } from '@/constants';

export default {
  components: {
    HotTable: () => import('@handsontable/vue').then(({ HotTable }) => HotTable)
  },
  data() {
    return {
      users: [],
      urls: [],
      urlClicksToday: 'Loading...',
      qrClicksToday: 'Loading...',
      emailToSuspend: ''
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    dateToString,
    init() {
      window.fetch(`${serverHost}/api/admin/all`, {
        credentials: 'include',
      }).then(res => res.json()).then(val => {
        this.urlClicksToday = val.data.urlClicksToday;
        this.qrClicksToday = val.data.qrClicksToday;

        let urlCountByUser = {};
        for (let each of val.data.urls) {
          if (!urlCountByUser[each.registered_to]) {
            urlCountByUser[each.registered_to] = 0;
          }
          urlCountByUser[each.registered_to]++;
        }

        let emailToName = {};
        this.users = val.data.users.sort((a, b) => b.created_time - a.created_time);
        this.users.forEach(user => {
          user.__url_amount = urlCountByUser[user.email];
          user.__name = user.first_name + ' ' + user.last_name;
          user.__pic = `<div style="background-image: url(${user.profile_pic}); background-size: 30px 30px; background-repeat: no-repeat; background-position: center; width: 30px; height: 30px; margin: 0 auto;"></div>`;
          user.__time = this.dateToString(user.created_time);
          user.__suspend = !user.is_suspended;

          emailToName[user.email] = user.__name;
        });

        this.urls = val.data.urls.sort((a, b) => b.created_time - a.created_time);
        this.urls.forEach(url => {
          url.__shortened = `<a href="/${url.shortened}" target="_blank">url.mvhs.io/${url.shortened}</a>`;
          url.__redirects_to = url.redirects_to.length > 25 ? url.redirects_to.substring(0, 25) + '...' : url.redirects_to;
          url.__created_time = this.dateToString(url.created_time);

          if (url.expires) {
            url.__expires = this.dateToString(url.expires);
            if (url.expires < Date.now()) {
              url.__expires = `<div style="color: #ff0000;">${url.__expires}</div>`;
            }
          } else {
            url.__expires = 'Never';
          }

          url.__more = `<!-- ${url.id} --><a href="/#/account/url/${url.id}" target="_blank">More</a>`;
          url.__name = emailToName[url.registered_to];
        });
      });
    },
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
    },
    suspendUser(user) {
      this.emailToSuspend = '';
      if (!user) {
        return alert('No user with this email found');
      }

      if (!user.is_suspended && (!confirm('Are you sure you want to suspend this account?') || !confirm(user.email + ' will no longer be able to create new urls?'))) {
        return;
      }

      window.fetch(`${serverHost}/api/admin/toggle-suspension`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      }).then(res => res.json()).then(val => {
        this.init();
      });
    }
  }
}
</script>

<style scoped src="@/assets/css/main.css"></style>
<style scoped>
@import '~handsontable/dist/handsontable.full.css';

.title {
  background: #fccb0b;
  padding: 15px 20px;
  display: block;
  font-family: 'Product Sans';
  font-size: 28px;
  transition: background .2s ease;
}

table {
	border-collapse: collapse;
}

th {
  text-align: left;
  padding: 8px;
}

td {
  text-align: left;
  padding: 12px 4px;
}

.card {
  padding: 25px;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2);
  margin: 18px 16px;
  border-radius: 8px;
}
</style>
