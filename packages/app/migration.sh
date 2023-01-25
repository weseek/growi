



function drawioProcessor(body) {
  var oldDrawioRegExp = /:::\s?drawio\n(.+)\n:::/g; // drawio old format
  return body.replace(oldDrawioRegExp, '``` drawio\n$1\n```');
}

function plantumlProcessor(body) {
  var oldPlantUmlRegExp = /@startuml\n([\s\S]*?)\n@enduml/g; // plantUML old format
  return body.replace(oldPlantUmlRegExp, '``` plantuml\n$1\n```');
}

function tsvProcessor(body) {
  var oldTsvTableRegExp = /::: tsv(-h)?\n([\s\S]*?)\n:::/g; // TSV old format
  return body.replace(oldTsvTableRegExp, '``` tsv$1\n$2\n```');
}

function csvProcessor(body) {
  var oldCsvTableRegExp = /::: csv(-h)?\n([\s\S]*?)\n:::/g; // CSV old format
  return body.replace(oldCsvTableRegExp, '``` csv$1\n$2\n```');
}

function replaceLatestRevisions(body, processors) {
  var replacedBody = body;
  processors.forEach((processor) => {
    replacedBody = processor(body)
  })
  return replacedBody;
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
var oldFormatProcessors = [drawioProcessor, plantumlProcessor, tsvProcessor, csvProcessor];

revisionsCollection.find({ _id: { $in: revisionIds } }).forEach((doc) => {
    var replacedBody = replaceLatestRevisions(doc.body, oldFormatProcessors);
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
