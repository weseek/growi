# :tada: 欢迎来到GROWI

[![GitHub Releases](https://img.shields.io/github/release/weseek/growi.svg)](https://github.com/weseek/growi/releases/latest)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/weseek/growi/blob/master/LICENSE)

GROWI是一个针对个人和公司的Wiki - 一个知识库工具。
公司、大学实验室和俱乐部的知识可以轻松共享，任何人都可以编辑页面。

我们可以很容易地写下我们知道的东西，并一起编辑，我们可以**简化我们团队中的隐性知识（难以用语言解释的知识）**。 
让我们每天增加信息交流。

### :beginner: 如何轻松制作一个页面 

- 从右上方的 "**创建**"按钮，或右下方的**铅笔图标开始。
    - 页面标题以后可以再编辑，不用担心标题的问题。
        - 在标题输入栏，可以用半宽的`/`（斜线）创建页面的层次。
        - 例子）尝试输入`/category1/category2/page-title-we-want-to-create`。
- 我们可以通过在行首添加`-`来创建一个要点。
- 我们还可以复制和粘贴，拖放附件，如图片、PDF、Word/Excel/PowerPoint等。
- 一旦我们完成了，按 "**更新**"按钮来发布页面。
    - 我们也可以通过`Ctrl(⌘) + S`来保存。

了解更多信息: [Tutorial#Create New Page](https://docs.growi.org/en/guide/tutorial/create_page.html#create-new-page)

<div class="mt-4 card border-primary">
  <div class="card-header bg-primary text-light">
    Tips
  </div>
  <div class="card-body">
    <ul>
      <li>Ctrl(⌘) + "/" 显示快速帮助。</li>
      <li>你可以用 <a href="https://getbootstrap.com/docs/4.6/components/">Bootstrap 4编写HTML</a>.</li>
    </ul>
  </div>
</div>

# :anchor: 对于管理员来说 <small>〜如果你创建了一个Wiki〜</small>

### :arrow_right: 你会和多个人一起使用Wiki吗？
- :heavy_check_mark: 让我们邀请一些成员。
    - [Add/invite new members to the Wiki](https://docs.growi.org/en/admin-guide/management-cookbook/user-management.html#temporary-issuance-of-a-new-user)
### :arrow_right: 与Slack合作，接收页面和评论通知。
- :heavy_check_mark:  [Slack integration](https://docs.growi.org/en/admin-guide/management-cookbook/slack-integration/#overview)
### :arrow_right: 你是否从另一个系统转换？
- :heavy_check_mark: 可以从其他GROWI, esa.io, Qiita:Team导入数据。
    -  [Import Data](https://docs.growi.org/en/admin-guide/management-cookbook/import.html)

了解更多信息: [Admin Guide](https://docs.growi.org/en/admin-guide/)


# 内容列表示例

你可以用一个表格和`$lsx`来显示内容列表。

| 所有页面列表（前15页)      | [/Sandbox] 下级页面列表 |
| ---------------------------| ------------------------|
| $lsx(/,num=15)             | $lsx(/Sandbox)          |

# Slack

<a href="https://growi-slackin.weseek.co.jp/"><img src="https://growi-slackin.weseek.co.jp/badge.svg"></a>

我们欢迎新人加入我们的slack频道，帮助改善Growi。
除了讨论发展问题，我们也很乐意在你加入时回答你的问题。
