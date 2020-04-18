# map_panel/

地图面板

后端

    维护地图树

    class MapTree: 地图树

    init: 从work.h5meta里读出地图树

    decode/encodeMapStrcut: 地图树变换为存储模式

    get: 获取当前地图树

    appendTo(id, to): 将某个新地图添加为指定节点的子节点, 若不填则追加到根上

    remove(id) 移除某个节点

地图树: 

    功能: 复制地图, 粘贴地图, 新建地图

    新建地图 窗口