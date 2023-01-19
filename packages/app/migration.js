const { MongoClient } = require('mongodb');

const uri = 'mongodb://mongo:27017/growi';

const regex = /::: drawio\n(.+)\n:::/g;

async function main() {

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db('growi');

    const revision = db.collection('revisions');

    // bodyに旧記法を持つrevisionのcursor
    // const aggrCursor = revision.aggregate(
    //   [
    //     {
    //       $addFields: {
    //         regexResObject: {
    //           $regexFindAll: {
    //             input: '$body',
    //             regex,
    //           },
    //         },
    //       },
    //     },
    //     {
    //       $match: {
    //         regexResObject: {
    //           $ne: [],
    //         },
    //       },
    //     },
    //   ],
    // );

    const aggrCursor = revision.find({ body: { $regex: regex } });

    // console.log('=================変更前のデータ=================');
    // await aggrCursor.forEach(doc => console.log(doc.body));
    // console.log('=================変更前のデータ=================');

    await aggrCursor.forEach((doc) => {
      const newBody = doc.body.replaceAll(regex, '``` drawio\n$1\n```'); // 新記法に置き換え

      // 保存処理
      revision.updateOne({ _id: doc._id }, [{ $set: { body: newBody } }]);
    });

    // console.log('=================変更後のデータ=================');
    // await aggrCursor.forEach(doc => console.log(doc));
    // console.log('=================変更後のデータ=================');

  }
  catch (e) {
    console.error(e);
  }
  finally {
    console.log('finally');
    await client.close();
  }
}

main().catch(console.error);
