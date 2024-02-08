# typescript-npm-package-template

> Template to kickstart creating a Node.js module using TypeScript and VSCode

Inspired by [node-module-boilerplate](https://github.com/sindresorhus/node-module-boilerplate)

## Features

- [Semantic Release](https://github.com/semantic-release/semantic-release)
- [Issue Templates](https://github.com/BorneRecharge/advenir-ts-client/tree/main/.github/ISSUE_TEMPLATE)
- [GitHub Actions](https://github.com/BorneRecharge/advenir-ts-client/tree/main/.github/workflows)
- [Codecov](https://about.codecov.io/)
- [VSCode Launch Configurations](https://github.com/BorneRecharge/advenir-ts-client/blob/main/.vscode/launch.json)
- [TypeScript](https://www.typescriptlang.org/)
- [Husky](https://github.com/typicode/husky)
- [Lint Staged](https://github.com/okonet/lint-staged)
- [Commitizen](https://github.com/search?q=commitizen)
- [Jest](https://jestjs.io/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## Getting started

### Add NPM Token

Add your npm token to your GitHub repository secrets as `NPM_TOKEN`.

**Remove everything from here and above**

---

# advenir-ts-client

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> A client to send EV charging sessions to the French organization [Advenir](https://advenir.mobi/)

## Install

```bash
npm install @bornerecharge/advenir-ts-client
```

## Usage

```ts
import { myPackage } from 'my-package-name';

myPackage('hello');
//=> 'hello from my package'
```

## API

### myPackage(input, options?)

#### input

Type: `string`

Lorem ipsum.

#### options

Type: `object`

##### postfix

Type: `string`
Default: `rainbows`

Lorem ipsum.

[build-img]:https://github.com/BorneRecharge/advenir-ts-client/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/BorneRecharge/advenir-ts-client/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/@bornerecharge/advenir-ts-client
[downloads-url]:https://www.npmtrends.com/@bornerecharge/advenir-ts-client
[npm-img]:https://img.shields.io/npm/v/@bornerecharge/advenir-ts-client
[npm-url]:https://www.npmjs.com/package/@bornerecharge/advenir-ts-client
[issues-img]:https://img.shields.io/github/issues/BorneRecharge/advenir-ts-client
[issues-url]:https://github.com/BorneRecharge/advenir-ts-client/issues
[codecov-img]:https://codecov.io/gh/BorneRecharge/advenir-ts-client/branch/main/graph/badge.svg
[codecov-url]:https://codecov.io/gh/BorneRecharge/advenir-ts-client
[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]:http://commitizen.github.io/cz-cli/
