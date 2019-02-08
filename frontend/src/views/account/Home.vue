<template>
    <div>
        My account page
    </div>
</template>

<script>
import { getCookie } from '@/utils.js';

export default {
    beforeCreate() {
        if (!getCookie('mvhs_url')) {
            this.$router.push({
                path: '/account/login'
            });
        }
    }
}
</script>

