<script>
export default {
    name: "mt-icon",
    functional: true,
    render(h, ctx) {
        const size = ctx.props.size;
        if (size) {
            ctx.data.style = {
                maxWidth: size + 'px',
                maxHeight: size + 'px',
                fontSize: size + 'px',
                ...ctx.data.style
            };
        }
        let c = ctx.data.class || [];
        c = Array.isArray(c) ? c : [c];
        ctx.data.class = ['mt-icon', 'codicon', 'codicon-'+ctx.props.icon, ...c];
        return h('i', ctx.data);
    },
    props: {
        "icon": String, 
        "size": Number
    }
}
</script>

<style lang="less">
.icon-btn {
    cursor: pointer;
    padding: 4px;
    i.codicon {
        width: 20px;
        height: 20px;
        font-size: 20px;
    }
}
</style>