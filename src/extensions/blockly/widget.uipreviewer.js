/**
 * @file widget.uipreviewer.js ui预览
 */
export const condition = [
    "previewUI_s", "clearMap_s", "clearMap_1_s", "setAttribute_s", "fillText_s",
    "fillBoldText_s", "drawTextContent_s", "fillRect_s", "strokeRect_s", "drawLine_s",
    "drawArrow_s", "fillPolygon_s", "strokePolygon_s", "fillCircle_s", "strokeCircle_s",
    "drawImage_s", "drawImage_1_s", "drawIcon_s", "drawBackground_s", "drawSelector_s", "drawSelector_1_s"
];


    
const previewBlock = function(b) {
    try {
        const code = "[" + Blockly.JavaScript.blockToCode(b).replace(/\\(i|c|d|e)/g, '\\\\$1') + "]";
        const obj = eval(code);
        // console.log(obj);
        if (obj.length > 0 && b.type.startsWith(obj[0].type)) {
            let previewObj;
            if (b.type == 'previewUI_s') previewObj = obj[0].action;
            else previewObj = obj[0];
            this.UIpreviewer.show(previewObj);
        }
    } catch (e) {
        main.log(e);
    }
}