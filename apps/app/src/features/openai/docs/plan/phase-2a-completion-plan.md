# Phase 2A 完遂計画 - 実用的Search-Replace機能実装

**作成日**: 2025-06-17  
**ステータス**: 🎯 実行可能な詳細計画  
**工数見積**: 8-12時間（実装 + テスト）

## 📊 **現状分析結果**

### ✅ **既存の優秀な部分**
1. **LLMスキーマ**: JSON形式で`search`/`replace`フィールド完備
2. **SSEストリーミング**: リアルタイム配信機能完成
3. **クライアントエンジンファイル**: 高品質な実装コンポーネント存在
4. **統合インフラ**: `useClientEngineIntegration`基盤実装済み

### ❌ **重大な未実装**
1. **search処理**: `detectedDiff.data.diff.search`が完全に無視されている
2. **行番号指定**: 存在するが活用されていない  
3. **Fuzzy Matching**: 実装済みだが統合されていない
4. **正確な置換**: 単純な末尾追加のみ

## 🎯 **Phase 2A完遂目標**

### **コア機能実装**
1. ✅ **行番号必須化**: `startLine`を必須パラメータに変更
2. ✅ **search処理統合**: 実際に`search`テキストを検索する
3. ✅ **Fuzzy Matching活用**: 既存実装の統合
4. ✅ **正確な置換**: 見つけた箇所の正確な置換

### **レスポンス形式決定**
```typescript
// 現在のJSON形式を維持（パフォーマンス最適化）
{
  "search": "既存のコード部分",
  "replace": "新しいコード", 
  "startLine": 42  // 必須化
}
```

**理由**: roo-code形式(`<<<<<<< SEARCH`)は文字列パースが重く、JSON形式の方がブラウザで高速処理可能

## 📋 **実装タスク詳細**

### **Task 1: スキーマ強化** (1時間)

#### 1.1 LLMレスポンススキーマ更新
```typescript
// apps/app/src/features/openai/interfaces/editor-assistant/llm-response-schemas.ts
export const LlmEditorAssistantDiffSchema = z.object({
  search: z.string()
    .min(1)
    .describe('Exact content to search for (including whitespace and indentation)'),
  replace: z.string()
    .describe('Content to replace with'),
  startLine: z.number()  // 必須化（optionalを削除）
    .int()
    .positive()
    .describe('Starting line number for search (1-based, REQUIRED)'),
  endLine: z.number()
    .int()
    .positive()
    .optional()
    .describe('Ending line number for search (1-based, optional)'),
});
```

#### 1.2 プロンプト更新
```typescript
// apps/app/src/features/openai/server/routes/edit/index.ts
const instruction = `
## For Edit Type (explicit editing request):
The SEARCH field must contain exact content including whitespace and indentation.
The startLine field is REQUIRED and must specify the line number where search begins.

Response format:
{
  "contents": [
    { "message": "Brief explanation of changes" },
    { 
      "search": "exact existing content", 
      "replace": "new content",
      "startLine": 42  // REQUIRED
    }
  ]
}
`;
```

### **Task 2: search-replace処理実装** (4-5時間)

#### 2.1 useEditorAssistant内での検索処理実装
```typescript
// apps/app/src/features/openai/client/services/editor-assistant/use-editor-assistant.tsx

useEffect(() => {
  const pendingDetectedDiff = detectedDiff?.filter(diff => diff.applied === false);
  if (yDocs?.secondaryDoc != null && pendingDetectedDiff != null && pendingDetectedDiff.length > 0) {
    const yText = yDocs.secondaryDoc.getText('codemirror');
    
    yDocs.secondaryDoc.transact(() => {
      pendingDetectedDiff.forEach((detectedDiff) => {
        if (detectedDiff.data.diff) {
          const { search, replace, startLine } = detectedDiff.data.diff;
          
          // 新しい検索・置換処理
          const success = performSearchReplace(yText, search, replace, startLine);
          
          if (!success) {
            // フォールバック: 既存の動作
            if (isTextSelected) {
              insertTextAtLine(yText, lineRef.current, replace);
              lineRef.current += 1;
            } else {
              appendTextLastLine(yText, replace);
            }
          }
        }
      });
    });
    
    // ...existing code...
  }
}, [codeMirrorEditor, detectedDiff, isTextSelected, selectedText, yDocs?.secondaryDoc]);
```

#### 2.2 検索・置換核心ロジック実装
```typescript
// apps/app/src/features/openai/client/services/editor-assistant/search-replace-engine.ts

import { ClientFuzzyMatcher } from './fuzzy-matching';
import { normalizeForBrowserFuzzyMatch } from './text-normalization';

export function performSearchReplace(
  yText: YText, 
  searchText: string, 
  replaceText: string, 
  startLine: number
): boolean {
  const content = yText.toString();
  const lines = content.split('\n');
  
  // 1. 指定行から検索開始
  const fuzzyMatcher = new ClientFuzzyMatcher(0.8);
  const result = fuzzyMatcher.findBestMatch(
    content,
    searchText,
    { 
      preferredStartLine: startLine,
      bufferLines: 20  // 前後20行の範囲で検索
    }
  );
  
  if (result.success && result.matchedRange) {
    // 2. 見つかった箇所を正確に置換
    const { startIndex, endIndex } = result.matchedRange;
    yText.delete(startIndex, endIndex - startIndex);
    yText.insert(startIndex, replaceText);
    return true;
  }
  
  return false; // 検索失敗
}
```

### **Task 3: Fuzzy Matching統合** (2時間)

#### 3.1 既存のfuzzy-matching.ts更新
```typescript
// apps/app/src/features/openai/client/services/editor-assistant/fuzzy-matching.ts

export interface SearchContext {
  preferredStartLine?: number;
  bufferLines?: number;
}

export interface MatchResult {
  success: boolean;
  similarity: number;
  matchedRange?: {
    startIndex: number;
    endIndex: number;
    startLine: number;
    endLine: number;
  };
  error?: string;
}

export class ClientFuzzyMatcher {
  findBestMatch(
    content: string,
    searchText: string,
    context: SearchContext = {}
  ): MatchResult {
    const { preferredStartLine, bufferLines = 40 } = context;
    
    // 指定行から優先検索
    if (preferredStartLine) {
      const exactMatch = this.tryExactLineMatch(content, searchText, preferredStartLine);
      if (exactMatch.success) {
        return exactMatch;
      }
      
      // 指定行周辺でfuzzy検索
      return this.performBufferedSearch(content, searchText, preferredStartLine, bufferLines);
    }
    
    // 全体検索
    return this.performFullSearch(content, searchText);
  }
}
```

### **Task 4: エラーハンドリング強化** (1時間)

#### 4.1 詳細エラー報告
```typescript
// apps/app/src/features/openai/client/services/editor-assistant/error-handling.ts

export interface SearchReplaceError {
  type: 'SEARCH_NOT_FOUND' | 'SIMILARITY_TOO_LOW' | 'INVALID_LINE_NUMBER';
  message: string;
  details: {
    searchContent: string;
    startLine: number;
    similarity?: number;
    suggestions: string[];
  };
}

export function createSearchError(
  searchText: string, 
  startLine: number, 
  similarity: number
): SearchReplaceError {
  return {
    type: 'SEARCH_NOT_FOUND',
    message: `Could not find search content at line ${startLine} (${Math.floor(similarity * 100)}% similarity)`,
    details: {
      searchContent: searchText.substring(0, 100),
      startLine,
      similarity,
      suggestions: [
        'Check if the line number is correct',
        'Verify the search content exactly matches the file',
        'Consider if the file was recently modified'
      ]
    }
  };
}
```

### **Task 5: クライアントエンジン統合更新** (2時間)

#### 5.1 processHybrid機能完成
```typescript
// apps/app/src/features/openai/client/services/client-engine-integration.tsx

const processDetectedDiffsClient = useCallback(async(
  content: string,
  detectedDiffs: SseDetectedDiff[]
): Promise<ProcessingResult> => {
  const processor = new ClientSearchReplaceProcessor({
    fuzzyThreshold: 0.8,
    enableProgressCallbacks: true
  });
  
  // SseDetectedDiff を LlmEditorAssistantDiff に変換
  const diffs = detectedDiffs.map(d => d.diff).filter(Boolean);
  
  // startLineが必須かチェック
  for (const diff of diffs) {
    if (!diff.startLine) {
      throw new Error(`startLine is required but missing in diff: ${diff.search?.substring(0, 50)}...`);
    }
  }
  
  const result = await processor.processMultipleDiffs(content, diffs, {
    enableProgressCallbacks: true,
    onProgress: (status) => {
      console.log(`Processing: ${status.progress}% - ${status.description}`);
    }
  });
  
  return {
    success: result.success,
    appliedCount: result.appliedCount,
    failedCount: (result.failedParts?.length ?? 0),
    modifiedText: result.content,
    originalText: content,
    processingTime: performance.now() - Date.now()
  };
}, []);
```

## 🧪 **テスト計画** (1-2時間)

### **手動テスト項目**
1. **基本search-replace**: 指定行の正確な置換
2. **Fuzzy matching**: 微細な差異がある場合の検索
3. **複数diff処理**: 複数箇所の同時変更
4. **エラーケース**: 検索失敗時の適切なフォールバック
5. **パフォーマンス**: 大きなファイルでの処理速度

### **テストケース例**
```typescript
// Test Case 1: 正確な検索・置換
const testDiff = {
  search: "function calculateTotal(items) {\n  let total = 0;",
  replace: "function calculateTotal(items) {\n  let total = 0;\n  // Added comment",
  startLine: 15
};

// Test Case 2: Fuzzy matching
const testDiff2 = {
  search: "function calculateTotal(items) {\n let total = 0;", // インデント違い
  replace: "function calculateSum(items) {\n  let sum = 0;",
  startLine: 15
};
```

## 📈 **成功指標**

### **機能指標**
- ✅ 行番号指定での正確な検索: 95%以上の成功率
- ✅ Fuzzy matching: 80%以上の類似度で検索成功
- ✅ 複数diff処理: 5個以上のdiffの同時処理
- ✅ エラーハンドリング: 検索失敗時の適切なフォールバック

### **パフォーマンス指標**
- ✅ 検索時間: 1000行以下で100ms以内
- ✅ 置換時間: 10箇所以下で500ms以内
- ✅ メモリ使用量: 10MB以下
- ✅ ブラウザ応答性: UI blocking 0秒

## 🚀 **実装優先順序**

1. **Task 1**: スキーマ強化（1時間）
2. **Task 2**: search-replace処理実装（4-5時間）
3. **Task 3**: Fuzzy Matching統合（2時間）
4. **Task 5**: クライアントエンジン統合（2時間）
5. **Task 4**: エラーハンドリング強化（1時間）
6. **テスト**: 手動テスト実行（1-2時間）

## 📝 **実装後の状態**

### **完成機能**
```typescript
// LLMからのレスポンス例
{
  "contents": [
    { "message": "Adding error handling to the calculation function" },
    {
      "search": "function calculateTotal(items) {\n  let total = 0;\n  for (let item of items) {\n    total += item;\n  }",
      "replace": "function calculateTotal(items) {\n  if (!Array.isArray(items)) {\n    throw new Error('Items must be an array');\n  }\n  let total = 0;\n  for (let item of items) {\n    total += item;\n  }",
      "startLine": 15
    }
  ]
}
```

### **処理フロー**
1. **SSE受信**: LLMからstructured response受信
2. **行番号検証**: `startLine`必須チェック
3. **Fuzzy検索**: 指定行から高精度検索
4. **正確置換**: 見つかった箇所の正確な置換
5. **フォールバック**: 検索失敗時の既存動作

## 🎯 **Phase 2A完遂後の価値**

### **即座の効果**
- ✅ **編集精度**: 60-70% → 90-95% (roo-codeレベル)
- ✅ **ユーザー体験**: 予測可能で正確な編集
- ✅ **開発効率**: 信頼できるAIアシスタント機能

### **技術的成果**
- ✅ **roo-code互換性**: 核心アルゴリズムの実装
- ✅ **ブラウザ最適化**: JSON形式での高速処理
- ✅ **拡張可能性**: Phase 2B/3への基盤完成

---

**見積工数**: 8-12時間  
**リスク**: 低（既存コンポーネント活用）  
**価値**: 高（即座の機能向上）  
**次のステップ**: Task 1から順次実装開始
