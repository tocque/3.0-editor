import { $ } from "../../mt-ui/canvas.js"
import { rgbToHsl, hslToRgb } from "../../editor_util.js"

export default {
    template: /* HTML */`
    <div class='rescource-append'><!-- appendpic -->
        <h3 class="header">追加素材 - {{ file.name }}</h3>
        <div>
            <input id="selectFileBtn" @click="selectFile" type="button" value="导入文件到画板"/>
            <input @click="appendConfirm" type="button" value="追加"/>
            <input @click="quickAppendConfirm" type="button" value="快速追加"/>
            <span style="font-size: 13px">自动注册</span>
            <mt-switch v-model="autoRegister"></mt-switch>
        </div>
        <div>
            <label>色相:</label>
            <input type="range" min="0" max="12" step="1" @v-model="hue" @change="changeColor"/>
        </div>
        <div class="container">
            <canvas style="position:absolute"></canvas><!-- 用于画出灰白相间背景 -->
            <canvas style="position:absolute" ref=""></canvas><!-- 用于画出选中文件 -->
            <canvas style="z-index:100" ref="eui" @clickPos="picClick"></canvas><!-- 用于响应鼠标点击 -->
            <tiled-renderer ></tiled-renderer>
            <canvas ref="pic"></canvas>
        </div>
    </div>`,
    props: ["file", "type"],
    data: function() {
        return {
            sourceCtx: null,
            imageName: '',
            img: null,
            toImg: null,
            num: null,
            autoRegister: true,
            hue: 1,
        }
    },
    computed: {
        canQuickAppend() {
            return ['enemys', 'enemy48', 'npcs', 'npc48'].includes(this.type);
        },
    },
    mounted: function() {
        
    },
    methods: {
        getSize(type) {
            return { x: 32, y: type.endsWith('48') ? 48 : 32 };
        },

        selectFile() {

            const autoAdjust = async function (image) {
                let changed = false;
    
                // Step 1: 检测白底
    
                let imgctx = $(image, { fix: true });
                let imgData = imgctx.getImageData();
                let trans = 0, white = 0, black = 0;
                $.mapPixels(imgData, ([r, g, b, a]) => {
                    if (a == 0) trans++;
                    if (r == 255 && g == 255 && b == 255 && a == 255) white++;
                    // if (pixel[0]==0 && pixel[1]==0 && pixel[2]==0 && pixel[3]==255) black++;
                })
                if (white > black && white > trans * 10 && confirm("看起来这张图片是以纯白为底色，是否自动调整为透明底色？")) {
                    imgData = $.mapPixels(imgData, ([r, g, b, a]) => {
                        if (r == 255 && g == 255 && b == 255 && a == 255) {
                            return [0, 0, 0, 0];
                        }
                    })
                    imgctx.putImageData(imgData);
                    changed = true;
                }
                /*
                if (black>white && black>trans*10 && confirm("看起来这张图片是以纯黑为底色，是否自动调整为透明底色？")) {
                    for (var i=0;i<image.width;i++) {
                        for (var j=0;j<image.height;j++) {
                            var pixel = editor.util.getPixel(imgData, i, j);
                            if (pixel[0]==0 && pixel[1]==0 && pixel[2]==0 && pixel[3]==255) {
                                editor.util.setPixel(imgData, i, j, [0,0,0,0]);
                            }
                        }
                    }
                    tempCanvas.clearRect(0, 0, image.width, image.height);
                    tempCanvas.putImageData(imgData, 0, 0);
                    changed = true;
                }
                */
    
                // Step 2: 检测长宽比
                const ysize = this.getSize(this.type);
                if ((image.width % 32 != 0 || image.height % ysize != 0) && (image.width <= ysize * 4)
                    && confirm("目标长宽不符合条件，是否自动进行调整？")) {
                    const ncanvas = $({
                        width: 128, height: 4*ysize, fix: true,
                    });
                    const w = image.width / 4, h = image.height / 4;
                    for (let i = 0; i < 4; i++) {
                        for (let j = 0; j < 4; j++) {
                            ncanvas.drawImage(imgctx.canvas, i * w, j * h, w, h, i * 32 + (32 - w) / 2, j * ysize + (ysize - h) / 2, w, h);
                        }
                    }
                    imgctx = ncanvas;
                    changed = true;
                }
    
                if (!changed) {
                    return image;
                } else {
                    return imgctx.toImage();
                }
            }

            core.readFile(function (content) {
                $.loadImage(content).then(function (image) {
                    autoAdjust(image).then(function (image) {
                        this.img = image;
                        this.width = image.width;
                        this.height = image.height;

                        var ysize = this.$refs.selectAppend.value.endsWith('48') ? 48 : 32;
                        for (var ii = 0; ii < 3; ii++) {
                            var newsprite = this.$refs.appendPicCanvas.children[ii];
                            newsprite.style.width = (newsprite.width = Math.floor(image.width / 32) * 32) / editor.uivalues.ratio + 'px';
                            newsprite.style.height = (newsprite.height = Math.floor(image.height / ysize) * ysize) / editor.uivalues.ratio + 'px';
                        }

                        //画灰白相间的格子
                        var bgc = this.$refs.bgCtx;
                        var colorA = ["#f8f8f8", "#cccccc"];
                        var colorIndex;
                        var sratio = 4;
                        for (var ii = 0; ii < image.width / 32 * sratio; ii++) {
                            colorIndex = 1 - ii % 2;
                            for (var jj = 0; jj < image.height / 32 * sratio; jj++) {
                                bgc.fillStyle = colorA[colorIndex];
                                colorIndex = 1 - colorIndex;
                                bgc.fillRect(ii * 32 / sratio, jj * 32 / sratio, 32 / sratio, 32 / sratio);
                            }
                        }

                        //把导入的图片画出
                        this.$refs.sourceCtx.drawImage(image, 0, 0);
                        this.sourceImageData = this.$refs.sourceCtx.getImageData(0, 0, image.width, image.height);

                        //重置临时变量
                        this.$refs.selectAppend.onchange();
                    });
                });
            }, null, 'image/*', 'img');

            return;
        },
        changeColor: function () {
            const delta = (~~changeColorInput.value) * 30;
            imgData = this.sourceImageData;
            const nimgData = $.mapPixels(imgData, (rgba) => {
                // ImageData .data 形如一维数组,依次排着每个点的 R(0~255) G(0~255) B(0~255) A(0~255)
                const hsl = rgbToHsl(rgba)
                hsl[0] = (hsl[0] + delta) % 360
                const nrgb = hslToRgb(hsl)
                nrgb.push(rgba[3])
                return nrgb
            })

            this.sourceCtx.putImageData(nimgData);
        },
        picClick: function (pos) {
            var pos = this.eToPos(loc);
            //console.log(e,loc,pos);
            var num = this.num;
            var ii = this.index;
            if (ii + 1 >= num) this.index = ii + 1 - num;
            else this.index++;
            this.selectPos[ii] = pos;
            this.$refs.appendPicSelection.children[ii].style = [
                'left:', pos.x * 32, 'px;',
                'top:', pos.y * pos.ysize, 'px;',
                'height:', pos.ysize - 6, 'px;'
            ].join('');
        },
        appendConfirm: function () {

            var ysize = this.$refs.selectAppend.value.endsWith('48') ? 48 : 32;
            for (var ii = 0, v; v = this.selectPos[ii]; ii++) {
                // var imgData = this.$refs.sourceCtx.getImageData(v.x * 32, v.y * ysize, 32, ysize);
                // this.spriteCtx.putImageData(imgData, ii * 32, this.$refs.sprite.height - ysize);
                // this.spriteCtx.drawImage(this.img, v.x * 32, v.y * ysize, 32, ysize,  ii * 32, height,  32, ysize)

                this.spriteCtx.drawImage(this.$refs.sourceCtx.canvas, v.x * 32, v.y * ysize, 32, ysize, 32 * ii, this.$refs.sprite.height - ysize, 32, ysize);
            }
            var dt = this.spriteCtx.getImageData(0, 0, this.$refs.sprite.width, this.$refs.sprite.height);
            var imgbase64 = this.$refs.sprite.toDataURL('image/png');
            var imgName = this.imageName;
            fs.writeFile('./project/images/' + imgName + '.png', imgbase64.split(',')[1], 'base64', function (err, data) {
                if (err) {
                    printe(err);
                    throw (err)
                }
                var currHeight = this.$refs.sprite.height;
                this.$refs.sprite.style.height = (this.$refs.sprite.height = (currHeight + ysize)) + "px";
                this.spriteCtx.putImageData(dt, 0, 0);
                core.material.images[imgName].src = imgbase64;
                editor.widthsX[imgName][3] = currHeight;
                if (this.autoRegister) {
                    editor.file.autoRegister({images: imgName}, function (e) {
                        if (e) {
                            printe(e);
                            throw e;
                        }
                        printf('追加素材并自动注册成功！你可以继续追加其他素材，最后再刷新以使用。');
                    });
                } else {
                    printf('追加素材成功！你可以继续追加其他素材，最后再刷新以使用。');
                }
            });
        },
        quickAppendConfirm: function () {
            var value = this.$refs.selectAppend.value;
            var ysize = value.endsWith('48') ? 48 : 32;
            if (this.$refs.sourceCtx.canvas.width != 128 || this.$refs.sourceCtx.canvas.height != 4 * ysize)
                return printe("只有 4*4 的素材图片才可以快速导入！");

            var dt = this.spriteCtx.getImageData(0, 0, this.$refs.sprite.width, this.$refs.sprite.height);
            this.$refs.sprite.style.height = (this.$refs.sprite.height = (this.$refs.sprite.height + 3 * ysize)) + "px";
            this.spriteCtx.putImageData(dt, 0, 0);
            if (this.$refs.sprite.width == 64) { // 两帧
                this.spriteCtx.drawImage(this.$refs.sourceCtx.canvas, 32, 0, 64, 4 * ysize, 0, this.$refs.sprite.height - 4 * ysize, 64, 4 * ysize);
            } else { // 四帧
                this.spriteCtx.drawImage(this.$refs.sourceCtx.canvas, 0, 0, 128, 4 * ysize, 0, this.$refs.sprite.height - 4 * ysize, 128, 4 * ysize);
            }

            dt = this.spriteCtx.getImageData(0, 0, this.$refs.sprite.width, this.$refs.sprite.height);
            var imgbase64 = this.$refs.sprite.toDataURL('image/png');
            var imgName = this.imageName;
            fs.writeFile('./project/images/' + imgName + '.png', imgbase64.split(',')[1], 'base64', function (err, data) {
                if (err) {
                    printe(err);
                    throw (err)
                }
                var currHeight = this.$refs.sprite.height;
                this.$refs.sprite.style.height = (this.$refs.sprite.height = (currHeight + ysize)) + "px";
                this.spriteCtx.putImageData(dt, 0, 0);
                core.material.images[imgName].src = imgbase64;
                editor.widthsX[imgName][3] = currHeight;
                if (autoRegister) {
                    editor.file.autoRegister({images: imgName}, function (e) {
                        if (e) {
                            printe(e);
                            throw e;
                        }
                        printf('快速追加素材并自动注册成功！你可以继续追加其他素材，最后再刷新以使用。');
                    })
                } else {
                    printf('快速追加素材成功！你可以继续追加其他素材，最后再刷新以使用。');
                }
            });

        }
    },
    watch: {
        file(file) {
            
        }
    }
}