CHANGES
========

## 1.5.2

*

## 1.5.1

* Fix: Broken corwi.min.js (thank you @Bakudankun #135)
* Fix: Use id permalink instead of the page path on notify to Slack.
* And some fixes and updates. (Thank you: @kzbandai @chuganzy)

## 1.5.0

* Feature: Search.
* Feature: CSRF protection.
* Feature: Page deletion.
* Feature: Emoji.
* Feature: TSV parser for code block.
* Feature: Page teamplte builder.
* Feature: Preview scroll sync.
* Improve: Page header highlighting.
* Improve: Changed icons and colors of for popular pages on page list.
* Improve: New page dialog.
* Fix: Couldn't create some page name like `/meeting` (Thank you @kazsw #100).
* Removed Feature: Facebook login feature is now removed.
* And some fixes. (Thank you @suzuki @xcezx)

## 1.4.0

* Feature: Slack integration.
* Feature: Page comment.
* Feature: User page.
* Feature: User bookmark page and created pages list.
* Feature: Portal for list.
* Feature: History diff (Thank you: @suzuki #65).
* Feature: Image uploader for local server (Thank you: @riaf ).
* Improve: List view styles.
* Improve: Paste handler with `> ` line (Thank you: @suzuki #57).
* Fix: Google Apps cliendId validation (Thank you: @suzutan #72).
* Fix: Bug of detecting prefix of the path on list view.
* And some fixes. (Thank you: @yuya-takeyama @takahashim)
* Library Update: now Crowi doesn't depends on bower.

## 1.3.1

* Fix: Logic of checking uploadable was broken.
* Fix: Creatable page name (Thank you: @riaf #42, Reported #33).
* Fix: Warning on uploading with create page.
* Fix: Error on uploading user profile image.

## 1.3.0

* Feature: Image uploader.
* Feature: Textarea editor (Thank you: @suzuki #38).
* Feature: Register API Token for user and added `pages.get` api (Experimental).
* Improve: Design on full-screen editor.
* Fix: Library version (mongoose-paginator is now fixed its version).
* Add unit test for user model.
* Library Update: node.js 4.2.x, npm 3.3.x and so far.

## 1.2.0

* Re-writed application structure.
* Add unit test for page model. (Thank you: @shinnya)

## 1.1.3

* Fix: Error occured on editting when the path includes multibyte string. (Thanks @shinnya)
* Added .gigignore to keep tmp/googlecache dir

## 1.1.2

* Feature: Add one-click button to create today's memo on  header (Thanks @fivestar).
* Fix: Fixize version of dependent libraries. (Thanks @shinnya)
* Fix: Google Project OAuth is working now (Thanks @yudoufu).
* Fix: Disabled auto-highlight because of the slow of the language detection.
* Change: Now `.` included `username` are allowed.
* Remove documentation from this repository. See [GitHub Wiki](https://github.com/crowi/crowi/wiki) instead. (Thanks @shinnya)
* And some fixes. (Thank you: @suzuki @yudoufu @fivestar @shinnya)

## 1.1.1

* Fix: Error on accessing restricted page.
* Fix: JS Error when section title includes colon.
* Fix: Typo on Facebook setting page (Facebook setting is now available).
* Fix and Feature: Add creator property to Page Object and show creator info in sidebar instead of last update user.

## 1.1.0

* Feature: Use redis for session store!
* Feature: Mail setting and added send mail module.
* Feature: User invitation.
* Feature: Activate invited user self (admin).
* Feature: Activate registered user (admin / using RESTRICTED mode).
* Feature: User suspend (admin).
* Feature: User delete (admin).
* Improve: Wiki style improved.
* Improve: Update favicon (high resolution).
* Fix: Affix header handling.
* Library Update: Bootstrap 3.3.1, Fontawesome 4.2.0, async 0.9.0,

## 1.0.4

* Feature: Basic auth restriction whole pages access.
* Fix: Security registration whitelist is working now.

## 1.0.3

* Initial Release.

