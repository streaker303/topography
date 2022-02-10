import axios from 'axios'
import router from '../router/index'
import store from '@/store/index'
import { Notification } from 'element-ui'
import { getAjax } from '@/utils/http'
import { getlocalStorage, removelocalStorage, setlocalStorage } from '@/assets/js/public_fun.js'
// 创建axios实例
const service = axios.create({
    baseURL: '/api/',
    timeout: 60000
})
// request拦截器
service.interceptors.request.use(
    (config) => {
        // const userInfo = getlocalStorage('userInfo')
        // if (userInfo) {
        //     console.log('config', config)
        //     if (config.url !== '/api/user-manage/loginUser' && config.url !== '/api/user-manage/register') {
        //         config.headers.token = userInfo.token
        //         let lastLoginTime = getlocalStorage('lastLoginTime')
        //         console.log(new Date().getTime())
        //         let now = new Date().getTime()
        //         if (lastLoginTime) {
        //             if (now - lastLoginTime > 60 * 30 * 1000) {
        //                 removelocalStorage('userInfo')
        //                 store.commit('switchUserInfo', '')
        //                 store.commit('switchLoginShow', {
        //                     show: true,
        //                     type: 0
        //                 })
        //                 router.push('/')
        //             } else {
        //                 setlocalStorage('lastLoginTime', now)
        //             }
        //         }
        //     }
        // }
        if (config.method === 'post' && config.headers['Content-Type']) {
            // eslint-disable-next-line no-self-assign
            config.headers['Content-Type'] = config.headers['Content-Type']
        } else {
            config.headers['Content-Type'] = 'application/json'
        }

        return config
    },
    (error) => {
        // Do something with request error
        console.log(error) // for debug
        Promise.reject(error)
    }
)
// response 拦截器
service.interceptors.response.use(
    (response) => {
        console.log(response)
        const code = response.status
        if (code >= 200 && code < 300) {
            return getAjax(response.data)
        } else {
            Notification.error({
                title: response.data.message
            })
            return Promise.reject(response.data.message)
        }
    },
    (error) => {
        let code = 0
        try {
            code = error.response.data.code
        } catch (e) {
            if (error.toString().indexOf('Error: timeout') !== -1) {
                Notification.error({
                    title: '网络请求超时',
                    duration: 2500
                })
                return Promise.reject(error)
            }
            if (error.toString().indexOf('Error: Network Error') !== -1) {
                Notification.error({
                    title: '网络请求错误',
                    duration: 2500
                })
                return Promise.reject(error)
            }
        }
        if (code === 401) {
            router.push({ path: '/401' })
            // 需要创建401页面
            // router.push({ path: '/401' })
        } else if (code === 403) {
            // 需要创建403页面
            // router.push({ path: '/403' })
        } else if (code === 404) {
            // 需要创建404页面
            // router.push({ path: '/404' })
        } else {
            const errorMsg = error.response.data.message
            if (errorMsg === '不允许访问') {
                // 需要创建401页面
                // router.push({ path: '/401' })
            }
        }
        return Promise.reject(error)
    }
)

export default service
