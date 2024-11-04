# What is Sandbox?
- On this page, you will find tips that help you to master GROWI 
- Feel free to enrich the content of your pages with the references under this page hierarchy


# :closed_book: Headings & Paragraphs
- By inserting headings and paragraphs, you can make the text on the page easier to read

## Headers
- Add `#` before the heading text to create a heading 
    - Depending on the number of `#`, the typeface size of headings would be different shown in the View screen 
- The number of `#` will decide the hierarchy level and help you to organize the contents

```markdown
# First-level heading
## Second-level heading
### Third-level heading
#### Forth-level heading
##### Fifth-level heading
###### Sixth-level heading
```

## Break
- Insert two half-width spaces at the end of the sentence you want to break
    - You can also change this in the Setting to break the line without half-width spaces
        - Change the line break setting in the `Markdown Settings` sector of the admin page

#### Example: Without line break
Paragraph 1
Paragraph 2

#### Example: With line break
Paragraph 1  
Paragraph 2

## Block
- Paragraphs can be created by inserting a blank line in the text
- Passage can be broken into sentences and make them easier to read

#### Example: Without paragraph
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

#### Example: With paragraph
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Horizontal lines
- Insert the horizontal line with three or more consecutive asterisks `*` or underscores `_`

#### Example
Below is a horizontal line
***

Below is a horizontal line
___

```markdown
Below is a horizontal line
***

Below is a horizontal line
___
```


# :green_book: Styling Text
- Various styles can be applied to enrich the textual expression of a sentence
    - These styles also can be easily applied by selecting the toolbar icon at the bottom of the Edit screen

## Italic
- Enclose the text with an asterisk `*` or an underscore `_`.

#### Examples
- This sentence indicates emphasis with *Italic*
- This sentence indicates emphasis with _Italic_ 

```markdown
- This sentence indicates emphasis with *Italic*
- This sentence indicates emphasis with _Italic_ 
```

## Bold
- Enclose the text with two asterisks `*` or two underscores `_`

#### Example
- This sentence indicates emphasis with **Bold** 
- This sentence indicates emphasis with __Bold__

```markdown
- This sentence indicates emphasis with **Bold** 
- This sentence indicates emphasis with __Bold__
```

## Italic & Bold
- Enclose the text with three asterisks `*` or three underscores `_`

#### Example
- This sentence indicates emphasis with ***Italic & Bold***
- This sentence indicates emphasis witH ___Italic & Bold___

```markdown
- This sentence indicates emphasis with ***Italic & Bold***
- This sentence indicates emphasis witH ___Italic & Bold___
```

# :orange_book: Insert Lists
## Bulleted List
- Insert a bulleted list by starting a line with a hyphen `-`, a plus `+`, or an asterisk `*`

#### Example
- This sentence is present in the bulleted list
    - This sentence is present in the bulleted list
        - This sentence is present in the bulleted list
        - This sentence is present in the bulleted list
- This sentence is present in the bulleted list
    - This sentence is present in the bulleted list

## Numbered List
- `Number.` at the beginning of a line to insert a numbered list
    - Numbers are automatically assigned

- Numbered list and bulleted list can also be combined for use

#### Example
1. This sentence is present in the numbered list
    1. This sentence is present in the numbered list
    1. This sentence is present in the numbered list
    1. This sentence is present in the numbered list
        - This sentence is present in the bulleted list 
1. This sentence is present in the bulleted list
    - This sentence is present in the bulleted list

## Task List
- Insert an unchecked checkbox list by writing `[] `
    - Check the checkbox by writing `[x]`

#### Example
- [ ] Task 1
    - [x] Task 1-1
    - [ ] Task 1-2
- [x] Task 2


# :blue_book: Link

## Auto link
Just write the URL and the link will be generated automatically.

### Example

https://www.google.co.jp

```markdown
https://www.google.co.jp
```

## Label and link
Insert a link by writing `[label](URL)`

### Example
- [Google](https://www.google.co.jp/)
- [Sandbox is here](/Sandbox)

```markdown
- [Google](https://www.google.co.jp/)
- [Sandbox is here](/Sandbox)
```

## Flexible link syntax

Flexible link syntax make it easy to write a link by page path, a relative page link and link label and URL.

- [[/Sandbox]]
- [[./Math]]
- [[How to write formulas?>./Math]]

```markdown
- [[/Sandbox]]
- [[./Math]]
- [[How to write formulas?>./Math]]
```

# :notebook: Others
## Blockquotes
- Use quoted expressions by putting `>` at the beginning of the paragraph
    - Multiple quotations can be expressed by using a sequence of `>` characters
- Lists and other elements can be used together within the blockquotes

#### Example
> - Quotation
> - Quotation
>> Multiple quotations need to insert more `>`

```markdown
> - Quotation
> - Quotation
>> Multiple quotations need to insert more `>`
```

## Code
- It is possible to express the code by adding it in three `` ` ``

#### Example

```markdown
Add codes here  

Line breaks and paragraphs can be reflected in the code as-is
```

#### Example (source code)

```javascript:mersenne-twister.js
function MersenneTwister(seed) {
  if (arguments.length == 0) {
    seed = new Date().getTime();
  }

  this._mt = new Array(624);
  this.setSeed(seed);
}
```

## Inline Code
- Enclose words in `` ` `` to make inline code

#### Example
Here is the `inline code` 


## Table

### General syntax

#### Example

| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       | This        | This         |
| column     | column      | column       |
| will       | will        | will         |
| be         | be          | be           |
| left       | right       | center       |
| aligned    | aligned     | aligned      |

```markdown
| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       | This        | This         |
| column     | column      | column       |
| will       | will        | will         |
| be         | be          | be           |
| left       | right       | center       |
| aligned    | aligned     | aligned      |
```

### CSV / TSV

#### Example

``` tsv
Content Cell	Content Cell
Content Cell	Content Cell
```

~~~
``` csv
Content Cell,Content Cell
Content Cell,Content Cell
```
~~~

~~~
``` tsv
Content Cell	Content Cell
Content Cell	Content Cell
```
~~~


### CSV / TSV (with header)


#### Example

``` tsv-h
First Header	Second Header
Content Cell	Content Cell
Content Cell	Content Cell
```

~~~
``` csv-h
First Header,Second Header
Content Cell,Content Cell
Content Cell,Content Cell
```
~~~

~~~
``` tsv-h
First Header	Second Header
Content Cell	Content Cell
Content Cell	Content Cell
```
~~~


# :ledger: More Applications
- [Bootstrap](/Sandbox/Bootstrap)

- [Diagrams](/Sandbox/Diagrams)

- [Math](/Sandbox/Math)





