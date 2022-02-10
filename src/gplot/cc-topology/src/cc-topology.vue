<template>
    <div class="topology" v-loading="loading">
        <!-- container -->
        <el-row :class="graphBg" style="height: 100%" @contextmenu.native.prevent>
            <!-- toolbar -->
            <div v-if="toolbarShow && ['add', 'edit'].includes($parent.$parent.mode)">
                <toolbar-edit @enableMinimapHandler="enableMinimapHandler"></toolbar-edit>
            </div>
            <div v-else-if="toolbarShow">
                <toolbar-preview @enableMinimapHandler="enableMinimapHandler" ref="toolbarPreview"></toolbar-preview>
            </div>
            <!-- graph-container -->
            <el-col
                class="graph-container"
                :span="graphMode === 'edit' && graphPanelShow === true ? 19 : 24"
                ref="graphContainer">
                <div id="mount-topology" @dragenter="dragenterHandler" @dragover="dragoverHandler" @drop="dropHandler"></div>
                <div class="right-menu" ref="rightMenu" v-show="rightMenuShow" @contextmenu.prevent>
                    <ul v-if="currentFocus === 'node' && selectedNodes.length > 1">
                        <li @click="alignHandler('horizontal')">水平对齐</li>
                        <li @click="alignHandler('vertical')">垂直对齐</li>
                        <li @click="createComboHandler">创建分组</li>
                    </ul>
                    <ul v-else-if="currentFocus === 'combo'">
                        <li @click="removeComboHandler">移除分组</li>
                    </ul>
                </div>
                <div
                    :class="graphPanelShow ? 'collapse-opened' : 'collapse-closed'"
                    v-if="graphMode === 'edit'"
                    @click="toggleCollapse">
                    <div class="collapse-bg"><span></span></div>
                    <div class="collapse">
                        <span class="el-icon-d-arrow-left"></span>
                        <span class="el-icon-d-arrow-right"></span>
                    </div>
                </div>
            </el-col>
            <!-- graph-pannel -->
            <div class="graph-pannel" v-if="graphMode === 'edit' && graphPanelShow === true" :span="4" :offset="1">
                <div v-if="currentFocus === 'node'">
                    <div class="pannel-title">节点</div>
                    <div class="pannel-body">
                        <div>
                            <span>资产名称</span>
                            <el-autocomplete
                                class="params-input"
                                style="width:100%"
                                v-model="selectedNodeParams.label"
                                size="mini"
                                :fetch-suggestions="querySearchAsync"
                                placeholder="请输入内容"
                                @select="handleSelect"
                            ></el-autocomplete>
                        </div>
                        <div>
                            <span>节点IP</span>
                            <el-input class="params-input" v-model="selectedNodeParams.appConfig.ip" size="mini"></el-input>
                        </div>
                        <div>
                            <span>节点端口</span>
                            <el-input class="params-input" v-model="selectedNodeParams.appConfig.port" size="mini"></el-input>
                        </div>
                    </div>
                </div>
                <div v-else-if="currentFocus === 'edge'">
                    <div class="pannel-title">连线</div>
                    <div class="pannel-body">
                        <span>连线标签</span>
                        <el-input class="params-input" v-model="selectedEdgeParams.label" size="mini"></el-input>
                        <!--<input class="params-input" type="text" autocomplete="off" v-model="selectedEdgeParams.label"/>-->
                        <div v-for="(value, key) in edgeAppConfig" :key="key">
                            <span>{{ value }}</span>
                            <el-input class="params-input" v-model="selectedEdgeParams.appConfig[key]" size="mini"></el-input>
                            <input class="params-input" type="text" autocomplete="off" v-model="selectedEdgeParams.appConfig[key]"/>
                        </div>
                    </div>
                </div>
                <div v-else-if="currentFocus === 'combo'">
                    <div class="pannel-title">分组</div>
                    <div class="pannel-body">
                        <span>分组标签</span>
                        <el-input class="params-input" v-model="selectedComboParams.label" size="mini"></el-input>
                        <span>标签位置</span>
                        <el-select class="params-select" v-model="selectedComboParams.labelPosition" placeholder="请选择" size="mini">
                            <el-option label="top" value="top"></el-option>
                            <el-option label="left" value="left"></el-option>
                            <el-option label="right" value="right"></el-option>
                            <el-option label="bottom" value="bottom"></el-option>
                            <el-option label="center" value="center"></el-option>
                        </el-select>
                        <span>水平偏移</span>
                        <el-input-number
                            class="params-input-number"
                            v-model="selectedComboParams.labelRefX"
                            :controls="false"
                            :min="-100"
                            :max="100"
                            label="标签水平方向偏移"
                            size="mini">
                        </el-input-number>
                        <span>垂直偏移</span>
                        <el-input-number
                            class="params-input-number"
                            v-model="selectedComboParams.labelRefY"
                            :controls="false"
                            :min="-100"
                            :max="100"
                            label="标签水平方向偏移"
                            size="mini">
                        </el-input-number>
                        <span>分组形状</span>
                        <el-select class="params-select" v-model="selectedComboParams.type" placeholder="请选择" size="mini">
                            <el-option label="circle" value="circle"></el-option>
                            <el-option label="rect" value="rect"></el-option>
                        </el-select>
                    </div>
                </div>
                <div v-else>
                    <div class="pannel-title">常用资产类型</div>
                    <div class="pannel-body">
                        <div class=" ub ub-ac ub-pj" style="flex-wrap: wrap;">
                            <div
                                class="node-type"
                                v-for="nodeType in nodeTypeList"
                                :key="nodeType.guid">
                                <img
                                    :src="nodeType.imgSrc"
                                    :alt="nodeType.label"
                                    :title="nodeType.desc"
                                    draggable="true"
                                    @dragstart="dragstartHandler($event, nodeType)"
                                    @dragend="dragendHandler">
                                <label class="label-text">{{ nodeType.label }}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </el-row>
    </div>
</template>

<script>
import _ from 'lodash'
import G6 from '@antv/g6'
import ToolbarPreview from './toolbar-preview'
import ToolbarEdit from './toolbar-edit'
import registerEdge from './edge'
import ccNode from './node'
import ccBehavior from './behavior'
import config from './config'
import theme from './theme'
import initGraph from './graph'
import utils from './utils'
import { switchToImg, getAssetsType } from '@/gplot/cc-topology/src/utils/asset-to-graph'
// import { getOneTypeAssets } from '@/server/assets/api'
registerEdge(G6)
ccNode.register(G6)
ccBehavior.register(G6)

export default {
    name: 'Topology',
    components: {
        'toolbar-preview': ToolbarPreview,
        'toolbar-edit': ToolbarEdit
    },
    props: {
        nodeTypeList: {
            type: Array,
            default: () => {
                return [
                    {
                        guid: 'gateway',
                        label: '网闸',
                        desc: '网闸',
                        imgSrc: switchToImg('gateway')
                    },
                    {
                        guid: 'bastion_host',
                        label: '堡垒机',
                        desc: '堡垒机',
                        imgSrc: switchToImg('bastion_host')
                    },
                    {
                        guid: 'firewall',
                        label: '防火墙',
                        desc: '防火墙',
                        imgSrc: switchToImg('firewall')
                    },
                    {
                        guid: 'rqfy',
                        label: '入侵防御',
                        desc: '入侵防御',
                        imgSrc: switchToImg('rqfy')
                    },
                    {
                        guid: 'rqjc',
                        label: '入侵检测',
                        desc: '入侵检测',
                        imgSrc: switchToImg('rqjc')
                    },
                    {
                        guid: 'fbdxt',
                        label: '防病毒系统',
                        desc: '防病毒系统',
                        imgSrc: switchToImg('fbdxt')
                    },
                    {
                        guid: 'sjksj',
                        label: '数据库审计',
                        desc: '数据库审计',
                        imgSrc: switchToImg('sjksj')
                    },
                    {
                        guid: 'vpnsb',
                        label: 'VPN设备',
                        desc: 'VPN设备',
                        imgSrc: switchToImg('vpnsb')
                    },
                    {
                        guid: 'web_gateway',
                        label: 'Web应用安全网关',
                        desc: 'Web应用安全网关',
                        imgSrc: switchToImg('web_gateway')
                    },
                    {
                        guid: 'router',
                        label: '路由器',
                        desc: '路由器',
                        imgSrc: switchToImg('router')
                    },
                    {
                        guid: 'switch',
                        label: '交换机',
                        desc: '交换机',
                        imgSrc: switchToImg('switch')
                    },
                    {
                        guid: 'wlan',
                        label: 'WLAN',
                        desc: 'WLAN',
                        imgSrc: switchToImg('wlan')
                    },
                    /* {
                        guid: 'hub',
                        label: 'Hub',
                        desc: 'Hub',
                        imgSrc: switchToImg('hub')
                    },*/
                    {
                        guid: 'computer',
                        label: '计算机',
                        desc: '计算机',
                        imgSrc: switchToImg('computer')
                    },
                    {
                        guid: 'notebook',
                        label: '笔记本',
                        desc: '笔记本',
                        imgSrc: switchToImg('notebook')
                    },
                    {
                        guid: 'cloud_services',
                        label: '云服务',
                        desc: '云服务',
                        imgSrc: switchToImg('cloud_services')
                    },
                    {
                        guid: 'others',
                        label: '其他',
                        desc: '其他',
                        imgSrc: switchToImg('others')
                    }
                ]
            }
        },
        nodeAppConfig: {
            type: Object,
            default: () => {
                return {}
            }
        },
        edgeAppConfig: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    data() {
        return {
            restaurants: [],
            state: '',
            timeout: null,
            assetsType: '',
            graphPanelShow: true,
            graphBg: 'default-style',
            toolbarShow: true,
            rightMenuShow: false,
            graphData: {
                nodes: [],
                edges: []
            },
            loading: false,
            clientWidth: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
            clientHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            edgeShapeList: [
                { guid: 'cc-line', label: '直线', class: 'iconfont icon-flow-line' },
                { guid: 'cc-brokenline', label: '折线', class: 'iconfont icon-flow-broken' },
                { guid: 'cc-polyline', label: '多段线', class: 'iconfont icon-flow-broken' },
                { guid: 'cc-cubic', label: '曲线', class: 'iconfont icon-flow-curve' },
                { guid: 'cc-dot', label: '动线', class: 'iconfont icon-flow-curve' }
            ],
            graph: null,
            minimap: null,
            graphMode: 'preview',
            currentEdgeShape: {
                guid: 'cc-line',
                label: '直线'
            },
            currentFocus: 'canvas',
            selectedNode: null,
            selectedNodeParams: {
                label: '',
                appConfig: this.nodeAppConfig
            },
            selectedNodeParamsTimeout: null,
            selectedEdge: null,
            selectedEdgeParams: {
                label: '',
                appConfig: this.edgeAppConfig
            },
            selectedEdgeParamsTimeout: null,
            selectedCombo: null,
            selectedComboParams: {
                label: '',
                labelPosition: '',
                labelRefX: 0,
                labelRefY: 0,
                type: ''
            },
            selectedComboParamsTimeout: null,
            zoomValue: 1,
            nodesInClipboard: [],
            historyIndex: 0,
            undoCount: 0,
            onresizeTimeout: null,
            pasteCount: 0
        }
    },
    computed: {
        disableUndo: function() {
            return this.historyIndex === 0 || this.historyIndex - (this.undoCount + 1) < 0
        },
        disableRedo: function() {
            return this.historyIndex === 0 || this.historyIndex === 10 || this.undoCount < 1
        },
        disableCopy: function() {
            return this.selectedNodes.length === 0
        },
        disablePaste: function() {
            return this.nodesInClipboard.length === 0
        },
        disableDelete: function() {
            return this.selectedNodes.length === 0 && this.selectedEdges.length === 0
        },
        selectedNodes: function() {
            let self = this
            let graph = self.graph
            if (graph && !graph.destroyed) {
                return graph.findAllByState('node', 'selected')
            } else {
                return []
            }
        },
        selectedEdges: function() {
            let graph = this.graph
            if (graph && !graph.destroyed) {
                return graph.findAllByState('edge', 'selected')
            } else {
                return []
            }
        }
    },
    created() {
    },
    mounted() {
        ccNode.obj.ccImage.sendThis(this)
        ccBehavior.obj.clickEventEdit.sendThis(this)
        ccBehavior.obj.dragAddEdge.sendThis(this)
        ccBehavior.obj.dragEventEdit.sendThis(this)
        ccBehavior.obj.keyupEventEdit.sendThis(this)
        this.clearHistoryData()
        // this.initTopo(this.graphData)
        // this.autoZoomHandler()
        window.onresize = () => {
            return (() => {
                this.onresizeHandler()
            })()
        }
    },
    beforeRouteUpdate(to, from, next) {
        this.clearHistoryData()
        next()
    },
    beforeRouteLeave(to, from, next) {
        this.clearHistoryData()
        next()
    },
    beforeDestroy() {
        this.clearHistoryData()
    },
    methods: {
        querySearchAsync(queryString, cb) {
            var restaurants = this.restaurants
            var results = queryString ? restaurants.filter(this.createStateFilter(queryString)) : restaurants

            clearTimeout(this.timeout)
            this.timeout = setTimeout(() => {
                cb(results)
            }, 10)
        },
        createStateFilter(queryString) {
            return (state) => {
                return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
            }
        },
        handleSelect(item) {
            this.selectedNodeParams.label = item.value || ''
            this.selectedNodeParams.appConfig.ip = item.device_ip || ''
            this.selectedNodeParams.appConfig.port = item.device_ports || ''
        },
        toggleCollapse() {
            this.graphPanelShow = !this.graphPanelShow
        },
        openFullScreenLoading() {
            this.loading = true
        },
        closeFullScreenLoading() {
            let self = this
            self.$nextTick(() => {
                self.loading = false
            })
        },
        dragstartHandler(event, nodeType) {
            console.log(nodeType, event)
            event.dataTransfer.setData('text', JSON.stringify(nodeType))
        },
        dragenterHandler(event) {
            event.preventDefault()
        },
        dragoverHandler(event) {
            event.preventDefault()
        },
        dropHandler(event) {
            let nodeTypeStr = event.dataTransfer.getData('text')
            console.log(nodeTypeStr)
            try {
                let nodeType = JSON.parse(nodeTypeStr)
                let clientX = event.clientX
                let clientY = event.clientY
                this.addNode(clientX, clientY, nodeType)
            } catch (e) {
                console.log('报错了', e)
            }
        },
        dragendHandler() {
        },
        initTopo(graphData) {
            let self = this
            if (self.graph) {
                self.graph.destroy()
            }
            // 图画布的定义
            let graphContainer = self.$refs.graphContainer.$el
            let graphWidth = graphContainer.clientWidth - 20
            let graphHeight = graphContainer.clientHeight - 20
            // Plugins
            let plugins = []
            let modes = {
                default: [
                    'drag-canvas',
                    'drag-node',
                    {
                        type: 'click-select',
                        trigger: 'ctrl',
                        multiple: true
                    }
                ],
                preview: [
                    'drag-canvas',
                    // 'zoom-canvas',
                    // "drag-node",
                    // 'click-select',
                    {
                        type: 'tooltip',
                        formatText(model) {
                            return model.description || model.label
                        }
                    },
                    {
                        type: 'edge-tooltip',
                        formatText(model) {
                            return model.description || 'source:' + self.graph.findById(model.source).getModel().label + ' target:' + self.graph.findById(model.target).getModel().label
                        }
                    }
                    // 自定义Behavior
                    // 'my-collapse-expand'
                ],
                edit: [
                    'drag-node',
                    'drag-canvas',
                    {
                        type: 'click-select',
                        trigger: 'ctrl',
                        multiple: true
                    },
                    {
                        type: 'brush-select',
                        trigger: 'control', // FIXME... G6 bug: ['ctrl', 'control'] only 'control' effetcs
                        includeEdges: false
                    },
                    'right-click-node',
                    'right-click-edge',
                    // Group Behavior
                    'drag-combo',
                    // 'collapse-expand-combo',
                    // 自定义Behavior
                    'hover-event-edit',
                    'click-event-edit',
                    'keyup-event',
                    'drag-event-edit',
                    'keyup-event-edit',
                    'drag-add-edge'
                ],
                addEdge: [
                    'drag-canvas',
                    // 自定义Behavior
                    'click-add-edge'
                ],
                multiSelect: [
                    {
                        type: 'brush-select',
                        trigger: 'drag',
                        onSelect() {
                            this.graph.setMode('edit')
                            window.document.getElementById('multi-select').style.backgroundColor = 'transparent'
                        }
                    }
                ]
            }
            /* 生成图 */
            self.graph = initGraph.commonGraph(G6, {
                plugins: plugins,
                container: 'mount-topology',
                width: graphWidth,
                height: graphHeight,
                modes: modes,
                graphData: graphData,
                graphMode: self.graphMode
            })
            self.graph.get('canvas').set('localRefresh', false)
            self.graph.$C = config
            self.graph.setMode(self.graphMode)
            self.graph.refresh()
            // self.graph.zoomTo(1)
            self.autoZoomHandler()
            this.enableMinimapHandler(true)
        },
        /* 自动布局 */
        forceLayoutHandler(type) {
            let graph = this.graph
            if (graph && !graph.destroyed) {
                this.openFullScreenLoading()
                graph.updateLayout({
                    type: 'force',
                    center: [200, 200],
                    preventOverlap: true,
                    linkDistance: 150,
                    nodeStrength: -200,
                    onLayoutEnd: () => {
                        this.closeFullScreenLoading()
                    }
                })
            }
        },
        changeEdgeShapeHandler(edgeShape) {
            this.currentEdgeShape = _.find(this.edgeShapeList, { guid: edgeShape })
            this.graph.$C.edge.type = this.currentEdgeShape.guid
        },
        undoHandler() {
            if (this.historyIndex > 0 && this.historyIndex - (this.undoCount + 1) >= 0) {
                this.undoCount += 1
                let key = `graph_history_${this.historyIndex - this.undoCount}`
                let historyData = this.getHistoryData(key)
                this.changeGraphData(JSON.parse(historyData))
                this.refreshGraph()
            }
        },
        redoHandler() {
            if (this.undoCount > 0) {
                let key = `graph_history_${this.historyIndex - this.undoCount + 1}`
                let historyData = this.getHistoryData(key)
                this.changeGraphData(JSON.parse(historyData))
                this.undoCount -= 1
                this.refreshGraph()
            }
        },
        copyHandler() {
            this.nodesInClipboard = this.selectedNodes
            this.pasteCount = 0
        },
        pasteHandler() {
            this.pasteCount += 1 // 连续paste次数统计
            let graph = this.graph
            let nodesInClipboard = this.nodesInClipboard
            if (graph && !graph.destroyed && nodesInClipboard.length > 0) {
                // ************** 记录【粘贴】前的数据状态 start **************
                let historyData = JSON.stringify(graph.save())
                let key = `graph_history_${this.historyIndex}`
                this.addHistoryData(key, historyData)
                // ************** 记录【粘贴】前的数据状态 end **************
                // 开始粘贴
                for (let i = 0; i < nodesInClipboard.length; i++) {
                    let node = nodesInClipboard[i]
                    let model = node.getModel()
                    let newModel = {
                        ...model,
                        id: utils.generateUUID(),
                        x: model.x + 10 * this.pasteCount,
                        y: model.y + 10 * this.pasteCount
                    }
                    graph.addItem('node', newModel)
                }
                // ************** 记录【粘贴】后的数据状态 start **************
                // 如果当前点过【撤销】了，【粘贴】后将取消【重做】功能
                // 重置undoCount，【粘贴】后的数据状态给(当前所在historyIndex + 1)，且清空这个时间点之后的记录
                if (this.undoCount > 0) {
                    this.historyIndex = this.historyIndex - this.undoCount // 此时的historyIndex应当更新为【撤销】后所在的索引位置
                    for (let i = 1; i <= this.undoCount; i++) {
                        let key = `graph_history_${this.historyIndex + i}`
                        this.removeHistoryData(key)
                    }
                    this.undoCount = 0
                }
                // 存储【粘贴】后的数据状态
                this.historyIndex += 1
                key = `graph_history_${this.historyIndex}`
                let currentData = JSON.stringify(graph.save())
                this.addHistoryData(key, currentData)
                // ************** 记录【粘贴】后的数据状态 end **************
            }
        },
        deleteHandler() {
            let graph = this.graph
            let selectedNodes = graph.findAllByState('node', 'selected')
            let selectedEdges = graph.findAllByState('edge', 'selected')
            if (this.selectedNodes.length > 0 || this.selectedEdges.length > 0) {
                // ************** 记录【删除】前的数据状态 start **************
                let historyData = JSON.stringify(graph.save())
                let key = `graph_history_${this.historyIndex}`
                this.addHistoryData(key, historyData)
                // ************** 记录【删除】前的数据状态 end **************
                // 开始删除
                for (let i = 0; i < selectedNodes.length; i++) {
                    graph.removeItem(selectedNodes[i])
                }
                for (let i = 0; i < selectedEdges.length; i++) {
                    graph.removeItem(selectedEdges[i])
                }
                // ************** 记录【删除】后的数据状态 start **************
                // 如果当前点过【撤销】了，拖拽节点后将取消【重做】功能
                // 重置undoCount，【删除】后的数据状态给(当前所在historyIndex + 1)，且清空这个时间点之后的记录
                if (this.undoCount > 0) {
                    this.historyIndex = this.historyIndex - this.undoCount // 此时的historyIndex应当更新为【撤销】后所在的索引位置
                    for (let i = 1; i <= this.undoCount; i++) {
                        let key = `graph_history_${this.historyIndex + i}`
                        this.removeHistoryData(key)
                    }
                    this.undoCount = 0
                }
                // 记录【删除】后的数据状态
                this.historyIndex += 1
                key = `graph_history_${this.historyIndex}`
                let currentData = JSON.stringify(graph.save())
                this.addHistoryData(key, currentData)
                // ************** 记录【删除】后的数据状态 end **************
            }
        },
        zoomInHandler() {
            let graph = this.graph
            if (graph && !graph.destroyed) {
                graph.zoom(1.2)
            }
        },
        zoomOutHandler() {
            let graph = this.graph
            if (graph && !graph.destroyed) {
                graph.zoom(0.8)
            }
        },
        autoZoomHandler() {
            let graph = this.graph
            if (graph && !graph.destroyed && graph.save().nodes.length > 0) {
                if (['add', 'edit'].includes(this.$parent.$parent.mode)) {
                    graph.fitView([10, 300, 10, 10])
                } else {
                    graph.fitView(10)
                }
            }
        },
        resetZoomHandler() {
            let graph = this.graph
            if (graph && !graph.destroyed) {
                graph.zoomTo(1)
            }
        },
        multiSelectHandler(event) {
            event.target.style.backgroundColor = '#EEEEEE'
            this.graph.setMode('multiSelect')
        },
        enableMinimapHandler(enableMinimap) {
            if (enableMinimap) {
                this.minimap = new G6.Minimap({
                    size: [200, 120],
                    type: 'default',
                    className: 'g6-minimap'
                })
                this.graph.addPlugin(this.minimap)
            } else {
                this.graph.removePlugin(this.minimap)
            }
        },
        // 右键菜单
        alignHandler(coordinate) {
            let graph = this.graph
            if (this.selectedNodes.length > 1 && this.selectedNode) {
                // ************** 记录【节点对齐】前的数据状态 start **************
                let historyData = JSON.stringify(graph.save())
                let key = `graph_history_${this.historyIndex}`
                this.addHistoryData(key, historyData)
                // ************** 记录【节点对齐】前的数据状态 end **************
                // 开始节点对齐
                let cfg = coordinate === 'horizontal' ? { y: this.selectedNode.getModel().y } : { x: this.selectedNode.getModel().x }
                for (let i = 0, len = this.selectedNodes.length; i < len; i++) {
                    this.selectedNodes[i].updatePosition(cfg)
                }
                graph.refresh()
                // ************** 记录【节点对齐】后的数据状态 start **************
                // 如果当前点过【撤销】了，节点对齐后将取消【重做】功能
                // 重置undoCount，【节点对齐】后的数据状态给(当前所在historyIndex + 1)，且清空这个时间点之后的记录
                if (this.undoCount > 0) {
                    this.historyIndex = this.historyIndex - this.undoCount // 此时的historyIndex应当更新为【撤销】后所在的索引位置
                    for (let i = 1; i <= this.undoCount; i++) {
                        let key = `graph_history_${this.historyIndex + i}`
                        this.removeHistoryData(key)
                    }
                    this.undoCount = 0
                }
                // 记录【节点对齐】后的数据状态
                this.historyIndex += 1
                key = `graph_history_${this.historyIndex}`
                let currentData = JSON.stringify(graph.save())
                this.addHistoryData(key, currentData)
                // ************** 记录【节点对齐】后的数据状态 end **************
            }
            this.rightMenuShow = false
        },
        createComboHandler() {
            let graph = this.graph
            if (graph && !graph.destroyed && this.selectedNodes.length > 1 && this.selectedNode) {
                // ************** 记录【添加分组】前的数据状态 start **************
                let historyData = JSON.stringify(graph.save())
                let key = `graph_history_${this.historyIndex}`
                this.addHistoryData(key, historyData)
                // ************** 记录【添加分组】前的数据状态 end **************
                let nodeIds = this.selectedNodes.map(item => {
                    return item._cfg.id
                })
                // 创建分组
                let combo = graph.createCombo({
                    id: utils.generateUUID()
                }, nodeIds)
                // ************** 记录【添加分组】后的数据状态 start **************
                if (combo) {
                    // 如果当前点过【撤销】了，【添加分组】后将取消【重做】功能
                    // 重置undoCount，【添加分组】后的数据状态给(当前所在historyIndex + 1)，且清空这个时间点之后的记录
                    if (this.undoCount > 0) {
                        this.historyIndex = this.historyIndex - this.undoCount // 此时的historyIndex应当更新为【撤销】后所在的索引位置
                        for (let i = 1; i <= this.undoCount; i++) {
                            let key = `graph_history_${this.historyIndex + i}`
                            this.removeHistoryData(key)
                        }
                        this.undoCount = 0
                    }
                    // 记录【添加分组】后的数据状态
                    this.historyIndex += 1
                    let key = `graph_history_${this.historyIndex}`
                    let currentData = JSON.stringify(graph.save())
                    this.addHistoryData(key, currentData)
                }
                // ************** 记录【添加分组】后的数据状态 end **************
                this.rightMenuShow = false
            }
        },
        removeComboHandler() {
            let graph = this.graph
            if (this.selectedCombo) {
                // ************** 记录【删除】前的数据状态 start **************
                let historyData = JSON.stringify(graph.save())
                let key = `graph_history_${this.historyIndex}`
                this.addHistoryData(key, historyData)
                // ************** 记录【删除】前的数据状态 end **************
                // 开始删除
                // FIXME... graph.uncombo() 后，combos 依旧存在 graph.save() 中。
                let { nodes: subNodes, combos: subCombos } = this.selectedCombo.getChildren()
                subNodes.forEach(subNode => {
                    let subNodeModel = subNode.getModel()
                    subNodeModel.comboId = undefined
                    subNode.update(subNodeModel)
                })
                subCombos.forEach(subCombo => {
                    let subComboModel = subCombo.getModel()
                    subComboModel.comboId = undefined
                    subCombo.update(subComboModel)
                })
                graph.uncombo(this.selectedCombo)
                // ************** 记录【删除】后的数据状态 start **************
                // 如果当前点过【撤销】了，删除分组后将取消【重做】功能
                // 重置undoCount，【删除】后的数据状态给(当前所在historyIndex + 1)，且清空这个时间点之后的记录
                if (this.undoCount > 0) {
                    this.historyIndex = this.historyIndex - this.undoCount // 此时的historyIndex应当更新为【撤销】后所在的索引位置
                    for (let i = 1; i <= this.undoCount; i++) {
                        let key = `graph_history_${this.historyIndex + i}`
                        this.removeHistoryData(key)
                    }
                    this.undoCount = 0
                }
                // 记录【删除】后的数据状态
                this.historyIndex += 1
                key = `graph_history_${this.historyIndex}`
                let currentData = JSON.stringify(graph.save())
                this.addHistoryData(key, currentData)
                // ************** 记录【删除】后的数据状态 end **************
                this.rightMenuShow = false
            }
        },
        addNode(clientX, clientY, nodeType) {
            console.log('nodeType', nodeType)
            let graph = this.graph
            if (graph && !graph.destroyed) {
                // ************** 记录【添加节点】前的数据状态 start **************
                let historyData = JSON.stringify(graph.save())
                let key = `graph_history_${this.historyIndex}`
                this.addHistoryData(key, historyData)
                // ************** 记录【添加节点】前的数据状态 end **************
                // 开始添加
                let droppoint = graph.getPointByClient(clientX, clientY)
                let node = graph.addItem('node', {
                    id: utils.generateUUID(),
                    x: droppoint.x,
                    y: droppoint.y,
                    label: nodeType.label,
                    labelCfg: {
                        position: 'top'
                    },
                    assetsType: getAssetsType(nodeType.guid),
                    graphType: nodeType.guid,
                    type: 'cc-image',
                    img: nodeType.imgSrc,
                    size: [80, 80],
                    width: 80,
                    height: 80,
                    anchorPoints: [
                        [0.5, 0], // top
                        [1, 0.5], // right
                        [0.5, 1], // bottom
                        [0, 0.5] // left
                    ],
                    // 自定义属性
                    appState: {
                        alert: false
                    }
                })
                // ************** 记录【添加节点】后的数据状态 start **************
                if (node) {
                    // 如果当前点过【撤销】了，【添加节点】后将取消【重做】功能
                    // 重置undoCount，【添加节点】后的数据状态给(当前所在historyIndex + 1)，且清空这个时间点之后的记录
                    if (this.undoCount > 0) {
                        this.historyIndex = this.historyIndex - this.undoCount // 此时的historyIndex应当更新为【撤销】后所在的索引位置
                        for (let i = 1; i <= this.undoCount; i++) {
                            let key = `graph_history_${this.historyIndex + i}`
                            this.removeHistoryData(key)
                        }
                        this.undoCount = 0
                    }
                    // 记录【添加节点】后的数据状态
                    this.historyIndex += 1
                    let key = `graph_history_${this.historyIndex}`
                    let currentData = JSON.stringify(graph.save())
                    this.addHistoryData(key, currentData)
                }
                // ************** 记录【添加节点】后的数据状态 end **************
            }
        },
        unselectAllNodes() {
        },
        addHistoryData(key, value) {
            try {
                sessionStorage.setItem(key, value)
            } catch (oException) {
                if (oException.name === 'QuotaExceededError') {
                    console.warn('已经超出本地存储限定大小，清空历史记录！')
                    // 可进行超出限定大小之后的操作，如下面可以先清除记录，再次保存
                    // sessionStorage.clear()
                    this.clearHistoryData()
                    this.historyIndex = 0
                    this.undoCount = 0
                    sessionStorage.setItem(key, value)
                }
            }
        },
        getHistoryData(key) {
            return sessionStorage.getItem(key)
        },
        removeHistoryData(key) {
            sessionStorage.removeItem(key)
        },
        clearHistoryData() {
            let keys = Object.keys(sessionStorage)
            keys.forEach(key => {
                if (key.startsWith('graph_history')) {
                    sessionStorage.removeItem(key)
                }
            })
        },
        onresizeHandler() {
            // 实时监听窗口大小变化
            let self = this
            clearTimeout(this.onresizeTimeout)
            this.onresizeTimeout = setTimeout(() => {
                setTimeout(() => {
                    let graph = self.graph
                    if (graph && !graph.destroyed) {
                        let graphContainer = self.$refs.graphContainer.$el
                        let graphWidth = graphContainer.clientWidth - 20
                        let graphHeight = graphContainer.clientHeight - 20
                        graph.changeSize(graphWidth, graphHeight)
                    }
                }, 0)
            }, 1000)
        },
        /* 暴露给外部的接口 */
        refreshGraph() {
            let graph = this.graph
            if (graph && !graph.destroyed) {
                graph.refresh()
            }
        },
        getGraphData() {
            let graph = this.graph
            if (graph && !graph.destroyed) {
                // FIXME... graph.uncombo() 后，combos 依旧存在 graph.save() 中。
                let { nodes, edges, groups, combos } = graph.save()
                let nodeComboIds = []
                nodes.forEach(node => {
                    let nodeComboId = node.comboId
                    if (typeof nodeComboId !== 'undefined' && nodeComboIds.indexOf(nodeComboId) < 0) {
                        nodeComboIds.push(nodeComboId)
                    }
                })
                graph.findAll('combo', combo => {
                    let comboId = combo.get('model').id
                    if (nodeComboIds.indexOf(comboId) < 0) {
                        console.log('G6 bug')
                        _.remove(combos, combo => {
                            return combo.id === comboId
                        })
                    }
                })
                return { nodes: nodes, edges: edges, groups: groups, combos: combos }
            } else {
                return { nodes: [], edges: [], groups: [], combos: [] }
            }
        },
        changeGraphData(data) {
            let graph = this.graph
            if (graph && !graph.destroyed) {
                graph.changeData(data)
            }
        },
        changeGraphSize(graphWidth = 0, graphHeight = 0) {
            let graph = this.graph
            if (graph && !graph.destroyed) {
                let graphContainer = this.$refs.graphContainer.$el
                graphWidth = graphWidth || graphContainer.clientWidth - 20
                graphHeight = graphHeight || graphContainer.clientHeight - 20
                graph.changeSize(graphWidth, graphHeight)
            }
        },
        changeGraphMode(graphData, graphMode) {
            this.graphMode = graphMode
            this.initTopo(graphData)
        },
        changeGraphTheme(themeValue) {
            let graph = this.graph
            if (graph && !graph.destroyed) {
                let nodes = graph.getNodes()
                let edges = graph.getEdges()
                let combos = graph.getCombos()
                switch (themeValue) {
                    case 'darkStyle':
                        this.graphBg = 'dark-style'
                        graph.$T = theme.darkStyle
                        for (let i = 0, len = edges.length; i < len; i++) {
                            let edge = edges[i]
                            let edgeModel = edge.getModel()
                            let a = edgeModel.style.stroke
                            edgeModel.style = graph.$T.edgeStyle.default
                            edgeModel.style.stroke = a
                            edge.update(edgeModel)
                        }
                        for (let i = 0, len = nodes.length; i < len; i++) {
                            let node = nodes[i]
                            let nodeModel = node.getModel()
                            nodeModel.labelCfg = graph.$T.nodeLabelCfg
                            node.update(nodeModel)
                        }
                        graph.paint()
                        break
                    case 'officeStyle':
                        this.graphBg = 'office-style'
                        graph.$T = theme.officeStyle
                        for (let i = 0, len = edges.length; i < len; i++) {
                            let edge = edges[i]
                            let edgeModel = edge.getModel()
                            edgeModel.style = graph.$T.edgeStyle.default
                            edge.update(edgeModel)
                        }
                        for (let i = 0, len = nodes.length; i < len; i++) {
                            let node = nodes[i]
                            let nodeModel = node.getModel()
                            nodeModel.labelCfg = graph.$T.nodeLabelCfg
                            node.update(nodeModel)
                        }
                        graph.paint()
                        break
                    case 'whiteStyle':
                        this.graphBg = 'white-style'
                        graph.$T = theme.whiteStyle
                        for (let i = 0, len = edges.length; i < len; i++) {
                            let edge = edges[i]
                            let edgeModel = edge.getModel()
                            edgeModel.edgeModel = graph.$T.edgeStyle.edgeLabelCfg
                            edgeModel.style = graph.$T.edgeStyle.default
                            edgeModel.labelCfg = graph.$T.edgeLabelCfg
                            edge.update(edgeModel)
                        }
                        for (let i = 0, len = nodes.length; i < len; i++) {
                            let node = nodes[i]
                            let nodeModel = node.getModel()
                            nodeModel.labelCfg = graph.$T.nodeLabelCfg
                            node.update(nodeModel)
                        }
                        for (let i = 0, len = combos.length; i < len; i++) {
                            let combo = combos[i]
                            let comboModel = combo.getModel()
                            console.log(comboModel, '!!!!!!!!!!!')
                            comboModel.labelCfg = graph.$T.comboLabelCfg
                            comboModel.style = graph.$T.comboStyle.default
                            combo.update(comboModel)
                        }
                        graph.paint()
                        break
                    default:
                        this.graphBg = 'default-style'
                        graph.$T = theme.defaultStyle
                        for (let i = 0, len = edges.length; i < len; i++) {
                            let edge = edges[i]
                            let edgeModel = edge.getModel()
                            edgeModel.edgeModel = graph.$T.edgeStyle.edgeLabelCfg
                            edgeModel.style = graph.$T.edgeStyle.default
                            edgeModel.labelCfg = graph.$T.edgeLabelCfg
                            edge.update(edgeModel)
                        }
                        for (let i = 0, len = nodes.length; i < len; i++) {
                            let node = nodes[i]
                            let nodeModel = node.getModel()
                            nodeModel.labelCfg = graph.$T.nodeLabelCfg
                            node.update(nodeModel)
                        }
                        for (let i = 0, len = combos.length; i < len; i++) {
                            let combo = combos[i]
                            let comboModel = combo.getModel()
                            comboModel.labelCfg = graph.$T.comboLabelCfg
                            comboModel.style = graph.$T.comboStyle.default
                            combo.update(comboModel)
                        }
                        graph.paint()
                }
            }
        },
        downloadFullImage() {
            let graph = this.graph
            if (graph && !graph.destroyed) {
                let name = 'graph_' + _.now()
                graph.downloadFullImage(name, 'image/png', {
                    backgroundColor: 'transparent',
                    padding: [30, 15, 15, 15]
                })
            }
        },
        downloadImage() {
            let graph = this.graph
            if (graph && !graph.destroyed) {
                let name = 'graph_' + _.now()
                graph.downloadImage(name, 'image/png', 'transparent')
            }
        },
        getAssetsIp(row, status) {
            if (row.ips && row.ips.length > 0) {
                if (row.ips.some(item => item.ipType == 1)) {
                    let ipv4 = row.ips.filter(item => item.ipType == 1)[0]
                    if (status == 1) {
                        return ipv4.assetsIp
                    } else {
                        let ports = []
                        if (ipv4.ports && ipv4.ports.length) {
                            ports = ipv4.ports.map(e => {
                                return e.port
                            })
                        }
                        return ports.join(',')
                    }
                } else {
                    return ''
                }
            } else {
                return ''
            }
        }
        /* getOneTypeAssets(type) {
            this.restaurants = []
            let data = {
                queryData: {},
                paramsData: {
                    deviceTypeId: type
                }
            }
            getOneTypeAssets(data).then(res => {
                console.log('res', res)
                if (res.length > 0) {
                    res.forEach(item => {
                        let obj = {}
                        obj.value = item.device_name
                        obj.id = item.id
                        obj.device_type_name = item.device_type_name
                        obj.device_type_id = item.device_type_id
                        obj.device_ip = this.getAssetsIp(item, 1)
                        obj.device_ports = this.getAssetsIp(item, 2)
                        this.restaurants.push(obj)
                    })
                }
            }).catch(error => {
                console.log(error)
            })
        } */
    },
    watch: {
        layoutType() {
            this.initTopo(this.graphData)
        },
        graphPanelShow() {
            this.onresizeHandler()
        },
        selectedNodeParams: {
            deep: true,
            handler: function(newVal, oldVal) {
                let selectedNodeModel = this.selectedNode.getModel()
                if (this.assetsType === '' || this.assetsType !== selectedNodeModel.assetsType) {
                    // this.getOneTypeAssets(selectedNodeModel.assetsType)
                    this.assetsType = selectedNodeModel.assetsType
                }

                if (utils.isObjectValueEqual(selectedNodeModel.appConfig, newVal.appConfig) && selectedNodeModel.label === newVal.label) {
                    return
                }
                // 实时监听input值的变化，停止输入500ms后执行update，而不是时时update
                clearTimeout(this.selectedNodeParamsTimeout)
                this.selectedNodeParamsTimeout = setTimeout(() => {
                    selectedNodeModel.label = newVal.label
                    selectedNodeModel.appConfig = newVal.appConfig
                    this.selectedNode.update(selectedNodeModel)
                }, 500)
            }
        },
        selectedEdgeParams: {
            deep: true,
            handler: function(newVal, oldVal) {
                let selectedEdgeModel = this.selectedEdge.getModel()
                if (utils.isObjectValueEqual(selectedEdgeModel.appConfig, newVal.appConfig) && selectedEdgeModel.label === newVal.label) {
                    return
                }
                // 实时监听input值的变化，停止输入500ms后执行update，而不是时时update
                clearTimeout(this.selectedEdgeParamsTimeout)
                this.selectedEdgeParamsTimeout = setTimeout(() => {
                    let selectedEdgeModel = this.selectedEdge.getModel()
                    selectedEdgeModel.label = newVal.label
                    selectedEdgeModel.appConfig = newVal.appConfig
                    this.selectedEdge.update(selectedEdgeModel)
                }, 500)
            }
        },
        selectedComboParams: {
            deep: true,
            handler: function(newVal, oldVal) {
                let selectedComboModel = this.selectedCombo.getModel()
                if (selectedComboModel.label === newVal.label &&
          selectedComboModel.labelCfg.position === newVal.labelPosition &&
          selectedComboModel.labelCfg.refX === newVal.labelRefX &&
          selectedComboModel.labelCfg.refY === newVal.labelRefY &&
          selectedComboModel.type === newVal.type) {
                    return
                }
                // 实时监听input值的变化，停止输入500ms后执行update，而不是时时update
                clearTimeout(this.selectedComboParamsTimeout)
                this.selectedComboParamsTimeout = setTimeout(() => {
                    let selectedComboModel = this.selectedCombo.getModel()
                    selectedComboModel.label = newVal.label
                    selectedComboModel.labelCfg.position = newVal.labelPosition ? newVal.labelPosition : 'top'
                    selectedComboModel.labelCfg.refX = newVal.labelRefX ? newVal.labelRefX : 0
                    selectedComboModel.labelCfg.refY = newVal.labelRefY ? newVal.labelRefY : 0
                    selectedComboModel.type = newVal.type ? newVal.type : 'circle'
                    this.selectedCombo.update(selectedComboModel)
                }, 500)
            }
        }
    }
}
</script>
<style lang="scss" scoped>
@import '../../assets/iconfont/iconfont.css';

*[draggable = true] {
  -khtml-user-drag: element;
}

.topology {
//   height: calc(100vh - 110px);
  box-sizing: border-box;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 1px solid  #1cd7fa;
}

.graph-container {
  position: relative;
  height: 100%;
  overflow: hidden;

  .collapse-opened {
    position: absolute;
    top: 40%;
    right: -16px;
    width: 16px;
    height: 50px;

    .collapse-bg {
      height: 50px;
      border-top: 10px solid transparent;
      border-bottom: 9px solid transparent;
      border-left: 13px solid #dae8ee;

      span {
        position: absolute;
        top: 0;
        left: 1px;
        display: block;
        width: 0;
        height: 50px;
        border-top: 10px solid transparent;
        border-bottom: 9px solid transparent;
        border-left: 11px solid #f7fafb;
      }
    }

    .collapse {
      position: relative;
      top: -50px;
      left: -2px;
      height: 50px;
      text-align: center;
      cursor: pointer;

      span {
        display: inline;
        color: #9bb3bb;
        font-size: 14px;
        line-height: 50px;
      }

      .el-icon-d-arrow-right {
        display: inline;
      }

      .el-icon-d-arrow-left {
        display: none;
      }
    }
  }

  .collapse-closed {
    position: absolute;
    top: 40%;
    right: 0;
    width: 16px;
    height: 50px;

    .collapse-bg {
      height: 50px;
      border-top: 11px solid transparent;
      border-right: 13px solid #dae8ee;
      border-bottom: 11px solid transparent;

      span {
        position: absolute;
        display: block;
        top: 0;
        right: 0;
        width: 0;
        height: 50px;
        border-top: 11px solid transparent;
        border-right: 12px solid #f7fafb;
        border-bottom: 11px solid transparent;
        border-left: none;
      }
    }

    .collapse {
      position: relative;
      top: -50px;
      right: 0;
      height: 50px;
      text-align: center;
      cursor: pointer;

      span {
        display: inline;
        color: #9bb3bb;
        font-size: 14px;
        line-height: 50px;
      }

      .el-icon-d-arrow-right {
        display: none;
      }

      .el-icon-d-arrow-left {
        display: inline;
      }
    }
  }
}

.graph-pannel {
  width: 300px;
  box-sizing: border-box;
  position: absolute;
  right: 0;
  padding-top: 80px;
  height: 100%;
  color: #fff;
  font-size: 12px;
  text-align: left;
  background-color: #081f30;
  border-left: 0.1px solid #00ffff;
  border-bottom: 0.1px solid #00ffff;
  z-index: 1;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  .node-type {
    display: inline-block;
    width: 80px;
    height: 100px;
    text-align: center;
    vertical-align: middle;
    border: 0.1px solid transparent;
    margin-bottom: 20px;

    img {
      height: 80px;
      width: 80px;
    }

    label {
      width: 60px;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .node-type:hover {
    cursor: move;
    border: 1px solid #ccc;
  }

  .pannel-title {
    position: relative;
    padding: 10px 10px 10px 20px;
    height: 20px;
    color: #fff;
    line-height: 20px;
    border-top: 0.1px solid #00ffff;
    // border-bottom: 0.1px solid #DCE3E8;
  }
    .pannel-title:before {
        width: 4px;
        height: 20px;
        content: " ";
        position: absolute;
        left: 10px;
        top: 10px;
        border-radius: 3px;
        background: #00e9ff;
    }

  .pannel-body {
    padding: 10px 10px;
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(100vh - 390px);

    span {
      display: block;
    }
    label.label-text {
        display: inline-block;
        width:67px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
    }

    .params-input, .params-select, .params-input-number {
      margin: 5px 0 10px 0;
    }

    .params-input-number {
      width: 60px;
    }

    .el-input__inner {
      padding: 0 8px !important;
    }
  }
    /*伪元素保证最后一行左对齐*/
    .pannel-body >div::after {
        content: '';
        width: 67px;
        margin: 6px;
    }
}

.right-menu {
  position: fixed;
  padding: 10px 5px;
  list-style: none;
  background-color: rgb(4, 33, 54);
  opacity: 1;
  border: 1px solid #1a5c92;
  border-radius: 10px;

  li {
    padding: 5px;
    list-style-type: none;
    cursor: pointer;
  }

  li:hover {
    color: #409EFF;
  }
}

// 背景主题
.default-style {
  background: #0b1520;
}

.white-style {
    background: #f0efef;
}

.dark-style {
  background: #0b1520;
}

.office-style {
  background-image: linear-gradient(to right, #fef6de 0%, #f3ebd3 100%);
}
</style>

<style lang="scss">
.g6-tooltip {
  padding: 10px 6px;
  color: #444;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e2e2;
  border-radius: 4px;
}

// 预览模式自动生成的节点
.graph-container {
  #mount-topology .g6-minimap {
    position: absolute;
    right: 10px;
    bottom: 60px;
    border: 1px solid #1cd7fa;
    background: #080e15;
  }
}
</style>
