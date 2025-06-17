# GROWI エディターアシスタント改修計画

## 📋 概要

現在のGROWIエディターアシスタントをroo-codeの方式に倣って再実装する改修計画。

### 目的
- **精度向上**: Search/Replace方式による正確な編集
- **安全性向上**: Fuzzy matchingによる堅牢な処理
- **機能拡張**: 複数変更の一括処理
- **エラーハンドリング強化**: 詳細なフィードバック

## 🔍 現状分析

### 現在のアーキテクチャ
```
[AiAssistantSidebar] 
    ↓ useEditorAssistant
[Client] → postMessage → [Server: edit/index.ts]
    ↓ OpenAI Stream
[LlmResponseStreamProcessor] → jsonrepair → parse
    ↓ SseDetectedDiff
[useEditorAssistant] → setDetectedDiff → yText更新
```

### 課題
1. **単純置換**: `replace`のみで正確性に欠ける
2. **エラー処理**: 失敗時の詳細情報不足
3. **複数変更**: 安全な一括処理ができない
4. **検索精度**: コンテキストなしの置換で誤変更リスク

## 🎯 改修目標

### roo-code方式の採用
- **Search/Replace形式**: 正確な検索条件による置換
- **Fuzzy Matching**: Levenshtein距離による類似度判定
- **複数diff処理**: 一つのリクエストで複数箇所変更
- **詳細エラー報告**: 失敗原因と解決策の提示

## 📝 段階別実装計画

### Phase 1: スキーマ・インターフェース更新

#### 1.1 新しいDiffスキーマ
```typescript
// apps/app/src/features/openai/interfaces/editor-assistant/llm-response-schemas.ts
export const LlmEditorAssistantDiffSchema = z.object({
  search: z.string().describe('正確に検索する内容（空白・インデント含む）'),
  replace: z.string().describe('置換後の内容'),
  startLine: z.number().optional().describe('検索開始行番号（1ベース）'),
  endLine: z.number().optional().describe('検索終了行番号（1ベース）'),
});
```

#### 1.2 処理結果型の拡張
```typescript
type DiffApplicationResult = {
  success: boolean;
  appliedCount: number;
  failedParts?: Array<{
    search: string;
    error: string;
    suggestions?: string;
  }>;
  content?: string;
};
```

### Phase 2: Search/Replace処理エンジン

#### 2.1 新しい処理クラス
```typescript
// apps/app/src/features/openai/server/services/editor-assistant/multi-search-replace-processor.ts
export class MultiSearchReplaceProcessor {
  private fuzzyThreshold = 0.8; // 類似度閾値
  private bufferLines = 40; // コンテキスト行数
  
  async applyDiffs(
    originalContent: string,
    diffs: LlmEditorAssistantDiff[]
  ): Promise<DiffApplicationResult>
}
```

#### 2.2 主要機能
- **Fuzzy Matching**: `fastest-levenshtein`による類似度計算
- **Middle-out Search**: 効率的な検索アルゴリズム
- **インデント保持**: 元のインデントを維持した置換
- **エラー詳細化**: 失敗原因の具体的な報告

### Phase 3: サーバーサイド統合

#### 3.1 LlmResponseStreamProcessor更新
```typescript
// apps/app/src/features/openai/server/services/editor-assistant/llm-response-stream-processor.ts
// Search/Replace形式のパース対応
// 新しいコールバック定義
```

#### 3.2 edit/index.ts改修
```typescript
// apps/app/src/features/openai/server/routes/edit/index.ts
// プロンプト更新（roo-code形式）
// 新しい処理エンジンとの統合
```

### Phase 4: クライアントサイド対応

#### 4.1 useEditorAssistant更新
```typescript
// apps/app/src/features/openai/client/services/editor-assistant.tsx
// 新しいdiff形式への対応
// エラーハンドリング強化
```

#### 4.2 UI改善
- より詳細なエラー表示
- 部分適用結果の表示
- 進捗状況の可視化

### Phase 5: プロンプト更新

#### 5.1 roo-code形式の採用
```
<<<<<<< SEARCH
:start_line: (required) 検索開始行番号
-------
[正確な検索内容（空白・インデント含む）]
=======
[置換後の内容]
>>>>>>> REPLACE
```

#### 5.2 指示の詳細化
- マーカーのエスケープ規則
- 複数diffブロックの処理
- エラー時の対処方法

## 🔧 技術実装詳細

### Fuzzy Matching アルゴリズム
- **ライブラリ**: `fastest-levenshtein`
- **閾値**: 80%以上で一致判定
- **検索方式**: Middle-out search（中央から外側へ）

### エラーハンドリング戦略
```typescript
type DiffError = {
  type: 'SEARCH_NOT_FOUND' | 'SIMILARITY_TOO_LOW' | 'MULTIPLE_MATCHES';
  message: string;
  details: {
    searchContent: string;
    bestMatch?: string;
    similarity?: number;
    suggestions: string[];
  };
};
```

### パフォーマンス最適化
- **メモリ効率**: 大きなファイルでの文字列処理最適化
- **ストリーミング**: 段階的JSONパース継続
- **UI更新**: 必要最小限のDOM操作

## 📊 期待効果

| 項目 | 現在 | 改修後 | 改善率 |
|------|------|--------|--------|
| **編集精度** | 60-70% | 90-95% | +30-35% |
| **複雑変更対応** | 困難 | 対応可能 | - |
| **エラー情報詳細度** | 低 | 高 | +200% |
| **Fuzzy matching** | なし | あり (0.8閾値) | - |
| **複数diff処理** | 困難 | 効率的 | - |
| **テキスト正規化** | なし | roo-code互換 | - |
| **段階的バリデーション** | なし | あり | - |

## 🔍 roo-code調査結果の反映

### 主要な学習ポイント
- **テスト戦略**: 1186行の包括的テストケース参考
- **エラーハンドリング**: 段階的バリデーションと詳細エラーメッセージ
- **設定管理**: 階層化設定と環境変数対応
- **文字正規化**: スマートクォート・Unicode正規化
- **パフォーマンス**: Middle-out検索と早期終了最適化

### 計画への反映
- **総工数**: 73.5時間 → **77時間** (+3.5時間)
- **タスク数**: 18個 → **20個** (+2個)
- **新規追加**: テキスト正規化、設定管理システム

## 🎯 実装優先順位

### 高優先度
1. ✅ スキーマ・インターフェース更新
2. ✅ Search/Replace処理エンジン実装

### 中優先度
3. ⏳ サーバーサイド統合
4. ⏳ クライアントサイド対応

### 低優先度
5. ⏳ UI改善・最適化
6. ⏳ パフォーマンス調整

## 🧪 検証計画

### テスト戦略
1. **単体テスト**: 処理エンジンの動作確認
2. **統合テスト**: サーバー・クライアント連携
3. **E2Eテスト**: 実際のユースケース検証
4. **パフォーマンステスト**: 大きなファイルでの処理速度

### 品質保証
- **Fuzzy matching精度**: 各種ケースでの類似度測定
- **エラーハンドリング**: 異常系での適切な処理
- **メモリ使用量**: 大きなファイルでのリソース消費

## 📚 参考資料

- [roo-code apply_diff implementation](https://github.com/RooCodeInc/Roo-Code/blob/main/src/core/tools/applyDiffTool.ts)
- [roo-code multi-search-replace strategy](https://github.com/RooCodeInc/Roo-Code/blob/main/src/core/diff/strategies/multi-search-replace.ts)
- [roo-code prompts](apps/app/src/features/openai/docs/roo-prompts.md)
- [roo-code investigation supplement](apps/app/src/features/openai/docs/plan/roo-code-investigation-supplement.md)

## 📝 備考

この改修により、GROWIのエディターアシスタントはroo-codeレベルの堅牢で精密な編集機能を実現し、ユーザーの生産性向上に大きく貢献することが期待される。

**重要な改善点:**
- **Fuzzy Matching**: 0.8閾値で80%類似度マッチング
- **文字正規化**: スマートクォート・Unicode対応
- **段階的バリデーション**: マーカー→内容→適用の3段階検証
- **詳細エラーハンドリング**: 修正提案付きエラーメッセージ
- **設定管理**: 環境変数と階層化設定システム

---
**作成日**: 2025-06-17  
**更新日**: 2025-06-17  
**ステータス**: 計画段階
