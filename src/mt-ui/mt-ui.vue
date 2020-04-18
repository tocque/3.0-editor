<style lang="less">
.mt-input {
    border: none;
    background-color: #444444;
    padding: 2px;
    margin: 0px;
    color: var(--c-text);
}

.link-btn {
    color: var(--c-link);
    cursor: pointer;
    white-space: nowrap;
    text-decoration: none;
}

.slide-fade-enter-active, .slide-fade-leave-active {
    transition: all .3s ease;
}
.slide-fade-enter, .slide-fade-leave-to {
    transform: translateY(10px);
    opacity: 0;
}

h5 {
    line-height: inherit;
    margin: 0;
    font-size: inherit;
}


.el-color-picker {
    display: inline-block;
    position: relative;
    line-height: normal;
    height: 20px;
    .__trigger {
        display: inline-block;
        box-sizing: border-box;
        height: 20px;
        width: 100px;
        border-radius: 4px;
        font-size: 0;
        position: relative;
        cursor: pointer;
    }
    .__color {
        position: relative;
        display: block;
        box-sizing: border-box;
        border: 1px solid #999;
        border-radius: 2px;
        width: 100%;
        height: 100%;
        text-align: center;
        &.is-alpha {
            background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
        }
    }
    .__color-inner {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
    }
}

.el-color-dropdown {
    width: 300px;
    &.__panel {
        position: absolute;
        z-index: 10;
        padding: 6px;
        box-sizing: content-box;
        background-color: var(--c-bg-pop);
        box-shadow: 0 2px 12px 0 var(--c-bg);
    }
    .__main-wrapper {
        margin-bottom: 6px;
    }
    .__btns {
        margin-top: 6px;
        text-align: right;
    }
    .__value {
        float: left;
        line-height: 26px;
        font-size: 12px;
        color: #000;
        width: 160px;
    }
}

.el-color-svpanel {
    position: relative;
    width: 280px;
    height: 180px;
    .__white {
        background: linear-gradient(90deg,#fff,hsla(0,0%,100%,0));
    }
    .__black {
        background: linear-gradient(0deg,#000,transparent);
    }
    .__black, .__white {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    .__cursor {
        position: absolute;
        &>div {
            cursor: head;
            width: 4px;
            height: 4px;
            box-shadow: 0 0 0 1.5px #fff, inset 0 0 1px 1px rgba(0,0,0,.3), 0 0 1px 2px rgba(0,0,0,.4);
            border-radius: 50%;
            transform: translate(-2px,-2px);
        }
    }
    .__main-wrapper:after {
        content: "";
        display: table;
        clear: both;
    }
}

.el-color-hue-slider {
    position: relative;
    box-sizing: border-box;
    width: 280px;
    height: 12px;
    background-color: red;
    padding: 0 2px;
    &.is-vertical {
        width: 12px;
        height: 180px;
        padding: 2px 0;
        .__bar {
            background: linear-gradient(180deg,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red);
        }
        .__thumb {
            left: 0;
            top: 0;
            width: 100%;
            height: 4px;
        }
    }
    .__bar {
        position: relative;
        background: linear-gradient(90deg,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red);
        height: 100%;
    }
    .__thumb {
        position: absolute;
        cursor: pointer;
        box-sizing: border-box;
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        border-radius: 1px;
        background: #fff;
        border: 1px solid #f0f0f0;
        box-shadow: 0 0 2px rgba(0,0,0,.6);
        z-index: 1;
    }
}

.el-color-alpha-slider {
    position: relative;
    box-sizing: border-box;
    width: 280px;
    height: 12px;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
    .__bar {
        position: relative;
        background: linear-gradient(90deg,hsla(0,0%,100%,0) 0,#fff);
        height: 100%;
    }
    .__thumb {
        position: absolute;
        cursor: pointer;
        box-sizing: border-box;
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        border-radius: 1px;
        background: #fff;
        border: 1px solid #f0f0f0;
        box-shadow: 0 0 2px rgba(0,0,0,.6);
        z-index: 1;
    }
}

.el-color-predefine {
    display: flex;
    font-size: 12px;
    margin-top: 8px;
    width: 280px;
    .__colors {
        display: flex;
        flex: 1;
        flex-wrap: wrap;
    }
    .__color-selector {
        margin: 0 0 8px 8px;
        width: 20px;
        height: 20px;
        border-radius: 4px;
        cursor: pointer;
        &>div {
            display: flex;
            height: 100%;
            border-radius: 3px;
        }
        &:nth-child(10n+1) {
            margin-left: 0;
        }
    }
}
</style>