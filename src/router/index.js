import Vue from 'vue'
import Router from 'vue-router'

import paths from './paths'

Vue.use(Router)

// 从paths中获取routes的方法
function route (path, view, name) {
  return {
    name: name || view,
    path,
    component: (resovle) => import(
      `@/views/${view}.vue`
    ).then(resovle)
  }
}

const router = new Router({
  routes: paths.map(path => route(path.path, path.view, path.name)).concat([
    { path: '*', redirect: '/home' }
  ]),
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { selector: to.hash }
    }
    return { x: 0, y: 0 }
  }
})

export default router
