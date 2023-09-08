- [English 🇺🇸](./README.md)
  <p align="center">
    <a href="https://growi.org">
      <img src="https://user-images.githubusercontent.com/1638767/38254268-d4476bbe-3793-11e8-964c-8865d690baff.png" width="240px">
    </a>
  </p>
  <p align="center">
    <a href="https://github.com/weseek/growi/releases/latest"><img src="https://img.shields.io/github/release/weseek/growi.svg"></a>
    <a href="https://communityinviter.com/apps/wsgrowi/invite">join our Slack team</a>
  </p>

<p align="center">
  <a href="https://docs.growi.org">ドキュメント</a> / <a href="https://demo.growi.org">デモ</a>
</p>

# GROWI

[![Actions Status](https://github.com/weseek/growi/workflows/Node%20CI/badge.svg)](https://github.com/weseek/growi/actions)
[![docker pulls](https://img.shields.io/docker/pulls/weseek/growi.svg)](https://hub.docker.com/r/weseek/growi/)

|                                                　デモンストレーション                                                 |
| :-------------------------------------------------------------------------------------------------------------------: |
| ![sample image](https://user-images.githubusercontent.com/42988650/70600974-6b29cc80-1c34-11ea-94ef-33c39c6a00dc.gif) |

## 目次

- [機能紹介](#機能紹介)
- [クイックスタート](#クイックスタート)
  - [docker-compose を使ってはじめる](#docker-compose-を使ってはじめる)
  - [Helm (Experimental) でデプロイする](#Helm-Experimental-でデプロイする)
  - [オンプレミス](#オンプレミスではじめる)
- [環境変数](#環境変数)
- [ドキュメント](#ドキュメント)
- [ライセンス](#ライセンス)

# 機能紹介

- **主な機能**
  - マークダウンを使用してページを階層構造で作成することが可能です。 -> [デモサイトで GROWI を体験する](https://docs.growi.org/ja/guide/getting-started/try_growi.html)。
  - [HackMD(CodiMd)](https://hackmd.io/) と連携することで同時多人数編集が可能です。
    - [GROWI Docs: HackMD(CodiMD) 連携](https://docs.growi.org/ja/admin-guide/admin-cookbook/integrate-with-hackmd.html)
  - LDAP / Active Direcotry , OAuth 認証をサポートしています。
  - SAML を用いた Single Sign On が可能です。
  - Slack / Mattermost, IFTTT と連携することが可能です。
  - [GROWI Docs: 機能紹介](https://docs.growi.org/ja/guide/features/page_layout.html)
- **プラグイン**
  - [npm](https://www.npmjs.com/browse/keyword/growi-plugin) または [GitHub](https://github.com/search?q=topic%3Agrowi-plugin) から 便利なプラグインを見つけることができます。
- **[Docker の準備][dockerhub]**
- **[Docker Compose の準備][docker-compose]**
  - [GROWI Docs: 複数の GROWI を起動](https://docs.growi.org/ja/admin-guide/admin-cookbook/multi-app.html)
  - [GROWI Docs: Let's Encrypt による HTTPS 運用](https://docs.growi.org/ja/admin-guide/admin-cookbook/lets-encrypt.html)

# クイックスタート

### docker-compose を使ってはじめる

- [GROWI Docs: docker-compose](https://docs.growi.org/ja/admin-guide/getting-started/docker-compose.html) ([en](https://docs.growi.org/en/admin-guide/getting-started/docker-compose.html)/[ja](https://docs.growi.org/ja/admin-guide/getting-started/docker-compose.html))

### Helm (Experimental) でデプロイする

- [GROWI Helm Chart](https://github.com/weseek/helm-charts/tree/master/charts/growi)

### オンプレミスではじめる

Crowi からの移行は **[こちら](https://docs.growi.org/en/admin-guide/migration-guide/from-crowi-onpremise.html) ([en](https://docs.growi.org/en/admin-guide/migration-guide/from-crowi-onpremise.html)/[ja](https://docs.growi.org/ja/admin-guide/migration-guide/from-crowi-onpremise.html))**。

- [GROWI Docs: Ubuntu Server 上でインストール](https://docs.growi.org/ja/admin-guide/getting-started/ubuntu-server.html)
- [GROWI Docs: CentOS 上でインストール](https://docs.growi.org/ja/admin-guide/getting-started/centos.html)

## 設定

[GROWI Docs: 管理者ガイド](https://docs.growi.org/ja/admin-guide/) ([en](https://docs.growi.org/en/admin-guide/)/[ja](https://docs.growi.org/ja/admin-guide/))をご覧ください。

### 環境変数

[GROWI Docs: 環境変数](https://docs.growi.org/ja/admin-guide/admin-cookbook/env-vars.html) ([en](https://docs.growi.org/en/admin-guide/admin-cookbook/env-vars.html)/[ja](https://docs.growi.org/ja/admin-guide/admin-cookbook/env-vars.html)) をご覧ください。

# 開発環境

## 依存関係

- Node.js v16.x or v18.x
- npm 6.x
- yarn
- [Turborepo](https://turbo.build/repo)
- MongoDB 4.x

### オプションの依存関係

- Redis 3.x
- ElasticSearch 6.x or 7.x (needed when using Full-text search)
  - **注意: 次のプラグインが必要です**
    - [Japanese (kuromoji) Analysis plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-kuromoji.html)
    - [ICU Analysis Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu.html)

## コマンド詳細

| コマンド          | 説明                                                    |
| ------------------| ------------------------------------------------------- |
| `yarn app:build`  | GROWI app クライアントをビルドします。                  |
| `yarn app:server` | GROWI app サーバーを起動します。                        |
| `yarn start`      | `yarn app:build` と `yarn app:server` を呼び出します。  |

詳しくは [GROWI Docs: npm スクリプトリスト](https://docs.growi.org/ja/dev/startup-v5/start-development.html#npm-%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%95%E3%82%9A%E3%83%88%E3%83%AA%E3%82%B9%E3%83%88)をご覧ください。

# ドキュメント

- [GROWI Docs](https://docs.growi.org/)
- [GROWI Developers Wiki](https://dev.growi.org/)

# コントリビューション

## バグがありましたか？

ソースコード上でバグを発見されたら、私たちの GitHub 上の Repository にて Issue を作成していただけると助かります。バグを修正して Pull requests を提出していただけるとさらに助かります。

## 欲しい機能が見あたりませんか？

私たちの GitHub 上の リポジトリに Issue を出して、新しい機能をリクエストすることができます。新機能を実装したい場合も同様に、まずは Issue を提出してください。どのような新機能や変更を提案されるのかを明確にしていただきます。

- **大規模な機能追加につきましては**、Issue を open にした上で、提案された概要を説明していただき、議論できる状態にします。
  議論を積み重ねることで、提案内容を双方向的に実装したい機能を整理することができ、実装の重複を防ぐことにもなります。これによって、GROWI への導入がスムーズになります。

- **小規模な機能追加につきましては**、 Issue を作成し、直接 [Pull requests][pulls] を提出してください。

## GitHub 上での言語について

Issue と Pull requests の作成は英語・日本語どちらでも受け付けています。

## GROWI について話し合いましょう！

質問や提案があれば、私たちの [Slack team](https://communityinviter.com/apps/wsgrowi/invite) にぜひご参加ください。
いつでも、どこでも GROWI について議論しましょう！

# ライセンス

- The MIT License (MIT)
- [ライセンス](https://github.com/weseek/growi/blob/master/LICENSE) と [THIRD-PARTY-NOTICES.md](https://github.com/weseek/growi/blob/master/THIRD-PARTY-NOTICES.md) をご覧ください。

  [crowi]: https://github.com/crowi/crowi
  [growi]: https://github.com/weseek/growi
  [issues]: https://github.com/weseek/growi/issues
  [pulls]: https://github.com/weseek/growi/pulls
  [dockerhub]: https://hub.docker.com/r/weseek/growi
  [docker-compose]: https://github.com/weseek/growi-docker-compose
