/** ------ select point ------ */
    
export const condition = {
    "changeFloor_m": ["Number_0", "Number_1", "IdString_0", true],
    "jumpHero_s": ["PosString_0", "PosString_1"],
    "changeFloor_s": ["PosString_0", "PosString_1", "IdString_0", true],
    "changePos_0_s": ["PosString_0", "PosString_1"],
    "battle_1_s": ["PosString_0", "PosString_1"],
    "openDoor_s": ["PosString_0", "PosString_1", "IdString_0"],
    "closeDoor_s": ["PosString_0", "PosString_1"],
    "show_s": ["EvalString_0", "EvalString_1", "IdString_0"],
    "hide_s": ["EvalString_0", "EvalString_1", "IdString_0"],
    "setBlock_s": ["EvalString_1", "EvalString_2", "IdString_0"],
    "move_s": ["PosString_0", "PosString_1"],
    "jump_s": ["PosString_2", "PosString_3"], // 跳跃暂时只考虑终点
    "showBgFgMap_s": ["EvalString_0", "EvalString_1", "IdString_0"],
    "hideBgFgMap_s": ["EvalString_0", "EvalString_1", "IdString_0"],
    "setBgFgBlock_s": ["EvalString_1", "EvalString_2", "IdString_0"],
    "showFloorImg_s": ["EvalString_0", "EvalString_1", "IdString_0"],
    "hideFloorImg_s": ["EvalString_0", "EvalString_1", "IdString_0"],
    "trigger_s": ["PosString_0", "PosString_1"],
    "insert_2_s": ["PosString_0", "PosString_1", "IdString_0"],
    "animate_s": ["EvalString_0", "EvalString_0"],
    "setViewport_s": ["PosString_0", "PosString_1"]
}

// id: [x, y, floorId, forceFloor]
const selectPoint = function() {
    var block = Blockly.selected, arr = null;
    var floorId = editor.currentFloorId, pos = editor.pos, x = pos.x, y = pos.y;
    if (block != null && block.type in condition) {
        arr = condition[block.type];
        var xv = parseInt(block.getFieldValue(arr[0])), yv = parseInt(block.getFieldValue(arr[1]));
        if (block.type == 'animate_s') {
            var v = block.getFieldValue(arr[0]).split(",");
            xv = parseInt(v[0]); yv = parseInt(v[1]);
        }
        if (!isNaN(xv)) x = xv;
        if (!isNaN(yv)) y = yv;
        if (arr[2] != null) floorId = block.getFieldValue(arr[2]) || floorId;
    }
    editor.uievent.selectPoint(floorId, x, y, arr && arr[2] == null, function (fv, xv, yv) {
        if (!arr) return;
        if (arr[2] != null) {
            if (fv != editor.currentFloorId) block.setFieldValue(fv, arr[2]);
            else block.setFieldValue(arr[3] ? fv : "", arr[2]);
        }
        if (block.type == 'animate_s') {
            block.setFieldValue(xv+","+yv, arr[0]);
        }
        else {
            block.setFieldValue(xv+"", arr[0]);
            block.setFieldValue(yv+"", arr[1]);
        }
        if (block.type == 'changeFloor_m') {
            block.setFieldValue("floorId", "Floor_List_0");
            block.setFieldValue("loc", "Stair_List_0");
        }
    });
}