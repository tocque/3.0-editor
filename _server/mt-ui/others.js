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
        let c = ctx.data.class;
        c = c || [];
        c = c instanceof Array ? c : [c];
        ctx.data.class = ['mt-icon', 'codicon', 'codicon-'+ctx.props.icon, ...c];
        ctx.data.style = Object.assign({}, ctx.data.style, style);
        return h('i', ctx.data);
    },
    props: ["icon", "size"]
}