<template>
    <div class="toolbar">
        <div class="pull-right">
            <div class="graph-ops">
                <i class="iconfont icon-fangda1" id="zoom-in" title="放大" @click="$parent.$parent.zoomInHandler"></i>
                <i class="iconfont icon-suoxiao1" title="缩小" @click="$parent.$parent.zoomOutHandler"></i>
                <i class="iconfont icon-shiyinghuabu" title="适应画布" @click="$parent.$parent.autoZoomHandler"></i>
                <i class="iconfont icon-shijichicun" title="实际尺寸" @click="$parent.$parent.resetZoomHandler"></i>
                <i class="iconfont icon-xiazai1" id="download" title="下载图片" @click="$parent.$parent.downloadFullImage"></i>
                <span class="separator"></span>
                <el-checkbox
                    v-model="checkData"
                    @change="enableMinimapHandler"
                    style="margin-left: 8px; vertical-align: middle;color: #fff;font-size: 12px">
                    导航器
                </el-checkbox>
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
  width: 100%;
  color: #333;
  text-align: left;
  vertical-align: middle;
  line-height: 42px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  z-index: 999;

  .graph-ops {
    display: inline-block;
    vertical-align: middle;
    margin: 0 16px;

    i {
      width: 16px;
      height: 16px;
      margin: 0 6px;
      line-height: 16px;
      color: #00ffff;
      text-align: center;
      border-radius: 2px;
      display: inline-block;
      border: 1px solid rgba(2, 2, 2, 0);
    }

    i:hover {
      cursor: pointer;
      border: 1px solid transparent;
    }

    .disabled {
      color: rgba(0, 0, 0, 0.25);
    }

    .disabled:hover {
      cursor: not-allowed;
      border: 1px solid rgba(2, 2, 2, 0);
    }

    .icon-select {
      background-color: #EEEEEE;
    }

    .separator {
      margin: 0 4px;
      border-left: 1px solid #00ffff;
    }
  }
}
</style>
<style lang="scss">
.graph-ops {
  .el-checkbox__input {
    vertical-align: baseline;

    .el-checkbox__inner {
      color: #EDEDED !important;
      background-color: transparent !important;
    }
  }

  .el-checkbox__label {
    vertical-align: text-bottom;
  }
}
</style>
