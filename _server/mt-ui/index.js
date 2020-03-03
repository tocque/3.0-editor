import * as layout from'./layout.js';
import * as control from'./control.js';
import * as navigation from'./navigation.js';
import * as others from'./others.js';

import './contextmenu.js';
import './notify.js';
import './tree.js';

const components = { ...layout, ...control, ...navigation, ...others };
for (let c in components) {
    Vue.component(components[c].name, components[c]);
}