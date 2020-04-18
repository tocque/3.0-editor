import Button from './input/Button.vue';
import Checkbox from './input/Checkbox.vue';
import Search from './input/Search.vue';
import Switch from './input/Switch.vue';
import Table from './input/Table.vue';

import Board from './layout/Board.vue';
import "./layout/Container.vue"
import FormItem from './layout/FormItem.vue';
import Window from './layout/Window.vue';

import Side from './navigation/Side.vue';
import SidePane from './navigation/SidePane.vue';
import Tabs from './navigation/Tabs.vue';
import View from './navigation/View.vue';

import Contextmenu from './others/Contextmenu.vue';
import Icon from './others/Icon.vue';
import ImagePreviewer from './others/ImagePreviewer.vue';
import ProgressBit from './others/ProgressBit.vue';

import Notification from './notify/index.js';
import Shortcut from './shortcut/index.js';

import "./mt-ui.vue"

const install = function(Vue) {
    [
        Button, Checkbox, Search, Switch, Table,
        Board, FormItem, Window,
        Side, SidePane, Tabs, View,
        Contextmenu, Icon, ImagePreviewer, ProgressBit
    ].forEach((e) => Vue.component(e.name, e));

    Notification.install(Vue);
    Shortcut.install(Vue);
}

export default {
    install
}