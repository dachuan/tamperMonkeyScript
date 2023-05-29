/*
 *```// @require      file:///Users/dcthe/DC/Study/icoding/tamperMonkeyScript/pra/local_js.js```
 * 本地包，被其它tm脚本调用使用
 * */
console.log('this is a local file');
function loadJS(){
    console.log('from local file');
}
