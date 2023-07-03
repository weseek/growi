# :tada: Welcome to GROWI

[![GitHub Releases](https://img.shields.io/github/release/weseek/growi.svg)](https://github.com/weseek/growi/releases/latest)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/weseek/growi/blob/master/LICENSE)

GROWI is a Wiki for Individuals and Corporations | A knowledge base tool.
Knowledge in companies, university laboratories, and clubs can be easily shared and anyone can edit the page.

We can easily write what we know and edit it together, we can **simplify the tacit knowledge (knowledge which is hard to explain with words) in our team**.  
Let's increase the information exchange everyday.

### :beginner: How to create a page easily 

- Start from "**Create**" button on the upper right, or the **Pencil Icon** on the lower right.
    - The page title can be edited again later, don't worry about the title.
        - On title input field, it's possible to create the page's hierarchy with half-width `/` (slash).
        - （Example）Try entering `/category1/category2/page-title-we-want-to-create`.
- We can create a bullet point by adding `-`  at the beginning of the line.
- We can also copy and paste, drag and drop attachments such as images, PDF, Word/Excel/PowerPoint, etc.
- Once we finished, press the "**Update**" button to publish the page.
    - We can also save it by `Ctrl(⌘) + S`.

For more information: [Tutorial#Create New Page](https://docs.growi.org/en/guide/tutorial/create_page.html#create-new-page)

<div class="mt-4 card border-primary">
  <div class="card-header bg-primary text-light">
    Tips
  </div>
  <div class="card-body">
    <ul>
      <li>Ctrl(⌘) + "/" to show quick help.</li>
      <li>We can write HTML with <a href="https://getbootstrap.com/docs/4.6/components/">Bootstrap 4</a>.</li>
    </ul>
  </div>
</div>

# :anchor: For administrator <small>〜After you construct the site〜</small>

### :arrow_right: Do you will use a Wiki with more than one person?
- :heavy_check_mark: Let's invite some members.
    - [Add/invite new members to the Wiki](https://docs.growi.org/en/admin-guide/management-cookbook/user-management.html#temporary-issuance-of-a-new-user)
### :arrow_right: Work with Slack to receive page and comment notifications.
- :heavy_check_mark:  [Slack integration](https://docs.growi.org/en/admin-guide/management-cookbook/slack-integration/#overview)
### :arrow_right: Are you switching from another system?
- :heavy_check_mark: It's possible to import data from other GROWI, esa.io, Qiita:Team.
    -  [Import Data](https://docs.growi.org/en/admin-guide/management-cookbook/import.html)

For more information: [Admin Guide](https://docs.growi.org/en/admin-guide/)


# Content List Example

We can display the content list using a table and `$lsx`.

| All page list (First 15 pages)      | [/Sandbox] List of subordinate pages |
| ----------------------------------- | ------------------------------------ |
| $lsx(/,num=15)                      | $lsx(/Sandbox)                       |

# Slack

<a href="https://growi-slackin.weseek.co.jp/"><img src="https://growi-slackin.weseek.co.jp/badge.svg"></a>

We welcome newcomers joining our slack channel to help improve GROWI.
In addition to discussing development, we are also happy to answer your questions when you join.
