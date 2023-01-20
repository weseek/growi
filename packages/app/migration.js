
const { MongoClient } = require('mongodb');

const uri = 'mongodb://mongo:27017/growi';

const oldDrawioRegExp = /::: drawio\n(.+)\n:::/g; // drawioの旧記法
const oldPlantUmlRegExp = /@startuml\n(.+)\n@enduml/g; // plantUMLの旧記法
const oldTsvTableRegExp = /::: tsv(-h)?\n(.+)\n:::/g; // TSVによるテーブル描画の旧記法
const oldCsvTableRegExp = /::: csv(-h)?\n(.+)\n:::/g; // CSVによるテーブル描画の旧記法

async function main() {

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db('growi');

    const revision = db.collection('revisions');

    // 旧記法を含むrevisionのcursorを取得
    const aggrCursor = revision.find({
      $or: [
        { body: { $regex: oldDrawioRegExp } },
        { body: { $regex: oldPlantUmlRegExp } },
        { body: { $regex: oldTsvTableRegExp } },
        { body: { $regex: oldCsvTableRegExp } },
      ],
    });

    // cursorをイテレートして新記法に置き換える
    await aggrCursor.forEach((doc) => {
      const bodyDrawio = doc.body.replaceAll(oldDrawioRegExp, '``` drawio\n$1\n```'); // drawioを新記法に置き換え
      const bodyPlantUml = bodyDrawio.replaceAll(oldPlantUmlRegExp, '``` plantuml\n$1\n```'); // PlantUMLを新記法に置き換え
      const bodyTsvTable = bodyPlantUml.replaceAll(oldTsvTableRegExp, '``` tsv$1\n$2\n```'); // TSVによるテーブルを新記法に置き換え
      const bodyCsvTable = bodyTsvTable.replaceAll(oldTsvTableRegExp, '``` csv$1\n$2\n```'); // CSVによるテーブルを新記法に置き換え

      // 保存処理
      revision.updateOne({ _id: doc._id }, [{ $set: { body: bodyCsvTable } }]);
    });
  }
  catch (e) {
    console.error(e);
  }
  finally {
    await client.close();
  }
}

main();
