const graph = () => import('@/pages/topo/graph.vue')
const errorPage = () => import('@/pages/common/error.vue')
export default [
    {
        path: '/',
        redirect: '/graph'
    },
    {
        path: '/error',
        name: 'error',
        component: errorPage,
        meta: {
            title: '系统出错了'
        }
    },
    {
        path: '/graph',
        name: 'graph',
        component: graph,
        meta: {
            title: '登录'
        }
    }
]
