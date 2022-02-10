/**
 * @author: wenyuan
 * @data: 2019/08/15
 * @repository: https://github.com/wenyuan
 * @description: set edge state
 */

import theme from '../../theme'
import vm from '@/main.js'

export default function(name, value, item) {
    const group = item.getContainer()
    const shape = group.get('children')[0] // 顺序根据 draw 时确定
    let themeStyle = theme.defaultStyle // todo...先使用默认主题，后期可能增加其它风格的主体
    // if (vm.$store.state.common.currentTheme === 'white-theme') {
    //     themeStyle = theme.whiteStyle
    // }
    if (name === 'active') {
        if (value) {
            shape.attr(themeStyle.edgeStyle.active)
        } else {
            shape.attr(themeStyle.edgeStyle.inactive)
        }
    } else if (name === 'selected') {
        if (value) {
            shape.attr(themeStyle.edgeStyle.selected)
        } else {
            shape.attr(themeStyle.edgeStyle.unselected)
        }
    }
}
