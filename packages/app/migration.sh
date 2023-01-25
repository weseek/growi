var oldDrawioRegExp = /:::\s?drawio\n(.+)\n:::/g; // drawio old format
var oldPlantUmlRegExp = /@startuml\n([\s\S]*?)\n@enduml/g; // plantUML old format
var oldTsvTableRegExp = /::: tsv(-h)?\n([\s\S]*?)\n:::/g; // TSV old format
var oldCsvTableRegExp = /::: csv(-h)?\n([\s\S]*?)\n:::/g; // CSV old format

function replaceBody(body) {
  const drawioReplaced = body.replace(oldDrawioRegExp, '``` drawio\n$1\n```');
  const plantUmlReplaced = drawioReplaced.replace(oldPlantUmlRegExp, '``` plantuml\n$1\n```');
  const tsvReplaced = plantUmlReplaced.replace(oldTsvTableRegExp, '``` tsv$1\n$2\n```');
  const csvReplaced = tsvReplaced.replace(oldCsvTableRegExp, '``` csv$1\n$2\n```');
  return csvReplaced;
}

var pagesCollection = db.getCollection("pages");
var revisionIds = [];

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

    // bulkWrite per 100 revisions
    if (operations.length > 99) {
        revisionsCollection.bulkWrite(operations);
        // sleep time can be set from env var
        sleep(5);
        operations = []
    }
})
revisionsCollection.bulkWrite(operations);
