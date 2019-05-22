<template>
  <div>
    <span class="title">Senior Portal</span>
    <div v-show="!first_name" style="padding: 25px;">
      <span style="font-size: 30px;">Please wait...</span>
    </div>
    <div v-show="first_name" style="padding: 25px; box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2); margin: 18px 16px; border-radius: 8px;">
      <span style="font-size: 28px; font-weight: bold;">Hello {{ first_name }} {{ last_name }},</span>
      <br>
      <span>Grade: {{ seniorInfo[11] }}</span><br>
      <span>Short ID Number: {{ seniorInfo[1] }}</span><br>
      <span>Email: {{ seniorInfo[4] }}</span><br>
      <br>
      <div v-html="html"></div>
      <br><br>
      <button class="main-button" @click="reloadData()">Click here to refresh this information</button>
      <br><br>
      <span style="font-style: italic;">Our servers grab the latest data every thirty seconds. Hold tight if you aren't seeing a change immediately, and click the button above to see changes come through.</span>
    </div>
  </div>
</template>

<script>
import { serverHost } from '@/constants';

export default {
  data() {
    return {
      first_name: '',
      last_name: '',
      seniorInfo: {},
      html: '',
      lastData: Date.now()
    }
  },
  methods: {
    loadProfile() {
      if (window.profile) {
        this.first_name = window.profile.data.first_name;
        this.last_name = window.profile.data.last_name;

        for (let i = 0; i < window.profile.data.isSenior; i++) {
          window.profile.data.isSenior[i] = window.profile.data.isSenior[i].trim();
        }

        this.seniorInfo = window.profile.data.isSenior;
        this.lastData = Date.now();

        this.html = this.generateMessage(this.seniorInfo);
      } else {
        setTimeout(() => {
          this.loadProfile();        
        }, 1000);
      }
    },
    reloadData() {
      this.first_name = undefined;
      if (Date.now() - this.lastData > 30 * 1000) {
        window.fetch(`${serverHost}/api/profile`, {
          credentials: 'include'
        }).then(res => res.json()).then(res => {
          window.profile = res;
          this.loadProfile();
        });
      } else {
        alert('Our servers grab the latest data every thirty seconds. Hold tight if you aren\'t seeing a change immediately');
        setTimeout(() => this.loadProfile(), 1000);
      }
    },
    generateMessage(values) {
      let body = '';
      let missing = [];

      if (values[5] === '') {
        missing.push('Our records indicate that you are missing one or more items from the <b><i>College & Career Center</i></b>. Please follow up with the College & Career Center coordinators to complete the process.');
      }
      if (values[6] === '') {
        missing.push('Our records indicate that you are missing one or more items from the <b><i>Library</i></b>. Please follow up with the Librarian or Library Assistant to complete the process.');
      }
      if (values[7] === '') {
        missing.push('Our records indicate that you are missing one or more items from the <b><i>Textbook Center (TBC)</i></b>. Please follow up with the TBC to complete the process.');
      }
      if (values[8] === '') {
        missing.push('Our records indicate that you are missing one or more items from the <b><i>Finance Office</i></b>. Please follow up with the Finance Office to complete the process.');
      }
      if (values[9] !== '') {
        missing.push('Our records indicate that you will need to submit the <b><i>Long Form for Grade Verification</i></b> before checking out. Please follow up with <b>your counselor</b> to complete the process and ensure to bring this form with you on check-out day.');
      }

      body += `<br><div style="padding: 10px; background: ${missing.length === 0 ? '#adf3ad' : '#ffd2d2'}; border-radius: 4px;">`;

      if (missing.length === 0) {
        body += 'Congratulations! You have completed the requirements for Senior Check-out. Please report to the “EXPRESS CHECK-OUT” line at the theater steps on Senior Check-out Day, Wednesday June 5, 2019 at 9:45 AM to receive your ticket to claim your cap & gown.';
      } else {
        for (let i = 0; i < missing.length; i++) {
          if (i !== 0)
            body += '<br>';
          body += `${i + 1}) ${missing[i]}`;
        }
      }

      body += '</div>';

      return body;
    }
  },
  mounted() {
    this.loadProfile();
  }
}
</script>

<style scoped src="@/assets/css/main.css"></style>


