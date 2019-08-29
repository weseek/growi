# growi-plugin-attachment-refs

[![dependencies status](https://david-dm.org/weseek/growi-plugin-attachment-refs.svg)](https://david-dm.org/weseek/growi-plugin-attachment-refs)
[![devDependencies Status](https://david-dm.org/weseek/growi-plugin-attachment-refs/dev-status.svg)](https://david-dm.org/weseek/growi-plugin-attachment-refs?type=dev)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)


Install
--------

1. install plugin

    ```bash
    yarn add growi-plugin-attachment-refs
    ```

1. build client app (see official documents)


Usage
------

### `ref` tag

#### Syntax

```
$ref(file.txt)
$ref(file.txt, page=/somewhere/page)
```

#### Output

![here](resource/img/ref_example.png)

#### Options

- **`file`** : File name of reference file (default: the first argument)
- *`page`* : Target page path of reference file (default: current page)

### `refs` tag

#### Syntax

```
$refs(/somewhere/page, regexp=/^file.*\.txt$/)
```

#### Output

![ref_example](resource/img/refs_example.png)

#### Options

- *`page`* : Target page path to search attachments (default: the first argument || current page)
- *`prefix`* : Page prefix to search attachments
- *`depth`* : page depth to search attachments
- *`regexp`* : Regular Expression to retrieve
- *`format`* : File format filtering


### `refimg` tag

#### Syntax

```
$refimg(pict.png, width=50%, alt=Pic)
```

#### Output

```html
<img src="/attachment/xxxxx" width="50%" alt="Pic">
```

#### Options

- **`file`** : File name of reference file (default: the first argument)
- *`width`* : width
- *`height`* : height
- *`max-width`* : max-width
- *`max-height`* : max-height
- *`alt`* : alt text


### `refsimg` tag

#### Syntax

```
$refsimg(/somewhere/page, regexp=/^.*\.png$/, max-width=200)
```

#### Output

```html
<ul>
  <li><img src="/attachment/xxxxx" style="max-width: 200"></li>
  <li><img src="/attachment/yyyyy" style="max-width: 200"></li>
  <li><img src="/attachment/zzzzz" style="max-width: 200"></li>
</ul>
```

#### Options

- *`page`* : Target page path to search attachments (default: the first argument || current page)
- *`prefix`* : Page prefix to search attachments
- *`depth`* : page depth to search attachments
- *`regexp`* : Regular Expression to retrieve
- *`format`* : File format filtering
- *`width`* : width
- *`height`* : height
- *`max-width`* : max-width
- *`max-height`* : max-height


TODO
-----

- [ ] use `findOne` when `prefix` is not specified
- [ ] `depth` option
- [ ] `format` option

[GROWI]: https://github.com/weseek/growi
