import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

const bigTable1 = String.raw`# Big Table 1

| Key  | Value           |
| ---- | --------------- |
| k1   | v1              |
| k2   | v2              |
| k3   | v3              |
| k4   | v4              |
| k5   | v5              |
| k6   | v6              |
| k7   | v7              |
| k8   | v8              |
| k9   | v9              |
| k10  | v10             |
| k1   | v1              |
| k2   | v2              |
| k3   | v3              |
| k4   | v4              |
| k5   | v5              |
| k6   | v6              |
| k7   | v7              |
| k8   | v8              |
| k9   | v9              |
| k10  | v10             |
| k1   | v1              |
| k2   | v2              |
| k3   | v3              |
| k4   | v4              |
| k5   | v5              |
| k6   | v6              |
| k7   | v7              |
| k8   | v8              |
| k9   | v9              |
| k10  | v10             |
| k1   | v1              |
| k2   | v2              |
| k3   | v3              |
| k4   | v4              |
| k5   | v5              |
| k6   | v6              |
| k7   | v7              |
| k8   | v8              |
| k9   | v9              |
| k10  | v10             |
| k1   | v1              |
| k2   | v2              |
| k3   | v3              |
| k4   | v4              |
| k5   | v5              |
| k6   | v6              |
| k7   | v7              |
| k8   | v8              |
| k9   | v9              |
| k10  | v10             |

`;


const bigTable2 = String.raw`# Big Table 2

| Key  | Value           |
| ---- | --------------- |
| k1   | v1              |
| k2   | v2              |
| k3   | v3              |
| k4   | v4              |
| k5   | v5              |
| k6   | v6              |
| k7   | v7              |
| k8   | v8              |
| k9   | v9              |
| k10  | v10             |
| ---- | --------------- |
| k1   | v1              |
| k2   | v2              |
| k3   | v3              |
| k4   | v4              |
| k5   | v5              |
| k6   | v6              |
| k7   | v7              |
| k8   | v8              |
| k9   | v9              |
| k10  | v10             |
| ---- | --------------- |
| k1   | v1              |
| k2   | v2              |
| k3   | v3              |
| k4   | v4              |
| k5   | v5              |
| k6   | v6              |
| k7   | v7              |
| k8   | v8              |
| k9   | v9              |
| k10  | v10             |
| ---- | --------------- |
| k1   | v1              |
| k2   | v2              |
| k3   | v3              |
| k4   | v4              |
| k5   | v5              |
| k6   | v6              |
| k7   | v7              |
| k8   | v8              |
| k9   | v9              |
| k10  | v10             |
| ---- | --------------- |
| k1   | v1              |
| k2   | v2              |
| k3   | v3              |
| k4   | v4              |
| k5   | v5              |
| k6   | v6              |
| k7   | v7              |
| k8   | v8              |
| k9   | v9              |
| k10  | v10             |

`;


main();

async function main() {
  console.time('bigTable1 w/o gfm');
  await remark()
    .process(bigTable1);
  console.timeEnd('bigTable1 w/o gfm');

  console.time('bigTable1 w/  gfm');
  await remark()
    .use(remarkGfm)
    .process(bigTable1);
  console.timeEnd('bigTable1 w/  gfm');

  console.time('bigTable2 w/o gfm');
  await remark()
    .process(bigTable2);
  console.timeEnd('bigTable2 w/o gfm');

  console.time('bigTable2 w/  gfm');
  await remark()
    .use(remarkGfm)
    .process(bigTable2);
  console.timeEnd('bigTable2 w/  gfm');

}
