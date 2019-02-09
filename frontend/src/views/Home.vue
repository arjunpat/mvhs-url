<template>
  <div id="main">
    <div id="url-maker">
      <div>
        <span style="font-family: 'Product Sans'; font-size: 50px; font-weight: bold;">Simplfiy your links</span>
        <br>
        <br>
        <span style="font-size: 20px;">url.mvhs.io/u/&nbsp;</span><input style="width: 30%; padding-left: 4px;" type="text" placeholder="Your shortened URL" v-model="shortened">
        <br>
        <br>
        <br>
        <input type="text" placeholder="Your original URL here" v-model="redirects_to">
        <br>
        <br>
        <br>
        <br>
        <span style="display: block; margin-bottom: 10px;">When do you want this link to expire?</span>
        <select v-model="expires_in">
          <optgroup label="Soon">
            <option value="86400000">1 day</option>
            <option value="604800000">1 week</option>
            <option value="2592000000">1 month</option>
          </optgroup>
          <optgroup label="Later">
            <option value="7862400000">3 months</option>
            <option value="15811200000">6 months</option>
            <option value="23673600000">9 months</option>
          </optgroup>
          <optgroup label="A while">
            <option value="31536000000">1 year</option>
            <option value="63072000000">2 years</option>
          </optgroup>
          <option value="never">Never (not recommended)</option>
        </select>
        <br>
        <br>
        <br>
        <br>
        <div id="recaptcha-div"></div>
        <br>
        <button v-show="recaptchaToken && shortened && redirects_to && expires_in" @click="create()">Shorten URL</button>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { serverHost } from '@/constants';
import { getCookie } from '@/utils';

export default {
  data() {
    return {
      recaptchaToken: '',
      shortened: '',
      redirects_to: '',
      expires_in: '604800000'
    }
  },
  methods: {
    initRecaptcha() {
			setTimeout(() => {
				if (typeof grecaptcha === 'undefined' || typeof grecaptcha.render === 'undefined') {
					return this.initRecaptcha()
				}
				
				grecaptcha.render('recaptcha-div', {
					sitekey: '6Lf3A5AUAAAAAOgFN4mozHXDpwK3hKWTGMxhZYJp',
					callback: token => this.recaptchaToken = token
				});

			}, 100);
		},
    create() {
      let shortened = this.shortened;
      let redirects_to = this.redirects_to;
      let recaptchaToken = this.recaptchaToken;
      let expires_in = this.expires_in;
      expires_in = isNaN(parseInt(expires_in)) ? expires_in : parseInt(expires_in);

      this.shortened = '';
      this.redirect_to = '';
      this.expires_in = '604800000';

      window.fetch(`${serverHost}/api/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shortened,
          redirects_to,
          recaptchaToken,
          expires_in
        })
      }).then(res => res.json()).then(val => {
        console.log(val);
      });

    }
  },
  mounted() {
    if (typeof grecaptcha === 'undefined') {
			let script = document.createElement('script');
			script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
			script.async = 'true';
			script.defer = 'true';
			document.body.append(script);
		}

		this.initRecaptcha();
  },
  beforeCreate() {
    if (getCookie('mvhs_url')) {
      return;
    }

    function getHashValue(key) {
      let matches = window.location.hash.match(new RegExp(key + '=([^&]*)'));
      return matches ? matches[1] : null;
    }

    let accessToken = getHashValue('access_token');

    if (accessToken) {
      console.log(accessToken);

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
      })

    } else {
      let redirectPath = encodeURIComponent(window.location.protocol + '//' + window.location.host + window.location.pathname.split('/').slice(0, -1).join('/'));

      let params = {
        client_id: '740436136559-n3qoo8kanof8cs8gqpl0s8g8qvohr8ta.apps.googleusercontent.com',
        redirect_uri: redirectPath,
        scope: encodeURIComponent('profile email')
      }

      let url = `https://accounts.google.com/o/oauth2/auth?client_id=${params.client_id}&redirect_uri=${redirectPath}&scope=${params.scope}&response_type=token`;
      //console.log(url);
      window.location.href = url;
    }
  }
}
</script>

<style scoped>

#main {
  height: calc(100% - 74px);
}

#url-maker {
  background: #fccb0b;
  width: 100%;
  height: 100%;
}

#url-maker > div {
  max-width: 700px;
  min-width: 500px;
  margin: 0 auto;
  padding: 50px 0 70px 0;
}

#url-maker > div > input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  outline: none;
  border-radius: 6px;
  border: none;
  transition: box-shadow 200ms ease;
  box-shadow: 0 2px 1px -1px rgba(0,0,0,0.1), 0 1px 1px 0 rgba(0,0,0,0.07), 0 1px 3px 0 rgba(0,0,0,0.06);
  max-width: 700px;
}

#url-maker > div > input:focus {
  box-shadow: 2px 3px 1px -1px rgba(0,0,0,0.1), 0 1px 1px 0 rgba(0,0,0,0.07), 0 1px 3px 0 rgba(0,0,0,0.06);
}

#url-maker > div > button {
  padding: 12px 16px;
  font-family: 'Product Sans';
  font-size: 16px;
  background: #444;
  color: #fccb0b;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  outline: none;
}

select {
  display: block;
  border: 2px solid #3367d6;
  background: #fff;
  color: #000;
  border-radius: 0;
  padding: 2px 15px 2px 10px;
  cursor: pointer;
  margin: 0;
  width: 250px;
  height: 30px;
  font-size: 16px;
  outline: none;
}

</style>
