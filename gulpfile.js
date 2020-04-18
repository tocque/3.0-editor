const fs = require('fs');
const del = require('del');
const path = require('path');
const { task, src, dest } = require('gulp');
const rollup = require('rollup');
const vueLoader = require('rollup-plugin-vue');
const cssLoader = require('rollup-plugin-css-only');
const npmLoader = require('@rollup/plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const compressing = require("compressing")

function copy(from, to) {
    return new Promise(res => {
        src(from)
            .pipe(dest(to))
            .on("end", res);
    })
}

function transplieTS(from, to) {
    return new Promise(res => {
        src(from)
            .pipe(tsProject())
            .js
            .pipe(dest(to))
            .on("end", res);
    })
}

async function buildVueModule(dir, multi) {
    const bundle = await rollup.rollup({
        input: './src/'+dir+'index.js',
        plugins: [
            cssLoader({ output: './dist/'+dir+'style.css' }),
            vueLoader({
                css: false,
                template: {
                    transpileOptions: {
                        target: {
                            chrome: 63
                        }
                    }
                },
                style: {
                    preprocessOptions: {
                        "less": {
                            compress: true,
                        },
                    },
                }
            }),
            npmLoader({ mainFields: ['browser', 'module', 'main'] }),
            babel()
        ],
        external: (modulePath, filePath) => {
            if (modulePath.includes("node_modules")) return false;
            const filedir = path.dirname(filePath);
            const moduledir = path.dirname(modulePath);
            return path.relative('./src/'+dir, path.resolve(filedir, moduledir)).startsWith("..");
        },
    });
  
    if (multi) {
        await bundle.write({
            dir: './dist/'+dir,
            format: 'esm'
        });
    } else {
        await bundle.write({
            file: './dist/'+dir+'index.js',
            format: 'esm'
        });
    }
}

async function buildMtUI() {
    return Promise.all([
        transplieTS('./src/mt-ui/canvas.ts', './dist/mt-ui/'),
        buildVueModule('mt-ui/')
    ]);
}

async function buildPanels() {
    const path = "./src/panels/";
    const list = fs.readdirSync(path).filter((e) => {
        return fs.statSync(path+e).isDirectory();
    })
    return Promise.all(list.map(e => buildVueModule("panels/"+e+"/")));
}

async function buildTiledEditor() {
    return buildVueModule("tiled/");
}

async function buildMultiEditor() {
    const path = "./src/vs/";
    const list = fs.readdirSync(path).filter((e) => {
        return fs.statSync(path+e).isDirectory();
    })
    await Promise.all([
        ...list.map(e => copy(path+e+"/**/*", "./dist/vs/"+e)),
        buildVueModule("vs/")
    ])
    return ;
}

async function buildBlocklyEditor() {
    const dest = "./dist/blockly/"
    await Promise.all([
        copy("./src/blockly/*.min.js", dest),
        copy("./src/blockly/zh-hans.js", dest),
        copy("./src/blockly/MotaAction.g4", dest),
        copy("./src/blockly/media/*", dest+"media/"),
        buildVueModule("blockly/", true)
    ])
}

async function buildTree() {
    await transplieTS("./src/tree/tree.ts", "./src/tree/")
    await buildVueModule("tree/");
    return del("./src/tree/tree.js")
}

async function buildMain() {
    await Promise.all([
        copy("./src/*.json", "./dist"),
        copy("./src/*.js", "./dist"),
        copy("./src/index.html", "./dist"),
        transplieTS("./src/*.ts", "./dist")
    ])
}

async function buildComments () {
    return copy("./src/comments/*.js", "./dist/comments/")
}

async function buildGame () {
    return copy("./src/game/*.js", "./dist/game/")
}

task('build', async function () {
    await Promise.all([
        buildPanels(),
        buildVueModule("view/"),
        buildTiledEditor(),
        buildMultiEditor(),
        buildBlocklyEditor(),
        buildComments(),
        buildGame(),
        buildMain(),
        copy("./src/extensions/**/*", "./dist/extensions"),
        copy("./src/thirdparty/**/*", "./dist/thirdparty"),
        copy("./src/css/*.css", "./dist/css"),
        copy("./src/theme/*.css", "./dist/theme"),
        copy("./src/icon/*", "./dist/icon"),
    ])
    await buildMtUI();
    buildTree()
});

task('packtemplate', async() => {
    return compressing.zip.compressDir("template", "./dist/game/template.zip")
});