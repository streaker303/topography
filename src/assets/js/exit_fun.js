
import router from '../../router'
import {
	getTime,
	isClick,
	setsessionStorage,
	removesessionStorage,
	getQueryString,
	getsessionStorage,
	removelocalStorage,
	setlocalStorage,
	getlocalStorage,
	typeOf,
	hasClass,
	addClass,
	removeClass,
	uni,
	numChange,
	setCookie,
	getCookie,
	formatJSON,
	accMul,
} from './public_fun.js'
export default {
	version: '0.0.1',
	install: function(Vue) {
		Vue.prototype.$getTime = getTime;
		Vue.prototype.$isClick = isClick;
		Vue.prototype.$setsessionStorage = setsessionStorage;
		Vue.prototype.$removesessionStorage = removesessionStorage;
		Vue.prototype.$getQueryString = getQueryString;
		Vue.prototype.$getsessionStorage = getsessionStorage;
		Vue.prototype.$removelocalStorage = removelocalStorage;
		Vue.prototype.$setlocalStorage = setlocalStorage;
		Vue.prototype.$getlocalStorage = getlocalStorage;
		Vue.prototype.$typeOf = typeOf;
		Vue.prototype.$uni = uni;
		Vue.prototype.$accMul = accMul;

		Vue.prototype.$hasClass = hasClass;
		Vue.prototype.$addClass = addClass;
		Vue.prototype.$removeClass = removeClass;
		Vue.prototype.$numChange = numChange;
		Vue.prototype.$getCookie = getCookie;
		Vue.prototype.$setCookie = setCookie;
		Vue.prototype.$formatJSON = formatJSON;
		
		Vue.prototype.$deepCopy = (obj) => {
			let strObj = JSON.stringify(obj);
			return JSON.parse(strObj);
		};
		Vue.prototype.$NullStr = (str) => {
			if ((str + '' === '') || (str == null) || (str == undefined)) {
				return '--';
			} else {
				return str;
			}
		};
		Vue.prototype.$NullToStr = (obj) => {
			if (obj == null) {
				return '';
			} else {
				return obj;
			}
		};
        //获取当前用户有没有某个菜单权限
        /*
        @params id模块modular
        */
        Vue.prototype.$isModular = (modular) => {
            modular = modular;
            let menuIds = getsessionStorage('menuIds');
            if(menuIds!==''){
                return menuIds.includes(modular)
            }else{
                return false;
            }
		};
        Vue.prototype.$pushRouter = (path) => {
            window.open('http://' + window.location.host + '/#' + path)
            // router.push({
            //     path:path
            // })
		};
        Vue.prototype.$goRouter = (path) => {
            router.push({
                path:path
            })
		};

	},
}
