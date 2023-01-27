import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/main-layout/main-layout.vue'),
    children: [
      { name: 'home', path: '', component: () => import('src/pages/home-page/home-page.vue') },
      { name: 'tracklist', path: '/tracklist', component: () => import('src/pages/tracklist-page/tracklist-page.vue') }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/errors/no-found/no-found.vue'),
  },
];

export default routes;
