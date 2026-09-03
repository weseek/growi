import fs from 'node:fs';
import path from 'node:path';

// Verifies the theme-overridable inline comment highlight token declared in
// _marker.scss:root. See requirements.md Requirement 12 (12.1, 12.2) and
// design.md "決定1" for why this indirection (rather than reading
// --grw-marker-bg directly) is required.
describe('_marker.scss inline comment highlight token', () => {
  const scssPath = path.join(__dirname, '_marker.scss');
  const scssSource = fs.readFileSync(scssPath, 'utf-8');

  it('declares --grw-inline-comment-marker-bg in :root, defaulting to the search marker color', () => {
    const rootBlockMatch = scssSource.match(/:root\s*\{([^}]*)\}/);
    expect(rootBlockMatch).not.toBeNull();

    const rootBlockBody = rootBlockMatch?.[1] ?? '';
    expect(rootBlockBody).toContain(
      '--grw-inline-comment-marker-bg: var(--grw-marker-bg, var(--grw-marker-bg-yellow));',
    );
  });
});
