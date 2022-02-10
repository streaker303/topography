<template>
    <div class="event event-wrapper add_template graph">
        <div class="event-content w100">
            <div class="ub w100 relative">
                <div class="list-tips">{{ getTitle() }}</div>
                <div class="btn-wrap" style="margin-left: auto">
                    <el-button
                        size="small"
                        v-if="mode !== 'preview'"
                        @click="handleLayoutClick"
                        style="margin-right: 8px"
                    >自动布局</el-button>
                    <el-button
                        size="small"
                        v-if="mode === 'add' || mode === 'edit'"
                        @click="saveTopo()"
                        style="margin-right: 8px"
                    >完成提交</el-button>
                    <el-button
                        size="small"
                        v-if="mode !== 'preview'"
                        @click="changeToPreview"
                    >查看</el-button>
                    <el-button
                        size="small"
                        v-if="mode === 'preview'"
                        @click="changeToEdit"
                    >编辑</el-button>
                </div>
            </div>
            <div
                class="w100 form-wrapper"
                style="color: #fff; padding-top: 30px"
            >
                <el-form
                    ref="formData"
                    :model="formData"
                    :rules="formDataRules"
                    label-width="100px"
                >
                    <div class="topo">
                        <cc-topology
                            ref="topology"
                            :graph-data="graphData"
                            :node-app-config="nodeAppConfig"
                        >
                        </cc-topology>
                    </div>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'
// import moment from 'moment'
import { CCTopology } from '@/gplot'
import { getRandomArrayElements } from '@/utils/topo'
import { mapGraph, assetObj } from '@/gplot/cc-topology/src/utils/asset-to-graph'
// import { saveGraph, getTopoInfo } from '@/server/assets/topo'

export default {
    name: 'Graph',
    components: {
        'cc-topology': CCTopology
    },
    data() {
        return {
            backDialog: false,
            activeStep: 1,
            formData: {
                name: ''
            },
            formDataRules: {
                name: [
                    {
                        required: true,
                        message: '请输入拓扑图名称',
                        trigger: 'blur'
                    }
                ]
            },
            // topoName: '',
            topoId: '',
            assetData: [
                {
                    device_type_id: '12313',
                    device_type_name: 'fhq',
                    device_name: '我是防火墙',
                    device_ip: '1.1.1.1',
                    device_ports: '8080'
                }
            ],
            graphData: {
                nodes: [],
                edges: [],
                // groups:[],
                combos: []
            },
            nodeTypeList: [
                {
                    guid: 'server',
                    label: '服务器',
                    imgSrc: require('@/gplot/assets/images/server.png')
                },
                {
                    guid: 'database',
                    label: '数据库',
                    imgSrc: require('@/gplot/assets/images/database.png')
                },
                {
                    guid: 'firewall',
                    label: '防火墙',
                    imgSrc: require('@/gplot/assets/images/firewall.png')
                },
                {
                    guid: 'client',
                    label: '客户端',
                    imgSrc: require('@/gplot/assets/images/client.png')
                }
            ],
            // 节点配置
            nodeAppConfig: {
                ip: '节点IP',
                port: '节点端口'
            },
            autoRefresh: {
                enable: false,
                interval: 5
            },
            autoRefreshTimer: null,
            dataUpdateTime: '暂无关联数据',
            graphMode: 'add',
            mode: 'add'
        }
    },
    mounted() {
        this.$nextTick(async() => {
            if (this.mode === 'add') {
                this.handleEditClick()
            }
            this.$refs.topology.changeGraphTheme('default-style')
            // if (this.$store.state.common.currentTheme === 'white-theme') {
            //     this.$refs.topology.changeGraphTheme('whiteStyle')
            // } else {
            //     this.$refs.topology.changeGraphTheme('default-style')
            // }
            // console.log('拓扑图主题' + this.$store.state.common.currentTheme)
        })
    },

    methods: {
        goBack() {
            this.backDialog = true
        },
        getTitle() {
            if (this.mode === 'add') {
                return '添加拓扑图'
            } else if (this.mode === 'edit') {
                return '编辑拓扑图'
            } else if (this.mode === 'preview') {
                return '查看拓扑图'
            }
        },
        changeToPreview() {
            this.mode = 'preview'
            let graphData = _.cloneDeep(this.$refs.topology.getGraphData())
            this.graphMode = 'preview'
            console.log(graphData)
            this.$refs.topology.changeGraphMode(graphData, 'preview')
            // if (this.$store.state.common.currentTheme === 'white-theme') {
            //     this.$refs.topology.changeGraphTheme('whiteStyle')
            // }
            this.$refs.topology.resetZoomHandler()
        },
        changeToEdit() {
            this.mode = 'edit'
            let graphData = _.cloneDeep(this.$refs.topology.getGraphData())
            this.graphMode = 'edit'
            this.$refs.topology.changeGraphMode(graphData, 'edit')
            // if (this.$store.state.common.currentTheme === 'white-theme') {
            //     this.$refs.topology.changeGraphTheme('whiteStyle')
            // }
            this.$refs.topology.resetZoomHandler()
        },
        handleEditClick() {
            if (this.autoRefreshTimer) {
                clearInterval(this.autoRefreshTimer)
            }
            let graphData = _.cloneDeep(this.$refs.topology.getGraphData())
            this.$refs.topology.changeGraphMode(graphData, 'edit')
            if (this.mode === 'add' && this.$getsessionStorage('assetTopoData')?.assets?.length) {
                this.$refs.topology.resetZoomHandler()
                this.$refs.topology.forceLayoutHandler()
            } else {
                this.$refs.topology.resetZoomHandler()
            }
        },
        initAssetGraphData(assets) {
            let data = assets.map((item) => {
                let path = mapGraph(item.device_type_id)
                console.log(item)
                return {
                    id: this.$uuid(),
                    x: 0,
                    y: 0,
                    label: item.device_name,
                    labelCfg: {
                        position: 'bottom'
                    },
                    assetsType: item.device_type_id,
                    graphType: assetObj[item.device_type_id] ? assetObj[item.device_type_id] : 'others',
                    type: 'cc-image',
                    img: path,
                    size: [80, 80],
                    width: 80,
                    height: 80,
                    anchorPoints: [
                        [0.5, 0], // top
                        [1, 0.5], // right
                        [0.5, 1], // bottom
                        [0, 0.5] // left
                    ],
                    appState: {
                        alert: false
                    },
                    appConfig: {
                        ip: item.device_ip,
                        port: item.device_ports
                    }
                }
            })
            this.graphData.nodes = this.$deepCopy(data)
            console.log(this.graphData)
        },
        handleRefreshClick() {
            // this.getRelatedData()
        },
        handleLayoutClick() {
            this.$refs.topology.forceLayoutHandler()
        },
        handlePreviewClick() {
            this.graphMode = 'preview'
            // 需要先去异步请求获取远程的 graphData
            let graphData = _.cloneDeep(this.graphData)
            this.$refs.topology.changeGraphMode(graphData, 'preview')
            this.$refs.topology.resetZoomHandler()
            // this.handleRefreshClick()
        },
        toggleAutoRefresh(command) {
            if (command && command !== 'close') {
                this.autoRefresh.interval = Number(command)
                clearInterval(this.autoRefreshTimer)
                this.autoRefreshTimer = setInterval(() => {
                    this.getRelatedData()
                }, this.autoRefresh.interval * 60 * 1000)
                this.$once('hook:beforeDestroy', () => {
                    clearInterval(this.autoRefreshTimer)
                })
            } else {
                this.autoRefresh.interval = command
                clearInterval(this.autoRefreshTimer)
            }
        },
        initGraphData() {
            // 异步请求获取远程的 graphData
            let graphData = _.cloneDeep(this.graphData)
            this.$refs.topology.initTopo(graphData)
            // this.handleRefreshClick()
        },
        handleGraphDataSave() {
            let { nodes, edges, groups, combos } = this.$refs.topology.getGraphData()
            console.log(JSON.stringify({ nodes, edges, groups, combos }))
            console.log({ nodes, edges, groups, combos })
        },
        /**
         * TODO：这个函数内有报错，未使用先注释掉
         */
        getRelatedData() {
            /* this.dataUpdateTime = moment().format('YYYY-MM-DD HH:mm:ss')*/
            let graphData = _.cloneDeep(this.$refs.topology.getGraphData())
            let { nodes, edges } = graphData
            // let randomIdx = Math.floor((Math.random() * nodes.length))
            let randomNodeIds = getRandomArrayElements(nodes, 1).map((x) => {
                return x.id
            })
            for (let i = 0, len = nodes.length; i < len; i++) {
                let node = nodes[i]
                if (randomNodeIds.indexOf(node.id) > -1) {
                    node.description = `<p class="tooltips-title text-center">${node.label}</p>
                <table class="tooltips-table">
                <tr>
                <td style="text-align:left;color:#303133">设备IP: 10.5.97.1</td>
                </tr>
                <tr>
                <td style="text-align:left;color:#303133">设备名称: chaincloud-01</td>
                </tr>
                <tr>
                <td style="text-align:left;color:#ff0000">CPU使用率: 99%</td>
                </tr>
                <tr>
                <td style="text-align:left;color:#ff0000">内存使用率: 72%</td>
                </tr>
                <tr>
                <td style="text-align:left;color:#303133">最近刷新时间: ${this.dataUpdateTime}</td>
                </tr>
                </table>`
                    node.appState.alert = false
                } else {
                    nodes[i].appState.alert = false
                    nodes[i].description =
                        '<p class="tooltips-title text-center">没有数据</p>'
                }
            }
            this.$refs.topology.changeGraphData(graphData)
        },
        saveTopo() {
            let { nodes, edges, groups, combos } = this.$refs.topology.getGraphData()
            console.log({ nodes, edges, groups, combos })
            let content = {
                nodes,
                edges,
                combos
            }
            let data = {
                queryData: {},
                paramsData: {
                    id: this.mode === 'add' ? '' : this.topoId,
                    name: this.formData.name,
                    content: JSON.stringify(content)
                }
            }
            /* saveGraph(data).then(res => {
                this.$message({
                    message: '保存成功',
                    type: 'success'
                })
                setTimeout(() => {
                    this.cancel()
                }, 1000)
            }).catch(error => {
                console.log('error' + error)
            }) */
        }
        /* async getTopoById() {
            let data = {
                queryData: {},
                paramsData: {
                    id: this.topoId
                }
            }
            await getTopoInfo(data).then(res => {
                console.log(res, '拓扑图信息')
                console.log(JSON.parse(res.content).combos, '拓扑图信息combos')
                if (res.content) {
                    this.graphData.nodes = JSON.parse(res.content).nodes ?? []
                    this.graphData.edges = JSON.parse(res.content).edges ?? []
                    this.graphData.combos = JSON.parse(res.content).combos ?? []
                    let combosColor = {
                        white: '#909090',
                        default: '#a3e2ff'
                    }
                    let flag = this.$store.state.common.currentTheme === 'white-theme'
                    if (this.graphData.combos.length > 0) {
                        this.graphData.combos = this.graphData.combos.map(item => {
                            return {
                                children: item.children,
                                depth: item.depth,
                                id: item.id,
                                label: item.label,
                                labelCfg: item.labelCfg,
                                style: {
                                    default: {
                                        stroke: flag ? combosColor.white : combosColor.default,
                                        fill: item.style.default.fill,
                                        lineWidth: item.style.default.lineWidth
                                    },
                                    fill: item.style.fill,
                                    height: item.style.height,
                                    hover: item.style.hover,
                                    lineWidth: item.style.lineWidth,
                                    r: item.style.r,
                                    selected: item.style.selected,
                                    stroke: flag ? combosColor.white : combosColor.default,
                                    width: item.style.width
                                },
                                type: item.type,
                                x: item.x,
                                y: item.y
                            }
                        })
                    }
                }
            }).catch(error => {
                console.log('error' + error)
            })
        } */
    },
    beforeDestroy() {
        if (this.$getsessionStorage('assetTopoData')) {
            this.$removesessionStorage('assetTopoData')
        }
    },
    watch: {
        /* graphMode(value) {
             if (value === 'preview') {
                // let themes = ['darkStyle', 'darkStyle', 'officeStyle']
                // let idx = Math.floor((Math.random() * themes.length))
                // let theme = themes[idx]
                // let theme = 'darkStyle'
                // this.$refs.topology.changeGraphTheme(theme)
            } else {
                let theme = 'defaultStyle'
                this.$refs.topology.changeGraphTheme(theme)
            }
        }*/
    }
}
</script>

<style lang="scss" scoped>
.event-content {
    background-color: #111d2b;
}
.relative {
    position: relative;
    .btn-wrap {
        position: absolute;
        right: 0;
    }
}

.add_template ::v-deep .is-disabled {
    .el-textarea__inner {
        background: transparent;
        border: 1px solid #1cd7fa;
        box-shadow: 0px 0px 7px #389bf7 inset;
        color: #ccc;
    }
}
.add_template ::v-deep .el-steps {
    .el-step {
        .el-step__head {
            .el-step__line {
                display: none;
                height: 0px;
            }
            .is-text {
                width: 186px;
                height: 30px;
                border-style: hidden;
                background-color: transparent !important;
            }
        }
        .step1,
        .step2,
        .step3 {
            width: 186px;
            color: #ffffff;
            text-indent: 24px;
            margin-left: 6px;
            line-height: 30px;
            font-style: normal;
            height: 30px;
            background-size: 100% 100%;
        }
    }
}
.add-tmap {
    span.selected-btn {
        color: #409eff !important;
        opacity: 0.5;
        cursor: pointer;
    }
    span.selected-btn.active {
        color: #409eff !important;
        opacity: 1;
    }
}
.topo-name {
    font-size: 16px;
    letter-spacing: 2px;
    color: #fff;
    margin-bottom: 36px;
}
::v-deep .el-input--small .el-input__inner {
    height: 30px;
    line-height: 30px;
}
::v-deep .custom-dialog {
    background-color: #052942;
    box-shadow: 0px 0px 40px 0px #000000, inset 0px 0px 18px 0px #00b4ff;
    border: solid 1px #50b0ff;
    .el-dialog__header {
        padding: 10px 0 0 0;
    }
    .content-one {
        text-align: center;
        font-size: 18px;
        letter-spacing: 2px;
        color: #00e9ff;
        margin-bottom: 20px;
    }
    .content-two {
        text-align: center;
        font-size: 14px;
        letter-spacing: 0;
       color: #ffffff;
    }
    .el-dialog__footer {
        text-align: center;
    }
}
.white-theme {
   .content-one {
       color: #000000;
   }
   .content-two {
       color: #696969;
   }
}
.topo {
    width: 100%;
    height: calc(100vh - 238px)
}
</style>
