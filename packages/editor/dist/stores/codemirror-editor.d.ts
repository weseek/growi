import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import type { SWRResponse } from 'swr';
import type { UseCodeMirrorEditor } from '../services';
export declare const useCodeMirrorEditorIsolated: (key: string | null, container?: HTMLDivElement | null, props?: ReactCodeMirrorProps) => SWRResponse<UseCodeMirrorEditor>;
