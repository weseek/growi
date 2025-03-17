import React from 'react';

import type { UseFormRegisterReturn } from 'react-hook-form';

import { SCOPE } from '../../../interfaces/scope';

const scopes = [
  { id: 'admin', label: 'admin', desc: 'Access admin data' },
  { id: 'user', label: 'user', desc: 'Access user data' },
];

type AccessTokenScopeSelectProps = {
  register: UseFormRegisterReturn<'scopes'>;
};

export const AccessTokenScopeSelect: React.FC<AccessTokenScopeSelectProps> = ({ register }) => {
  return (
    <div className="border rounded">
      <RecursiveScopeList scopeObject={parsePermissions(SCOPE)} register={register} />
    </div>
  );
};

const RecursiveScopeList = ({ scopeObject, register, level = 0 }) => {
  return (
    <>
      {Object.entries(scopeObject).map(([key, value], index) => {
        // string か object かを判定
        const isNestedObject = typeof value === 'object';

        // 階層に応じた offset クラスを動的に付与
        // 例: level=1 なら offset-md-1, level=2 なら offset-md-2,...
        // 大きくなりすぎないように適宜制限をかけてもOK
        const offsetLevel = Math.min(level, 5); // たとえば最大5まで
        const offsetClass = offsetLevel > 0 ? `offset-md-${level}` : '';


        if (isNestedObject) {
          // 子要素がオブジェクト（＝さらにネストされる場合）
          return (
            <div key={key}>
              <div className="my-1 row">
                {(level === 0 || level === 1) && index !== 0 && <hr className="m-0" />}
                {/* チェックボックス + ラベル */}
                <div className={`col-md-5 ${offsetClass}`}>
                  <input
                    className="form-check-input ms-2"
                    type="checkbox"
                    id={key}
                    value={key}
                  />
                  <label className="form-check-label fw-bold ms-2" htmlFor={key}>
                    {key}
                  </label>
                </div>
                <div className={`col-md-4 offset-md-${3 - level}`}>
                  desc
                </div>
              </div>
              <RecursiveScopeList
                scopeObject={value}
                register={register}
                level={level + 1}
              />
            </div>
          );
        }

        // 子要素が単なる文字列(葉ノード)の場合
        return (
          <div key={key} className="row my-1">
            {/* チェックボックス + ラベル */}
            <div className={`col-md-5 ${offsetClass}`}>
              <input
                className="form-check-input ms-2"
                type="checkbox"
                id={value}
                value={value}
                {...register}
              />
              <label className="form-check-label ms-2" htmlFor={value}>
                {value}
              </label>
            </div>

            {/* 説明などをそろえて表示する列 */}
            <div className={`col-md-4 offset-md-${3 - level}`}>
              desc
            </div>
          </div>
        );
      })}
    </>
  );
};


// ------------------------------------------------------------
// 2) 中間ツリーを作る
//    ここで「ALL」というキーがあった場合、サブノードを作らず
//    親に「read:hoge:all」などを直接格納する処理を行う
// ------------------------------------------------------------
function buildMergedTree(permissions: Record<string, any>) {
  const root: Record<string, any> = {};

  function traverse(
      obj: Record<string, any>, // 今見ている階層のオブジェクト
      action: 'read' | 'write', // "read" または "write"
      path: string[], // ["admin","top"] のような階層パス
  ) {
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase(); // 例: "ALL" → "all"

      // value が文字列 ⇒ 葉ノード ("read:user:info" など)
      if (typeof value === 'string') {
        // 「ALL」で、かつ現在 path が空でなければ (=トップレベル以外) 親ノードにマージ
        // ※ 「ADMIN:ALL」などを作らず、親ノードに直接 read/write を入れる
        if (lowerKey === 'all' && path.length > 0) {
          const parentNode = getOrCreateNode(root, path);
          parentNode[action] = value;
        }
        else {
          // 通常はキーに対応するサブノードを作成してセット
          const node = getOrCreateNode(root, path.concat(lowerKey));
          node[action] = value;
        }
      }
      // value がオブジェクト ⇒ 再帰的に下の階層へ
      else if (value && typeof value === 'object') {
        if (lowerKey === 'all' && path.length > 0) {
          // さらに深い階層も "ALL" に続く場合は、そのまま同じ path にマージする
          traverse(value, action, path);
        }
        else {
          traverse(value, action, path.concat(lowerKey));
        }
      }
    }
  }

  // パスに沿ってノードを作成 or 取得
  function getOrCreateNode(base: Record<string, any>, segments: string[]) {
    let curr = base;
    for (const seg of segments) {
      if (!curr[seg]) {
        curr[seg] = {};
      }
      curr = curr[seg];
    }
    return curr;
  }

  // トップレベルにある "READ" / "WRITE" を処理
  for (const [actionKey, subtree] of Object.entries(permissions)) {
    const action = actionKey.toLowerCase() === 'read' ? 'read' : 'write';
    traverse(subtree, action, []);
  }

  return root;
}


// ------------------------------------------------------------
// 3) 中間ツリーを「read:hoge」「write:hoge:xxx」形式に変換
// ------------------------------------------------------------
/**
 * 変換イメージ:
 *  node = {
 *    read: "read:admin:*",
 *    write: "write:admin:*",
 *    top: { read: "read:admin:top", write: "write:admin:top" },
 *    app: { ... }
 *  }
 *  path = "admin"
 *
 *  => 出力: {
 *       "read:admin": "read:admin:*",
 *       "write:admin": "write:admin:*",
 *       "ADMIN:TOP": { "read:admin:top": ..., "write:admin:top": ... },
 *       "ADMIN:APP": { ... }
 *     }
 */
function transformTree(node: Record<string, any>, path: string): Record<string, any> {
  const result: Record<string, any> = {};

  // read / write があれば 「read:パス」 「write:パス」を設定
  if (node.read) {
    result[`read:${path}`] = node.read;
  }
  if (node.write) {
    result[`write:${path}`] = node.write;
  }

  // サブノードはキー名を大文字化して再帰的に処理
  for (const [k, v] of Object.entries(node)) {
    if (k === 'read' || k === 'write') continue;

    const subPath = path ? `${path}:${k}` : k; // 例: path="admin", k="top" → "admin:top"
    const upperKey = `${path ? `${path}:` : ''}${k}`.toUpperCase();
    // 例: "admin:top" → "ADMIN:TOP"

    result[upperKey] = transformTree(v, subPath);
  }

  return result;
}


// ------------------------------------------------------------
// 4) 最終的に parsePermissions でまとめる
// ------------------------------------------------------------
function parsePermissions(permissions: Record<string, any>) {
  // まず中間ツリーを作成
  const merged = buildMergedTree(permissions);

  // トップレベル (all, admin, user, base...) を transform
  const result: Record<string, any> = {};
  for (const [topKey, node] of Object.entries(merged)) {
    const upperKey = topKey.toUpperCase();
    result[upperKey] = transformTree(node, topKey);
  }
  return result;
}
