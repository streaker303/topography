/**
 * @param {function} func 执行函数
 * @param {number} time 防抖节流时间
 * @param {boolean} isDebounce [1,3]为防抖组件,[2]为节流组件
 * @param {this} ctx this 的指向
*/
const debounce = (func, time, isDebounce, ctx) => {
    var timer, lastCall, rtn;
    // 防抖函数
    if (isDebounce == 1) {
        rtn = (...params) => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(ctx, params);
            }, time);
        };
    } else if(isDebounce == 2){ // 节流函数
        rtn = (...params) => {
            const now = new Date().getTime();
            if (now - lastCall < time && lastCall) return;
            lastCall = now;
            func.apply(ctx, params);
        };
    } else if(isDebounce == 3){ // 立即执行的防抖函数
        rtn = (...params) => {
            if (timer) clearTimeout(timer);
            let callNow = !timer;
            timer = setTimeout(() => {
                timer = null;
            }, time)
            if (callNow) func.apply(ctx, params)
        };
    }
    return rtn;
};
 
export default {
    name: 'Debounce',
    abstract: true,
    props: {
        time: {
            type: Number,
            default: 800,
        },
        events: {
            type: String,
            default: 'click',
        },
        isDebounce: {
            type: Number,
            default: 1,
        },
    },
    created() {
        this.eventKeys = this.events.split(',');   // 分隔事件
        this.originMap = {};  // 储存事件，用于重新render时与子事件的对比
        this.debouncedMap = {};   // 储存防抖节流事件
    },
    render() {
        const vnode = this.$slots.default[0];
        this.eventKeys.forEach(key => {
            const target = vnode.data.on[key];
            if (target === this.originMap[key] && this.debouncedMap[key]) {
                vnode.data.on[key] = this.debouncedMap[key];
            } else if (target) {
                this.originMap[key] = target;
                this.debouncedMap[key] = debounce(
                    target,
                    this.time,
                    this.isDebounce,
                    vnode
                );
                vnode.data.on[key] = this.debouncedMap[key];  // 重写子组件的事件
            }
        });
        return vnode;
    },
};