CHANGES
========

## 1.3.0

* Feature: Image uploader.
* Improve: Design on full-screen editor.
* Fix: Library version (mongoose-paginator is now fixed its version).
* Add unit test for user model.

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

