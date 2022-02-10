<template>
    <div class="error">
        <div class="ub ub-pc ub-ac" style="line-height: 100px;">系统出错了</div>
        <div style="width:60%;margin: 20px auto 0; border-radius:10px;">
            <el-collapse>
                <el-collapse-item>
                    <template slot="title">
                        <div class="ub ub-pc" style="width:100%;font-size:14px;color:#333333;">
                            展开查看详情
                        </div>
                    </template>
                    <div style="padding:20px;color:#333333; text-align: justify;font-size:13px;word-break: break-all; line-height: 24px;">
                        <pre>{{message}} </pre></div>
                </el-collapse-item>
            </el-collapse>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Error',
    data() {
        return {
            message: ''
        }
    },
    mounted() {
        let errorInfo = this.$getsessionStorage('errorInfo')
        this.message = errorInfo
    },
    methods: {

    }
}
</script>

<style lang="scss" scoped>
.error{
    width:100%;
    position: absolute;
    left:0;
    top:0;
    height:100%;
    overflow-y:auto;
}
</style>
