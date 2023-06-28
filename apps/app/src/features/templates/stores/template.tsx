import type { TemplateSummary } from '@growi/pluginkit/dist/interfaces/v4';
import useSWR, { type SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';

// const presetTemplates: ITemplate[] = [
//   // preset 1
//   {
//     id: '__preset1__',
//     name: '日報',
//     markdown: `# {{yyyy}}/{{MM}}/{{dd}} 日報

// ## 今日の目標
// - 目標１
//     - 〇〇の完了
// - 目標２
//     - 〇〇を〇件達成


// ## 内容
// - 10:00 ~ 10:20 今日のタスク確認
// - 10:20 ~ 11:00 全体会議


// ## 進捗
// - 目標１
//     - 完了
// - 目標２
//     - 〇〇件達成


// ## メモ
// - 改善できることの振り返り


// ## 翌営業日の目標
// - 目標１
//     - 〇〇の完了
// - 目標２
//     - 〇〇を〇件達成
// `,
//   },

//   // preset 2
//   {
//     id: '__preset2__',
//     name: '議事録',
//     markdown: `# {{{title}}}{{^title}}＜会議名＞{{/title}}

// ## 日時
// {{yyyy}}/{{MM}}/{{dd}} {{HH}}:{{mm}}〜hh:mm


// ## 参加者
// -

// ## 議題
// 1.
// 2.


// ## 1.
// ### 内容


// ### 決定事項


// ### Next Action


// ## 2.
// ### 内容


// ### 決定事項


// ### Next Action


// ## 次回会議
// - 会議内容
// - 会議時間
//     - {{yyyy}}/{{MM}}/dd
// `,
//   },

//   // preset 3
//   {
//     id: '__preset3__',
//     name: '企画書',
//     markdown: `# {{{title}}}{{^title}}＜企画タイトル＞{{/title}}

// ## 目的


// ## 現状の課題


// ## 概要
// #### 企画の内容

// #### スケジュール


// ## 効果
// #### メリット

// #### 数値目標


// ## 参考資料

// `,
//   },

//   // preset 4
//   {
//     id: '__preset4__',
//     name: '関連ページの一覧表示',
//     markdown: `# 関連ページ

// ## 子ページ一覧
// $lsx(depth=1)
// `,
//   },
// ];

export const useSWRxTemplates = (): SWRResponse<TemplateSummary[], Error> => {
  // return useSWR(
  //   'templates',
  //   () => [
  //     ...presetTemplates,
  //     ...Object.values<ITemplate>(getGrowiFacade().customTemplates ?? {}),
  //   ],
  //   {
  //     fallbackData: presetTemplates,
  //   },
  // );
  return useSWR(
    ['/templates'],
    ([endpoint]) => apiv3Get<{ summaries: TemplateSummary[] }>(endpoint).then(res => res.data.summaries),
  );
};
