# 配置编辑器


## 列表注释文件

编辑器中的列表(如地图属性) 是由 _server/comments 下的注释文件渲染的, 通过修改注释文件, 可以自行增添对自定义属性的列表支持

一个典型的编辑项如下

```json
"nameMap": {
    "_leaf": true, // 是否是叶节点, 只有叶节点代表可编辑的内容
    "_name": "文件名映射", // 编辑项名称
    "_type": "table", // 编辑项的控件类型
    "_parse": "object", // 控件的定义参数
    "_items": ["string", "string"], // 上同
    "_data": "文件名映射，目前仅对images, animates, bgms, sounds有效。\n例如定义 {\"精灵石.mp3\":\"jinglingshi.mp3\"} 就可以使用\ncore.playBgm(\"精灵石.mp3\") 或对应的事件来播放该bgm。" // 注释
},
```
以下列出所有可能的类型及定义参数

  类型 |  说明  | 可配置项 | 备注 
 :---: | :---: | :---: | :---: 
 object  | 包含其他可修改项, 非叶节点 | - | _data内放置其包含的子项目
 const | 不可编辑的文本项 | - | -
 text  | 较短文本 | - | -
 number | 整数 | _min: 最小值 _max: 最大值 | -
 select | 选择 | _options: 选项 | -
 checkbox | 开关 | - | -
 color | 颜色 | _alpha: 是否可编辑透明度 | -
 resource | 资源 | _dir: 供选择的文件夹 | - 
 event | 事件 | _event: 事件入口 | - 
 table | 表格 | _parse: 数据类型, "object"或"array", _item: 每项的数据类型, 支持"string", "number", "boolean", 若为数组则写成数组形式, 例["string", "number"], "object"默认键的类型为string, 不必修改, _maxItem: 最大项数, _keys: 对于 "object" 类型, 规定键的来源, 填写该项后, 不可增删键 | -
