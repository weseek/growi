
/* eslint-disable no-undef, no-var, vars-on-top, no-restricted-globals, regex/invalid, import/extensions */
// ignore lint error because this file is js as mongoshell

var pagesCollection = db.getCollection('pages');
var revisionsCollection = db.getCollection('revisions');

var getProcessorArray = require('./processor.js');

var migrationType = process.env.MIGRATION_TYPE;
var processors = getProcessorArray(migrationType);

var operations = [];

var batchSize = process.env.BATCH_SIZE ?? 100; // default 100 revisions in 1 bulkwrite
var batchSizeInterval = process.env.BATCH_INTERVAL ?? 3000; // default 3 sec

// ===========================================
// replace method with processors
// ===========================================
function replaceLatestRevisions(body, processors) {
  var replacedBody = body;
  processors.forEach((processor) => {
    replacedBody = processor(replacedBody);
  });
  return replacedBody;
}

if (processors.length === 0) {
  throw Error('No valid processors found. Please enter a valid environment variable');
}

pagesCollection.find({}).forEach((doc) => {
  if (doc.revision) {
    var revision = revisionsCollection.findOne({ _id: doc.revision });
    var replacedBody = replaceLatestRevisions(revision.body, [...processors]);
    var operation = {
      updateOne: {
        filter: { _id: revision._id },
        update: {
          $set: { body: replacedBody },
        },
      },
    };
    operations.push(operation);

    // bulkWrite per 100 revisions
    if (operations.length > (batchSize - 1)) {
      revisionsCollection.bulkWrite(operations);
      // sleep time can be set from env var
      sleep(batchSizeInterval);
      operations = [];
    }
  }
});
revisionsCollection.bulkWrite(operations);
print('migration complete!');
