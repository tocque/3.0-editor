const { src, dest } = require("gulp");
const uglifyJS = require("gulp-uglify");
const concat = require("gulp-concat");
const babel = require("gulp-babel");
const preprocess = require("gulp-preprocess");
const fs = require("fs");
const compressing = require('compressing');
import { localfs } from "../fs.js"
import game from "../game.js"

/** 打包main.js */
const pack_main = function(root, output) {
    return Promise.all([
        new Promise((res) => {
            src(root+'/main.js')
                .pipe(preprocess({ PRODUCTION: true, BGMREMOTE: true }))
                .pipe(babel({
                    presets: ['@babel/env']
                }))
                .pipe(uglifyJS())
                .pipe(dest(output))
                .on('end', res)
        }),
        localfs.copy(root+'/style.css', output+'/style.css'),
        localfs.copy(root+'/index.html', output+'/index.html'),
    ]);
}

/** 打包libs */
const pack_libs = function(root, output) {
    return new Promise((res) => {
        src(root+"/libs/*.js")
            .pipe(concat('libs.min.js'))
            .pipe(babel({
                presets: ['@babel/env']
            }))
            .pipe(uglifyJS())
            .pipe(dest(output+'/libs'))
            .on('end', res)
    });
}

/** 打包数据文件 */
const pack_pureData = function(root, output) {
    const all = {};
    game.main.pureData.forEach((e) => {
        all[e] = game.oriData[e];
    })
    return new Promise((res) => {
        fs.writeFile(output+"/project/project.min.json", JSON.stringify(all), res)
    });
}

/** 打包脚本文件 */
const pack_functions = function(root, output) {
    return new Promise((res) => {
        src(root+"/project/*.js")
            .pipe(concat('project.min.js'))
            .pipe(babel({
                presets: ['@babel/env']
            }))
            .pipe(uglifyJS())
            .pipe(dest(output+'/project'))
            .on('end', res)
    });
}

/** 打包地图文件 */
const pack_maps = function(root, output) {
    const all = {};
    game.oriData.data.main.floorIds.forEach((e) => {
        all[e] = game.maps[e].data;
    })
    return new Promise((res) => {
        fs.writeFile(output+"/project/floors.min.json", JSON.stringify(all), res)
    });
}

const pack_materials = function(root, output) {
    const tasks = [];
    editor.gameInfo.get("dirs", []).forEach((e) => {
        if (e.uncompressing) return;
        tasks.push(compressing.zip.compressDir(root+"/project/"+e.path, 
            output+"/project/"+e.path+'.h5data'))
    });
    return Promise.all(tasks);
}

export const pack = async function(root, output, onProgress) {
    onProgress("开始打包");
    const mkdir = (dir) => {
        try { 
            fs.accessSync(dir); 
        } catch { 
            fs.mkdirSync(dir); 
        }
    }
    mkdir(output);
    mkdir(output+"/libs");
    mkdir(output+"/project");
    const task = [
        pack_main(root, output).then(() => onProgress('打包main.js')),
        pack_libs(root, output).then(() => onProgress('打包libs')),
        localfs.copy(root+'/libs/thirdparty/*', output+'/libs/thirdparty').then(() => onProgress('复制第三方库')),
        pack_pureData(root, output).then(() => onProgress('打包数据文件')),
        pack_functions(root, output).then(() => onProgress('打包脚本')),
        pack_maps(root, output).then(() => onProgress('打包地图文件')),
        pack_materials(root, output).then(() => onProgress('打包素材'))
    ]
    return Promise.all(task);
}
