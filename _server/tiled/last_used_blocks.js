export default {
    template: /* HTML */`
    <div ref='container' class="lastUsed" @click="">
        <canvas ref='blocks'></canvas>
    </div>`,
    props: {
        selection: Number,
    },
    data() {
        return {
            lastUsed: [],
        }
    },
    model: {
        prop: 'selection',
        event: 'select',
    },
    mounted() {
        new window.MutationObserver((e) => {
            console.log(e);
        }).observe(this.$refs.container, { attributes: true });

        this.blockCtx = this.$refs.blocks.getContext('2d');
    },
    methods: {
        lastUsed_click: function (e) {

            var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop
            var px = scrollLeft + e.clientX - this.dom.mid2.offsetLeft - this.dom.lastUsedDiv.offsetLeft,
                py = scrollTop + e.clientY - this.dom.mid2.offsetTop - this.dom.lastUsedDiv.offsetTop;
            var x = parseInt(px / 32), y = parseInt(py / 32);
            var index = x + core.__SIZE__ * y;
            if (index >= this.lastUsed.length) return;
            editor.setSelectBoxFromInfo(this.lastUsed[index]);
            return;
        },
        updateLastUsedMap () {
            // 绘制最近使用事件
            var ctx = editor.dom.lastUsedCtx;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.strokeStyle = 'rgba(255,128,0,0.85)';
            ctx.lineWidth = 4;
            for (var i = 0; i < this.lastUsed.length; ++i) {
                try {
                    var x = i % core.__SIZE__, y = parseInt(i / core.__SIZE__);
                    var info = this.lastUsed[i];
                    if (!info || !info.images) continue;
                    if (info.isTile && core.material.images.tilesets[info.images]) {
                        ctx.drawImage(core.material.images.tilesets[info.images], 32 * info.x, 32 * info.y, 32, 32, x*32, y*32, 32, 32);
                    } else if (info.images == 'autotile' && core.material.images.autotile[info.id]) {
                        ctx.drawImage(core.material.images.autotile[info.id], 0, 0, 32, 32, x * 32, y * 32, 32, 32);
                    } else {
                        var per_height = info.images.endsWith('48') ? 48 : 32;
                        ctx.drawImage(core.material.images[info.images], 0, info.y * per_height, 32, per_height, x * 32, y * 32, 32, 32);
                    }
                    if (selectBox.isSelected() && editor.info.id == info.id) {
                        ctx.strokeRect(32 * x + 2, 32 * y + 2, 28, 28);
                    }
                } catch (e) {}
            }
        }
    }
}