export function createInlineResolver(key, options) {
    return {
        key,
        async resolve(input) {
            const search = (input.search ?? "").toLowerCase();
            let filtered = options;
            if (search) {
                filtered = options.filter((o) => String(o.label).toLowerCase().includes(search) ||
                    String(o.value).toLowerCase().includes(search));
            }
            const items = filtered.map((o) => ({
                id: String(o.value),
                label: o.label,
                value: o.value,
            }));
            return { items };
        },
    };
}
//# sourceMappingURL=inlineResolver.js.map