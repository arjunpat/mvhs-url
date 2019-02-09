<template>
  <div id="app" style="height: 100%;">
    <div id="nav">
      <div id="title">
        <span @click="$router.push({ path: '/' })">MVHS URL Shortener</span>
      </div>
      <div id="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/account">My Account</router-link>
      </div>
    </div>
    <router-view/>
  </div>
</template>

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

</style>
