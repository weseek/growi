import sanitize from 'sanitize-filename';

// https://regex101.com/r/fK2rV3/1
const githubReposIdPattern = new RegExp(/^\/([^/]+)\/([^/]+)$/);

export class GitHubUrl {

  private _organizationName: string;

  private _reposName: string;

  private _branchName: string;

  get organizationName(): string {
    return this._organizationName;
  }

  get reposName(): string {
    return this._reposName;
  }

  get branchName(): string {
    return this._branchName;
  }

  get archiveUrl(): string {
    const ghUrl = new URL(`/${this.organizationName}/${this.reposName}/archive/refs/heads/${this.branchName}.zip`, 'https://github.com');
    return ghUrl.toString();
  }

  constructor(url: string, branchName = 'main') {

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

    this._branchName = sanitize(branchName);

    this._organizationName = sanitize(matched[1]);
    this._reposName = sanitize(matched[2]);
  }

}
