# CHANGES

## 3.5.10-RC

* Improvement: Show loading spinner when fetching page history data
* Fix: Code Highlight Theme does not change
    * Introduced by 3.5.2
* Support: Upgrade libs
    * date-fns

## 3.5.9

* Fix: Editing table with Spreadsheet like GUI (Handsontable) is failed
* Fix: Plugins are not initialized when first launching
    * Introduced by 3.5.0
* Support: Upgrade libs
    * entities
    * growi-commons
    * openid-client
    * rimraf
    * style-loader

## 3.5.8

* Improvement: Controls when HackMD/CodiMD has unsaved draft
* Improvement: Show hints if HackMD/CodiMD integration is not working
* Improvement: GROWI server obtains HackMD/CodiMD page id from the 302 response header
* Improvement: Comment Thread Layout
* Improvement: Show commented date with date distance format

## 3.5.7 (Missing number)

## 3.5.6

* Fix: Saving new page is failed when empty string tag is set
* Fix: Link of Create template page button in New Page Modal is broken
* Fix: Global Notification dows not work when creating/moving/deleting/like/comment

## 3.5.5

* Feature: Support S3-compatible object storage (e.g. MinIO)
* Feature: Enable/Disable ID/Password Authentication
* Improvement: Login Mechanism with HTTP Basic Authentication header
* Improvement: Reactify Table Of Contents
* Fix: Profile images are broken in User Management
* Fix: Template page under root page doesn't work
* Support: Upgrade libs
    * csv-to-markdown-table
    * express-validator
    * markdown-it
    * mini-css-extract-plugin
    * react-hotkeys

## 3.5.4

* Fix: List private pages wrongly
* Fix: Global Notification Trigger Path does not parse glob correctly
* Fix: Consecutive page deletion requests cause unexpected complete page deletion

## 3.5.3

* Improvement: Calculate string width when save with Spreadsheet like GUI (Handsontable)
* Fix: Search Result Page doesn't work
* Fix: Create/Update page API returns data includes author's password hash
* Fix: Dropdown to copy page path/URL/MarkdownLink shows under CodeMirror vscrollbar
* Fix: Link to /trash in Dropdown menu

## 3.5.2

* Feature: Remain metadata option when Move/Rename page
* Improvement: Support code highlight for Swift and Kotlin
* Fix: Couldn't restrict page with user group permission
* Fix: Couldn't duplicate a page when it restricted by a user group permission
* Fix: Consider timezone on admin page
* Fix: Editor doesn't work on Microsoft Edge
* Support: Upgrade libs
    * growi-commons

## 3.5.1

### BREAKING CHANGES

* GROWI no longer supports
    * Protection system with Basic Authentication
    * Crowi Classic Authentication Mechanism
    * [Crowi Template syntax](https://medium.com/crowi-book/crowi-v1-5-0-5a62e7c6be90)
* GROWI no lonnger supports plugins with schema version 2
    * Upgrade [weseek/growi-plugin-lsx](https://github.com/weseek/growi-plugin-lsx) to v3.0.0 or above
    * Upgrade [weseek/growi-plugin-pukiwiki-like-linker
](https://github.com/weseek/growi-plugin-pukiwiki-like-linker
) to v3.0.0 or above
* The restriction mode of the root page (`/`) will be set 'Public'
* The restriction mode of the root page (`/`) can not be changed after v 3.5.1

Upgrading Guide: https://docs.growi.org/guide/upgrading/35x.html

### Updates

* Feature: Comment Thread
* Feature: OpenID Connect authentication
* Feature: HTTP Basic authentication
* Feature: Staff Credits with [Konami Code](https://en.wikipedia.org/wiki/Konami_Code)
* Feature: Restricte Complete Deletion of Pages
* Improvement Draft list
* Fix: Deleting page completely
* Fix: Search with `prefix:` param with CJK pathname
* Fix: Could not edit UserGroup even if `PUBLIC_WIKI_ONLY` is not set
* I18n: User Management Details
* I18n: Group Management Details
* Support: Apply unstated
* Support: Use Babel 7
* Support: Support plugins with schema version 3
* Support: Abolish Old Config API
* Support: Apply Jest for Tests
* Support: Upgrade libs
    * async
    * axios
    * connect-mongo
    * css-loader
    * eslint
    * eslint-config-weseek
    * eslint-plugin-import
    * eslint-plugin-jest
    * eslint-plugin-react
    * file-loader
    * googleapis
    * i18next
    * migrate-mongo
    * mini-css-extract-plugin
    * mongoose
    * mongoose-gridfs
    * mongoose-unique-validator
    * null-loader

## 3.5.0 (Missing number)

## 3.4.7

* Improvement: Handle private pages on group deletion
* Fix: Searching with `tag:xxx` syntax doesn't work
* Fix: Check CSRF when updating user data
* Fix: `createdAt` field initialization
* I18n: Import data page
* I18n: Group Management page

## 3.4.6

* Feature: Tags
* Feature: Dropdown to copy page path/URL/MarkdownLink
* Feature: List of drafts
* Improvement: Replace icons of Editor Tool Bar
* Improvement: Show display name when mouse hover to user image
* Fix: URL in slack message is broken on Safari
* Fix: Registration does not work when basic auth is enabled
* Support: Publish API docs with swagger-jsdoc and ReDoc
* Support: Upgrade libs
    * cmd-env
    * elasticsearch
    * mongoose-gridfs
    * node-dev
    * null-loader
    * react-codemirror

## 3.4.5

* Improvement: Pass autolink through the XSS filter according to CommonMark Spec
* Fix: Update ElasticSearch index when deleting/duplicating pages
* Fix: Xss filter breaks PlantUML arrows
* Support: Support growi-plugin-lsx@2.2.0
* Support: Upgrade libs
    * growi-commons
    * xss

## 3.4.4

* Fix: Comment component doesn't work

## 3.4.3

* Improvement: Add 'antarctic' theme
* Support Apply eslint-config-airbnb based rules
* Support Apply prettier and stylelint
* Support: Upgrade libs
    * csrf
    * escape-string-regexp
    * eslint
    * express-session
    * googleapis
    * growi-commons
    * i18next
    * mini-css-extract-plugin
    * nodemailer
    * penpal
    * react-i18next
    * string-width

## 3.4.2

* Fix: Nofitication to Slack doesn't work
    * Introduced by 3.4.0

## 3.4.1

* Fix: "Cannot find module 'stream-to-promise'" occured when build client with `FILE_UPLOAD=local`

## 3.4.0

### BREAKING CHANGES

None.

Upgrading Guide: https://docs.growi.org/guide/upgrading/34x.html

### Updates

* Improvement: Restrict to access attachments when the user is not allowed to see page
* Improvement: Show fans and visitors of page
* Improvement: Full text search tokenizing
* Improvement: Markdown comment on Crowi Classic Layout
* Fix: Profile image is not displayed when `FILE_UPLOAD=mongodb`
* Fix: Posting comment doesn't work under Crowi Classic Layout
    * Introduced by 3.1.5
* Fix: HackMD doesn't work when `siteUrl` ends with slash
* Fix: Ensure not to be able to move/duplicate page to the path which has trailing slash
* Support: Launch with Node.js v10
* Support: Launch with MongoDB 3.6
* Support: Launch with Elasticsearch 6.6
* Support: Upgrade libs
    * bootstrap-sass
    * browser-sync
    * react
    * react-dom


## 3.3.10

* Feature: PlantUML and Blockdiag on presentation
* Improvement: Render slides of presentation with GrowiRenderer
* Fix: Unportalizing doesn't work
* Support: Use mini-css-extract-plugin instead of extract extract-text-webpack-plugin
* Support: Use terser-webpack-plugin instead of uglifyjs-webpack-plugin
* Support: Upgrade libs
    * csv-to-markdown-table
    * file-loader
    * googleapis
    * i18next-browser-languagedetector
    * mocha
    * react-waypoint
    * webpack
    * webpack-assets-manifest
    * webpack-cli
    * webpack-merge

## 3.3.9

* Fix: Import from Qiita:Team doesn't work
    * Introduced by 3.3.0
* Fix: Typeahead shows autocomplete wrongly
    * Introduced by 3.3.8
* Support: Upgrade libs
    * react-bootstrap-typeahead

## 3.3.8

* Fix: Move/Duplicate don't work
    * Introduced by 3.3.7
* Fix: Server doesn't respond when root page is restricted
* Support: Upgrade libs
    * react
    * react-bootstrap-typeahead

## 3.3.7

* Feature: Editor toolbar
* Feature: `prefix:/path` searching syntax to filter with page path prefix
* Feature: Add an option to filter only children to searching box of navbar
* Improvement: Suggest page path when moving/duplicating/searching
* Fix: Anonymous users couldn't search
    * Introduced by 3.3.6
* I18n: Searching help
* Support: Prepare to suppoert Node.js v10
* Support: Upgrade libs
    * node-sass

## 3.3.6

* Improvement: Site URL settings must be set
* Improvement: Site URL settings can be set with environment variable
* Fix: "Anyone with the link" ACL doesn't work correctly
    * Introduced by 3.3.0
* Fix: Related pages list of /admin/user-group-detail/xxx doesn't show anything
    * Introduced by 3.3.0
* Fix: Diff of revision contents doesn't appeared when notifing with slack
* Fix: NPE occured on /admin/security when Crowi Classic Auth Mechanism is set
* Fix: Coudn't render Timing Diagram with PlantUML
* I18n: Cheatsheet for editor
* I18n: Some admin pages
* Support: Upgrade libs
    * diff
    * markdown-it-plantuml
    * mongoose
    * nodemailer
    * mongoose-gridfs
    * sinon
    * sinon-chai

## 3.3.5 (Missing number)

## 3.3.4

* Improvement: SAML configuration with environment variables
* Improvement: Upload file with pasting from clipboard
* Fix: `/_api/revisions.get` doesn't populate author data correctly
* Fix: Wrong OAuth callback url are shown at admin page
* Fix: Connecting to MongoDB failed when processing migration
* Support: Get ready to use new config management system

## 3.3.3

* Feature: Show line numbers to a code block
* Feature: Bulk update the scope of descendant pages when create/update page
* Improvement: The scope of ascendant page will be retrieved and set to controls in advance when creating a new page
* Fix: Pages that is restricted by groups couldn't be shown in search result page
* Fix: Pages order in search result page was wrong
* Fix: Guest user can't search
* Fix: Possibility that ExternalAccount deletion processing selects incorrect data
* Support: Upgrade libs
    * bootstrap-sass
    * i18next
    * migrate-mongo
    * string-width

## 3.3.2

* Fix: Specified Group ACL is not persisted correctly
    * Introduced by 3.3.0

## 3.3.1

* Feature: NO_CDN Mode
* Feature: Add option to show/hide restricted pages in list
* Feature: MongoDB GridFS quota
* Improvement: Refactor Access Control
* Improvement: Checkbox behavior of task list
* Improvement: Fixed search input on search result page
* Improvement: Add 'christmas' theme
* Improvement: Select default language of new users
* Fix: Hide restricted pages contents in timeline
* Support: Upgrade libs
    * googleapis
    * passport-saml

## 3.3.0 (Missing number)

## 3.2.10

* Fix: Pages in trash are available to create
* Fix: Couldn't create portal page under Crowi Classic Behavior
* Fix: Table tag in Timeline/SearchResult missed border and BS3 styles
* I18n: Installer


## 3.2.9

* Feature: Attachment Storing to MongoDB GridFS
* Fix: row/col moving of Spreadsheet like GUI (Handsontable) doesn't work
* Fix: Emoji AutoComplete dialog pops up at wrong position
* Support: Upgrade libs
    * codemirror
    * react-codemirror2

## 3.2.8

* Improvement: Add an option to use email for account link when using SAML federation
* Fix: Editor layout is sometimes broken
* Fix: Normalize table data for Spreadsheet like GUI (Handsontable) when import
* Support: Improve development environment
* Support: Upgrade libs
    * googleapis
    * react-dropzone

## 3.2.7

* Feature: Import CSV/TSV/HTML table on Spreadsheet like GUI (Handsontable)
* Fix: Pasting table data copied from Excel includes unnecessary line breaks
* Fix: Page break Preset 1 for Presentation mode is broken
* Fix: Login Form when LDAP login failed caused 500 Internal Server Error

## 3.2.6

* Feature: Add select alignment buttons of Spreadsheet like GUI (Handsontable)
* Improvement: Shrink the rows that have no diff of revision history page
* Fix: Login form rejects weak password
* Fix: An error occured by uploading attachment file when the page is not exists
    * Introduced by 2.3.5
* Support: Upgrade libs
    * i18next-express-middleware
    * i18next-node-fs-backend
    * i18next-sprintf-postprocessor

## 3.2.5

* Improvement: Expandable Spreadsheet like GUI (Handsontable)
* Improvement: Move/Resize rows/columns of Spreadsheet like GUI (Handsontable)
* Improvement: Prevent XSS of New Page modal
* Fix: Recent Created tab of user home shows wrong page list
    * Introduced by 3.2.4
* Support: Upgrade libs
    * @handsontable/react
    * handsontable
    * metismenu
    * sinon

## 3.2.4

* Feature: Edit table with Spreadsheet like GUI (Handsontable)
* Feature: Paging recent created in users home
* Improvement: Specify certificate for SAML Authentication
* Fix: SAML Authentication didn't work
    * Introduced by 3.2.2
* Fix: Failed to create new page with title which includes RegEx special characters
* Fix: Preventing XSS Settings are not applied in default
    * Introduced by 3.1.12
* Support: Mongoose migration mechanism
* Support: Upgrade libs
    * googleapis
    * mocha
    * mongoose
    * mongoose-paginate
    * mongoose-unique-validator
    * multer

## 3.2.3

* Feature: Kibela like layout
* Improvement: Custom newpage separator for presentation view
* Support: Shrink image size for themes which recently added

## 3.2.2

* Feature: SAML Authentication (SSO)
* Improvement: Add 'wood' theme
* Improvement: Add 'halloween' theme
* Improvement: Add 'island' theme
* Fix: Sending email function doesn't work
* Support Upgrade libs
    * style-loader

## 3.2.1

* Feature: Import data from esa.io
* Feature: Import data from Qiita:Team
* Feature: Add the endpoint for health check
* Improvement: Adjust styles when printing
* Fix: Renaming page doesn't work if the page was saved with shortcut
* Support: Refactor directory structure
* Support Upgrade libs
    * file-loader
    * googleapis
    * postcss-loader
    * sass-loader
    * style-loader

## 3.2.0

* Feature: HackMD integration so that user will be able to simultaneously edit with multiple people
* Feature: Login with Twitter Account (OAuth)
* Fix: The Initial scroll position is wrong when reloading the page

## 3.1.14

* Improvement: Show help for header search box
* Improvement: Add Markdown Cheatsheet to Editor component
* Fix: Couldn't delete page completely from search result page
* Fix: Tabs of trash page are broken

## 3.1.13

* Feature: Global Notification
* Feature: Send Global Notification with E-mail
* Improvement: Add attribute mappings for email to LDAP settings
* Support: Upgrade libs
    * autoprefixer
    * css-loader
    * method-override
    * optimize-css-assets-webpack-plugin
    * react
    * react-bootstrap-typeahead
    * react-dom


## 3.1.12

* Feature: Add XSS Settings
* Feature: Notify to Slack when comment
* Improvement: Prevent XSS in various situations
* Improvement: Show forbidden message when the user accesses to ungranted page
* Improvement: Add overlay styles for pasting file to comment form
* Fix: Omit unnecessary css link
    * Introduced by 3.1.10
* Fix: Invitation mail do not be sent
* Fix: Edit template button on New Page modal doesn't work

## 3.1.11

* Fix: OAuth doesn't work in production because callback URL field cannot be specified
    * Introduced by 3.1.9

## 3.1.10

* Fix: Enter key on react-bootstrap-typeahead doesn't submit
    * Introduced by 3.1.9
* Fix: CodeMirror of `/admin/customize` is broken
    * Introduced by 3.1.9

## 3.1.9

* Feature: Login with Google Account (OAuth)
* Feature: Login with GitHub Account (OAuth)
* Feature: Attach files in Comment
* Improvement: Write comment with CodeMirror Editor
* Improvement: Post comment with `Ctrl-Enter`
* Improvement: Place the commented page at the beginning of the list
* Improvement: Resolve errors on IE11 (Experimental)
* Support: Migrate to webpack 4 
* Support: Upgrade libs
    * eslint
    * react-bootstrap-typeahead
    * react-codemirror2
    * webpack

## 3.1.8 (Missing number)

## 3.1.7

* Fix: Update hidden input 'pageForm[grant]' when save with `Ctrl-S`
* Fix: Show alert message when conflict
* Fix: `BLOCKDIAG_URI` environment variable doesn't work
* Fix: Paste in markdown list doesn't work correctly
* Support: Ensure to inject logger configuration from environment variables
* Support: Upgrade libs
    * sinon
    * sinon-chai

## 3.1.6

* Feature: Support [blockdiag](http://blockdiag.com)
* Feature: Add `BLOCKDIAG_URI` environment variable
* Fix: Select modal for group is not shown 
* Support: Upgrade libs
    * googleapis
    * throttle-debounce

## 3.1.5

* Feature: Write comment with Markdown
* Improvement: Support some placeholders for template page
* Improvement: Omit unnecessary response header
* Improvement: Support LDAP attribute mappings for user's full name
* Improvement: Enable to scroll revision-toc
* Fix: Posting to Slack doesn't work
    * Introduced by 3.1.0
* Fix: page.rename api doesn't work
* Fix: HTML escaped characters in markdown are unescaped unexpectedly after page is saved
* Fix: sanitize `#raw-text-original` content with 'entities'
* Fix: Double newline character posted
    * Introduced by 3.1.4
* Fix: List and Comment components do not displayed
    * Introduced by 3.1.4
* Support: Upgrade libs
    * markdown-it-toc-and-anchor-with-slugid


## 3.1.4 (Missing number)


## 3.1.3 (Missing number)


## 3.1.2

* Feature: Template page
* Improvement: Add 'future' theme
* Improvement: Modify syntax for Crowi compatible template feature
    * *before*
        ~~~
        ``` template:/page/name
        page contents
        ```
        ~~~
    * *after*
        ~~~
        ::: template:/page/name
        page contents
        :::
        ~~~
* Improvement: Escape iframe tag in block codes
* Support: Upgrade libs
    * assets-webpack-plugin
    * googleapis
    * react-clipboard.js
    * xss

## 3.1.1

* Improvement: Add 'blue-night' theme
* Improvement: List up pages which restricted for Group ACL
* Fix: PageGroupRelation didn't remove when page is removed completely


## 3.1.0

* Improvement: Group Access Control List - Select group modal
* Improvement: Better input on mobile
* Improvement: Detach code blocks correctly
* Improvement: Auto-format markdown table which includes multibyte text
* Improvement: Show icon when auto-format markdown table is activated
* Improvement: Enable to switch show/hide border for highlight.js
* Improvement: BindDN field allows also ActiveDirectory styles 
* Improvement: Show LDAP logs when testing login
* Fix: Comment body doesn't break long terms
* Fix: lsx plugin lists up pages that hit by forward match wrongly
    * Introduced by 3.0.4
* Fix: Editor is broken on IE11
* Support: Multilingualize React components with i18next
* Support: Organize dependencies
* Support: Upgrade libs
    * elasticsearch
    * googleapis

## 3.0.13

* Improvement: Add Vim/Emacs/Sublime-Text icons for keybindings menu
* Improvement: Add 'mono-blue' theme
* Fix: Unportalize process failed silently
* Fix: Sidebar breaks editor layouts
* Support: Switch the logger from 'pino' to 'bunyan'
* Support: Set the alias for 'debug' to the debug function of 'bunyan'
* Support: Translate `/admin/security`
* Support: Optimize bundles
    * upgrade 'markdown-it-toc-and-anchor-with-slugid' and omit 'uslug'
* Support: Optimize .eslintrc.js

## 3.0.12

* Feature: Support Vim/Emacs/Sublime-Text keybindings
* Improvement: Add some CodeMirror themes (Eclipse, Dracula)
* Improvement: Dynamic loading for CodeMirror theme files from CDN
* Improvement: Prevent XSS when move/redirect/duplicate

## 3.0.11

* Fix: login.html is broken in iOS
* Fix: Removing attachment is crashed
* Fix: File-attaching error after new page creation
* Support: Optimize development build
* Support: Upgrade libs
    * env-cmd
    * googleapis
    * sinon

## 3.0.10

* Improvement: Add 'nature' theme
* Fix: Page list and Timeline layout for layout-growi
* Fix: Adjust theme colors
    * Introduced by 3.0.9

## 3.0.9

* Fix: Registering new LDAP User is failed
    * Introduced by 3.0.6
* Support: Organize scss for overriding bootstrap variables
* Support: Upgrade libs
    * codemirror
    * react-codemirror2
    * normalize-path
    * style-loader

## 3.0.8

* Improvement: h1#revision-path occupies most of the screen when the page path is long
* Improvement: Ensure not to save concealed email field to localStorage
* Fix: Cannot input "c" and "e" on iOS

## 3.0.7

* Improvement: Enable to download an attached file with original name
* Improvement: Use MongoDB for session store instead of Redis
* Improvement: Update dropzone overlay icons and styles
* Fix: Dropzone overlay elements doesn't show
    * Introduced by 3.0.0
* Fix: Broken page path of timeline
    * Introduced by 3.0.4

## 3.0.6

* Improvement: Automatically bind external accounts newly logged in to local accounts when username match
* Improvement: Simplify configuration for Slack Web API
* Support: Use 'slack-node' instead of '@slack/client'
* Support: Upgrade libs
    * googleapis
    * i18next
    * i18next-express-middleware
    * react-bootstrap-typeahead
    * sass-loader
    * uglifycss

## 3.0.5

* Improvement: Update lsx icons and styles
* Fix: lsx plugins doesn't show page names

## 3.0.4

* Improvement: The option that switch whether add h1 section when create new page
* Improvement: Encode page path that includes special character
* Fix: Page-saving error after new page creation

## 3.0.3

* Fix: Login page is broken in iOS
* Fix: Hide presentation tab if portal page
* Fix: A few checkboxes doesn't work
    * Invite user check with email in `/admin/user`
    * Recursively check in rename modal
    * Redirect check in rename modal
* Fix: Activating invited user form url is wrong
* Support: Use postcss-loader and autoprefixer

## 3.0.2

* Feature: Group Access Control List
* Feature: Add site theme selector
* Feature: Add a control to switch whether email shown or hidden by user
* Feature: Custom title tag content
* Fix: bosai version
* Support: Rename to GROWI
* Support: Add dark theme
* Support: Refreshing bootstrap theme and icons
* Support: Use Browsersync instead of easy-livereload
* Support: Upgrade libs
    * react-bootstrap
    * react-bootstrap-typeahead
    * react-clipboard.js

## 3.0.1 (Missing number)

## 3.0.0 (Missing number)

## 2.4.4

* Feature: Autoformat Markdown Table
* Feature: highlight.js Theme Selector
* Fix: The bug of updating numbering list by codemirror
* Fix: Template LangProcessor doesn't work
    * Introduced by 2.4.0
* Support: Apply ESLint
* Support: Upgrade libs
    * react, react-dom
    * codemirror, react-codemirror2

## 2.4.3

* Improvement: i18n in `/admin`
* Improvement: Add `SESSION_NAME` environment variable
* Fix: All Elements are cleared when the Check All button in DeletionMode
* Support: Upgrade libs
    * uglifycss
    * sinon-chai
    
## 2.4.2

* Improvement: Ensure to set absolute url from root when attaching files when `FILE_UPLOAD=local`
* Fix: Inline code blocks that includes doller sign are broken
* Fix: Comment count is not updated when a comment of the page is deleted
* Improvement: i18n in `/admin` (WIP)
* Support: Upgrade libs
    * googleapis
    * markdown-it-plantuml

## 2.4.1

* Feature: Custom Header HTML
* Improvement: Add highlight.js languages
    * dockerfile, go, gradle, json, less, scss, typescript, yaml
* Fix: Couldn't connect to PLANTUML_URI
    * Introduced by 2.4.0
* Fix: Couldn't render UML which includes CJK
    * Introduced by 2.4.0
* Support: Upgrade libs
    * axios
    * diff2html

## 2.4.0

* Feature: Support Footnotes
* Feature: Support Task lists
* Feature: Support Table with CSV
* Feature: Enable to render UML diagrams with public plantuml.com server
* Feature: Enable to switch whether rendering MathJax in realtime or not
* Improvement: Replace markdown parser with markdown-it
* Improvement: Generate anchor of headers with header strings
* Improvement: Enhanced Scroll Sync on Markdown Editor/Preview
* Improvement: Update `#revision-body` tab contents after saving with `Ctrl-S`
* Fix: 500 Internal Server Error occures when basic-auth configuration is set

## 2.3.9

* Fix: `Ctrl-/` doesn't work on Chrome
* Fix: Close Shortcuts help with `Ctrl-/`, ESC key
* Fix: Jump to last line wrongly when `.revision-head-edit-button` clicked
* Support: Upgrade libs
    * googleapis

## 2.3.8

* Feature: Suggest page path when creating pages
* Improvement: Prevent keyboard shortcuts when modal is opened
* Improvement: PageHistory UI
* Improvement: Ensure to scroll when edit button of section clicked
* Improvement: Enabled to toggle the style for active line
* Support: Upgrade libs
    * style-loader
    * react-codemirror2

## 2.3.7

* Fix: Open popups when `Ctrl+C` pressed
    * Introduced by 2.3.5

## 2.3.6

* Feature: Theme Selector for Editor
* Improvement: Remove unportalize button from crowi-plus layout
* Fix: CSS for admin pages
* Support: Shrink the size of libraries to include

## 2.3.5

* Feature: Enhanced Editor by CodeMirror
* Feature: Emoji AutoComplete
* Feature: Add keyboard shortcuts
* Improvement: Attaching file with Dropzone.js
* Improvement: Show shortcuts help with `Ctrl-/`
* Fix: DOMs that has `.alert-info` class don't be displayed
* Support: Switch and upgrade libs
    * 8fold-marked -> marked
    * react-bootstrap
    * googleapis
    * mongoose
    * mongoose-unique-validator
    * etc..

## 2.3.4 (Missing number)

## 2.3.3

* Fix: The XSS Library escapes inline code blocks
    * Degraded by 2.3.0
* Fix: NPE occurs on Elasticsearch when initial access
* Fix: Couldn't invite users(failed to create)

## 2.3.2

* Improvement: Add LDAP group search options

## 2.3.1

* Fix: Blockquote doesn't work
    * Degraded by 2.3.0
* Fix: Couldn't create user with first LDAP logging in

## 2.3.0

* Feature: LDAP Authentication
* Improvement: Prevent XSS
* Fix: node versions couldn't be shown
* Support: Upgrade libs
    * express-pino-logger

## 2.2.4

* Fix: googleapis v23.0.0 lost the function `oauth2Client.setCredentials`
    * Degraded by 2.2.2 updates
* Fix: HeaderSearchBox didn't append 'q=' param when searching
    * Degraded by 2.2.3 updates

## 2.2.3

* Fix: The server responds anything when using passport
    * Degraded by 2.2.2 updates
* Fix: Update `lastLoginAt` when login is success
* Support: Replace moment with date-fns
* Support: Upgrade react-bootstrap-typeahead
* Improvement: Replace emojify.js with emojione

## 2.2.2 (Missing number)

## 2.2.1

* Feature: Duplicate page
* Improve: Ensure that admin users can remove users waiting for approval
* Fix: Modal doesn't work with React v16
* Support: Upgrade React to 16
* Support: Upgrade outdated libs

## 2.2.0

* Support: Merge official Crowi v1.6.3

## 2.1.2

* Improvement: Ensure to prevent suspending own account
* Fix: Ensure to be able to use `.` for username when invited
* Fix: monospace font for `<code></code>`

## 2.1.1

* Fix: The problem that React Modal doesn't work
* Support: Lock some packages(react, react-dom, mongoose)

## 2.1.0

* Feature: Adopt Passport the authentication middleware
* Feature: Selective batch deletion in search result page
* Improvement: Ensure to be able to login with both of username or email
* Fix: The problem that couldn't update user data in /me
* Support: Upgrade outdated libs

## 2.0.9

* Fix: Server is down when a guest user accesses to someone's private pages
* Support: Merge official Crowi (master branch)
* Support: Upgrade outdated libs

## 2.0.8

* Fix: The problem that path including round bracket makes something bad
* Fix: Recursively option processes also unexpedted pages
* Fix: en-US translation

## 2.0.7

* Improvement: Add recursively option for Delete/Move/Putback operation
* Improvement: Comment layout and sort order (crowi-plus Enhanced Layout)

## 2.0.6

* Fix: check whether `$APP_DIR/public/uploads` exists before creating symlink
    * Fixed in weseek/crowi-plus-docker

## 2.0.5

* Improvement: Adjust styles for CodeMirror
* Fix: File upload does not work when using crowi-plus-docker-compose and `FILE_UPLOAD=local` is set  
    * Fixed in weseek/crowi-plus-docker

## 2.0.2 - 2.0.4 (Missing number)

## 2.0.1

* Feature: Custom Script
* Improvement: Adjust layout and styles for admin pages
* Improvement: Record and show last updated date in user list page
* Fix: Ignore Ctrl+(Shift+)Tab when editing (cherry-pick from the official)

## 2.0.0

* Feature: Enabled to integrate with Slack using Incoming Webhooks
* Support: Upgrade all outdated libs

## 1.2.16

* Improvement: Condition for creating portal
* Fix: Couldn't create new page after installation cleanly

## 1.2.15

* Improvement: Optimize cache settings for express server
* Improvement: Add a logo link to the affix header
* Fix: Child pages under `/trash` are not shown when applying crowi-plus Simplified Behavior

## 1.2.14

* Fix: Tabs(`a[data-toggle="tab"][href="#..."]`) push browser history twice
* Fix: `a[href="#edit-form"]` still save history even when disabling pushing states option

## 1.2.13

* Improvement: Enabled to switch whether to push states with History API when tabs changes 
* Fix: Layout of the Not Found page

## 1.2.12 (Missing number)

## 1.2.11

* Improvement: Enabled to open editing form from affix header
* Improvement: Enabled to open editing form from each section headers

## 1.2.10

* Fix: Revise `server:prod:container` script for backward compatibility

## 1.2.9

* Improvement: Enabled to save with <kbd>⌘+S</kbd> on Mac
* Improvement: Adopt the fastest logger 'pino'
* Fix: The problem that can't upload profile image

## 1.2.8

* Fix: The problem that redirect doesn't work when using 'crowi-plus Simplified Behavior'

## 1.2.7 (Missing number)

## 1.2.6

* Fix: The problem that page_list widget doesn't show the picture of revision.author
* Fix: Change implementation of Bootstrap3 toggle switch for admin pages

## 1.2.5

* Feature: crowi-plus Simplified Behavior
    * `/page` and `/page/` both shows the page
    * `/nonexistent_page` shows editing form
    * All pages shows the list of sub pages
* Improvement: Ensure to be able to disable Timeline feature

## 1.2.4

* Fix: Internal Server Error has occurred when a guest user visited the page someone added "liked"

## 1.2.3

* Improvement: Ensure to be able to use Presentation Mode even when not logged in
* Improvement: Presentation Mode on IE11 (Experimental)
* Fix: Broken Presentation Mode

## 1.2.2

* Support: Merge official Crowi (master branch)

## 1.2.1

* Fix: buildIndex error occured when access to installer

## 1.2.0

* Support: Merge official Crowi v1.6.2

## 1.1.12

* Feature: Remove Comment Button

## 1.1.11

* Fix: Omit Comment form from page_list (crowi-plus Enhanced Layout)
* Fix: .search-box is broken on sm/xs screen

## 1.1.10

* Fix: .search-box is broken on sm/xs screen
* Support: Browsable with IE11 (Experimental)

## 1.1.9

* Improvement: Ensure to generate indices of Elasticsearch when installed
* Fix: Specify the version of Bonsai Elasticsearch on Heroku

## 1.1.8

* Fix: Depth of dropdown-menu when `.on-edit`
* Fix: Error occured on saveing with `Ctrl-S`
* Fix: Guest users browsing

## 1.1.7

* Feature: Add option to allow guest users to browse
* Fix: crowi-plus Enhanced Layout

## 1.1.6

* Fix: crowi-plus Enhanced Layout

## 1.1.5

* Fix: crowi-plus Enhanced Layout
* Support: Merge official Crowi v1.6.1 master branch [573144b]

## 1.1.4

* Feature: Ensure to select layout type from Admin Page
* Feature: Add crowi-plus Enhanced Layout

## 1.1.3

* Improvement: Use POSIX-style paths (bollowed crowi/crowi#219 by @Tomasom)

## 1.1.2

* Imprv: Brushup fonts and styles
* Fix: Ensure to specity revision id when saving with `Ctrl-S`

## 1.1.1

* Feature: Save with `Ctrl-S`
* Imprv: Brushup fonts and styles

## 1.1.0

* Support: Merge official Crowi v1.6.1

## 1.0.9

* Feature: Delete user
* Feature: Upload other than images

## 1.0.8

* Feature: Ensure to delete page completely
* Feature: Ensure to delete redirect page
* Fix: https access to Gravatar (this time for sure)

## 1.0.7

* Feature: Keyboard navigation for search box
* Improvement: Intelligent Search

## 1.0.6

* Feature: Copy button that copies page path to clipboard
* Fix: https access to Gravatar
* Fix: server watching crash with `Error: read ECONNRESET` on Google Chrome

## 1.0.5

* Feature: Ensure to use Gravatar for profile image

## 1.0.4

* Improvement: Detach code blocks before preProcess
* Support: Ensure to deploy to Heroku with INSTALL_PLUGINS env
* Support: Ensure to load plugins easily when development

## 1.0.3

* Improvement: Adjust styles

## 1.0.2

* Improvement: For lsx 

## 1.0.1

* Feature: Custom CSS
* Support: Notify build failure to Slask

## 1.0.0

* Feature: Plugin mechanism
* Feature: Switchable LineBreaks ON/OFF from admin page
* Improvement: Exclude Environment-dependency
* Improvement: Enhanced linker
* Support: Add Dockerfile
* Support: Abolish gulp
* Support: LiveReload
* Support: Update libs
