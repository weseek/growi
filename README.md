- [日本語 🇯🇵](./README_JP.md)

<p align="center">
  <a href="https://growi.org">
    <img src="https://user-images.githubusercontent.com/1638767/38254268-d4476bbe-3793-11e8-964c-8865d690baff.png" width="240px">
  </a>
</p>
<p align="center">
  <a href="https://github.com/weseek/growi/releases/latest"><img src="https://img.shields.io/github/release/weseek/growi.svg"></a>
  <a href="https://communityinviter.com/apps/wsgrowi/invite/">join our Slack team</a>
</p>

<p align="center">
  <a href="https://docs.growi.org">Documentation</a> / <a href="https://demo.growi.org">Demo</a>
</p>

# GROWI

[![Actions Status](https://github.com/weseek/growi/workflows/Node%20CI/badge.svg)](https://github.com/weseek/growi/actions)
[![docker pulls](https://img.shields.io/docker/pulls/weseek/growi.svg)](https://hub.docker.com/r/weseek/growi/)

|                                                     demonstration                                                     |
| :-------------------------------------------------------------------------------------------------------------------: |
| ![sample image](https://user-images.githubusercontent.com/42988650/70600974-6b29cc80-1c34-11ea-94ef-33c39c6a00dc.gif) |

## Table Of Contents

- [Features](#features)
- [Quick Start for Production](#quick-start-for-production)
  - [docker-compose](#docker-compose)
  - [Helm (Experimental)](#helm-experimental)
  - [On-premise](#on-premise)
- [Environment Variables](#environment-variables)
- [Documentation](#documentation)
- [License](#license)

# Features

- **Features**
  - Create hierarchical pages with markdown -> [Try GROWI on the demo site](https://docs.growi.org/en/guide/getting-started/try_growi.html)
  - Simultaneously edit with multiple people
  - Support Authentication with LDAP / Active Directory, OAuth
  - SSO(Single Sign On) with SAML
  - Slack/Mattermost, IFTTT Integration
  - [GROWI Docs: Features](https://docs.growi.org/en/guide/features/page_layout.html)
- **Pluggable**
  - You can find plugins from [npm](https://www.npmjs.com/browse/keyword/growi-plugin) or [github](https://github.com/search?q=topic%3Agrowi-plugin)!
- **[Docker Ready][dockerhub]**
- **[Docker Compose Ready][docker-compose]**
  - [GROWI Docs: Multiple sites](https://docs.growi.org/en/admin-guide/admin-cookbook/multi-app.html)
  - [GROWI Docs: HTTPS(with Let's Encrypt) proxy integration](https://docs.growi.org/en/admin-guide/admin-cookbook/lets-encrypt.html)

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

- Node.js v18.x or v20.x
- npm 6.x
- pnpm 9.x
- [Turborepo](https://turbo.build/repo)
- MongoDB 6.0 or above

### Optional Dependencies

- Redis 3.x
- ElasticSearch 7.x or 8.x (needed when using Full-text search)
  - **CAUTION: Following plugins are required**
    - [Japanese (kuromoji) Analysis plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-kuromoji.html)
    - [ICU Analysis Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu.html)

## Command details

| command               | desc                                                    |
| --------------------- | ------------------------------------------------------- |
| `npm run app:build`   | Build GROWI app client                                  |
| `npm run app:server`  | Launch GROWI app server                                 |
| `npm run start`       | Invoke `npm run app:build` and `npm run app:server`     |

For more info, see [GROWI Docs: List of npm Scripts](https://docs.growi.org/en/dev/startup-v5/start-development.html#list-of-npm-scripts).

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

If you have questions or suggestions, you can [join our Slack team](https://communityinviter.com/apps/wsgrowi/invite/) and talk about anything, anytime.

# License

- The MIT License (MIT)
- See [LICENSE](https://github.com/weseek/growi/blob/master/LICENSE) and [THIRD-PARTY-NOTICES.md](https://github.com/weseek/growi/blob/master/THIRD-PARTY-NOTICES.md).

[crowi]: https://github.com/crowi/crowi
[growi]: https://github.com/weseek/growi
[issues]: https://github.com/weseek/growi/issues
[pulls]: https://github.com/weseek/growi/pulls
[dockerhub]: https://hub.docker.com/r/weseek/growi
[docker-compose]: https://github.com/weseek/growi-docker-compose
