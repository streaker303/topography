# topography

### 使用注意事项：
1. 使用版本"@antv/g6": "4.3.11"
- 写死版本，不同版本会出现分组或连线 bug
2. 初始化数据时，需要先
- 调用适应画布方法（防止图标自动放大）
- 调用自动布局（防止图标重叠）
3. 当label 标签为 top 时，会出现拖动重影bug
- 解决：需要在初始化图形时关闭局部渲染
```
// initTopo 函数中
   self.graph.get('canvas').set('localRefresh', false)
```
4. default-style.js文件
- 注意：fill 字段必须设置，缺失会造成 combo 点击功能失效
```
// 分组样式
comboStyle: {
  default: {
    fill: 'rgba(0,0,0,0)', // 填充颜色
      stroke: '#00ffff', // 设置字体颜色
        lineWidth: 2
  },
    hover: {
      lineWidth: 3,
        fill: 'rgba(0,0,0,0)'
    },
      selected: {
        fill: 'rgba(0,0,0,0)',
          stroke: '#00ffff'
      }
},
  // 分组标签样式
  comboLabelCfg: {
    position: 'top',
      style: {
        fontSize: 20,
          fill: '#fff'
      }
  }

```

5. 切换主题时，combo 框线变不过来
- 解决，目前是根据主题，在接口获取数据时map替换颜色
6. 节点设置 gif 或 svg 形式
```
new G6.Graph({
  renderer: "svg",
  ...
})
```
- 设置成 svg 后，新版本 g6 ，设置边的箭头，需要写成对象形式
```
edge.style.endArrow = {
  path: G6.Arrow.triangle(10, 20, 25),
  d: 25,
  fill: '#f00',
  stroke: '#0f0',
  opacity: 0.5,
  lineWidth: 3,
}
```
7. 告警和显示
- 可以用 id 将node 节点遍历出来更换一个svg或gif 图
- 将 `appState.alert` 设置成 true，就会出现告警涟漪图
- 设置 `description`  为 html，即可自定义告警框信息
8. require 导入图片后，获取到的是一个相对路径
```
const gatewayImg = require('@/gplot/assets/images/gateway.png') // 网闸

console.log(gatewayImg)  //  /static/img/gateway.f2da911.png
```
