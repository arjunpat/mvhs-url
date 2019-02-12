<template>
    <div>
        <span>Logging out</span>
    </div>
</template>

<script>
import { serverHost } from '@/constants';

export default {
    mounted() {
        window.fetch(`${serverHost}/api/logout`, {
            credentials: 'include'
        }).then(res => res.json).then(res => {
            document.cookie = 'mvhs_url=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            window.location.href = '/';
        });
    }
}
</script>

