"use strict";

function icons() {
    this._init();
}

icons.prototype._init = function () {
    this.icons = main.gameData.icons;
    //delete(main.gameData.icons);

    // tileset的起点
    this.tilesetStartOffset = 10000;
}

icons.prototype.getIcons = function () {
    return core.clone(this.icons);
}

////// 根据道具ID获得其cls //////
icons.prototype.getClsFromId = function (id) {
    for (var cls in core.material.icons) {
        if (cls != 'hero' && id in core.material.icons[cls])
            return cls;
    }
    return null;
}

icons.prototype._getAnimateFrames = function (cls, useOriginValue) {
    if (cls == 'enemys' || cls == 'npcs') {
        return 2;
    }
    if (cls == 'animates' || cls == 'enemy48') {
        return 4;
    }
    if (cls == 'npc48') {
        return useOriginValue ? 4 : 1;
    }
    return 1;
}

////// 根据图块数字或ID获得所在的tileset和坐标信息 //////
icons.prototype.getTilesetOffset = function (id) {

    if (typeof id == 'string') {
        // Tileset的ID必须是 X+数字 的形式
        if (!/^X\d+$/.test(id)) return null;
        id = parseInt(id.substring(1));
    }
    else if (typeof id != 'number') {
        return null;
    }

    core.tilesets = core.tilesets || [];
    var startOffset = this.tilesetStartOffset;
    for (var i in core.tilesets) {
        var imgName = core.tilesets[i];
        var img = core.material.images.tilesets[imgName];
        var width = Math.floor(img.width / 32), height = Math.floor(img.height / 32);
        if (id >= startOffset && id < startOffset + width * height) {
            var x = (id - startOffset) % width, y = parseInt((id - startOffset) / width);
            return {"image": imgName, "x": x, "y": y};
        }
        startOffset += this.tilesetStartOffset;
    }
    return null;
}

icons.prototype.initMetadata = function() {
    const metadatas = [];
    ['items', 'enemys', 'events'].forEach((e) => {
        for (let type in core.metadata[e]) {
            for (let i in core.metadata[e][type]) {
                core.icons[e] = Object.assign({}, core.icons[e], core.metadata[e][type][i]);
            }
        }
    })
    for (let i in core.metadata.tilesets) {
        core.icons.tilesets = Object.assign({}, core.tilesets, core.metadata.tilesets[i]);
    }
}