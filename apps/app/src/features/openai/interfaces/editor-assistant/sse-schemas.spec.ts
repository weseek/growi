import {
  describe, test, expect,
} from 'vitest';

import {
  SseMessageSchema,
  SseDetectedDiffSchema,
  SseFinalizedSchema,
  hasApplicationResult,
  type SseMessage,
  type SseDetectedDiff,
  type SseFinalized,
} from './sse-schemas';

describe('sse-schemas', () => {
  describe('SseMessageSchema', () => {
    test('should validate valid SSE message', () => {
      const validMessage = {
        appendedMessage: 'Processing your request...',
      };

      const result = SseMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.appendedMessage).toBe(validMessage.appendedMessage);
      }
    });

    test('should validate empty appended message', () => {
      const validMessage = {
        appendedMessage: '',
      };

      const result = SseMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    test('should validate multiline appended message', () => {
      const validMessage = {
        appendedMessage: 'Step 1: Analyzing code\nStep 2: Preparing changes\nStep 3: Applying diff',
      };

      const result = SseMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    test('should validate unicode and special characters', () => {
      const validMessage = {
        appendedMessage: 'コードを更新中... 🚀 Progress: 75%',
      };

      const result = SseMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    test('should fail when appendedMessage field is missing', () => {
      const invalidMessage = {};

      const result = SseMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
        expect(result.error.issues[0].path).toEqual(['appendedMessage']);
      }
    });

    test('should fail when appendedMessage is not a string', () => {
      const invalidMessage = {
        appendedMessage: 123,
      };

      const result = SseMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    test('should fail when appendedMessage is null', () => {
      const invalidMessage = {
        appendedMessage: null,
      };

      const result = SseMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    test('should allow extra fields (non-strict mode)', () => {
      const validMessage = {
        appendedMessage: 'Valid message',
        extraField: 'ignored',
      };

      const result = SseMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });
  });

  describe('SseDetectedDiffSchema', () => {
    test('should validate detected diff with complete diff object', () => {
      const validDetectedDiff = {
        diff: {
          search: 'function oldCode() {',
          replace: 'function newCode() {',
          startLine: 10,
          endLine: 12,
        },
      };

      const result = SseDetectedDiffSchema.safeParse(validDetectedDiff);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.diff.search).toBe(validDetectedDiff.diff.search);
        expect(result.data.diff.replace).toBe(validDetectedDiff.diff.replace);
        expect(result.data.diff.startLine).toBe(validDetectedDiff.diff.startLine);
        expect(result.data.diff.endLine).toBe(validDetectedDiff.diff.endLine);
      }
    });

    test('should validate detected diff without optional endLine', () => {
      const validDetectedDiff = {
        diff: {
          search: 'const value = 42;',
          replace: 'const value = 100;',
          startLine: 5,
        },
      };

      const result = SseDetectedDiffSchema.safeParse(validDetectedDiff);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.diff.endLine).toBeUndefined();
      }
    });

    test('should validate diff with empty replace content', () => {
      const validDetectedDiff = {
        diff: {
          search: 'lineToDelete();',
          replace: '',
          startLine: 20,
        },
      };

      const result = SseDetectedDiffSchema.safeParse(validDetectedDiff);
      expect(result.success).toBe(true);
    });

    test('should fail when diff field is missing', () => {
      const invalidDetectedDiff = {};

      const result = SseDetectedDiffSchema.safeParse(invalidDetectedDiff);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
        expect(result.error.issues[0].path).toEqual(['diff']);
      }
    });

    test('should fail when diff has invalid structure', () => {
      const invalidDetectedDiff = {
        diff: {
          search: 'valid search',
          replace: 'valid replace',
          // missing required startLine
        },
      };

      const result = SseDetectedDiffSchema.safeParse(invalidDetectedDiff);
      expect(result.success).toBe(false);
    });

    test('should fail when diff search is empty', () => {
      const invalidDetectedDiff = {
        diff: {
          search: '',
          replace: 'replacement',
          startLine: 1,
        },
      };

      const result = SseDetectedDiffSchema.safeParse(invalidDetectedDiff);
      expect(result.success).toBe(false);
    });

    test('should allow extra fields in detected diff', () => {
      const validDetectedDiff = {
        diff: {
          search: 'code',
          replace: 'new code',
          startLine: 1,
        },
        extraField: 'ignored',
      };

      const result = SseDetectedDiffSchema.safeParse(validDetectedDiff);
      expect(result.success).toBe(true);
    });
  });

  describe('SseFinalizedSchema', () => {
    test('should validate minimal finalized response', () => {
      const validFinalized = {
        finalized: {
          message: 'Changes have been applied successfully.',
          replacements: [],
        },
      };

      const result = SseFinalizedSchema.safeParse(validFinalized);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.finalized.message).toBe(validFinalized.finalized.message);
        expect(result.data.finalized.replacements).toEqual([]);
        expect(result.data.finalized.applicationResult).toBeUndefined();
      }
    });

    test('should validate finalized response with replacements', () => {
      const validFinalized = {
        finalized: {
          message: 'Successfully applied 2 changes.',
          replacements: [
            {
              search: 'old code 1',
              replace: 'new code 1',
              startLine: 5,
            },
            {
              search: 'old code 2',
              replace: 'new code 2',
              startLine: 10,
              endLine: 12,
            },
          ],
        },
      };

      const result = SseFinalizedSchema.safeParse(validFinalized);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.finalized.replacements).toHaveLength(2);
        expect(result.data.finalized.replacements[0].search).toBe('old code 1');
        expect(result.data.finalized.replacements[1].endLine).toBe(12);
      }
    });

    test('should validate finalized response with successful application result', () => {
      const validFinalized = {
        finalized: {
          message: 'All changes applied successfully.',
          replacements: [
            {
              search: 'test code',
              replace: 'updated code',
              startLine: 1,
            },
          ],
          applicationResult: {
            success: true,
            appliedCount: 1,
            totalCount: 1,
          },
        },
      };

      const result = SseFinalizedSchema.safeParse(validFinalized);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.finalized.applicationResult?.success).toBe(true);
        expect(result.data.finalized.applicationResult?.appliedCount).toBe(1);
        expect(result.data.finalized.applicationResult?.totalCount).toBe(1);
      }
    });

    test('should validate finalized response with failed application result', () => {
      const validFinalized = {
        finalized: {
          message: 'Some changes failed to apply.',
          replacements: [],
          applicationResult: {
            success: false,
            appliedCount: 0,
            totalCount: 1,
            failedParts: [
              {
                type: 'SEARCH_NOT_FOUND',
                message: 'Could not find the specified search content',
                line: 10,
                details: {
                  searchContent: 'missing code',
                  bestMatch: 'similar code',
                  similarity: 0.7,
                  suggestions: ['Check line numbers', 'Verify content'],
                  correctFormat: 'function example() {}',
                  lineRange: '8-12',
                },
              },
            ],
          },
        },
      };

      const result = SseFinalizedSchema.safeParse(validFinalized);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.finalized.applicationResult?.success).toBe(false);
        expect(result.data.finalized.applicationResult?.failedParts).toHaveLength(1);
        expect(result.data.finalized.applicationResult?.failedParts?.[0].type).toBe('SEARCH_NOT_FOUND');
        expect(result.data.finalized.applicationResult?.failedParts?.[0].details.similarity).toBe(0.7);
      }
    });

    test('should validate all error types in failedParts', () => {
      const errorTypes = [
        'SEARCH_NOT_FOUND',
        'SIMILARITY_TOO_LOW',
        'MULTIPLE_MATCHES',
        'EMPTY_SEARCH',
        'MARKER_SEQUENCE_ERROR',
        'CONTENT_ERROR',
      ];

      for (const errorType of errorTypes) {
        const validFinalized = {
          finalized: {
            message: `Error type: ${errorType}`,
            replacements: [],
            applicationResult: {
              success: false,
              appliedCount: 0,
              totalCount: 1,
              failedParts: [
                {
                  type: errorType,
                  message: `Test message for ${errorType}`,
                  details: {
                    searchContent: 'test',
                    suggestions: [],
                  },
                },
              ],
            },
          },
        };

        const result = SseFinalizedSchema.safeParse(validFinalized);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.finalized.applicationResult?.failedParts?.[0].type).toBe(errorType);
        }
      }
    });

    test('should fail when finalized field is missing', () => {
      const invalidFinalized = {};

      const result = SseFinalizedSchema.safeParse(invalidFinalized);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
        expect(result.error.issues[0].path).toEqual(['finalized']);
      }
    });

    test('should fail when message is missing', () => {
      const invalidFinalized = {
        finalized: {
          replacements: [],
        },
      };

      const result = SseFinalizedSchema.safeParse(invalidFinalized);
      expect(result.success).toBe(false);
      if (!result.success) {
        const messageError = result.error.issues.find(issue => issue.path.includes('message'));
        expect(messageError).toBeDefined();
      }
    });

    test('should fail when replacements is missing', () => {
      const invalidFinalized = {
        finalized: {
          message: 'Test message',
        },
      };

      const result = SseFinalizedSchema.safeParse(invalidFinalized);
      expect(result.success).toBe(false);
      if (!result.success) {
        const replacementsError = result.error.issues.find(issue => issue.path.includes('replacements'));
        expect(replacementsError).toBeDefined();
      }
    });

    test('should fail when appliedCount is negative', () => {
      const invalidFinalized = {
        finalized: {
          message: 'Test',
          replacements: [],
          applicationResult: {
            success: false,
            appliedCount: -1,
            totalCount: 1,
          },
        },
      };

      const result = SseFinalizedSchema.safeParse(invalidFinalized);
      expect(result.success).toBe(false);
    });

    test('should fail when totalCount is negative', () => {
      const invalidFinalized = {
        finalized: {
          message: 'Test',
          replacements: [],
          applicationResult: {
            success: false,
            appliedCount: 0,
            totalCount: -1,
          },
        },
      };

      const result = SseFinalizedSchema.safeParse(invalidFinalized);
      expect(result.success).toBe(false);
    });

    test('should fail when similarity is out of range', () => {
      const invalidFinalized = {
        finalized: {
          message: 'Test',
          replacements: [],
          applicationResult: {
            success: false,
            appliedCount: 0,
            totalCount: 1,
            failedParts: [
              {
                type: 'SIMILARITY_TOO_LOW',
                message: 'Low similarity',
                details: {
                  searchContent: 'test',
                  similarity: 1.5, // Invalid: > 1.0
                  suggestions: [],
                },
              },
            ],
          },
        },
      };

      const result = SseFinalizedSchema.safeParse(invalidFinalized);
      expect(result.success).toBe(false);
    });

    test('should fail when line number is not positive', () => {
      const invalidFinalized = {
        finalized: {
          message: 'Test',
          replacements: [],
          applicationResult: {
            success: false,
            appliedCount: 0,
            totalCount: 1,
            failedParts: [
              {
                type: 'SEARCH_NOT_FOUND',
                message: 'Not found',
                line: 0, // Invalid: must be positive
                details: {
                  searchContent: 'test',
                  suggestions: [],
                },
              },
            ],
          },
        },
      };

      const result = SseFinalizedSchema.safeParse(invalidFinalized);
      expect(result.success).toBe(false);
    });

    test('should allow extra fields in finalized', () => {
      const validFinalized = {
        finalized: {
          message: 'Test',
          replacements: [],
        },
        extraField: 'ignored',
      };

      const result = SseFinalizedSchema.safeParse(validFinalized);
      expect(result.success).toBe(true);
    });
  });

  describe('hasApplicationResult helper', () => {
    test('should return true when applicationResult is present', () => {
      const finalized: SseFinalized = {
        finalized: {
          message: 'Test',
          replacements: [],
          applicationResult: {
            success: true,
            appliedCount: 1,
            totalCount: 1,
          },
        },
      };

      expect(hasApplicationResult(finalized)).toBe(true);
    });

    test('should return false when applicationResult is undefined', () => {
      const finalized: SseFinalized = {
        finalized: {
          message: 'Test',
          replacements: [],
        },
      };

      expect(hasApplicationResult(finalized)).toBe(false);
    });

    test('should return false when applicationResult is undefined (explicit)', () => {
      const finalized: SseFinalized = {
        finalized: {
          message: 'Test',
          replacements: [],
          applicationResult: undefined,
        },
      };

      expect(hasApplicationResult(finalized)).toBe(false);
    });
  });

  describe('Type inference', () => {
    test('SseMessage type should match schema', () => {
      const message: SseMessage = {
        appendedMessage: 'Test message',
      };

      const result = SseMessageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });

    test('SseDetectedDiff type should match schema', () => {
      const detectedDiff: SseDetectedDiff = {
        diff: {
          search: 'old',
          replace: 'new',
          startLine: 1,
        },
      };

      const result = SseDetectedDiffSchema.safeParse(detectedDiff);
      expect(result.success).toBe(true);
    });

    test('SseFinalized type should match schema', () => {
      const finalized: SseFinalized = {
        finalized: {
          message: 'Done',
          replacements: [],
        },
      };

      const result = SseFinalizedSchema.safeParse(finalized);
      expect(result.success).toBe(true);
    });
  });

  describe('Real-world scenarios', () => {
    test('should validate complete SSE flow', () => {
      const realWorldFinalized = {
        finalized: {
          message: 'Successfully refactored the authentication function and added error handling.',
          replacements: [
            {
              search: 'function authenticate(token) {\n  return validateToken(token);\n}',
              // eslint-disable-next-line max-len
              replace: 'async function authenticate(token) {\n  try {\n    if (!token) {\n      throw new Error("Token is required");\n    }\n    return await validateToken(token);\n  } catch (error) {\n    console.error("Authentication failed:", error);\n    throw error;\n  }\n}',
              startLine: 25,
              endLine: 27,
            },
          ],
          applicationResult: {
            success: true,
            appliedCount: 1,
            totalCount: 1,
          },
        },
      };

      const result = SseFinalizedSchema.safeParse(realWorldFinalized);
      expect(result.success).toBe(true);
    });

    test('should validate error scenario with detailed feedback', () => {
      const errorScenario = {
        finalized: {
          message: 'Failed to apply changes. The specified code was not found.',
          replacements: [],
          applicationResult: {
            success: false,
            appliedCount: 0,
            totalCount: 1,
            failedParts: [
              {
                type: 'SEARCH_NOT_FOUND',
                message: 'Could not find exact match for the specified code',
                line: 25,
                details: {
                  searchContent: 'function authenticate(token) {',
                  bestMatch: 'function authenticateUser(userToken) {',
                  similarity: 0.85,
                  suggestions: [
                    'Check if the function name has changed',
                    'Verify the parameter name is correct',
                    'Ensure the code structure matches exactly',
                  ],
                  correctFormat: 'function authenticateUser(userToken) {',
                  lineRange: '20-30',
                },
              },
            ],
          },
        },
      };

      const result = SseFinalizedSchema.safeParse(errorScenario);
      expect(result.success).toBe(true);
    });
  });
});
