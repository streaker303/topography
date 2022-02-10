
/**
 * @author: wenyuan
 * @data: 2019/07/18
 * @repository: https://github.com/wenyuan
 * @description: 直线
 */

import base from './base'
const lineDash = [4, 2, 1, 2]
export default {
    name: 'cc-dot',
    extendName: 'line',
    options: {
        ...base,
        afterDraw(cfg, group) {
            // get the first shape in the group, it is the edge's path here=
            const shape = group.get('children')[0]
            let index = 0
            // Define the animation
            shape.animate(
                () => {
                    index++
                    if (index > 9) {
                        index = 0
                    }
                    const res = {
                        lineDash,
                        lineDashOffset: -index
                    }
                    // returns the modified configurations here, lineDash and lineDashOffset here
                    return res
                },
                {
                    repeat: true, // whether executes the animation repeatly
                    duration: 3000 // the duration for executing once
                }
            )
        }
    }
}
