const path = require('path')
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const isProduction = process.env.NODE_ENV === 'production'
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i
const HappyPack = require('happypack')
const { HashedModuleIdsPlugin } = require('webpack')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
function resolve(dir) {
    return path.join(__dirname, dir)
}

let pluginsArr = [
    new SimpleProgressWebpackPlugin(),
    new HardSourceWebpackPlugin(),
    new CompressionWebpackPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        test: productionGzipExtensions,
        threshold: 10240,
        minRatio: 0.8
    })
]

module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
        ? './'
        : '/',
    transpileDependencies: [
        /[/\\]node_modules[/\\](.+?)?element-ui(.*)[/\\]src/,
        /[/\\]node_modules[/\\](.+?)?element-ui(.*)[/\\]package/,
        /[/\\]node_modules[/\\](.+?)?f-render(.*)/,
        /[/\\]node_modules[/\\](.+?)?quill-image-drop-module(.*)/,
        /[/\\]node_modules[/\\](.+?)?vue-ele-form(.*)/,
        /[/\\]node_modules[/\\](.+?)?vue-ele-form-bmap(.*)/,
        /[/\\]node_modules[/\\](.+?)?vue-baidu-map(.*)/,
        /[/\\]node_modules[/\\](.+?)?vue-ele-upload-image(.*)/,
        /[/\\]node_modules[/\\](.+?)?@jiaminghi(.*)/,
        /[/\\]node_modules[/\\](.+?)?vuex(.*)/,
        /[/\\]node_modules[/\\](.+?)?vue-router(.*)/,
        /[/\\]node_modules[/\\](.+?)?jspdf(.*)/,
        /[/\\]node_modules[/\\](.+?)?bpmn-js(.*)/,
        /[/\\]node_modules[/\\](.+?)?camunda-bpmn-moddle(.*)/,
        /[/\\]node_modules[/\\](.+?)?xcrud(.*)/,
        /[/\\]node_modules[/\\](.+?)?vue2-ace-editor(.*)/,
        /[/\\]node_modules[/\\](.+?)?vue-ueditor-wrap(.*)/,
        /[/\\]node_modules[/\\](.+?)?vue-json-viewer(.*)/,
        /[/\\]node_modules[/\\](.+?)?vuedraggable(.*)/,
        /[/\\]node_modules[/\\](.+?)?vue-property-decorator(.*)/,
        /[/\\]node_modules[/\\](.+?)?vant(.*)/,
        /[/\\]node_modules[/\\](.+?)?vue-codemirror(.*)/,
        /[/\\]node_modules[/\\](.+?)?vue-class-component(.*)/,
        /[/\\]node_modules[/\\](.+?)?vue-clipboard2(.*)/,
        /[/\\]node_modules[/\\](.+?)?html2canvas(.*)/,
        /[/\\]node_modules[/\\](.+?)?iview(.*)/,
        /[/\\]node_modules[/\\](.+?)?vns-ui(.*)/

    ],
    configureWebpack: config => {
        let plugins = []
        let module = {}
        if (isProduction) {
            plugins = [].concat(pluginsArr)

            // 开启分离js
            config.optimization = {
                runtimeChunk: 'single',
                /* splitChunks: {
                    chunks: 'all', // 表明选择哪些 chunk 进行优化。通用设置，可选值：all/async/initial。设置为 all 意味着 chunk 可以在异步和非异步 chunk 之间共享。
                    minSize: 1000 * 60, // 允许新拆出 chunk 的最小体积
                    maxAsyncRequests: 10, // 每个异步加载模块最多能被拆分的数量
                    maxInitialRequests: 10, // 每个入口和它的同步依赖最多能被拆分的数量
                    enforceSizeThreshold: 50000, // 强制执行拆分的体积阈值并忽略其他限制
                    cacheGroups: {
                        libs: { // 第三方库
                            name: 'chunk-libs',
                            test: /[\\/]node_modules[\\/]/, // 请注意'[\\/]'的用法，是具有跨平台兼容性的路径分隔符
                            priority: 10 // 优先级，执行顺序就是权重从高到低
                        // chunks: 'initial' // 只打包最初依赖的第三方
                        },
                        elementUI: { // 把 elementUI 单独分包
                            name: 'chunk-elementUI',
                            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
                            priority: 20 // 权重必须比 libs 大，不然会被打包进 libs 里
                        },
                        commons: {
                            name: 'chunk-commons',
                            minChunks: 2, // 拆分前，这个模块至少被不同 chunk 引用的次数
                            priority: 0,
                            reuseExistingChunk: true
                        },
                        svgIcon: {
                            name: 'chunk-svgIcon',
                            // 函数匹配示例，把 svg 单独拆出来
                            test(module) {
                                // `module.resource` 是文件的绝对路径
                                // 用`path.sep` 代替 / or \，以便跨平台兼容
                                // const path = require('path') // path 一般会在配置文件引入，此处只是说明 path 的来源，实际并不用加上
                                return (
                                    module.resource &&
                                    module.resource.endsWith('.svg') &&
                                    module.resource.includes(`${path.sep}icons${path.sep}`)
                                )
                            },
                            priority: 30
                        }
                    }
                },*/
                minimize: true,
                minimizer: [
                    new TerserPlugin({
                        terserOptions: {
                            ecma: undefined,
                            warnings: false,
                            parse: {},
                            compress: {
                                drop_console: true,
                                drop_debugger: false,
                                pure_funcs: ['console.log'] // 移除console
                            }
                        },
                        // 代码压缩插件
                        parallel: 4, // 开启并行压缩
                        cache: true
                    })
                ]
            }

            // 取消webpack警告的性能提示
            config.performance = {
                hints: 'warning',
                // 入口起点的最大体积
                maxEntrypointSize: 1000000 * 500,
                // 生成文件的最大体积
                maxAssetSize: 10000000 * 1000,
                // 只给出 js 文件的性能提示
                assetFilter: function(assetFilename) {
                    return assetFilename.endsWith('.js')
                }
            }
        }

        return isProduction ? { plugins, module } : { plugins }
    },

    css: {
        sourceMap: process.env.NODE_ENV !== 'production'
    },
    chainWebpack: config => {
        config.resolve.alias
            .set('@', resolve('src'))
            .set('@mixins', resolve('src/mixins'))
            .set('@store', resolve('src/store'))
        config.plugin('HappyPack').use(HappyPack, [
            {
                loaders: [
                    {
                        loader: 'babel-loader?cacheDirectory=true'
                    }
                ]
            }
        ])
        // webpack 会默认给commonChunk打进chunk-vendors，所以需要对webpack的配置进行delete
        config.optimization.delete('splitChunks')
        // config
        //     .plugin('webpack-bundle-analyzer')
        //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    },

    assetsDir: 'static',
    runtimeCompiler: true,
    productionSourceMap: false,
    outputDir: 'dist',
    devServer: {
        host: 'localhost',
        port: 3000,
        https: false,
        hotOnly: false,
        proxy: { // 设置代理
            '/api': {
                target: 'http://10.10.109.162:17999/', // 需要代理的地址
                changeOrigin: true,
                ws: true,
                secure: false,
                pathRewrite: {
                    '^/api': '' // 本身的接口地址没有 '/api' 这种通用前缀，所以要rewrite，如果本身有则去掉
                }
            },

            // 图片服务代理
            '/imgServer': {
                // target: 'http://192.168.91.218:8081/', //需要代理的地址
                target: 'http://10.10.109.203:7699/', // 需要代理的地址
                changeOrigin: true,
                pathRewrite: {
                    '^/imgServer': '' // 本身的接口地址没有 '/api' 这种通用前缀，所以要rewrite，如果本身有则去掉
                }
            }
        }
    }

}
