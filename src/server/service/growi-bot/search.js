

class SearchService {

  constructor(client) {
    this.client = client;
  }

  search(body, args) {
    console.log(body, args);
  }

}


module.exports = SearchService;
