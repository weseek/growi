import { Container } from 'unstated';

/**
 * Service container for personal settings page (PageHistory.jsx)
 * @extends {Container} unstated Container
 */
export default class PageHistoryContainer extends Container {

  constructor(appContainer, pageContainer) {
    super();

    this.appContainer = appContainer;
    this.pageContainer = pageContainer;

    this.dummyRevisions = 0;

    this.state = {
      retrieveError: null,

      // set dummy rivisions for using suspense
      revisions: this.dummyRevisions,
      diffOpened: {},
    };

    this.retrieveRevisions = this.retrieveRevisions.bind(this);
    this.onDiffOpenClicked = this.onDiffOpenClicked.bind(this);
    this.getPreviousRevision = this.getPreviousRevision.bind(this);
    this.fetchPageRevisionBody = this.fetchPageRevisionBody.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'PageHistoryContainer';
  }

  async retrieveRevisions() {
    const { pageId, shareLinkId } = this.pageContainer.state;

    if (!pageId) {
      return;
    }

    const res = await this.appContainer.apiv3Get('/revisions/list', { pageId, share_link_id: shareLinkId });
    const rev = res.data.revisions;
    const diffOpened = {};
    const lastId = rev.length - 1;

    res.data.revisions.forEach((revision, i) => {
      const user = revision.author;
      if (user) {
        rev[i].author = user;
      }

      if (i === 0 || i === lastId) {
        diffOpened[revision._id] = true;
      }
      else {
        diffOpened[revision._id] = false;
      }
    });

    this.setState({ revisions: rev });
    this.setState({ diffOpened });

    // load 0, and last default
    if (rev[0]) {
      this.fetchPageRevisionBody(rev[0]);
    }
    if (rev[1]) {
      this.fetchPageRevisionBody(rev[1]);
    }
    if (lastId !== 0 && lastId !== 1 && rev[lastId]) {
      this.fetchPageRevisionBody(rev[lastId]);
    }

    return;
  }

  onDiffOpenClicked(revision) {
    const { diffOpened } = this.state;
    const revisionId = revision._id;

    diffOpened[revisionId] = !(diffOpened[revisionId]);
    this.setState(diffOpened);

    this.fetchPageRevisionBody(revision);
    this.fetchPageRevisionBody(this.getPreviousRevision(revision));
  }

  getPreviousRevision(currentRevision) {
    let cursor = null;
    for (const revision of this.state.revisions) {
      // comparing ObjectId
      // eslint-disable-next-line eqeqeq
      if (cursor && cursor._id == currentRevision._id) {
        cursor = revision;
        break;
      }

      cursor = revision;
    }

    return cursor;
  }

  fetchPageRevisionBody(revision) {
    const { pageId, shareLinkId } = this.pageContainer.state;

    if (revision.body) {
      return;
    }

    // TODO GW-3487 apiV3
    this.appContainer.apiGet('/revisions.get', { page_id: pageId, revision_id: revision._id, share_link_id: shareLinkId })
      .then((res) => {
        if (res.ok) {
          this.setState({
            revisions: this.state.revisions.map((rev) => {
              // comparing ObjectId
              // eslint-disable-next-line eqeqeq
              if (rev._id == res.revision._id) {
                return res.revision;
              }

              return rev;
            }),
          });
        }
      })
      .catch((err) => {

      });
  }


}
