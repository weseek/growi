var oldDrawioRegExp = /:::\s?drawio\n(.+)\n:::/g; // drawioの旧記法
var oldPlantUmlRegExp = /@startuml\n([\s\S]*?)\n@enduml/g; // plantUMLの旧記法
var oldTsvTableRegExp = /::: tsv(-h)?\n([\s\S]*?)\n:::/g; // TSVによるテーブル描画の旧記法
var oldCsvTableRegExp = /::: csv(-h)?\n([\s\S]*?)\n:::/g; // CSVによるテーブル描画の旧記法

function replaceBody(body) {
  const drawioReplaced = body.replace(oldDrawioRegExp, '```drawio\n$1\n```');
  const plantUmlReplaced = drawioReplaced.replace(oldPlantUmlRegExp, '``` plantuml\n$1\n```');
  const tsvReplaced = plantUmlReplaced.replace(oldTsvTableRegExp, '``` tsv$1\n$2\n```');
  const csvReplaced = tsvReplaced.replace(oldCsvTableRegExp, '``` csv$1\n$2\n```');
  return csvReplaced;
}

var pagesCollection = db.getCollection("pages");
var revisionIds = [];

// 各ページの最新のrevisionを取得(最新revisionしか記法のマイグレーションをしない)
pagesCollection.find({}).forEach((doc) => {
    if (doc.revision != undefined) {
        revisionIds.push(doc.revision);
    }
});

var revisionsCollection = db.getCollection("revisions");
var operations = [];

revisionsCollection.find({ _id: { $in: revisionIds } }).forEach((doc) => {
    var replacedBody = replaceBody(doc.body);
    var operation = {
        updateOne: {
            filter: {_id: doc._id},
            update: {
                $set: { body: replacedBody }
         }
        }
    };
    operations.push(operation);

    // revision 100毎にbulkWriteを実行
    if (operations.length > 99) {
        revisionsCollection.bulkWrite(operations);
        // sleep時間は環境変数で設定できるようにする
        sleep(5);
        operations = []
    }
})
revisionsCollection.bulkWrite(operations);
