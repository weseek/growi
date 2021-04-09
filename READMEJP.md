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
  <a href="https://docs.growi.org">Documentation</a> / <a href="https://demo.growi.org">Demo</a>
</p>

# GROWI

[![Actions Status](https://github.com/weseek/growi/workflows/Node%20CI/badge.svg)](https://github.com/weseek/growi/actions)
[![dependencies status](https://david-dm.org/weseek/growi.svg)](https://david-dm.org/weseek/growi)
[![devDependencies Status](https://david-dm.org/weseek/growi/dev-status.svg)](https://david-dm.org/weseek/growi?type=dev)
[![docker pulls](https://img.shields.io/docker/pulls/weseek/growi.svg)](https://hub.docker.com/r/weseek/growi/)

|                                                     demonstration                                                     |
| :-------------------------------------------------------------------------------------------------------------------: |
| ![sample image](https://user-images.githubusercontent.com/42988650/70600974-6b29cc80-1c34-11ea-94ef-33c39c6a00dc.gif) |

## 目次

- [特徴](#features)
- [Quick Start for Production](#quick-start-for-production)
  - [docker-compose](#docker-compose)
  - [Helm (Experimental)](#helm-experimental)
  - [On-premise](#on-premise)
- [Environment Variables](#environment-variables)
- [Documentation](#documentation)
- [License](#license)

# 特徴

- **特徴**
  - Create hierarchical pages with markdown -> [HERE](https://docs.growi.org/en/guide/getting-started/five_minutes.html) is 5 minutes tutorial
  - マークダウンを使用してページを階層構造で作成できます。 -> [HERE](https://docs.growi.org/en/guide/getting-started/five_minutes.html) is 5 minutes tutorial
  - Simultaneously edit with multiple people by [HackMD(CodiMD)](https://hackmd.io/) integration
    - [GROWI Docs: HackMD(CodiMD) Integration](https://docs.growi.org/en/admin-guide/admin-cookbook/integrate-with-hackmd.html)
  - HackMD(CodiMd) を統合することで同時多人数編集ができます。
  - Support Authentication with LDAP / Active Directory, OAuth
  - LDAP / Active Direcotry 認証をサポートしています。
  - SSO(Single Sign On) with SAML
  - SAML を用いた Single Sign On が可能です。
  - Slack/Mattermost, IFTTT Integration
  - Slack/Mattermost, IFTTT と連携することができます。
  - [GROWI Docs: Features](https://docs.growi.org/en/guide/features/page_layout.html)
- **Pluggable**
- **プラグイン**
  - You can find plugins from [npm](https://www.npmjs.com/browse/keyword/growi-plugin) or [github](https://github.com/search?q=topic%3Agrowi-plugin)!
  - [npm](https://www.npmjs.com/browse/keyword/growi-plugin) または [github](https://github.com/search?q=topic%3Agrowi-plugin)! から 便利なプラグインを見つけることができます。
- **[Docker Ready][dockerhub]**
- **[Docker の準備][dockerhub]**
- **[Docker Compose Ready][docker-compose]**
- **[Docker Compose の準備][docker-compose]**
  - [GROWI Docs: 複数の GROWI を起動](https://docs.growi.org/en/admin-guide/admin-cookbook/multi-app.html)
  - [GROWI Docs: Let's Encrypt による HTTPS 運用](https://docs.growi.org/en/admin-guide/admin-cookbook/lets-encrypt.html)

# Quick Start for Production

### docker-compose

- [GROWI Docs: Launch with docker-compose](https://docs.growi.org/en/admin-guide/getting-started/docker-compose.html) ([en](https://docs.growi.org/en/admin-guide/getting-started/docker-compose.html)/[ja](https://docs.growi.org/ja/admin-guide/getting-started/docker-compose.html))

### Helm (Experimental)

- [GROWI Helm Chart](https://github.com/weseek/helm-charts/tree/master/charts/growi)

### On-premise

**[Migration Guide from Crowi](https://docs.growi.org/en/admin-guide/migration-guide/from-crowi-onpremise.html) ([en](https://docs.growi.org/en/admin-guide/migration-guide/from-crowi-onpremise.html)/[ja](https://docs.growi.org/ja/admin-guide/migration-guide/from-crowi-onpremise.html))** is here.

- [GROWI Docs: Install on Ubuntu Server](https://docs.growi.org/en/admin-guide/getting-started/ubuntu-server.html)
- [GROWI Docs: Install on CentOS](https://docs.growi.org/en/admin-guide/getting-started/centos.html)

## Configuration

See [GROWI Docs: Admin Guide](https://docs.growi.org/en/admin-guide/) ([en](https://docs.growi.org/en/admin-guide/)/[ja](https://docs.growi.org/ja/admin-guide/)).

### Environment Variables

See [GROWI Docs: Environment Variables](https://docs.growi.org/en/admin-guide/admin-cookbook/env-vars.html) ([en](https://docs.growi.org/en/admin-guide/admin-cookbook/env-vars.html)/[ja](https://docs.growi.org/ja/admin-guide/admin-cookbook/env-vars.html)).

# Development

## Dependencies

- Node.js v12.x or v14.x
- npm 6.x
- yarn
- MongoDB 4.x

See [confirmed versions](https://docs.growi.org/en/dev/startup/dev-env.html#set-up-node-js-environment).

### Optional Dependencies

- Redis 3.x
- ElasticSearch 6.x (needed when using Full-text search)
  - **CAUTION: Following plugins are required**
    - [Japanese (kuromoji) Analysis plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-kuromoji.html)
    - [ICU Analysis Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu.html)

## Command details

| command                | desc                                                    |
| ---------------------- | ------------------------------------------------------- |
| `yarn run build:prod`  | Build the client                                        |
| `yarn run server:prod` | Launch the server                                       |
| `yarn start`           | Invoke `yarn run build:prod` and `yarn run server:prod` |

For more info, see [GROWI Docs: List of npm Commands](https://docs.growi.org/en/dev/startup-v2/launch.html#list-of-npm-commands).

# Documentation

- [GROWI Docs](https://docs.growi.org/)
- [GROWI Developers Wiki (ja)](https://dev.growi.org/)

# Contribution

## Found a Bug?

If you found a bug in the source code, you can help us by
[submitting an issue][issues] to our [GitHub Repository][growi]. Even better, you can
[submit a Pull Request][pulls] with a fix.

## Missing a Feature?

You can _request_ a new feature by [submitting an issue][issues] to our GitHub
Repository. If you would like to _implement_ a new feature, firstly please submit the issue with your proposal to make sure we can confirm it. Please clarify what kind of change you would like to propose.

- For a **Major Feature**, firstly open an issue and outline your proposal so it can be discussed.  
  It also allows us to coordinate better, prevent duplication of work and help you to create the change so it can be successfully accepted into the project.
- **Small Features** can be created and directly [submitted as a Pull Request][pulls].

## Language on GitHub

You can write issues and PRs in English or Japanese.

## Discussion

If you have questions or suggestions, you can [join our Slack team](https://growi-slackin.weseek.co.jp/) and talk about anything, anytime.

# License

- The MIT License (MIT)
- See [LICENSE](https://github.com/weseek/growi/blob/master/LICENSE) and [THIRD-PARTY-NOTICES.md](https://github.com/weseek/growi/blob/master/THIRD-PARTY-NOTICES.md).

[crowi]: https://github.com/crowi/crowi
[growi]: https://github.com/weseek/growi
[issues]: https://github.com/weseek/growi/issues
[pulls]: https://github.com/weseek/growi/pulls
[dockerhub]: https://hub.docker.com/r/weseek/growi
[docker-compose]: https://github.com/weseek/growi-docker-compose
