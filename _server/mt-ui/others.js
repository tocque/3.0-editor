/**
 * 图标
 */
export const MtIcon = {
    name: "mt-icon",
    functional: true,
    render(h, ctx) {
        const size = ctx.props.size;
        const style = size ? {
            maxWidth: size + 'px',
            maxHeight: size + 'px',
            fontSize: size + 'px'
        } : {};
        let c = ctx.data.class || [];
        const sc = ctx.data.staticClass;
        c = Array.isArray(c) ? c : [c];
        ctx.class = ['mt-icon', 'codicon', 'codicon-'+ctx.props.icon, ...c, sc];
        ctx.style = Object.assign({}, ctx.data.style, style);
        ctx.on = ctx.data.on;
        return h('i', ctx);
    },
    props: ["icon", "size"]
}