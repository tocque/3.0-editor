"use strict";

function data() {
    this._init();
}

data.prototype._init = function () {
    this.firstData = main.gameData.data.firstData;
    this.values = main.gameData.data.values;
    this.flags = main.gameData.data.flags;
    //delete(main.gameData.data);
}