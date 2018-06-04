var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , utils = require('../utils.js')
  ;
chai.use(sinonChai);

describe('Page', () => {
  var Page = utils.models.Page,
    User   = utils.models.User,
    UserGroup = utils.models.UserGroup,
    UserGroupRelation = utils.models.UserGroupRelation,
    PageGroupRelation = utils.models.PageGroupRelation,
    conn   = utils.mongoose.connection,
    createdPages,
    createdUsers,
    createdUserGroups;

  before(done => {
    conn.collection('pages').remove().then(() => {
      var userFixture = [
        { name: 'Anon 0', username: 'anonymous0', email: 'anonymous0@example.com' },
        { name: 'Anon 1', username: 'anonymous1', email: 'anonymous1@example.com' },
        { name: 'Anon 2', username: 'anonymous2', email: 'anonymous2@example.com' },
      ];

      return testDBUtil.generateFixture(conn, 'User', userFixture);
    }).then(testUsers => {
      createdUsers = testUsers;
      var testUser0 = testUsers[0];
      var testUser1 = testUsers[1];

      var fixture = [
        {
          path: '/user/anonymous0/memo',
          grant: Page.GRANT_RESTRICTED,
          grantedUsers: [testUser0],
          creator: testUser0
        },
        {
          path: '/grant/public',
          grant: Page.GRANT_PUBLIC,
          grantedUsers: [testUser0],
          creator: testUser0
        },
        {
          path: '/grant/restricted',
          grant: Page.GRANT_RESTRICTED,
          grantedUsers: [testUser0],
          creator: testUser0
        },
        {
          path: '/grant/specified',
          grant: Page.GRANT_SPECIFIED,
          grantedUsers: [testUser0],
          creator: testUser0
        },
        {
          path: '/grant/owner',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser0],
          creator: testUser0,
        },
        {
          path: '/page/for/extended',
          grant: Page.GRANT_PUBLIC,
          creator: testUser0,
          extended: {hoge: 1}
        },
        {
          path: '/grant/groupacl',
          grant: 5,
          grantedUsers: [],
          creator: testUser1,
        },
        {
          path: '/page1',
          grant: Page.GRANT_PUBLIC,
          creator: testUser0,
        },
        {
          path: '/page1/child1',
          grant: Page.GRANT_PUBLIC,
          creator: testUser0,
        },
        {
          path: '/page2',
          grant: Page.GRANT_PUBLIC,
          creator: testUser0,
        },
      ];

      return testDBUtil.generateFixture(conn, 'Page', fixture);
    })
    .then(pages => {
      createdPages = pages;
      groupFixture = [
        {
          image: '',
          name: 'TestGroup0',
        },
        {
          image: '',
          name: 'TestGroup1',
        },
      ];

      return testDBUtil.generateFixture(conn, 'UserGroup', groupFixture);
    })
    .then(userGroups => {
      createdUserGroups = userGroups;
      testGroup0 = createdUserGroups[0];
      testUser0 = createdUsers[0];
      userGroupRelationFixture = [
        {
          relatedGroup: testGroup0,
          relatedUser: testUser0,
        }
      ];
      return testDBUtil.generateFixture(conn, 'UserGroupRelation', userGroupRelationFixture);
    })
    .then(userGroupRelations => {
      testGroup0 = createdUserGroups[0];
      testPage = createdPages[6];
      pageGroupRelationFixture = [
        {
          relatedGroup: testGroup0,
          targetPage: testPage,
        }
      ];

      return testDBUtil.generateFixture(conn, 'PageGroupRelation', pageGroupRelationFixture)
      .then(pageGroupRelations => {
        done();
      });
    });
  });

  describe('.isPublic', () => {
    context('with a public page', () => {
      it('should return true', done => {
        Page.findOne({path: '/grant/public'}, (err, page) => {
          expect(err).to.be.null;
          expect(page.isPublic()).to.be.equal(true);
          done();
        });
      });
    });

    ['restricted', 'specified', 'owner'].forEach(grant => {
      context('with a ' + grant + ' page', () => {
        it('should return false', done => {
          Page.findOne({path: '/grant/' + grant}, (err, page) => {
            expect(err).to.be.null;
            expect(page.isPublic()).to.be.equal(false);
            done();
          });
        });
      });
    });
  });

  describe('.getDeletedPageName', () => {
    it('should return trash page name', () => {
      expect(Page.getDeletedPageName('/hoge')).to.be.equal('/trash/hoge');
      expect(Page.getDeletedPageName('hoge')).to.be.equal('/trash/hoge');
    });
  });
  describe('.getRevertDeletedPageName', () => {
    it('should return reverted trash page name', () => {
      expect(Page.getRevertDeletedPageName('/hoge')).to.be.equal('/hoge');
      expect(Page.getRevertDeletedPageName('/trash/hoge')).to.be.equal('/hoge');
      expect(Page.getRevertDeletedPageName('/trash/hoge/trash')).to.be.equal('/hoge/trash');
    });
  });

  describe('.isDeletableName', () => {
    it('should decide deletable or not', () => {
      expect(Page.isDeletableName('/hoge')).to.be.true;
      expect(Page.isDeletableName('/user/xxx')).to.be.false;
      expect(Page.isDeletableName('/user/xxx123')).to.be.false;
      expect(Page.isDeletableName('/user/xxx/')).to.be.true;
      expect(Page.isDeletableName('/user/xxx/hoge')).to.be.true;
    });
  });

  describe('.isCreatableName', () => {
    it('should decide creatable or not', () => {
      expect(Page.isCreatableName('/hoge')).to.be.true;

      // edge cases
      expect(Page.isCreatableName('/me')).to.be.false;
      expect(Page.isCreatableName('/me/')).to.be.false;
      expect(Page.isCreatableName('/me/x')).to.be.false;
      expect(Page.isCreatableName('/meeting')).to.be.true;
      expect(Page.isCreatableName('/meeting/x')).to.be.true;

      // end with "edit"
      expect(Page.isCreatableName('/meeting/edit')).to.be.false;

      // under score
      expect(Page.isCreatableName('/_')).to.be.true;
      expect(Page.isCreatableName('/_template')).to.be.true;
      expect(Page.isCreatableName('/__template')).to.be.true;
      expect(Page.isCreatableName('/_r/x')).to.be.false;
      expect(Page.isCreatableName('/_api')).to.be.false;
      expect(Page.isCreatableName('/_apix')).to.be.false;
      expect(Page.isCreatableName('/_api/x')).to.be.false;

      expect(Page.isCreatableName('/hoge/xx.md')).to.be.false;

      // start with https?
      expect(Page.isCreatableName('/http://demo.growi.org/hoge')).to.be.false;
      expect(Page.isCreatableName('/https://demo.growi.org/hoge')).to.be.false;
      expect(Page.isCreatableName('http://demo.growi.org/hoge')).to.be.false;
      expect(Page.isCreatableName('https://demo.growi.org/hoge')).to.be.false;

      expect(Page.isCreatableName('/ the / path / with / space')).to.be.false;

      var forbidden = ['installer', 'register', 'login', 'logout', 'admin', 'files', 'trash', 'paste', 'comments'];
      for (var i = 0; i < forbidden.length ; i++) {
        var pn = forbidden[i];
        expect(Page.isCreatableName('/' + pn + '')).to.be.false;
        expect(Page.isCreatableName('/' + pn + '/')).to.be.false;
        expect(Page.isCreatableName('/' + pn + '/abc')).to.be.false;
      }

    });
  });

  describe('.isCreator', () => {
    context('with creator', () => {
      it('should return true', done => {
        User.findOne({email: 'anonymous0@example.com'}, (err, user) => {
          if (err) { done(err); }

          Page.findOne({path: '/user/anonymous0/memo'}, (err, page) => {
            expect(page.isCreator(user)).to.be.equal(true);
            done();
          })
        });
      });
    });

    context('with non-creator', () => {
      it('should return false', done => {
        User.findOne({email: 'anonymous1@example.com'}, (err, user) => {
          if (err) { done(err); }

          Page.findOne({path: '/user/anonymous0/memo'}, (err, page) => {
            expect(page.isCreator(user)).to.be.equal(false);
            done();
          })
        });
      });
    });
  });

  describe('.isGrantedFor', () => {
    context('with a granted user', () => {
      it('should return true', done => {
        User.findOne({email: 'anonymous0@example.com'}, (err, user) => {
          if (err) { done(err); }

          Page.findOne({path: '/user/anonymous0/memo'}, (err, page) => {
            if (err) { done(err); }

            expect(page.isGrantedFor(user)).to.be.equal(true);
            done();
          });
        });
      });
    });

    context('with a public page', () => {
      it('should return true', done => {
        User.findOne({email: 'anonymous1@example.com'}, (err, user) => {
          if (err) { done(err); }

          Page.findOne({path: '/grant/public'}, (err, page) => {
            if (err) { done(err); }

            expect(page.isGrantedFor(user)).to.be.equal(true);
            done();
          });
        });
      });
    });

    context('with a restricted page and an user who has no grant', () => {
      it('should return false', done => {
        User.findOne({email: 'anonymous1@example.com'}, (err, user) => {
          if (err) { done(err); }

          Page.findOne({path: '/grant/restricted'}, (err, page) => {
            if (err) { done(err); }

            expect(page.isGrantedFor(user)).to.be.equal(false);
            done();
          });
        });
      });
    });
  });

  describe('Extended field', () => {
    context('Slack Channel.', () => {
      it('should be empty', done => {
        Page.findOne({path: '/page/for/extended'}, (err, page) => {
          expect(page.extended.hoge).to.be.equal(1);
          expect(page.getSlackChannel()).to.be.equal('');
          done();
        })
      });

      it('set slack channel and should get it and should keep hoge ', done => {
        Page.findOne({path: '/page/for/extended'}, (err, page) => {
          page.updateSlackChannel('slack-channel1')
          .then(data => {
            Page.findOne({path: '/page/for/extended'}, (err, page) => {
              expect(page.extended.hoge).to.be.equal(1);
              expect(page.getSlackChannel()).to.be.equal('slack-channel1');
              done();
            });
          })
        });
      });

    });
  });

  describe('Normalize path', () => {
    context('Normalize', () => {
      it('should start with slash', done => {
        expect(Page.normalizePath('hoge/fuga')).to.equal('/hoge/fuga');
        done();
      });

      it('should trim spaces of slash', done => {
        expect(Page.normalizePath('/ hoge / fuga')).to.equal('/hoge/fuga');
        done();
      });
    });
  });

  describe('.findPage', () => {
    context('findPageById', () => {
      it('should find page', done => {
        const pageToFind = createdPages[0];
        Page.findPageById(pageToFind._id)
        .then(pageData => {
          expect(pageData.path).to.equal(pageToFind.path);
          done();
        });
      });
    });

    context('findPageByIdAndGrantedUser', () => {
      it('should find page', done => {
        const pageToFind = createdPages[0];
        const grantedUser = createdUsers[0];
        Page.findPageByIdAndGrantedUser(pageToFind._id, grantedUser)
        .then((pageData) => {
          expect(pageData.path).to.equal(pageToFind.path);
          done();
        })
        .catch((err) => {
          done(err);
        });
      });

      it('should error by grant', done => {
        const pageToFind = createdPages[0];
        const grantedUser = createdUsers[1];
        Page.findPageByIdAndGrantedUser(pageToFind._id, grantedUser)
        .then(pageData => {
          done(new Error());
        }).catch(err => {
          expect(err).to.instanceof(Error);
          done();
        });
      });
    });

    context('findPageByIdAndGrantedUser granted userGroup', () => {
      it('should find page', done => {
        const pageToFind = createdPages[6];
        const grantedUser = createdUsers[0];
        Page.findPageByIdAndGrantedUser(pageToFind._id, grantedUser)
        .then(pageData => {
          expect(pageData.path).to.equal(pageToFind.path);
          done();
        })
        .catch((err) => {
          done(err);
        });
      });

      it('should error by grant userGroup', done => {
        const pageToFind = createdPages[6];
        const grantedUser = createdUsers[2];
        Page.findPageByIdAndGrantedUser(pageToFind._id, grantedUser)
          .then(pageData => {
            done(new Error());
          }).catch(err => {
            expect(err).to.instanceof(Error);
            done();
          });
      });
    });
  });

  context('generateQueryToListByStartWith', () => {
    it('should return only /page/', done => {
      const user = createdUsers[0];
      Page.generateQueryToListByStartWith('/page/', user, { isRegExpEscapedFromPath: true })
      .then(pages => {
        // assert length
        expect(pages.length).to.equal(1);
        // assert paths
        const pagePaths = pages.map(page => page.path);
        expect(pagePaths).to.include.members(['/page/for/extended'])
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
    it('should return only /page1/', done => {
      const user = createdUsers[0];
      Page.generateQueryToListByStartWith('/page1/', user, { isRegExpEscapedFromPath: true })
      .then(pages => {
        // assert length
        expect(pages.length).to.equal(2);
        // assert paths
        const pagePaths = pages.map(page => page.path);
        expect(pagePaths).to.include.members(['/page1', '/page1/child1'])
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
    it('should return pages which starts with /page', done => {
      const user = createdUsers[0];
      Page.generateQueryToListByStartWith('/page', user, {})
      .then(pages => {
        // assert length
        expect(pages.length).to.equal(4);
        // assert paths
        const pagePaths = pages.map(page => page.path);
        expect(pagePaths).to.include.members(['/page/for/extended', '/page1', '/page1/child1', '/page2'])
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
    it('should process with regexp', done => {
      const user = createdUsers[0];
      Page.generateQueryToListByStartWith('/page\\d{1}/', user, {})
      .then(pages => {
        // assert length
        expect(pages.length).to.equal(3);
        // assert paths
        const pagePaths = pages.map(page => page.path);
        expect(pagePaths).to.include.members(['/page1', '/page1/child1', '/page2'])
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

});
