CHANGES
========

## 2.0.8

* Fix: The problem that path including round bracket makes something bad

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

* Fix: Depth of dropdown-menu when '.on-edit'
* Fix: Error occured on saveing with Ctrl+S
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
* Fix: Ensure to specity revision id when saving with Ctrl+S

## 1.1.1

* Feature: Save with Ctrl+S
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
