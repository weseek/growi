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
- (TBD) *`format`* : File format filtering


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
$refsimg(prefix=/somewhere, grid=autofill, grid-gap=1px)
```

#### Output

```html
<div><img src="/attachment/xxxxx" style="max-width: 200"></div>
<div><img src="/attachment/yyyyy" style="max-width: 200"></div>
<div><img src="/attachment/zzzzz" style="max-width: 200"></div>
```

#### Options

- *`page`* : Target page path to search attachments (default: the first argument || current page)
- *`prefix`* : Page prefix to search attachments
- *`depth`* : page depth to search attachments
- *`regexp`* : Regular Expression to retrieve
- (TBD) *`format`* : File format filtering
- *`width`* : width
  - e.g. `width=200px`, `width=50%`
- *`height`* : height
  - e.g. `height=100px`
- *`max-width`* : max-width
  - e.g. `max-width=200px`, `max-width=50%`
- *`max-height`* : max-height
  - e.g. `max-height=100px`
- *`display`* : `display` property for image (use `display: block` when undefined)
  - This option is disabled when `grid` option is set.
- *`grid`* : Grid layout settings
  - `autofill` : Grid layout with auto filling with 100px tracks
  - `autofill-2x` : Grid layout with auto filling with 200px tracks
  - `autofill-3x` : Grid layout with auto filling with 300px tracks
  - `autofill-4x` : Grid layout with auto filling with 400px tracks
  - `col-2` : Grid layout with 2 columns
  - `col-3` : Grid layout with 3 columns
  - `col-4` : Grid layout with 4 columns
  - `col-5` : Grid layout with 5 columns
  - `col-6` : Grid layout with 6 columns
- *`grid-gap`* : Grid gap
  - e.g. `grid-gap=1px`
- *`no-carousel`* : Omit carousel function and just show images


### `gallery` tag

#### Syntax

```
$gallery(prefix=/somewhere/page)
```

`gallery` is a Grid Mode Sugar Syntax for `refsimg`.  
This is same to:

```
$refsimg(prefix=/somewhere, grid=col-4, grid-gap=1px)
```

#### Output

```html
<div><img src="/attachment/xxxxx" style="max-width: 200"></div>
<div><img src="/attachment/yyyyy" style="max-width: 200"></div>
<div><img src="/attachment/zzzzz" style="max-width: 200"></div>
```


TODO
-----

- [ ] `format` option

[GROWI]: https://github.com/weseek/growi
