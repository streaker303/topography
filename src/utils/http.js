
import router from '../router/index'
import { Message, MessageBox } from 'element-ui'
import { setsessionStorage, removelocalStorage } from '@/assets/js/public_fun.js'
import store from '@/store/index'

export const getAjax = (result) => {
    return new Promise((resolve, reject) => {
        if (typeof result.code !== 'undefined' && result.code === 1) {
            resolve(result.data)
        } else {
            if (result.code === 2) {
                // 请求成功但流程不对
                Message({
                    message: result.message,
                    showClose: true,
                    type: 'warning'
                })
            } else if (result.code === 9999) {
                MessageBox.confirm('系统报错，点击查看详情?', '提示', {
                    confirmButtonText: '查看',
                    cancelButtonText: '取消',
                    type: 'warning',
                    customClass: 'confirm-box'
                })
                    .then(() => {
                        setsessionStorage('errorInfo', result.message)
                        router.push('/error')
                    })
                    .catch(() => {})
            } else if (result.code === 9005) {
                if (document.getElementsByClassName('el-message').length === 0) {
                    Message({
                        message: '登录已失效，请重新登录！',
                        showClose: true,
                        type: 'warning'
                    })
                }
                console.log(22222222222)
                removelocalStorage('userInfo')
                store.commit('switchUserInfo', '')
                store.commit('switchLoginShow', {
                    show: true,
                    type: 0
                })
                router.push('/')
            } else {
                Message({
                    message: result.message,
                    showClose: true,
                    type: 'warning'
                })
            }
            reject(result.data)
        }
    })
}

