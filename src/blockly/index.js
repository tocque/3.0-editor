import { importCSS } from "../ui.js";
import BlocklyEditor from "./BlocklyEditor.vue";
import BlocklyHook from "./blockly_proxy";

const BlocklyEditorAsync = async function () {
    importCSS("./blockly/style.css");
    await BlocklyHook.load();
    return BlocklyEditor;
}

export default BlocklyEditorAsync;