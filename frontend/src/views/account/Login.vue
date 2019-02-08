<template>
  <div>
    <div style="padding: 20px; background: #fccb0b;">
      <span style="font-weight: bold; font-size: 44px; font-family: 'Product Sans';">Please log in</span>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    if (typeof gapi === 'undefined') {
			let script = document.createElement('script');
			script.src = 'https://apis.google.com/js/platform.js';
			script.async = 'true';
			script.defer = 'true';
			document.body.append(script);
		}

		this.gapiLoaded();
  },
  methods: {
    gapiLoaded() {
      
    }
  }
}
</script>
