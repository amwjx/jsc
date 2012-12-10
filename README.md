jsc
===

JavaScript Seajs Compiler.


##无模板，不前端

1. 按目录合并seajs模块，相对路径，一次合并到处运行，支持`seajs 1.0|1.1|1.2|1.3|1.3+`
1. 预编译html模板为`./tmpl.js`模块
1. 监听文件改变自动编译
1. 支持win7、linux
1. 对跨目录合并说No


##1分钟上手

1. 安装`node-v0.8+`，保证全局命令node可用
1. 保证bin下的命令全局可用，将`jsc/bin`添加到环境变量path中或其它方法(window、linux均可)
1. 打开命令行并进入到要合并的源代码目录
1. 输入`jsc`并 回车


##致谢

1. 感谢`viktor`提供windows下鼠标右键功能
1. 感谢`fly`修改jsc支持windows平台
1. 感谢`link`关注google论坛最新动态
1. 感谢`朋友网前端团队`陪jsc走过的这几年和未来几年
1. 感谢`woods`推进jsc产生按配置文件打包的高级使用方式
1. 感谢`johnnie、shine`在新photo项目中推进jsc转型为相对路径打包
1. 感谢相册团队推进去seajs root化
1. 感谢`yuni`推进jsc产生全新的打包方式，支持seajs各版本
1. 感谢`QQ空间QZFL团队`支持CMD规范

##谁在用

1. 腾讯朋友(http://www.pengyou.com)
1. QQ相册



##高级功能
1. src/目录下放一个_config.js文件实现更灵活的合并，格式参见jsc/demo._config.js
1. 重写合并后的模块：src/目录下放一个同名模块即可
1. src/支持子目录：*.js：参与模块id的计算，以.分隔；*.tmpl.html：分类存放作用

##骨灰级玩家
1. tmpl.js可运行于nodejs，用于前台模版瞬间转换角色为后台模板，直出页面(http://n.pengyou.com/index.php?mod=group)


## License
jsc is available under the terms of the [MIT License].


##The end.