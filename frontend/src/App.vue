<template>
  <div id="app" style="height: 100%;">
    <div id="nav">
      <div id="title">
        <span @click="$router.push({ path: '/' })">MVHS URL Shortener</span>
      </div>
      <div id="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/account">My Account</router-link>
        <router-link v-if="isAdmin" to="/admin">Admin</router-link>
        <router-link v-if="isSenior" to="/senior-portal">Senior Portal</router-link>
        <a @click="logout">Logout</a>
        <img id="profile-pic" v-show="profile_pic" :src="profile_pic">
      </div>
    </div>
    <router-view v-if="isMVLA"/>
    <div v-if="!isMVLA" style="padding: 20px;">
      <h1>This application is intended for use by MVLA students only.</h1>
      <br>
      <h2>Please sign out and log in with your MVLA account.<br><br>If you are having difficulty logging out of this application, open google.com, sign into your MVLA account there, and then try to logout of this application.</h2>
    </div>
  </div>
</template>

<script>
import { serverHost } from '@/constants';
import { getCookie } from '@/utils';

export default {
  data() {
    return {
      profile_pic: '',
      isAdmin: false,
      isSenior: false,
      isMVLA: true
    }
  },
  methods: {
    loadProfile() {
      setTimeout(() => {
        if (!getCookie('mvhs_url'))
          return this.loadProfile();

        window.fetch(`${serverHost}/api/profile`, {
          credentials: 'include'
        }).then(res => res.json()).then(res => {
          this.profile_pic = res.data.profile_pic;
          this.isAdmin = res.data.isAdmin;
          this.isSenior = !!res.data.isSenior;

          this.isMVLA = !!res.data.email.includes('@mvla.net');

          window.profile = res;
        });
      }, 1000);
    },
    logout() {
      window.fetch(`${serverHost}/api/logout`, {
        credentials: 'include'
      }).then(res => res.json).then(res => {
        document.cookie = 'mvhs_url=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        window.location.href = '/';
      });
    }
  },
  mounted() {
    this.loadProfile();
  },
  beforeCreate() {
    if (getCookie('mvhs_url')) {
      return;
    }

    this.loggingIn = true;

    let accessTokenLocation = window.location.href.indexOf('access_token=');

    if (accessTokenLocation > -1) {
      let accessToken = window.location.href.substring(accessTokenLocation + 13);

      while (accessToken.includes('&')) {
        accessToken = accessToken.substring(0, accessToken.indexOf('&'));
      }

      window.fetch(`${serverHost}/api/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessToken
        })
      }).then(res => res.json()).then(res => {

        if (window.location.href.includes('localhost')) {
          document.cookie = `mvhs_url=${res.data.token}; Max-Age=2592000`;
        }

        window.history.replaceState({}, '', '/');

        this.$router.push({
          path: '/'
        });
      });

    } else {
      let redirectPath = encodeURIComponent(window.location.protocol + '//' + window.location.host + window.location.pathname.split('/').slice(0, -1).join('/') + '/');

      let params = {
        client_id: '740436136559-n3qoo8kanof8cs8gqpl0s8g8qvohr8ta.apps.googleusercontent.com',
        redirect_uri: redirectPath,
        scope: encodeURIComponent('profile email')
      }

      let url = `https://accounts.google.com/o/oauth2/auth?client_id=${params.client_id}&redirect_uri=${redirectPath}&scope=${params.scope}&response_type=token`;
      window.location.href = url;
    }
  }
}
</script>


<style>
* {
  padding: 0;
  margin: 0;
  font-family: 'Roboto', sans-serif;
}

html, body {
  height: 100%;
}
</style>

<style scoped>
#title {
  padding: 20px;
  display: inline-block;
}

#title > span {
  font-family: 'Product Sans';
  font-size: 28px;
  cursor: pointer;
  font-weight: bold;
}

#nav-links {
  float: right;
  padding: 20px;
  display: flex;
}

#nav-links > a {
  text-decoration: none;
  color: #333;
  display: inline-block;
  padding: 12px 16px;
  border-radius: 6px;
}

#nav-links > a:hover {
  background: #eee;
}

#profile-pic {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  margin-left: 10px;
  cursor: pointer;
  transition: .2s ease all;
}

@media only screen and (max-width: 400px) {
  #profile-pic {
    display: none;
  }
}

</style>
