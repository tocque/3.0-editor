# 加载器

在file.ts中提供了两种抽象的文件模型

JSONFile和JSFile

在map.js中, 抽象了MapFile

在data.js中, 对items, enemys, blocks对应抽象JSONDataBase

在resource.js中, 设法对items, enemys, events抽象了spriteMaterials

同时对autotiles和tilesets抽象了autotileMaterials, tilesetsMaterials

对bgm和se抽象了 audioMaterial