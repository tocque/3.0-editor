/*
loader.js：负责对资源的加载

 */
"use strict";

function loader() {
    this._init();
}

loader.prototype._init = function () {

}

////// 设置加载进度条进度 //////
loader.prototype._setStartProgressVal = function (val) {
    core.dom.startTopProgress.style.width = val + '%';
}

////// 设置加载进度条提示文字 //////
loader.prototype._setStartLoadTipText = function (text) {
    core.dom.startTopLoadTips.innerText = text;
}

loader.prototype._load = async function (loadList) {
    this._loadAnimates(loadList.animates);
    this._loadMusic(loadList.bgms, loadList.sounds);

    await Promise.all([
        this._loadMaterialImages(loadList.materials),
        this._loadTextures(loadList),
        this._loadPictures(loadList.images),
        this._loadAutotiles(loadList.autotiles),
        this._loadTilesets(loadList.tilesets)
    ]);
}

loader.prototype._loadMaterialImages = async function (list) {
    const images = await this.loadImages("materials/", list, '.png');
    const icons = core.splitImage(images.icons);
    for (let key in core.statusBar.icons) {
        if (typeof core.statusBar.icons[key] == 'number') {
            core.statusBar.icons[key] = icons[core.statusBar.icons[key]];
            if (core.statusBar.image[key] != null)
                core.statusBar.image[key].src = core.statusBar.icons[key].src;
        }
    }
    core.animateFrame.weather.fog = images.fog;
}

loader.prototype._loadPictures = async function (list) {
    core.images.images = await this.loadImages("images/", list);
}

loader.prototype._loadAutotiles = async function (list) {
    core.images.autotiles = await this.loadImages("autotiles/", list, '.png');
    setTimeout(function () {
        core.maps._makeAutotileEdges(list, core.images.autotiles);
    });
}

loader.prototype._loadTextures = async function (loadList) {
    const tasks = [];
    ['items', 'enemys', 'events'].forEach((e) => {
        const list = loadList[e];
        if (main.useCompress) {
            tasks.push(axios.get('project/' + e + '/' + e + "min.h5meta").then((res) => {
                core.metadata[e] = res.data;
            }))
            core.unzip('project/'+e+".h5data?v="+main.version).then((data) => {
                console.log(data);
            });
        } else {
            for (let dir in list) {
                core.images[e] = {};
                core.metadata[e] = {};
                const path = e + '/' + (dir == 'default' ? '' : dir + '/');
                tasks.push(this.loadImages(path, list[dir], '.png').then((images) => {
                    core.images[e][dir] = images;
                }));
                if (dir != 'sprites') {
                    tasks.push(this._loadMetadatas(path, list[dir]).then((data) => {
                        core.metadata[e][dir] = data;
                    }));
                }
            }
        }
    });
    return Promise.all(tasks);
}

loader.prototype._loadMetadatas = async function (path, list) {
    if (!list || list.length == 0) return {};
    const metadatas = {};
    await Promise.all(list.map((e) => {
        return axios.get("project/"+path+e+'.h5meta').then((res) => {
            metadatas[e] = res.data;
        }).catch(() => {
            metadatas[e] = {};
        });
    }));
    return metadatas;
}

loader.prototype._loadTilesets = async function (list) {
    core.images.tilesets = await this.loadImages("tilesets/", list, '.png');
    core.metadata.tilesets = await this._loadMetadatas("tilesets/", list);
    // 检查宽高是32倍数，如果出错在控制台报错
    for (let imgName in core.images.tilesets) {
        const img = core.images.tilesets[imgName];
        if (img.width % 32 != 0 || img.height % 32 != 0) {
            console.warn("警告！" + imgName + "的宽或高不是32的倍数！");
        }
        if (img.width * img.height > 32 * 32 * 3000) {
            console.warn("警告！" + imgName + "上的图块素材个数大于3000！");
        }
    }
}

loader.prototype.loadImages = async function (dir, list, suffix) {
    const toSave = {};
    if (!list || list.length == 0) {
        return toSave;
    }
    if (main.useCompress) {
        const data = await core.unzip('project/'+dir.slice(0, -1)+".h5data?v="+main.version);
        const task = list.map((name) => new Promise((res) => {
            if (!(name in data)) console.error("zip资源不全");
            const img = new Image();
            const url = URL.createObjectURL(data[name]);
            img.onload = function () {
                URL.revokeObjectURL(url);
                toSave[name] = img;
                res();
            }
            img.src = url;
        }));
        await Promise.all(task);
    } else {
        let cnt = 0;
        const task = list.map((name) => {
            const filename = name + (suffix || '');
            return this.loadImage(dir, filename).then((image) => {
                this._setStartLoadTipText('正在加载图片 ' + name + "...");
                toSave[name] = image;
                this._setStartProgressVal((++cnt) * (100 / list.length));
            })
        });
        await Promise.all(task);
    }
    return toSave;
}

loader.prototype.loadImage = function (dir, name) {
    try {
        const image = new Image();
        return new Promise((res) => {
            image.onload = function () {
                res(image, name);
            }
            image.src = 'project/'+ dir + name + "?v=" + main.version;
        })
    }
    catch (e) {
        main.log(e);
    }
}

loader.prototype._loadAnimates = function (list) {
    if (main.useCompress) {
        core.unzip("project/animates.h5data?v="+main.version, true).then((data) => {
            for (let name in data) {
                if (name.endsWith(".animate")) {
                    const t = name.substring(0, name.length - 8);
                    if (list.indexOf(t) >= 0)
                        core.material.animates[t] = this._loadAnimate(data[name]);
                }
            }
        });
    } else {
        list.map((t) => {  
            axios.get('project/animates/' + t + ".animate?v=" + main.version, {
                contentType: "text/plain; charset=x-user-defined"
            }).then((res) => {
                core.material.animates[t] = this._loadAnimate(res.data);
            })
        })
    }
}

loader.prototype._loadAnimate = function (content) {
    try {
        const data = {
            ratio: content.ratio,
            se: content.se,
            images: content.bitmaps.map((t2) => {
                if (!t2) return null;
                try {
                    const image = new Image();
                    image.src = t2;
                    return image;
                } catch (e) {
                    main.log(e);
                }
            }),
            images_rev: [],
            frame: content.frame_max,
            frames: content.frames.map((t2) => {
                return t2.map((t3) => ({
                    'index': t3[0],
                    'x': t3[1],
                    'y': t3[2],
                    'zoom': t3[3],
                    'opacity': t3[4],
                    'mirror': t3[5] || 0,
                    'angle': t3[6] || 0,
                }));
            })
        };
        return data;
    }
    catch (e) {
        main.log(e);
        return null;
    }
}

/** 
 * 加载音频 
 */
loader.prototype._loadMusic = function (bgms, sounds) {
    bgms.forEach((t) => this.loadOneMusic(t));

    if (main.useCompress && core.musicStatus.audioContext) {
        core.unzip('project/sounds/sounds.zip?v=' + main.version, function (data) {
            for (var name in data) {
                if (core.sounds.indexOf(name) >= 0) {
                    core.loader._loadOneSound_decodeData(name, data[name]);
                }
            }
        });
    } else {
        sounds.forEach((t) => this.loadOneSound(t));
    }
    // 直接开始播放
    core.playBgm(main.startBgm);
}

loader.prototype.loadOneMusic = function (name) {
    var music = new Audio();
    music.preload = 'none';
    if (main.bgmRemote) music.src = main.bgmRemoteRoot + core.firstData.name + '/' + name;
    else music.src = 'project/bgms/' + name;
    music.loop = 'loop';
    core.material.bgms[name] = music;
}

loader.prototype.loadOneSound = function (name) {
    if (core.musicStatus.audioContext != null) {
        core.http('GET', 'project/sounds/' + name, null, function (data) {
            try {
                core.musicStatus.audioContext.decodeAudioData(data, function (buffer) {
                    core.material.sounds[name] = buffer;
                }, function (e) {
                    main.log(e);
                    core.material.sounds[name] = null;
                })
            }
            catch (e) {
                main.log(e);
                core.material.sounds[name] = null;
            }
        }, function (e) {
            main.log(e);
            core.material.sounds[name] = null;
        }, null, 'arraybuffer');
    }
    else {
        var music = new Audio();
        music.src = 'project/sounds/' + name;
        core.material.sounds[name] = music;
    }
}

loader.prototype.loadBgm = function (name) {
    name = core.getMappedName(name);
    if (!core.material.bgms[name]) return;
    // 如果没开启音乐，则不预加载
    if (!core.musicStatus.bgmStatus) return;
    // 是否已经预加载过
    var index = core.musicStatus.cachedBgms.indexOf(name);
    if (index >= 0) {
        core.musicStatus.cachedBgms.splice(index, 1);
    }
    else {
        // 预加载BGM
        this._preloadBgm(core.material.bgms[name]);
        // core.material.bgms[name].load();
        // 清理尾巴
        if (core.musicStatus.cachedBgms.length == core.musicStatus.cachedBgmCount) {
            this.freeBgm(core.musicStatus.cachedBgms.pop());
        }
    }
    // 移动到缓存最前方
    core.musicStatus.cachedBgms.unshift(name);
}

loader.prototype._preloadBgm = function (bgm) {
    bgm.volume = 0;
    bgm.play();
}

loader.prototype.freeBgm = function (name) {
    name = core.getMappedName(name);
    if (!core.material.bgms[name]) return;
    // 从cachedBgms中删除
    core.musicStatus.cachedBgms = core.musicStatus.cachedBgms.filter(function (t) {
        return t != name;
    });
    // 清掉缓存
    core.material.bgms[name].removeAttribute("src");
    core.material.bgms[name].load();
    core.material.bgms[name] = null;
    if (name == core.musicStatus.playingBgm) {
        core.musicStatus.playingBgm = null;
    }
    // 三秒后重新加载
    setTimeout(function () {
        core.loader.loadOneMusic(name);
    }, 3000);
}