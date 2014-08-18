CHANGES
========

## 1.0.3

* Feature: Page access control
* Fix: Upgrade twbs and fixed popover problem

## 1.0.2

* Feature: Use SCSS instead of LESS
* Improve: Style of presentation mode

## 1.0.1

* Feature: Printable style
* Fix: Added tmp dir to repository and set cache dir option to googleapi.
* Fix: Responsive styles
* Fix: GitHub linker

## 1.0.0

* Feature: GitHub issue link syntax (`[userOrOrgName/repo#issue]`)
* Feature: User login restriction and E-mail registration
    * User can now update the information themselves
* Feature: Presentation mode (thanks. @riaf)
* Feature: Hide sidebar
* Feature: Upload user picture by themselves
* Improve: styles

### Configurations

* Added `security` section
    * `security.passwordSeed`
    * `security.registrationWhiteList`
    * `security.confidential`
* Added `aws` section
    * `aws.bucket`: S3 bucket
    * `aws.region`: Region
    * `aws.accessKeyId`
    * `aws.secretAccessKey`

### B.C.

* Configuration name changed: `app.confidential` to `security.confidential`


## 0.9.6

* Fix some bugs

## 0.9.5

* Fix: pager
* Improve affix style

## 0.9.4

* Feature: Page conflict check
* Feature: Sticky page header
* Feature: Search on header and popup
* Fix: URL detect with x-forwarded-proto header

## 0.9.3

* Feature: Added link create modal: Easy to create today's memo
* Feature: Generate clickable and copieable link
* Feature: Page rename
* Feature: Help modal
* Fix: Express configuration

## 0.9.2

* Bug Fix: Fatal error on session recover

## 0.9.1

* Update design
* Upgrade dependencies
* Compiling LESS and JS files with Grunt

## 0.2.0

* Use revision schema instead of embedded document
* Show table of contents
* Preview on editting
* Insert 4 space when TAB key pressed on editting


### Migration

* npm install async

run:

    $ node bin/migration/0.0.1-0.0.2-convert_embedded_object_to_schema.js

## 0.1.0

* Initial Release
