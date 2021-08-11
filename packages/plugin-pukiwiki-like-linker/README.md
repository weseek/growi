# growi-plugin-pukiwiki-like-linker
[GROWI][growi] Plugin to add PukiwikiLikeLinker

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
