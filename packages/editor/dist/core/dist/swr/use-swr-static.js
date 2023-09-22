import { useSWRConfig as u } from "swr";
import e from "swr/immutable";
function s(...i) {
  var l;
  const [t, a, o] = i;
  if ((o == null ? void 0 : o.fetcher) != null)
    throw new Error("useSWRStatic does not support 'configuration.fetcher'");
  const { cache: r } = u(), n = e(t, null, {
    ...o,
    fallbackData: (o == null ? void 0 : o.fallbackData) ?? (t != null ? (l = r.get(t == null ? void 0 : t.toString())) == null ? void 0 : l.data : void 0)
  });
  return t != null && a !== void 0 && n.mutate(a, { optimisticData: a }), n;
}
export {
  s as useSWRStatic
};
//# sourceMappingURL=use-swr-static.js.map
