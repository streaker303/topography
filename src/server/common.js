
import request from '@/utils/server'

// 退出
export const exit = (data) => {
    return request({
        url: 'common/exit',
        method: 'post',
        params: data.queryData,
        data: data.paramsData
    })
}
