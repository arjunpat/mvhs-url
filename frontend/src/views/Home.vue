<template>
  <div id="main">
    <div id="url-maker">
      <div>
        <span style="font-family: 'Product Sans'; font-size: 50px; font-weight: bold;">Simplify your links</span>
        <br>
        <br>
        <span style="font-size: 20px;">url.mvhs.io/&nbsp;</span>
        <input style="width: 30%; padding-left: 4px;" type="text" placeholder="Anything you choose" v-model="shortened">
        <i class="material-icons"
          style="font-size: 36px; margin-left: 8px; vertical-align: middle;"
          :style="{
            color: availability === 'check_circle' ? 'green' : availability === 'block' ? 'red' : 'black',
            animation: availability === 'cached' ? 'spin 1.2s linear infinite' : ''
          }"
        >{{ availability }}</i>
        <br>
        <div v-show="shortened && !/^[A-Za-z0-9-_.]+$/g.test(shortened)" style="color: red; font-weight: bold; margin-top: 20px;">Your shortened URL can only contain alphanumeric, underscore, dash, and period characters.</div>
        <div v-show="shortened && availability === 'block'" style="color: red; font-weight: bold; margin-top: 20px;">This shortened URL is already in use or not available.</div>
        <br>
        <br>
        <br>
        <input type="text" placeholder="Your original URL here" v-model="redirects_to">
        <br><br>
        <span v-show="redirects_to && !/((http(s)?(\:\/\/))+(www\.)?([\w\-\.\/])*(\.[a-zA-Z]{2,3}\/?))[^\s\b\n|]*[^.,;:\?\!\@\^\$ -]/.test(redirects_to)" style="color: red; font-weight: bold;">Please enter a complete URL</span>
        <br>
        <br>
        <span style="display: block; margin-bottom: 10px;">When do you want this link to expire? This frees up the name for other users to use</span>
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
        <div id="recaptcha-div"></div>
        <br>
        <button v-show="recaptchaToken && shortened && /((http(s)?(\:\/\/))+(www\.)?([\w\-\.\/])*(\.[a-zA-Z]{2,3}\/?))[^\s\b\n|]*[^.,;:\?\!\@\^\$ -]/.test(redirects_to) && expires_in" @click="create()">Shorten URL</button>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { serverHost } from '@/constants';

export default {
  data() {
    return {
      recaptchaToken: '',
      shortened: '',
      redirects_to: '',
      expires_in: '604800000',
      availability: '' // check_circle, block, cached
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


      this.$router.push({
        path: '/create-url?data=' + encodeURIComponent(JSON.stringify({
          shortened,
          redirects_to,
          recaptchaToken,
          expires_in
        }))
      });
    }
  },
  watch: {
    shortened() {
      this.shortened = this.shortened.replace(/ /g, '-');
      let current = this.shortened;
      if (current === '' || !/^[A-Za-z0-9-_.]+$/g.test(current)) {
        this.availability = 'block';
        return;
      }

      this.availability = 'cached';

      setTimeout(() => {
        if (current !== this.shortened)
          return;

        window.fetch(`${serverHost}/api/availability`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            shortened: this.shortened
          })
        }).then(res => res.json()).then(res => {

          if (res.data.availability === 'none') {
            this.availability = 'block';
          } else if (res.data.availability === 'available') {
            this.availability = 'check_circle'
          }
        });
      }, 500);
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
  }
}
</script>

<style>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

</style>


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
