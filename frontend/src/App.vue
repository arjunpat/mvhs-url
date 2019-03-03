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
        <router-link to="/logout">Logout</router-link>
        <img @click="logout()" id="profile-pic" v-show="profile_pic" :src="profile_pic">
      </div>
    </div>
    <router-view/>
  </div>
</template>

<script>
import { serverHost } from '@/constants';

export default {
  data() {
    return {
      profile_pic: '',
      isAdmin: false
    }
  },
  mounted() {
    setTimeout(() => {
      window.fetch(`${serverHost}/api/profile`, {
        credentials: 'include'
      }).then(res => res.json()).then(res => {
        this.profile_pic = res.data.profile_pic;
        this.isAdmin = res.data.isAdmin;
      });
    }, 1000);
  },
  methods: {
    logout() {

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

</style>
