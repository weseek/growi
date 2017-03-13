class LsxCacheManager {

  static retrieveFromSessionStorage() {
    return JSON.parse(sessionStorage.getItem('lsx-cache')) || {};
  }

}
