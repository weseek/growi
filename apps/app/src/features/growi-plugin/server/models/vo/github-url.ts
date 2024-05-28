import sanitize from 'sanitize-filename';

// https://regex101.com/r/fK2rV3/1
const githubReposIdPattern = new RegExp(/^\/([^/]+)\/([^/]+)$/);
// https://regex101.com/r/CQjSuz/1
const sanitizeBranchChars = new RegExp(/[^a-zA-Z0-9_.]+/g);

// https://regex101.com/r/f4wj8q/1
// GitHub will return a zip file with the v removed if the tag or branch name is "v + number"
const checkVersionName = new RegExp(/^v[\d]/g);

export class GitHubUrl {

  private _organizationName: string;

  private _reposName: string;

  private _branchName: string;

  private _tagName: string;

  get organizationName(): string {
    return this._organizationName;
  }

  get reposName(): string {
    return this._reposName;
  }

  get branchName(): string {
    return this._branchName;
  }

  get tagName(): string {
    return this._tagName;
  }

  get archiveUrl(): string {
    const encodedBranchName = encodeURIComponent(this.branchName);
    const encodedTagName = encodeURIComponent(this.tagName);
    if (encodedTagName !== '') {
      const ghUrl = new URL(`/${this.organizationName}/${this.reposName}/archive/refs/tags/${encodedTagName}.zip`, 'https://github.com');
      return ghUrl.toString();
    }

    const ghUrl = new URL(`/${this.organizationName}/${this.reposName}/archive/refs/heads/${encodedBranchName}.zip`, 'https://github.com');
    return ghUrl.toString();

  }

  get extractedArchiveDirName(): string {
    if (this._tagName !== '') {
      const tagName = this._tagName?.match(checkVersionName) ? this._tagName.replace('v', '') : this._tagName;
      return tagName.replaceAll(sanitizeBranchChars, '-');
    }
    const branchName = this._branchName?.match(checkVersionName) ? this._branchName.replace('v', '') : this._branchName;
    return branchName.replaceAll(sanitizeBranchChars, '-');
  }

  constructor(url: string, branchName = 'main', tagName = '') {

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
