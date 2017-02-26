# crowi-plugin-pukiwiki-like-linker
The Crowi Plugin to add PukiwikiLikeLinker

Overview
----------

Add the feature to use `[[alias>./relative/path]]` expression in markdown.

### Replacement examples

When you write at `/Level1/Level2` page:

```html
<!-- Markdown -->
[[./Level3]]
<!-- HTML -->
<a href="/Level1/Level2/Level3">./Level3</a>


<!-- Markdown -->
[[../AnotherLevel2]]
<!-- HTML -->
<a href="/Level1/AnotherLevel2">../AnotherLevel2</a>


<!-- Markdown -->
Level 3 page is [[here>./Level3]]
<!-- HTML -->
Level 3 page is <a href="/Level1/Level2/Level3">here</a>


<!-- Markdown -->
[[example.com>https://example.com/]]
<!-- HTML -->
<a href="https://example.com/">example.com</a>
```

Install
--------

1. install plugin

    ```
    $ npm run install-plugin https://github.com/yuki-takei/crowi-plugin-pukiwiki-like-linker.git
    ```

1. modify `${CROWI_INSTALLED_DIR}/plugin/plugin.js`

   ```
   const plugins = [
     // require('crowi-plugin-pukiwiki-like-linker')
   ]
   ```

1. build plugin (see official documents)
