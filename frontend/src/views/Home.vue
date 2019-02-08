<template>
  <div>
    <div id="url-maker">
      <div>
        <span style="font-family: 'Product Sans'; font-size: 44px; font-weight: bold;">Simplfiy your links</span>
        <br>
        <br>
        <span style="font-size: 20px;">url.mvhs.io/u/&nbsp;</span><input style="width: 30%; padding-left: 4px;" type="text" placeholder="Your shortened URL">
        <br>
        <br>
        <br>
        <input type="text" placeholder="Your original URL here">
        <br>
        <br>
        <br>
        <div id="recaptcha-div"></div>
        <br>
        <button>Shorten URL</button>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  data() {
    return {
      recaptchaToken: ''
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

<style scoped>

#url-maker {
  background: #fccb0b;
  width: 100%;
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

</style>
