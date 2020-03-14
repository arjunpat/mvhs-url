import Vue from 'vue';
import Router from 'vue-router';

import Home from './views/Home.vue';
import CreateUrl from './views/CreateUrl.vue';
import AccountHome from './views/account/Home.vue';
import Expired from './views/Expired.vue';
import NotFound from './views/NotFound.vue';
import AccountHistory from './views/account/History.vue';
import About from './views/About.vue';

Vue.use(Router);

let router = new Router({
  /* mode: 'history', */
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
      path: '/create-url',
      name: 'create-url',
      component: CreateUrl,
      meta: {
        title: 'Create URL - MVHS URL Shortener'
      }
    },
    {
      path: '/about',
      component: About,
      meta: {
        title: 'Meta - MVHS URL Shortener'
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
      path: '/account/history',
      component: AccountHistory,
      meta: {
        title: 'Account History - MVHS URL Shortener'
      }
    },
    {
      path: '/admin/home',
      name: 'admin-home',
      component: () => import('./views/admin/Home.vue'),
      meta: {
        title: 'Admin Home - MVHS URL Shortener'
      }
    },
    {
      path: '/admin',
      redirect: '/admin/home'
    },
    {
      path: '/expired',
      name: 'expired',
      component: Expired,
      meta: {
        title: 'Expired - MVHS URL Shortener'
      }
    },
    {
      path: '/account/url/:id',
      name: 'account-url',
      component: () => import('./views/account/Url.vue'),
      meta: {
        title: 'URL - MVHS URL Shortener'
      }
    },
    {
      path: '/not-found',
      name: 'not-found',
      component: NotFound,
      meta: {
        title: 'Not Found - MVHS URL Shortener'
      }
    },
    {
      path: '/senior-portal',
      name: 'senior-portal',
      component: () => import('./views/SeniorPortal.vue'),
      meta: {
        title: 'Senior Portal - MVHS URL Shortener'
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