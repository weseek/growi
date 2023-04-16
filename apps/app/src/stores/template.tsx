import { ITemplate } from '@growi/core';
import useSWR, { SWRResponse } from 'swr';

import { getGrowiFacade } from '~/features/activate-plugin';

const presetTemplates: ITemplate[] = [
  // preset 1
  {
    id: '__preset1__',
    name: '[Preset] WESEEK Inner Wiki Style',
    markdown: `# 関連ページ

$lsx()

# `,
  },

  // preset 2
  {
    id: '__preset2__',
    name: '[Preset] Qiita Style',
    markdown: `# <会議体名>
## 日時
yyyy/mm/dd hh:mm〜hh:mm

## 場所

## 出席者
-

## 議題
1. [議題1](#link)
2.
3.

## 議事内容
### <a name="link"></a>議題1

## 決定事項
- 決定事項1

## アクション事項
- [ ] アクション

## 次回
yyyy/mm/dd (予定、時間は追って連絡)`,
  },
];

export const useTemplates = (): SWRResponse<ITemplate[], Error> => {
  return useSWR(
    'templates',
    () => [
      ...presetTemplates,
      ...Object.values(getGrowiFacade().customTemplates ?? {}),
    ],
    {
      fallbackData: presetTemplates,
    },
  );
};
