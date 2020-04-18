# project.js

工程管理器, 工程相关操作均在此处进行, 以保证数据正常统计

工程信息: {
    path: 工程文件夹路径, 工程的id
    name: 工程文件夹名称
    lastEditTime: 上次编辑时间
    lastBuildTime: 上次打包时间
}

状态:

history: 历史工程
now: 当前工程

open(path): Promise: 打开一个工程

build(path, onProgress): Promise: 打包一个工程

create(path): Promise 在某位置新建一个工程


