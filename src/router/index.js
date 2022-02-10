import Vue from 'vue'
import Router from 'vue-router'
import common from './common'

Vue.use(Router)
const VueRouterReplace = Router.prototype.replace
Router.prototype.replace = function replace(to) {
    return VueRouterReplace.call(this, to).catch(err => err)
}
const VueRouterPush = Router.prototype.push
Router.prototype.push = function push(to) {
    return VueRouterPush.call(this, to).catch(err => err)
}

const router = new Router({
    routes: [
        ...common
    ]
})

// router.beforeEach((to, from, next) => {
//     const userInfo = Vue.prototype.$getlocalStorage('userInfo')
//     if (userInfo) {
//         if (to.meta.title) {
//             document.title = to.meta.title
//         }
//         next()
//     } else {
//         if (to.path === '/login') {
//             next()
//         } else {
//             next({
//                 path: '/login'
//             })
//         }
//     }
// })

/* addRoutes的作用注入新的路由，而不是替换其他路由,需要先清空原来的路由*/
// router.selfaddRoutes = function(params) {
//     router.matcher = new Router().matcher
//     router.addRoutes(params)
// }
export default router
