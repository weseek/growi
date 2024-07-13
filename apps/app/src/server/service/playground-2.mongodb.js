/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('growi');

// Search for documents in the current collection.
db.getCollection('yjs-writings')
  .find(
    {
      // version: 'v1',
      // docName: '646fd27beff95905ea491a2d',
      // version: 'v1_sv',
      // clock: 0,
      metaKey: 'meta_updatedAt',
      /*
      * Filter
      * fieldA: value or expression
      */
    },
    {
      /*
      * Projection
      * _id: 0, // exclude _id
      * fieldA: 1 // include field
      */
    },
  )
  .sort({
    /*
    * fieldA: 1 // ascending
    * fieldB: -1 // descending
    */
  });
// .explain('executionStats');
