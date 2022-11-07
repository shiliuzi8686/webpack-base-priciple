// 文件操作模块
const fs = require("fs")
// 路径模块
const path = require("path")
// babel
const parser = require('@babel/parser')
const traverse = require("@babel/traverse").default
const babel = require("@babel/core")

function getModuleInfo(file) {
    //读取文件
    const body = fs.readFileSync(file,'utf-8')
    //转化AST语法树
        /**
         * 代码字符串 --》 对象(ast语法树) --》 对象遍历解析
         * 编译过程（parse -》transform -》render）
         */
    const ast = parser.parse(body, {
        sourceType: "module", //表示我们要解析的是ES模块
    })
    //依赖收集（找ast中的import项）
    const deps = {}
    traverse(ast, { //遍历所有的节点
        //visitor 回调
        ImportDeclaration({ node }){ //遇到import节点的时候回调
            // 相对路径转绝对路径（为啥相对需要转绝对）
            const dirname = path.dirname(file) //拿到入口文件的绝对路径 
            const abspath = "./" + path.join(dirname,node.source.value) //相对于入口文件的绝对路径
            deps[node.source.value] = abspath //不只一个import
        }
    })
    //ES6转成ES5
    const  { code } = babel.transformFromAst(ast, null, {
        presets: ["@babel/preset-env"] //需要使用预设
    })
    const moduleInfo = { file, deps, code}
    return moduleInfo
}
// const info = getModuleInfo("./src/index.js")
// console.log('_ting_info', info)

/**
 * 获取依赖
 * @param {*} temp
 * @param {*} param1
 */
 function getDeps(temp, { deps }){
    //递归分析依赖
    Object.keys(deps).forEach((key) => { //temp的所有子依赖的分析
        const child = getModuleInfo(deps[key])
        temp.push(child)
        getDeps(temp, child)
    })
}

/**
 * 模块解析
 * @param {*} file
 * @returns
 */
 function parseModules(file) {
    const entry = getModuleInfo(file)
    const temp = [entry] //所有模块的分析信息
    const depsGraph = {} //最后输出的依赖图
    getDeps(temp, entry) //用于获取依赖
    //temp构建依赖图 
    temp.forEach(moduleInfo => { 
        depsGraph[moduleInfo.file] = {
            deps: moduleInfo.deps,
            code: moduleInfo.code
        }
    })
    return depsGraph
}

function bundle(file) {
    const depsGraph = JSON.stringify(parseModules(file));
    return `(function (graph) {
        function require(file) {
            function absRequire(relPath) {
                return require(graph[file].deps[relPath])
            }
            var exports = {};
            (function (require,exports,code) {
                eval(code)
            })(absRequire,exports,graph[file].code)
            return exports
        }
        require('${file}')
    })(${depsGraph})`;
}
const content = bundle('./index.js')
!fs.existsSync("./dist") && fs.mkdirSync("./dist");
fs.writeFileSync("./dist/bundle.js", content);