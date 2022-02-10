/**
 * @author: wenyuan
 * @data: 2019/07/18
 * @repository: https://github.com/wenyuan
 * @description: register edges
 */

import ccLine from './cc-line'
import ccBrokenline from './cc-brokenline'
import ccPolyline from './cc-polyline'
import ccCubic from './cc-cubic'
import ccDot from './cc-dot'

const obj = {
    ccLine,
    ccBrokenline,
    ccPolyline,
    ccCubic,
    ccDot
}

export default function(G6) {
    Object.values(obj).map(item => {
        G6.registerEdge(item.name, item.options, item.extendName)
    })
}
