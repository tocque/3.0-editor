import FormTree from "./FormTree.vue"
import WorkspaceNode from "./WorkspaceNode.vue"
import { buildTree } from "./tree.js"

Vue.component(FormTree.name, FormTree);
Vue.component(WorkspaceNode.name, WorkspaceNode);

export {
    buildTree
}