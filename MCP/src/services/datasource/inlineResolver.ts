import type { InlineOption } from "../../types/datasource.js";
import type { DatasourceResolver } from "./resolver.js";
import type { ResolveInput, ResolveResult } from "../../types/datasource.js";

export function createInlineResolver(
  key: string,
  options: InlineOption[]
): DatasourceResolver {
  return {
    key,
    async resolve(input: ResolveInput): Promise<ResolveResult> {
      const search = (input.search ?? "").toLowerCase();
      let filtered = options;
      if (search) {
        filtered = options.filter(
          (o) =>
            String(o.label).toLowerCase().includes(search) ||
            String(o.value).toLowerCase().includes(search)
        );
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
