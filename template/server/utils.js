export const createGuid = function () {
    return 'id_' + 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const isset = function (val) {
    return val != undefined && val != null && !(typeof val == 'number' && isNaN(val));
}

export const clone = function(data) {
    if (!isset(data)) return null;
    // date
    if (data instanceof Date) {
        return new Date(data);
    }
    // array
    if (Array.isArray(data)) {
        const copy = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            copy[i] = clone(data[i]);
        }
        return copy;
    }
    // 函数
    if (data instanceof Function) {
        return data;
    }
    // object
    if (data instanceof Object) {
        const copy = {};
        for (let i in data) {
            if (data.hasOwnProperty(i))
                copy[i] = clone(data[i]);
        }
        return copy;
    }
    return data;
}