import Vue from 'vue'
import Router from 'vue-router'
import Login from './views/Login.vue'
import Top from './views/Top.vue'
import ServerError from './views/ServerError.vue'
import NotFoundError from './views/NotFoundError.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/top',
      name: 'top',
      component: Top
    },
    {
      path: '/error',
      name: 'error',
      component: ServerError
    },
    {
      path: '*',
      name: '404',
      component: NotFoundError
    }
  ]
})
