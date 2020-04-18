/**
 * @file fs.js 文件操作层
 */
const fs = require('fs');
const path = require('path');
const { src, dest } = require('gulp');
const { ipcRenderer } = require('electron');

export const baseURL = ".";

export class afios {

    baseURL: string

    constructor(baseURL = ".") {
        this.baseURL = baseURL;
    }

    fixURL(url: string) {
        if (this.baseURL == ".") return url;
        else return path.resolve(this.baseURL, url);
    }

    fetch(src: string, options?: string | { encoding?: string; flag?: string; }): Promise<String|Buffer> {
        return new Promise((res, rej) => {
            const cb = (err, data) => err ? rej(err) : res(data);
            if (options) {
                fs.readFile(this.fixURL(src), options, cb)
            } else {
                fs.readFile(this.fixURL(src), cb)
            }
        })
    }

    write(dest: string, data: any, options?) {
        return new Promise((res, rej) => {
            if (options) {
                fs.writeFile(this.fixURL(dest), data, options, res);
            } else {
                fs.writeFile(this.fixURL(dest), data, res);
            }
        })
    }

    isDir(url: string): boolean {
        return fs.statSync(this.fixURL(url)).isDirectory();
    }

    isExist(url: string): boolean {
        try {
            fs.statSync(this.fixURL(url));
            return true;
        } catch {
            return false;
        }
    }

    async remove(url: string) {
        return new Promise((res, rej) => {
            fs.unlink(this.fixURL(path), (err, data) => {
                if (err) rej(err);
                else res(data);
            });
        })
    }

    /**
     * 复制文件或文件夹
     * @param from 要复制的文件地址
     * @param to 复制到的地址
     */
    async copy(from: string, to: string) {
        return new Promise(res => src(this.fixURL(from))
            .pipe(dest(this.fixURL(to)))
            .on("end", res));
    }

    async readdir(path: string): Promise<string[]> {
        return new Promise((res, rej) => {
            fs.readdir(this.fixURL(path), (err, data) => {
                if (err) rej(err);
                else res(data);
            });
        })
    }
}

export const localfs = new afios(baseURL);

let selectFileHook: (path: string) => void;

ipcRenderer.on('selectedItem', (event, path) => {
    if (selectFileHook) {
        selectFileHook(path);
    }
});

/**
 * 打开选择文件的对话框
 * @param type 选择的类型
 */
export const selectFile = function(type: 'file'|'directory'): Promise<string> {
    ipcRenderer.send('open-directory-dialog', { 
        file: 'openFile', directory: 'openDirectory' 
    }[type]);
    return new Promise((res) => {
        selectFileHook = res;
    })
}