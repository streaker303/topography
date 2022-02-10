/**
 * 给商品价格加补0
 * @param {*} value 
 */
const addZero=function(value){
    var value=Math.round(parseFloat(value)*100)/100;
    var xsd=value.toString().split(".");
    if(xsd.length==1){
        value=value.toString()+".00";
        return value;
    }
    if(xsd.length>1){
        if(xsd[1].length<2){
            value=value.toString()+"0";
        }
        return value;
    }
}
const NullStr=function(str){
	if((str+'' === '')||(str == null)||(str == undefined)){
		return '--';
	}else{
		return str;
	}
}
const numChange = function(value){
    console.log('value',value)
    value = parseInt(value);
    let num;
    if(value > 9999){//大于9999显示x.xx万
        num=(Math.floor(value/1000)/10);
    }else if( value <= 9999 && value>-9999){
        num=value
    }else if(value<=-9999){//小于-9999显示-x.xx万
        num = -(Math.floor(Math.abs(value)/1000)/10);
    }
    return num;
}


export default {
    addZero,
    NullStr,
    numChange
}
