import sanitize from 'sanitize-filename';

// https://regex101.com/r/fK2rV3/1
const githubReposIdPattern = new RegExp(/^\/([^/]+)\/([^/]+)$/);
// https://regex101.com/r/CQjSuz/1
const sanitizeChars = new RegExp(/[^a-zA-Z1-9_.]+/g);

export class GitHubUrl {

  private _organizationName: string;

  private _reposName: string;

  private _branchName: string;

  private _tagName: string | undefined;

  get organizationName(): string {
    return this._organizationName;
  }

  get reposName(): string {
    return this._reposName;
  }

  get branchName(): string {
    return this._branchName;
  }

  get tagName(): string | undefined {
    return this._tagName;
  }

  get archiveUrl(): string {
    const encodedBranchName = encodeURIComponent(this.branchName);
    const encodedTagName = encodeURIComponent(this.tagName ?? '');
    if (encodedTagName !== '') {
      const ghUrl = new URL(`/${this.organizationName}/${this.reposName}/archive/refs/tags/${encodedTagName}.zip`, 'https://github.com');
      return ghUrl.toString();
    }

    const ghUrl = new URL(`/${this.organizationName}/${this.reposName}/archive/refs/heads/${encodedBranchName}.zip`, 'https://github.com');
    return ghUrl.toString();

  }

  get extractedArchiveDirName(): string {
    if (this._tagName != null) {
      return this._tagName?.replaceAll(sanitizeChars, '-');
    }
    return this._branchName.replaceAll(sanitizeChars, '-');
  }

  constructor(url: string, branchName = 'main', tagName?: string) {

    let matched;
    try {
      const ghUrl = new URL(url);

      matched = ghUrl.pathname.match(githubReposIdPattern);

      if (ghUrl.hostname !== 'github.com' || matched == null) {
        throw new Error();
      }
    }
    catch (err) {
      throw new Error(`The specified URL is invalid. : url='${url}'`);
    }

    this._branchName = branchName;
    this._tagName = tagName;

    this._organizationName = sanitize(matched[1]);
    this._reposName = sanitize(matched[2]);
  }

}
