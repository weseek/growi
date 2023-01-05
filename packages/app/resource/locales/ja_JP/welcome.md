# :tada: GROWI へようこそ
[![GitHub Releases](https://img.shields.io/github/release/weseek/growi.svg)](https://github.com/weseek/growi/releases/latest)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/weseek/growi/blob/master/LICENSE)

GROWI は個人・法人向けの Wiki | ナレッジベースツールです。  
会社や大学の研究室、サークルでのナレッジ情報を簡単に共有でき、作られたページは誰でも編集が可能です。

知っている情報をカジュアルに書き出しみんなで編集することで、**チーム内での暗黙知を減らす**ことができます。  
当たり前に共有される情報を日々増やしていきましょう。

### :beginner: 簡単なページの作り方

- 右上の "**作成**"ボタンまたは右下の**鉛筆アイコン**のボタンからページを書き始めることができます
    - ページタイトルは後から変更できますので、適当に入力しても大丈夫です
        - タイトル入力欄では、半角の `/` (スラッシュ) でページ階層を作れます
        - （例）`/カテゴリ1/カテゴリ2/作りたいページタイトル` のように入力してみてください
- `- ` を行頭につけると、この文章のような箇条書きを書くことができます
- 画像やPDF、Word/Excel/PowerPointなどの添付ファイルも、コピー＆ペースト、ドラッグ＆ドロップで貼ることができます
- 書けたら "**更新**" ボタンを押してページを公開しましょう
    - `Ctrl(⌘) + S` でも保存できます

さらに詳しくはこちら: [チュートリアル#新規ページ作成](https://docs.growi.org/ja/guide/tutorial/create_page.html#新規ページ作成)

<div class="mt-4 card border-primary">
  <div class="card-header bg-primary text-light">Tips</div>
  <div class="card-body"><ul>
    <li>Ctrl(⌘) + "/" でショートカットヘルプを表示します</li>
    <li>HTML/CSS の記述には、<a href="https://getbootstrap.com/docs/4.6/components/">Bootstrap 4</a> を利用できます</li>
  </ul></div>
</div>


# :anchor: 管理者の方へ <small>〜Wikiを作ったら〜</small>

### :arrow_right: 複数人でWikiを使いますか？
- :heavy_check_mark: メンバーを招待しましょう
    - [Wikiに新しいメンバーを追加・招待する](https://docs.growi.org/ja/admin-guide/management-cookbook/user-management.html#%E6%96%B0%E8%A6%8F%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%81%AE%E4%BB%AE%E7%99%BA%E8%A1%8C)
### :arrow_right: Slackと連携してページやコメントの通知を受け取りましょう
- :heavy_check_mark:  [Slack連携](https://docs.growi.org/ja/admin-guide/management-cookbook/slack-integration/#%E6%A6%82%E8%A6%81)
### :arrow_right: 他のシステムからの乗り換えですか？
- :heavy_check_mark: 他の GROWI、esa. io、Qiita:Team のデータをインポートすることが出来ます
    -  [データのインポート](https://docs.growi.org/ja/admin-guide/management-cookbook/import.html)

さらに詳しくはこちら: [管理者ガイド](https://docs.growi.org/ja/admin-guide/)


# コンテンツリストアップ例

テーブルと `$lsx` を使ってコンテンツリストを表示できます。

| 全てのページリスト (First 15 pages) | [/Sandbox] 配下ページ一覧 |
| ----------------------------------- | ------------------------- |
| $lsx(/,num=15)                      | $lsx(/Sandbox)            |

# Slack

<a href="https://growi-slackin.weseek.co.jp/"><img src="https://growi-slackin.weseek.co.jp/badge.svg"></a>

GROWI をより良いものにするために、是非 Slack に参加してください。  
開発に関する議論を行っている他、導入時の質問等も受け付けています。
