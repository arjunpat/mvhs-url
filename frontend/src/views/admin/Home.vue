<template>
    <div>
      <span class="title">Admin Portal</span>
      <!-- <div style="padding: 25px; box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2); margin: 18px 16px; border-radius: 8px;">
        <span style="font-weight: bold; font-size: 22px;">All Shortened URLs</span>
        <br>
        <span style="color: red; font-size: 14px;">Red signifies an expired URL</span>
        <br><br>
        <table style="width: 100%;">
          <tr style="border-bottom: 1px solid #ccc;">
            <th>Shortened</th>
            <th>Redirects To</th>
            <th>Created</th>
            <th>Expires</th>
            <th>Clicks</th>
            <th>User</th>
            <th>More</th>
          </tr>
          <Url v-for="url of urls" :key="url.id" v-bind:url="url"></Url>
        </table>
      </div> -->
      <div style="padding: 25px; box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2); margin: 18px 16px; border-radius: 8px;">
        <span style="font-weight: bold; font-size: 22px;">All Accounts</span>
        <br><br>
        <!-- <table style="width: 100%;">
          <tr style="border-bottom: 1px solid #ccc;">
            <th>Email</th>
            <th>Name</th>
            <th>Created account</th>
            <th>Amount of URLs</th>
            <th>Suspend account</th>
          </tr>
          <tr v-for="user of users" :key="user.email">
            <td>{{ user.email }}</td>
            <td>{{ user.first_name + ' ' + user.last_name }}</td>
            <td>{{ dateToString(user.created_time) }}</td>
            <td>{{ user.__url_amount }}</td>
            <td style="color: blue; cursor: pointer;" @click="() => suspendUser(user)">{{ user.is_suspended ? 'Unsuspend' : 'Suspend' }}</td>
          </tr>
        </table> -->
        <div>
          <span>Enable or suspend an account</span><br>
          <input placeholder="Email" v-model="emailToSuspend" style="padding: 10px; width: 200px;"><button style="padding: 10px;" @click="suspendUser(users.filter(u => u.email === emailToSuspend)[0])">Toggle Account Suspension</button>
        </div>
        <br><br>
        <hot-table
          :data="users"
          :colHeaders="['Profile Picture', 'Name', 'Email', 'Creation', '# of URLs', 'Is Active']"
          licenseKey="non-commercial-and-evaluation"
          :editor="false"
          :columnSorting="true"
          height="300"
          :columns="[
            {data: '__pic', renderer: 'html'},
            {data: '__name'},
            {data: 'email'},
            {data: '__time'},
            {data: '__url_amount'},
            {data: '__suspend'},
          ]"
        ></hot-table>
      </div>
    </div>
</template>

<script>
import { serverHost } from '@/constants';
import Url from '@/views/components/Url.vue';
import { HotTable } from '@handsontable/vue';

export default {
  components: {
    Url,
    HotTable
  },
  data() {
    return {
      users: [],
      urls: [],
      emailToSuspend: ''
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      window.fetch(`${serverHost}/api/admin/all`, {
        credentials: 'include',
      }).then(res => res.json()).then(val => {
        this.urls = val.data.urls.sort((a, b) => b.created_time - a.created_time);
        this.users = val.data.users.sort((a, b) => b.created_time - a.created_time);
        this.users.forEach(user => {
          user.__url_amount = this.urls.filter(u => u.registered_to === user.email).length;
          user.__name = user.first_name + ' ' + user.last_name;
          user.__pic = `<div style="background-image: url(${user.profile_pic}); background-size: 30px 30px; background-repeat: no-repeat; background-position: center; width: 30px; height: 30px; margin: 0 auto;"></div>`;
          user.__time = this.dateToString(user.created_time);
          user.__suspend = !user.is_suspended;
        });

        this.isLoading = false;
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email })
      }).then(res => res.json()).then(val => {
        this.init();
      });
    }
  }
}
</script>


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

</style>
