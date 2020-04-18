import Window from "./Window.vue"
import StatusItem from "./StatusItem.vue"
import "../thirdparty/elementUI/elementui.umd.min.js"
import "../tree/index.js"
import MtUI from "../mt-ui/index.js"
import "../tiled/index.js"
import "../vs/index.js"

Vue.use(MtUI)
Vue.component(StatusItem.name, StatusItem)

export default Window