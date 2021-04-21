<template>
  <div>
    <div v-show="loading">
      <span class="title">Please wait...</span>
    </div>
    <div v-show="!loading">
      <span class="title">{{ success ? 'Success!' : 'There was an error' }}</span>
      <div style="padding: 20px;">
        <div v-show="!success">{{ error }}</div>
        <div v-show="success">
          <span><span class="code">url.mvhs.io/{{ this.data.shortened }}</span> now redirects to <span class="code">{{ this.data.redirects_to }}</span>!</span>

          <br><br><br>
          <h2>We generated a QR Code for your link!</h2>
          <div style="display: flex;">
            <div>
              <img style="width: 150px; padding: 10px; padding-right: 20px;" :src="qrCodeURL">
            </div>
            <div style="padding: 20px;">
              <button @click="downloadQR()"><span style="font-size: 16px;">Download this QR Code</span><i class="material-icons" style="font-size: 30px; vertical-align: middle; margin-left: 8px;">qr_code_2</i></button><br><br>
              <p>You can always download it later by going to the URL's summary page, <router-link :to="'/account/url/' + id">located here</router-link>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { serverHost, genQRCodeURL, toDataURL } from '@/constants';

export default {
  data() {
    return {
      data: JSON.parse(this.$route.query.data),
      success: false,
      loading: true,
      error: '',
      qrCodeURL: '',
      id: ''
    }
  },
  mounted() {

    window.fetch(`${serverHost}/api/create`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shortened: this.data.shortened,
        redirects_to: this.data.redirects_to,
        recaptchaToken: this.data.recaptchaToken,
        expires_in: this.data.expires_in
      })
    }).then(res => res.json()).then(val => {

      if (val.success) {
        this.qrCodeURL = genQRCodeURL(`https://url.mvhs.io/${this.data.shortened}?qrcode=true`);
        this.id = val.data.id;
      } else {
        if (val.error === 'bad_recaptcha') {
          this.error = 'Try again, and, if your human, it should work';
        } else if (val.error === 'suspended_account') {
          this.error = 'Your account has been suspended. Please contact an administrator if you think this is an accident.';
        } else if (val.error === 'no_account') {
          this.error = 'It looks like you don\'t have an account. This is probably due to server issues. To fix this, click \'Logout\' above and try again.';
        } else if (val.error === 'not_valid_redirects_to') {
          this.error = 'Your redirection URL is not a valid URL';
        } else if (val.error === 'bad_shortened') {
          this.error = 'Your shortened URL does not meet our creteria';
        } else if (val.error === 'shortened_exists') {
          this.error = 'Somebody is currently using this shortened URL';
        } else {
          this.error = 'Error: ' + val.error;
        }
      }

      this.success = val.success;
      this.loading = false;
    });

  },
  methods: {
    async downloadQR() {
      let anchor = document.createElement('a');
      anchor.href = await toDataURL(this.qrCodeURL);
      anchor.download = this.data.shortened + '.png';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    },
  }
}
</script>

<style>
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
  display: inline-block;
  padding: 6px 8px;
  border-radius: 4px;
}

button {
  background: #fccb0b;
  padding: 8px 14px;
  display: inline-block;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: 'Product Sans', sans-serif;
  cursor: pointer;
  border-radius: 4px;
}
</style>
