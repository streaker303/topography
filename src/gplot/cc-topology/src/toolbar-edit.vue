<template>
    <div class="toolbar">
        <div class="pull-right">
            <div class="ub ub-pj text-tip">
                <div class="text">操作</div>
                <el-checkbox
                    v-model="checkData"
                    @change="enableMinimapHandler"
                    style="margin-left: 8px; vertical-align: middle"
                >导航器</el-checkbox
                >
            </div>
            <div class="graph-ops ub">
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="撤销"
                    placement="bottom"
                >
                    <i
                        class="iconfont icon-chexiao2"
                        :class="$parent.disableUndo ? 'disabled' : ''"
                        @click="$parent.$parent.undoHandler"
                    ></i>
                </el-tooltip>
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="重做"
                    placement="bottom"
                >
                    <i
                        class="iconfont icon-zhongzuo"
                        :class="$parent.disableRedo ? 'disabled' : ''"
                        @click="$parent.$parent.redoHandler"
                    ></i>
                </el-tooltip>

                <span class="separator"></span>
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="复制"
                    placement="bottom"
                >
                    <i
                        class="iconfont icon-fuzhi1"
                        :class="$parent.disableCopy ? 'disabled' : ''"
                        @click="$parent.$parent.copyHandler"
                    ></i>
                </el-tooltip>
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="粘贴"
                    placement="bottom"
                >
                    <i
                        class="iconfont icon-niantie"
                        :class="$parent.disablePaste ? 'disabled' : ''"
                        @click="$parent.$parent.pasteHandler"
                    ></i>
                </el-tooltip>
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="删除"
                    placement="bottom"
                >
                    <i
                        class="iconfont icon-shanchu2"
                        :class="$parent.disableDelete ? 'disabled' : ''"
                        @click="$parent.$parent.deleteHandler"
                    ></i>
                </el-tooltip>
                <span class="separator"></span>
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="放大"
                    placement="bottom"
                >
                    <i
                        class="iconfont icon-fangda1"
                        id="zoom-in"
                        @click="$parent.$parent.zoomInHandler"
                    ></i>
                </el-tooltip>
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="缩小"
                    placement="bottom"
                >
                    <i
                        class="iconfont icon-suoxiao1"
                        @click="$parent.$parent.zoomOutHandler"
                    ></i>
                </el-tooltip>
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="适应画布"
                    placement="bottom"
                >
                    <i
                        class="iconfont icon-shiyinghuabu"
                        @click="$parent.$parent.autoZoomHandler"
                    ></i>
                </el-tooltip>
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="实际尺寸"
                    placement="bottom"
                >
                    <i
                        class="iconfont icon-shijichicun"
                        @click="$parent.$parent.resetZoomHandler"
                    ></i>
                </el-tooltip>
                <span class="separator"></span>
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="框选"
                    placement="bottom"
                >
                    <i
                        class="iconfont icon-kuangxuan"
                        id="multi-select"
                        @click="$parent.$parent.multiSelectHandler"
                    ></i>
                </el-tooltip>
                <span class="separator"></span>
                <el-dropdown
                    @command="$parent.$parent.changeEdgeShapeHandler"
                    trigger="click"
                >
                    <span class="el-dropdown-link">
                        {{ $parent.$parent.currentEdgeShape.label.substr(0, 1)
                        }}<i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item
                            v-for="edgeShape in $parent.$parent.edgeShapeList"
                            :command="edgeShape.guid"
                            :key="edgeShape.guid"
                        >
                            {{ edgeShape.label }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ToolbarEdit',
    data() {
        return {
            checkData: true
        }
    },
    methods: {
        enableMinimapHandler(val) {
            this.$emit('enableMinimapHandler', val)
            this.checkData = val
        }
    }
}
</script>

<style lang="scss" scoped>
.toolbar {
    position: absolute;
    width: 300px;
    color: #333;
    text-align: left;
    vertical-align: middle;
    box-sizing: border-box;
    padding: 10px;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    z-index: 999;
    right: 0;
    .pull-right {
        width: 100%;
        ::v-deep .el-checkbox__label,.text {
            color: #fff;
            font-size: 12px;
        }
    }

    .graph-ops {
        // display: inline-block;
        // vertical-align: middle;
        padding: 10px 0;

        i {
            //   width: 16px;
            //   height: 16px;
            margin-right:7px;
            line-height: 20px;
            color: #00ffff;
            text-align: left;
            //   border-radius: 2px;
            //   display: inline-block;
            //   border: 1px solid rgba(2, 2, 2, 0);
        }

        i:hover {
            cursor: pointer;
            //   border: 1px solid #E9E9E9;
        }

        .disabled {
            color: rgba(0, 0, 0, 0.25);
        }

        .disabled:hover {
            cursor: not-allowed;
            border: 1px solid rgba(2, 2, 2, 0);
        }

        .icon-select {
            background-color: #eeeeee;
        }

        .separator {
            // margin: 1px;
            border-left: 1px solid #00ffff;
            vertical-align: middle;
            margin-right: 7px;
        }
        .iconfont {
            color: #00ffff;
            font-size: 14px;
        }
        ::v-deep .el-dropdown {
            color: #00ffff;
            font-size: 12px;
        }
    }

    .el-button {
        margin: 0 5px;
    }
    ::v-deep .el-dropdown {
        font-size: 12px;
    }
    .text-tip {
        padding-left: 10px;
    }
    .text-tip:before {
        width: 4px;
        height: 20px;
        content: " ";
        position: absolute;
        left: 0px;
        top: 0;
        border-radius: 3px;
        background: #00e9ff;
    }
}
</style>
<style lang="scss">
.graph-ops {
    .el-checkbox__input {
        vertical-align: baseline;

        .el-checkbox__inner {
            color: #a8a8a8 !important;
            background-color: transparent !important;
        }
    }

    .el-checkbox__label {
        vertical-align: text-bottom;
    }
}
</style>
