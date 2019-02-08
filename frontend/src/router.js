import Vue from 'vue'
import Router from 'vue-router'

import Home from './views/Home.vue'
import AccountHome from './views/account/Home.vue';
import AccountLogin from './views/account/Login.vue'


Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        title: 'Home - MVHS URL Shortener'
      }
    },
    {
      path: '/account',
      redirect: '/account/home'
    },
    {
      path: '/account/home',
      name: 'account-home',
      component: AccountHome,
      meta: {
        title: 'Account - MVHS URL Shortener'
      }
    },
    {
      path: '/account/login',
      name: 'account-login',
      component: AccountLogin,
      meta: {
        title: 'Login - MVHS URL Shortener'
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
	if (to.meta.title) window.document.title = to.meta.title;

	// google analytics
	//page(to.path);

	next();
});

export default router;