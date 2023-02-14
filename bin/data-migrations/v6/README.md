# Migration to v6 from v5

> **Warning**
> **Migration in this way is applied only to the latest revision. Past revisions are not applied.**

## Usage
```
git clone https://github.com/weseek/growi
cd growi/bin/data-migrations/v6

NETWORK=growi_devcontainer_default \
MONGO_URI=mongodb://growi_devcontainer_mongo_1/growi \
docker run --rm \
  --network $NETWORK \
  -v "$(pwd)"/src:/opt \
  -w /opt \
  -e MIGRATION_TYPE=v6 \
  mongo:6.0 \
  /bin/mongosh $MONGO_URI migration.js
```

## Variables
| Variable              | Description                                                                    | Default |
| --------------------- | ------------------------------------------------------------------------------ | ------- |
| NETWORK     | Network in docker compose of MongoDB server                                                         | -       |
| MONGO_URI| URI that can connect to MongoDB                                                     | -       |

## Environment variables
### Required

| Variable              | Description                                                                    | Default |
| --------------------- | ------------------------------------------------------------------------------ | ------- |
| MIGRATION_TYPE     | Migrated notation                                                        | -       |

The value of `MIGRATION_TYPE` is one of the following.
- `v6-drawio`: Migration for Draw.io notation only([
reference](https://docs.growi.org/ja/admin-guide/upgrading/60x.html#%E4%BB%95%E6%A7%98%E5%A4%89%E6%9B%B4-draw-io-diagrams-net-%E8%A8%98%E6%B3%95))
- `v6-plantuml`: Migration for PlantUML notation only([
reference](https://docs.growi.org/ja/admin-guide/upgrading/60x.html#%E4%BB%95%E6%A7%98%E5%A4%89%E6%9B%B4-plantuml-%E8%A8%98%E6%B3%95))
- `v6-tsv`: Migration for table notation by TSV only([
reference](https://docs.growi.org/ja/admin-guide/upgrading/60x.html#%E4%BB%95%E6%A7%98%E5%A4%89%E6%9B%B4-csv-tsv-%E3%81%AB%E3%82%88%E3%82%8B%E3%83%86%E3%83%BC%E3%83%95%E3%82%99%E3%83%AB%E6%8F%8F%E7%94%BB%E8%A8%98%E6%B3%95))
- `v6-csv`: Migration for table notation by CSV only([
reference](https://docs.growi.org/ja/admin-guide/upgrading/60x.html#%E4%BB%95%E6%A7%98%E5%A4%89%E6%9B%B4-csv-tsv-%E3%81%AB%E3%82%88%E3%82%8B%E3%83%86%E3%83%BC%E3%83%95%E3%82%99%E3%83%AB%E6%8F%8F%E7%94%BB%E8%A8%98%E6%B3%95))
- `v6-bracketlink`: Migration for only page links within GROWI([
reference](https://docs.growi.org/ja/admin-guide/upgrading/60x.html#%E6%9C%AA%E5%AE%9F%E8%A3%85-%E5%BB%83%E6%AD%A2%E6%A4%9C%E8%A8%8E%E4%B8%AD-growi-%E7%8B%AC%E8%87%AA%E8%A8%98%E6%B3%95%E3%81%AE%E3%83%98%E3%82%9A%E3%83%BC%E3%82%B7%E3%82%99%E3%83%AA%E3%83%B3%E3%82%AF))
- `v6`: Migration for all the above notations
- `custom`: You can define your own processors and apply them to `revision` (see "Advanced" below for details)

### Optional

| Variable              | Description                                                                    | Default |
| --------------------- | ------------------------------------------------------------------------------ | ------- |
| BATCH_SIZE     | Number of revisions to be processed at one time（revision）                                                         | 100       |
| BATCH_INTERVAL| Interval after batch processing（ms）                                                     | 3000       |

※The `BATCH_INTERVAL` is for server load control. If you don't mind the load of the MongoDB, there is no problem to reduce it.

## Advanced

By creating a function in `growi/bin/data-migrations/v6/src/processor.js` that replaces a specific regular expression, you can replace all specific strings in the latest revisions for all pages.

The following function replaces the string `foo` with the string `bar`.

``` javascript
function customProcessor(body) {
  var fooRegExp = /foo/g; // foo regex
  return body.replace(fooRegExp, 'bar'); // replace to bar
}
```

By passing `custom` in the environment variable `MIGRATION_TYPE` and executing it, you can apply the `customProcessor` to all the latest `revisions`.
```
git clone https://github.com/weseek/growi
cd growi/bin/data-migrations/v6

NETWORK=growi_devcontainer_default \
MONGO_URI=mongodb://growi_devcontainer_mongo_1/growi \
docker run --rm \
  --network $NETWORK \
  -v "$(pwd)"/src:/opt \
  -w /opt \
  -e MIGRATION_TYPE=custom \
  mongo:6.0 \
  /bin/mongosh $MONGO_URI migration.js
```