<template>
    <div>
        <span class="title">Expired URL</span>
        <div style="padding: 20px;">
            <span>
                <span style="background: #ddd; padding: 4px 6px; display: inline-block; border-radius: 3px;">url.mvhs.io/u/{{ $route.query.shortened }}</span> has expired. You can try requesting it again; however, it is possible that it has already been taken by another user.</span>
        </div>
    </div>
</template>

<style scoped>

.title {
  background: #fccb0b;
  padding: 15px 20px;
  display: block;
  font-family: 'Product Sans';
  font-size: 28px;
  transition: background .2s ease;
}

</style>
