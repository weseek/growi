import { StateEffect } from '@codemirror/state';

import type { Delta } from '../interfaces';

export const CollaborativeChange = StateEffect.define<Delta>();
