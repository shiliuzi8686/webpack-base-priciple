// var exports = {}
// //node文件读取后的代码字符串
// eval("exports.default = function(a,b) { return a + b }")
// exports.default(1,3)


// var exports = {}
// (function (exports, code) {
//     eval(code)
// })(exports, "exports.default = function(a,b) { return a + b }")


// function require(file){
//     var exports = {}
//     (function(exports, code) {
//         eval(code)
//     })(exports,"exports.default = function(a,b) { return a + b }")
//     return exports
// }

exports.default = function(a,b) { return a + b }