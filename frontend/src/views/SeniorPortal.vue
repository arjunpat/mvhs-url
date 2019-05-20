<template>
  <div>
    <span class="title">Senior Portal</span>
    <div v-show="!first_name" style="padding: 25px;">
      <span style="font-size: 30px;">Please wait...</span>
    </div>
    <div v-show="first_name" style="padding: 25px; box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2); margin: 18px 16px; border-radius: 8px;">
      <span style="font-size: 28px; font-weight: bold;">Hello {{ first_name }} {{ last_name }},</span>
      <br>
      <span>Grade: {{ seniorInfo[10] }}</span><br>
      <span>Short ID Number: {{ seniorInfo[0] }}</span><br>
      <span>Email: {{ seniorInfo[3] }}</span><br>
      <br>
      <button style="padding: 15px;">Click here to refresh this information</button>
      <br><br>
      <span v-if="seniorInfo[4] === ''" style="color: red;">
        You have one or more items missing from the <span style="font-weight:bold;">College &amp; Career Center</span><br>
      </span>
      <span v-if="seniorInfo[5] === ''" style="color: red;">
        You have one or more items missing from the <span style="font-weight:bold;">Library</span><br>
      </span>
      <span v-if="seniorInfo[6] === ''" style="color: red;">
        You have one or more items missing from the <span style="font-weight:bold;">Textbook Center</span><br>
      </span>
      <span v-if="seniorInfo[7] === ''" style="color: red;">
        You have one or more items missing from the <span style="font-weight:bold;">Finance Office</span><br>
      </span>
      <span v-if="seniorInfo[8] !== ''" style="color: red;">
        You are <span style="font-weight:bold;">in danger of failing</span> one or more classes<br>
      </span>
      <span v-if="seniorInfo[4] !== '' && seniorInfo[5] !== '' && seniorInfo[6] !== '' && seniorInfo[7] !== '' && seniorInfo[8] === ''" style="color: green; font-weight: bold; font-size: 24px;">
        You're all checked out! Please report to the "EXPRESS CHECK-OUT" line at the theater steps to collect your cap and gown on Senior Check-out day.<br>
      </span>
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
      seniorInfo: {}
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
      } else {
        setTimeout(() => {
          this.loadProfile();        
        }, 1000);
      }
    }
  },
  mounted() {
    this.loadProfile();
  }
}
</script>

<style scoped>
</style>


