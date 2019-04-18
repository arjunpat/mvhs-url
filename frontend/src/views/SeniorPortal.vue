<template>
  <div>
    <span class="title">Senior Portal</span>
    <div style="padding: 25px; box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2); margin: 18px 16px; border-radius: 8px;">
      <span style="font-size: 28px; font-weight: bold;">Hello {{ first_name }},</span>
      <br><br>
      <span>Grade: {{ seniorInfo[9] }}</span><br>
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
      <span v-if="seniorInfo[8] === 'x'" style="color: red;">
        You are <span style="font-weight:bold;">in danger of failing</span> one or more classes<br>
      </span>
      <span v-if="seniorInfo[4] !== '' && seniorInfo[5] !== '' && seniorInfo[6] !== '' && seniorInfo[7] !== '' && seniorInfo[8] === ''" style="color: green;">
        You're all checked out!<br>
      </span>
    </div>
  </div>
</template>

<script>
import { serverHost } from '@/constants';

export default {
  data() {
    return {
      first_name: '',
      seniorInfo: {}
    }
  },
  methods: {
    loadProfile() {
      window.fetch(`${serverHost}/api/profile`, {
        credentials: 'include'
      }).then(res => res.json()).then(res => {
        this.first_name = res.data.first_name;
        this.seniorInfo = res.data.isSenior;
      });
    }
  },
  mounted() {
    this.loadProfile();
  }
}
</script>

<style scoped>
</style>


