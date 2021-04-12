<p align="center">
  <a href="https://growi.org">
    <img src="https://user-images.githubusercontent.com/1638767/38254268-d4476bbe-3793-11e8-964c-8865d690baff.png" width="240px">
  </a>
</p>
<p align="center">
  <a href="https://github.com/weseek/growi/releases/latest"><img src="https://img.shields.io/github/release/weseek/growi.svg"></a>
  <a href="https://growi-slackin.weseek.co.jp/"><img src="https://growi-slackin.weseek.co.jp/badge.svg"></a>
</p>

<p align="center">
  <a href="https://docs.growi.org">ドキュメント</a> / <a href="https://demo.growi.org">デモ</a>
</p>

# GROWI

[![Actions Status](https://github.com/weseek/growi/workflows/Node%20CI/badge.svg)](https://github.com/weseek/growi/actions)
[![dependencies status](https://david-dm.org/weseek/growi.svg)](https://david-dm.org/weseek/growi)
[![devDependencies Status](https://david-dm.org/weseek/growi/dev-status.svg)](https://david-dm.org/weseek/growi?type=dev)
[![docker pulls](https://img.shields.io/docker/pulls/weseek/growi.svg)](https://hub.docker.com/r/weseek/growi/)

|                                                         デモ                                                          |
| :-------------------------------------------------------------------------------------------------------------------: |
| ![sample image](https://user-images.githubusercontent.com/42988650/70600974-6b29cc80-1c34-11ea-94ef-33c39c6a00dc.gif) |

## 目次

- [機能紹介](#機能紹介)
- [さっそくはじめてみる](#さっそくはじめてみる)
  - [docker-compose を使ってはじめる](#docker-compose-を使ってはじめる)
  - [Helm (Experimental)](#Helm-Experimental-でデプロイする)
  - [オンプレミス](#オンプレミスではじめる)
- [環境変数](#環境変数)
- [ドキュメント](#ドキュメント)
- [ライセンス](#ライセンス)

# 機能紹介

- **機能紹介**
  - マークダウンを使用してページを階層構造で作成できます。 -> 5 分間チュートリアルは[こちら](https://docs.growi.org/en/guide/getting-started/five_minutes.html)
  - HackMD(CodiMd)[https://hackmd.io/] と連携することで同時多人数編集ができます。
    - - [GROWI Docs: HackMD(CodiMD) 連携](https://docs.growi.org/en/admin-guide/admin-cookbook/integrate-with-hackmd.html)
  - LDAP / Active Direcotry , OAuth 認証をサポートしています。
  - SAML を用いた Single Sign On が可能です。
  - Slack/Mattermost, IFTTT と連携することができます。
  - [GROWI Docs: 機能紹介](https://docs.growi.org/en/guide/features/page_layout.html)
- **プラグイン**
  - You can find plugins from [npm](https://www.npmjs.com/browse/keyword/growi-plugin) or [github](https://github.com/search?q=topic%3Agrowi-plugin)!
  - [npm](https://www.npmjs.com/browse/keyword/growi-plugin) または [github](https://github.com/search?q=topic%3Agrowi-plugin)! から 便利なプラグインを見つけることができます。
- **[Docker の準備][dockerhub]**
- **[Docker Compose の準備][docker-compose]**
  - [GROWI Docs: 複数の GROWI を起動](https://docs.growi.org/en/admin-guide/admin-cookbook/multi-app.html)
  - [GROWI Docs: Let's Encrypt による HTTPS 運用](https://docs.growi.org/en/admin-guide/admin-cookbook/lets-encrypt.html)

# さっそくはじめてみる

### docker-compose を使ってはじめる

- [GROWI Docs: Launch with docker-compose](https://docs.growi.org/en/admin-guide/getting-started/docker-compose.html) ([en](https://docs.growi.org/en/admin-guide/getting-started/docker-compose.html)/[ja](https://docs.growi.org/ja/admin-guide/getting-started/docker-compose.html))

### Helm (Experimental) でデプロイする

- [GROWI Helm Chart](https://github.com/weseek/helm-charts/tree/master/charts/growi)

### オンプレミスではじめる

Crowi からの マイグレーションガイドは **[こちら。](https://docs.growi.org/en/admin-guide/migration-guide/from-crowi-onpremise.html) ([en](https://docs.growi.org/en/admin-guide/migration-guide/from-crowi-onpremise.html)/[ja](https://docs.growi.org/ja/admin-guide/migration-guide/from-crowi-onpremise.html))**

- [GROWI Docs: Ubuntu Server 上でインストール](https://docs.growi.org/en/admin-guide/getting-started/ubuntu-server.html)
- [GROWI Docs: CentOS 上でインストール](https://docs.growi.org/en/admin-guide/getting-started/centos.html)

## 設定

See [GROWI Docs: 管理者ガイド](https://docs.growi.org/en/admin-guide/) ([en](https://docs.growi.org/en/admin-guide/)/[ja](https://docs.growi.org/ja/admin-guide/)).

### 環境変数

[GROWI Docs: 環境変数](https://docs.growi.org/en/admin-guide/admin-cookbook/env-vars.html) ([en](https://docs.growi.org/en/admin-guide/admin-cookbook/env-vars.html)/[ja](https://docs.growi.org/ja/admin-guide/admin-cookbook/env-vars.html)) をご覧ください。

# 開発環境

## 依存関係

- Node.js v12.x or v14.x
- npm 6.x
- yarn
- MongoDB 4.x

[確認済みのバージョン](https://docs.growi.org/en/dev/startup/dev-env.html#set-up-node-js-environment) をご覧ください。

### Optional Dependencies

- Redis 3.x
- ElasticSearch 6.x (needed when using Full-text search)
  - **注意: 次のプラグインが必要です**
    - [Japanese (kuromoji) Analysis plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-kuromoji.html)
    - [ICU Analysis Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu.html)

## コマンド詳細

| コマンド               | 説明                                                             |
| ---------------------- | ---------------------------------------------------------------- |
| `yarn run build:prod`  | クライアントをビルドします。                                     |
| `yarn run server:prod` | サーバーを立ち上げます。                                         |
| `yarn start`           | `yarn run build:prod` と `yarn run server:prod` を呼び出します。 |

For more info, see [GROWI Docs: List of npm Commands](https://docs.growi.org/en/dev/startup-v2/launch.html#list-of-npm-commands).

# ドキュメント

- [GROWI Docs](https://docs.growi.org/)
- [GROWI Developers Wiki](https://dev.growi.org/)

# コントリビューション

## バグがありましたか？

もし、ソースコード上でバグを発見したら、GitHub Repository 上で Issue を作成していただけると助かります。バグを修正してプルリクエストを提出していただけるとさらに助かります。

## 機能が足りませんか？

私たちの GitHub 上に Issue を出して新しい機能をリクエストすることができます。もし新機能を実装したい場合、まず、ご提案内容を確認させていただくために、Issue を提出してください。どのような変更を提案されるのかを明確にしていただきます。

You can _request_ a new feature by [submitting an issue][issues] to our GitHub
Repository. If you would like to _implement_ a new feature, firstly please submit the issue with your proposal to make sure we can confirm it. Please clarify what kind of change you would like to propose.

- For a **Major Feature**, firstly open an issue and outline your proposal so it can be discussed.
  大規模な機能追加につきましては、まず Issue を open にした上で、提案された概要を説明し、議論できるようにします。
  It also allows us to coordinate better, prevent duplication of work and help you to create the change so it can be successfully accepted into the project.
  また、より良い調整を行い、作業の重複を防ぐことで、プロジェクトに導入されるように変更を作成することができます

- **小規模の機能追加につきましては** Issue を作成し、直接[プルリクエスト](pulls)を提出してください。

## GitHub 上での言語について

Issue とプルリクエストの作成は英語・日本語どちらでも受け付けています。

## GROWI について話し合いましょう！

もし、質問や提案があれば、私たちの [Slack team](https://growi-slackin.weseek.co.jp/) にぜひご参加ください！
いつでも、どこでも GROWI について議論しましょう！

# ライセンス

- The MIT License (MIT)
- [ライセンス](https://github.com/weseek/growi/blob/master/LICENSE) と[THIRD-PARTY-NOTICES.md](https://github.com/weseek/growi/blob/master/THIRD-PARTY-NOTICES.md) をご覧ください。

  [crowi]: https://github.com/crowi/crowi
  [growi]: https://github.com/weseek/growi
  [issues]: https://github.com/weseek/growi/issues
  [pulls]: https://github.com/weseek/growi/pulls
  [dockerhub]: https://hub.docker.com/r/weseek/growi
  [docker-compose]: https://github.com/weseek/growi-docker-compose
