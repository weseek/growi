# 什么是沙盒？
- 在此页面上，您将找到帮助您掌握 GROWI 的技巧
- 使用此页面层次结构下的参考资料随意丰富页面内容

# :closed_book: 标题和段落
- 通过插入标题和段落，您可以使页面上的文本更易于阅读

## 标题
- 在标题文本前添加 `#` 以创建标题
- 根据 `#` 的数量，标题的字体大小在视图屏幕中显示不同
- `#` 的数量将决定层次结构级别并帮助您组织内容

```markdown
# 第一级标题
## 第二级标题
### 第三级标题
#### 第四级标题
##### 第五级标题
###### 第六级标题
```

## 换行
- 在要换行的句子末尾插入两个半角空格
    - 您也可以在设置中更改此设置以换行而不使用半角空格
        - 更改换行设置在管理页面的“Markdown 设置”部分
        
#### 示例：没有换行
第 1 段
第 2 段

#### 示例：有换行符
第 1 段  
第 2 段

## 块
- 可以通过在文本中插入空行来创建段落
- 可以将段落分成句子，使它们更易于阅读

#### 示例：没有段落
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

#### 示例：用段落
Lorem ipsum dolor sat amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut Labore et dolore magna aliqua。 Ut enim ad minim veniam, quis nostrud exeritation ullamco labouris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur。 Excepteur sint occaecat cupidatat non proident，sunt in culpa qui officia deserunt mollit anim id est laborum。

## 水平线
- 用三个或更多连续的星号 `*` 或下划线 `_` 插入水平线

#### 示例
下面是一条水平线
***
下面是一条水平线
___

```markdown
下面是一条水平线
***
下面是一条水平线
___
```

# :green_book: 文本样式
- 可以应用各种样式来丰富句子的文本表达
    - 也可以通过选择编辑屏幕底部的工具栏图标轻松应用这些样式

## 斜体
- 用星号 `*` 或下划线 `_` 括住文本。

#### 示例
- 本句用 *Italic* 表示强调
- 本句用 _Italic_ 表示强调

```markdown
- 本句用 *Italic* 表示强调
- 本句用 _Italic_ 表示强调
```

## 粗体
- 用两个星号 `*` 或两个下划线 `_` 括住文本

#### 示例
- 本句用 **Bold** 表示强调
- 本句用 __Bold__ 表示强调

```markdown
- 本句用 **Bold** 表示强调
- 本句用 __Bold__ 表示强调
```

## 斜体 & 粗体
- 用三个星号 `*` 或三个下划线 `_` 括住文本

#### 示例
- 本句用 ***Italic & 粗体*** 表示强调
- 本句用 ___Italic & 粗体___ 表示强调

```markdown
-本句使用 ***斜体和粗体*** 表示强调
- 本句使用 ___斜体和粗体___ 表示强调
```

# :orange_book: 插入列表
## 项目符号列表
- 通过在行首使用连字符 `-`、加号 `+` 或星号 `*` 插入项目符号列表

#### 示例
- 本句在项目符号列表中
    - 本句在项目符号列表中
        - 本句在项目符号列表中
        - 本句在项目符号列表中
- 本句在项目符号列表中
    - 本句在项目符号列表中

## 编号列表
- 在行首使用 `Number.` 插入编号列表
- 编号自动分配

- 编号列表和项目符号列表也可组合使用

#### 示例
1. 本句在编号列表中
    1. 本句在编号列表中
    1. 此句子出现在编号列表中
    1. 此句子出现在编号列表中
        - 此句子出现在项目符号列表中
1. 此句子出现在项目符号列表中
    - 此句子出现在项目符号列表中

## 任务列表
- 通过写入 `[] ` 插入未选中的复选框列表
    - 通过写入 `[x]` 选中复选框

#### 示例
- [ ] 任务 1
    - [x] 任务 1-1
    - [ ] 任务 1-2
- [x] 任务 2

# :blue_book: 链接

## 自动链接
只需输入 URL，链接就会自动生成。

### 示例

https://www.google.co.jp

```markdown
https://www.google.co.jp
```

## 标签和链接
通过输入 `[label](URL)` 插入链接

### 示例
- [Google](https://www.google.co.jp/)
- [Sandbox is here](/Sandbox)

```markdown
- [Google](https://www.google.co.jp/)
- [Sandbox is here](/Sandbox)
```

## 灵活的链接语法

灵活的链接语法使通过页面路径、相对页面链接和链接标签和 URL 编写链接变得容易。

- [[/Sandbox]]
- [[./Math]]
- [[如何写公式？>./Math]]

```markdown
- [[/Sandbox]]
- [[./Math]]
- [[如何写公式？>./Math]]
```

# :notebook: 其他
## 区块引用
- 在段落开头放置 `>` 即可使用带引号的表达式
    - 可以使用一系列 `>` 字符来表示多个引号
- 列表和其他元素可以在区块引用中一起使用

#### 示例
> - 引号
> - 引号
>> 多个引号需要插入更多 `>`

```markdown
> - 引号
> - 引号
>> 多个引号需要插入更多 `>`
```

## 代码
- 可以通过在三个 `` ` `` 中添加代码来表示代码

####示例

```markdown
在此处添加代码

换行符和段落可以按原样反映在代码中
```

#### 示例（源代码）

```javascript:mersenne-twister.js
function MersenneTwister(seed) {
if (arguments.length == 0) {
seed = new Date().getTime();
}

this._mt = new Array(624);
this.setSeed(seed);
}
```

## 内联代码
- 将单词括在 `` ` `` 中以制作内联代码

#### 示例
以下是 `内联代码`

## 表格

### 通用语法

#### 示例

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

#### 示例

``` tsv
内容单元格 内容单元格
内容单元格 内容单元格
```

~~~
``` csv
内容单元格,内容单元格
内容单元格,内容单元格
```
~~~

~~~
``` tsv
内容单元格 内容单元格
内容单元格 内容单元格
```
~~~

### CSV / TSV (带标题)

#### 示例

``` tsv-h
第一个标题 第二个标题
内容单元格 内容单元格
内容单元格 内容单元格
```

~~~
``` csv-h
第一个标题,第二个标题
内容单元格,内容单元格
内容单元格,内容单元格
```
~~~

~~~
``` tsv-h
第一个标题 第二个标题
内容单元格 内容单元格
内容单元格 内容单元格
```
~~~

# :ledger: 更多应用
- [Bootstrap](/Sandbox/Bootstrap)

- [Diagrams](/Sandbox/Diagrams)

- [Math](/Sandbox/Math)