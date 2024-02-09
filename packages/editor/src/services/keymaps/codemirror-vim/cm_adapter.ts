/* eslint-disable */
// @ts-nocheck
import { EditorSelection, Text, MapMode, ChangeDesc } from "@codemirror/state"
import { StringStream, matchBrackets, indentUnit, ensureSyntaxTree, foldCode } from "@codemirror/language"
import { EditorView, runScopeHandlers, ViewUpdate } from "@codemirror/view"
import { RegExpCursor, setSearchQuery, SearchQuery } from "@codemirror/search"
import {
  insertNewlineAndIndent, indentMore, indentLess, indentSelection, cursorCharLeft,
  undo, redo, cursorLineBoundaryBackward, cursorLineBoundaryForward, cursorCharBackward,
} from "@codemirror/commands"
import {vimState, CM5RangeInterface} from "./types"

function indexFromPos(doc: Text, pos: Pos): number {
  var ch = pos.ch;
  var lineNumber = pos.line + 1;
  if (lineNumber < 1) {
    lineNumber = 1
    ch = 0
  }
  if (lineNumber > doc.lines) {
    lineNumber = doc.lines
    ch = Number.MAX_VALUE
  }
  var line = doc.line(lineNumber)
  return Math.min(line.from + Math.max(0, ch), line.to)
}
function posFromIndex(doc: Text, offset: number): Pos {
  let line = doc.lineAt(offset)
  return { line: line.number - 1, ch: offset - line.from }
}
class Pos {
  line: number
  ch: number
  sticky?: string
  constructor(line: number, ch: number) {
    this.line = line; this.ch = ch;
  }
};

function on(emitter: any, type: string, f: Function) {
  if (emitter.addEventListener) {
    emitter.addEventListener(type, f, false);
  } else {
    var map = emitter._handlers || (emitter._handlers = {});
    map[type] = (map[type] || []).concat(f);
  }
};

function off(emitter: any, type: string, f: Function) {
  if (emitter.removeEventListener) {
    emitter.removeEventListener(type, f, false);
  } else {
    var map = emitter._handlers, arr = map && map[type];
    if (arr) {
      var index = arr.indexOf(f);
      if (index > -1) { map[type] = arr.slice(0, index).concat(arr.slice(index + 1)); }
    }
  }
}

function signal(emitter: any, type: string, ...args: any[]) {
  var handlers = emitter._handlers?.[type]
  if (!handlers) return
  for (var i = 0; i < handlers.length; ++i) { handlers[i](...args); }
}

function signalTo(handlers: any, ...args: any[]) {
  if (!handlers) return
  for (var i = 0; i < handlers.length; ++i) { handlers[i](...args); }
}

let wordChar: RegExp
try {
  wordChar = new RegExp("[\\w\\p{Alphabetic}\\p{Number}_]", "u")
} catch (_) {
  wordChar = /[\w]/
}

interface Operation {
  $d: number,
  isVimOp?: boolean,
  cursorActivityHandlers?: Function[],
  cursorActivity?: boolean,
  lastChange?: any,
  change?: any,
  changeHandlers?: Function[],
  $changeStart?: number,
}

// workaround for missing api for merging transactions
function dispatchChange(cm: CodeMirror, transaction: any) {
  var view = cm.cm6;
  if (view.state.readOnly)
    return;
  var type = "input.type.compose";
  if (cm.curOp) {
    if (!cm.curOp.lastChange) type = "input.type.compose.start";
  }
  if (transaction.annotations) {
    try {
      transaction.annotations.some(function (note: any) {
        if (note.value == "input") note.value = type;
      });
    } catch (e) {
      console.error(e);
    }
  } else {
    transaction.userEvent =  type;
  }
  return view.dispatch(transaction)
}

function runHistoryCommand(cm: CodeMirror, revert: boolean) {
  if (cm.curOp) {
    cm.curOp.$changeStart = undefined;
  }
  (revert ? undo : redo)(cm.cm6);
  let changeStartIndex = cm.curOp?.$changeStart;
  // vim mode expects the changed text to be either selected or cursor placed at the start
  if (changeStartIndex != null) {
    cm.cm6.dispatch({ selection: { anchor: changeStartIndex } });
  }
}

var keys: Record<string, (cm: CodeMirror) => void> = {};
"Left|Right|Up|Down|Backspace|Delete".split("|").forEach(key => {
  keys[key] = (cm:CodeMirror) => runScopeHandlers(cm.cm6, {key: key} as KeyboardEvent, "editor");
});

export class CodeMirror {
  static isMac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
  // --------------------------
  static Pos = Pos;
  static StringStream = StringStream as unknown as StringStream & { new(_: string): StringStream }
  static commands = {
    cursorCharLeft: function (cm: CodeMirror) { cursorCharLeft(cm.cm6); },
    redo: function (cm: CodeMirror) { runHistoryCommand(cm, false); },
    undo: function (cm: CodeMirror) { runHistoryCommand(cm, true); },
    newlineAndIndent: function (cm: CodeMirror) {
      insertNewlineAndIndent({
        state: cm.cm6.state,
        dispatch: (tr) => {
          return dispatchChange(cm, tr);
        }
      })
    },
    indentAuto: function (cm: CodeMirror) {
      indentSelection(cm.cm6)
    },
    newlineAndIndentContinueComment: undefined as any,
    save: undefined as any,
  };
  static isWordChar = function (ch: string) {
    return wordChar.test(ch);
  };
  static keys: any = keys;
  static addClass = function (el, str) { };
  static rmClass = function (el, str) { };
  static e_preventDefault = function (e: Event) {
    e.preventDefault()
  };
  static e_stop = function (e: Event) {
    e?.stopPropagation?.()
    e?.preventDefault?.()
  };

  static lookupKey = function lookupKey(key: string, map: string, handle: Function) {
    var result = CodeMirror.keys[key];
    if (result) handle(result);
  };

  static on = on
  static off = off;
  static signal = signal;

  // --------------------------
  openDialog(template: Element, callback: Function, options: any) {
    return openDialog(this, template, callback, options);
  };
  openNotification(template: Node, options: NotificationOptions) {
    return openNotification(this, template, options);
  };

  static findMatchingTag = findMatchingTag;
  static findEnclosingTag = findEnclosingTag;

  // --------------------------
  cm6: EditorView
  state: {
    statusbar?: Element | null,
    dialog?: Element | null,
    vimPlugin?: any,
    vim?: vimState | null,
    currentNotificationClose?: Function | null,
    keyMap?: string,
    overwrite?: boolean,
    textwidth?: number,
  } = {};
  marks: Record<string, Marker> = Object.create(null);
  $mid = 0; // marker id counter
  curOp: Operation | null | undefined;
  options: any = {};
  _handlers: any = {};
  constructor(cm6: EditorView) {
    this.cm6 = cm6;
    this.onChange = this.onChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
  };

  on(type: string, f: Function) { on(this, type, f) }
  off(type: string, f: Function) { off(this, type, f) }
  signal(type: string, e: any, handlers?: any) { signal(this, type, e, handlers) }

  indexFromPos(pos: Pos) {
    return indexFromPos(this.cm6.state.doc, pos);
  };
  posFromIndex(offset: number) {
    return posFromIndex(this.cm6.state.doc, offset);
  };


  foldCode(pos: Pos) {
    let view = this.cm6
    let ranges = view.state.selection.ranges
    let doc = this.cm6.state.doc
    let index = indexFromPos(doc, pos)
    let tmpRanges = EditorSelection.create([EditorSelection.range(index, index)], 0).ranges;

    (view.state.selection as any).ranges = tmpRanges;
    foldCode(view);
    (view.state.selection as any).ranges = ranges;
  }

  firstLine() { return 0; };
  lastLine() { return this.cm6.state.doc.lines - 1; };
  lineCount() { return this.cm6.state.doc.lines };
  setCursor(line: number, ch: number): void;
  setCursor(line: Pos): void;
  setCursor(line: Pos | number, ch?: number) {
    if (typeof line === 'object') {
      ch = line.ch;
      line = line.line;
    }
    var offset = indexFromPos(this.cm6.state.doc, { line, ch: ch || 0 })
    this.cm6.dispatch({ selection: { anchor: offset } }, { scrollIntoView: !this.curOp })
    if (this.curOp && !this.curOp.isVimOp)
      this.onBeforeEndOperation();
  };
  getCursor(p?: "head" | "anchor" | "start" | "end"): Pos {
    var sel = this.cm6.state.selection.main;

    var offset = p == "head" || !p
      ? sel.head
      : p == "anchor"
        ? sel.anchor
        : p == "start"
          ? sel.from
          : p == "end"
            ? sel.to
            : null
    if (offset == null) throw new Error("Invalid cursor type")
    return this.posFromIndex(offset);
  };

  listSelections() {
    var doc = this.cm6.state.doc
    return this.cm6.state.selection.ranges.map(r => {
      return {
        anchor: posFromIndex(doc, r.anchor),
        head: posFromIndex(doc, r.head),
      };
    });
  };
  setSelections(p: CM5RangeInterface[], primIndex?: number) {
    var doc = this.cm6.state.doc
    var ranges = p.map(x => {
      return EditorSelection.range(indexFromPos(doc, x.anchor), indexFromPos(doc, x.head))
    })
    this.cm6.dispatch({
      selection: EditorSelection.create(ranges, primIndex)
    })
  };
  setSelection(anchor: Pos, head: Pos, options?: any) {
    var doc = this.cm6.state.doc
    var ranges = [EditorSelection.range(indexFromPos(doc, anchor), indexFromPos(doc, head))]
    this.cm6.dispatch({
      selection: EditorSelection.create(ranges, 0)
    })
    if (options && options.origin == '*mouse') {
      this.onBeforeEndOperation();
    }
  };
  getLine(row: number): string {
    var doc = this.cm6.state.doc
    if (row < 0 || row >= doc.lines) return "";
    return this.cm6.state.doc.line(row + 1).text;
  };
  getLineHandle(row: number) {
    if (!this.$lineHandleChanges) this.$lineHandleChanges = [];
    return { row: row,  index: this.indexFromPos(new Pos(row, 0))};
  }
  getLineNumber(handle: any) {
    var updates = this.$lineHandleChanges;

    if (!updates) return null;
    var offset = handle.index;
    for (var i = 0; i < updates.length; i++) {
      offset = updates[i].changes .mapPos(offset, 1, MapMode.TrackAfter);
      if (offset == null) return null;
    }
    var pos = this.posFromIndex(offset);
    return pos.ch == 0 ? pos.line : null;
  }
  releaseLineHandles() {
    this.$lineHandleChanges = undefined;
  }
  getRange(s: Pos, e: Pos) {
    var doc = this.cm6.state.doc;
    return this.cm6.state.sliceDoc(
      indexFromPos(doc, s),
      indexFromPos(doc, e)
    )
  };
  replaceRange(text: string, s: Pos, e?: Pos, source?: string) {
    if (!e) e = s;
    var doc = this.cm6.state.doc;
    var from = indexFromPos(doc, s);
    var to = indexFromPos(doc, e);
    dispatchChange(this, { changes: { from, to, insert: text } });
  };
  replaceSelection(text: string) {
    dispatchChange(this, this.cm6.state.replaceSelection(text))
  };
  replaceSelections(replacements: string[]) {
    var ranges = this.cm6.state.selection.ranges;
    var changes = ranges.map((r, i) => {
      return { from: r.from, to: r.to, insert: replacements[i] || "" }
    });
    dispatchChange(this, { changes });
  };
  getSelection() {
    return this.getSelections().join("\n");
  };
  getSelections() {
    var cm = this.cm6;
    return cm.state.selection.ranges.map(r => cm.state.sliceDoc(r.from, r.to))
  };

  somethingSelected() {
    return this.cm6.state.selection.ranges.some(r => !r.empty)
  };
  getInputField() {
    return this.cm6.contentDOM;
  };
  clipPos(p: Pos) {
    var doc = this.cm6.state.doc
    var ch = p.ch;
    var lineNumber = p.line + 1;
    if (lineNumber < 1) {
      lineNumber = 1
      ch = 0
    }
    if (lineNumber > doc.lines) {
      lineNumber = doc.lines
      ch = Number.MAX_VALUE
    }
    var line = doc.line(lineNumber)
    ch = Math.min(Math.max(0, ch), line.to - line.from)
    return new Pos(lineNumber - 1, ch);
  };


  getValue(): string {
    return this.cm6.state.doc.toString();
  };
  setValue(text: string) {
    var cm = this.cm6;
    return cm.dispatch({
      changes: { from: 0, to: cm.state.doc.length, insert: text },
      selection: EditorSelection.range(0, 0)
    })
  };

  focus() {
    return this.cm6.focus();
  };
  blur() {
    return this.cm6.contentDOM.blur();
  };
  defaultTextHeight() {
    return this.cm6.defaultLineHeight
  };

  findMatchingBracket(pos: Pos, _options?: any) {
    var state = this.cm6.state
    var offset = indexFromPos(state.doc, pos);
    var m = matchBrackets(state, offset + 1, -1)
    if (m && m.end) {
      return { to: posFromIndex(state.doc, m.end.from) };
    }
    m = matchBrackets(state, offset, 1)
    if (m && m.end) {
      return { to: posFromIndex(state.doc, m.end.from) };
    }
    return { to: undefined };
  };
  scanForBracket(pos: Pos, dir: 1 | -1, style: any, config: any) {
    return scanForBracket(this, pos, dir, style, config);
  };

  indentLine(line: number, more?: boolean) {
    // todo how to indent only one line instead of selection
    if (more) this.indentMore()
    else this.indentLess()
  };

  indentMore() {
    indentMore(this.cm6);
  };
  indentLess() {
    indentLess(this.cm6);
  };

  execCommand(name: string) {
    if (name == "indentAuto") CodeMirror.commands.indentAuto(this);
    else if (name == "goLineLeft") cursorLineBoundaryBackward(this.cm6);
    else if (name == "goLineRight") {
      cursorLineBoundaryForward(this.cm6);
      let state = this.cm6.state
      let cur = state.selection.main.head;
      if (cur < state.doc.length && state.sliceDoc(cur, cur + 1) !== "\n") {
        cursorCharBackward(this.cm6);
      }
    }
    else console.log(name + " is not implemented");
  };

  setBookmark(cursor: Pos, options?: { insertLeft: boolean }) {
    var assoc = options?.insertLeft ? 1 : -1;
    var offset = this.indexFromPos(cursor)
    var bm = new Marker(this, offset, assoc);
    return bm;
  };

  cm6Query?: SearchQuery
  addOverlay({ query }: { query: RegExp }) {
    let cm6Query = new SearchQuery({
      regexp: true,
      search: query.source,
      caseSensitive: !/i/.test(query.flags),
    });
    if (cm6Query.valid) {
      (cm6Query as any).forVim = true;
      this.cm6Query = cm6Query;
      let effect = setSearchQuery.of(cm6Query);
      this.cm6.dispatch({ effects: effect });
      return cm6Query
    }
  };
  removeOverlay(overlay?: any) {
    if (!this.cm6Query) return
    (this.cm6Query as any).forVim = false;
    let effect = setSearchQuery.of(this.cm6Query);
    this.cm6.dispatch({ effects: effect });
  };

  getSearchCursor(query: RegExp, pos: Pos) {
    var cm = this;
    type CM6Result = { from: number, to: number, match: string[] } | null;
    type CM5Result = { from: Pos, to: Pos, match: string[] } | null;
    var last: CM6Result = null;
    var lastCM5Result: CM5Result = null;

    if (pos.ch == undefined) pos.ch = Number.MAX_VALUE;
    var firstOffset = indexFromPos(cm.cm6.state.doc, pos);

    var source = query.source.replace(/(\\.|{(?:\d+(?:,\d*)?|,\d+)})|[{}]/g, function (a, b) {
      if (!b) return "\\" + a
      return b;
    });

    function rCursor(doc: Text, from = 0, to = doc.length) {
      return new RegExpCursor(doc, source, { ignoreCase: query.ignoreCase }, from, to);
    }

    function nextMatch(from: number) {
      var doc = cm.cm6.state.doc
      if (from > doc.length) return null;
      let res = rCursor(doc, from).next()
      return res.done ? null : res.value
    }

    var ChunkSize = 10000
    function prevMatchInRange(from: number, to: number) {
      var doc = cm.cm6.state.doc
      for (let size = 1; ; size++) {
        let start = Math.max(from, to - size * ChunkSize)
        let cursor = rCursor(doc, start, to), range: CM6Result = null
        while (!cursor.next().done) range = cursor.value
        if (range && (start == from || range.from > start + 10)) return range
        if (start == from) return null
      }
    }
    return {
      findNext: function () { return this.find(false) },
      findPrevious: function () { return this.find(true) },
      find: function (back?: boolean): string[] | null | undefined {
        var doc = cm.cm6.state.doc
        if (back) {
          let endAt = last ? (last.from == last.to ? last.to - 1 : last.from) : firstOffset
          last = prevMatchInRange(0, endAt);
        } else {
          let startFrom = last ? (last.from == last.to ? last.to + 1 : last.to) : firstOffset
          last = nextMatch(startFrom)
        }
        lastCM5Result = last && {
          from: posFromIndex(doc, last.from),
          to: posFromIndex(doc, last.to),
          match: last.match,
        }
        return last && last.match
      },
      from: function () { return lastCM5Result?.from },
      to: function () { return lastCM5Result?.to },
      replace: function (text: string) {
        if (last) {
          dispatchChange(cm, {
            changes: { from: last.from, to: last.to, insert: text }
          });
          last.to = last.from + text.length
          if (lastCM5Result) {
            lastCM5Result.to = posFromIndex(cm.cm6.state.doc, last.to);
          }
        }
      }
    };
  };
  findPosV(start: Pos, amount: number, unit: "page" | "line", goalColumn?: number) {
    let { cm6 } = this;
    const doc = cm6.state.doc;
    let pixels = unit == 'page' ? cm6.dom.clientHeight : 0;

    const startOffset = indexFromPos(doc, start);
    let range = EditorSelection.range(startOffset, startOffset, goalColumn);
    let count = Math.round(Math.abs(amount))
    for (let i = 0; i < count; i++) {
      if (unit == 'page') {
        range = cm6.moveVertically(range, amount > 0, pixels);
      }
      else if (unit == 'line') {
        range = cm6.moveVertically(range, amount > 0);
      }
    }

    let pos = posFromIndex(doc, range.head) as Pos&{hitSide?: boolean};
    // set hitside to true if there was no place to move and cursor was clipped to the edge
    // of document. Needed for gj/gk
    if (
      (
        amount < 0 &&
        range.head == 0 && goalColumn != 0 &&
        start.line == 0 && start.ch != 0
      ) || (
        amount > 0 &&
        range.head == doc.length && pos.ch != goalColumn
        && start.line == pos.line
      )
    ) {
      pos.hitSide = true;
    }
    return pos;
  };
  charCoords(pos: Pos, mode: "div" | "local") {
    var rect = this.cm6.contentDOM.getBoundingClientRect();
    var offset = indexFromPos(this.cm6.state.doc, pos)
    var coords = this.cm6.coordsAtPos(offset)
    var d = -rect.top
    return { left: (coords?.left || 0) - rect.left, top: (coords?.top || 0) + d, bottom: (coords?.bottom || 0) + d }
  };
  coordsChar(coords: { left: number, top: number }, mode: "div" | "local") {
    var rect = this.cm6.contentDOM.getBoundingClientRect()

    var offset = this.cm6.posAtCoords({ x: coords.left + rect.left, y: coords.top + rect.top }) || 0
    return posFromIndex(this.cm6.state.doc, offset)
  };

  getScrollInfo() {
    var scroller = this.cm6.scrollDOM
    return {
      left: scroller.scrollLeft, top: scroller.scrollTop,
      height: scroller.scrollHeight,
      width: scroller.scrollWidth,
      clientHeight: scroller.clientHeight, clientWidth: scroller.clientWidth
    };
  };
  scrollTo(x?: number|null, y?: number|null) {
    if (x != null)
      this.cm6.scrollDOM.scrollLeft = x
    if (y != null)
      this.cm6.scrollDOM.scrollTop = y
  };
  scrollIntoView(pos?: Pos, margin?: number) {
    if (pos) {
      var offset = this.indexFromPos(pos);
      this.cm6.dispatch({
        effects: EditorView.scrollIntoView(offset)
      });
    } else {
      this.cm6.dispatch({ scrollIntoView: true, userEvent: "scroll" });
    }
  };

  getWrapperElement() {
    return this.cm6.dom;
  };

  // for tests
  getMode() {
    return { name: this.getOption("mode") };
  };
  setSize(w: number, h: number) {
    this.cm6.dom.style.width = w + 4 + "px"
    this.cm6.dom.style.height = h + "px"
    this.refresh()
  }
  refresh() {
    (this.cm6 as any).measure()
  }

  // event listeners
  destroy() {
    this.removeOverlay();
  };

  getLastEditEnd() {
    return this.posFromIndex(this.$lastChangeEndOffset);
  };
  $lastChangeEndOffset = 0;
  $lineHandleChanges: undefined|ViewUpdate[]
  onChange(update: ViewUpdate) {
    if (this.$lineHandleChanges) {
      this.$lineHandleChanges.push(update);
    }
    for (let i in this.marks) {
      let m = this.marks[i];
      m.update(update.changes)
    }
    if (this.virtualSelection) {
      this.virtualSelection.ranges = this.virtualSelection.ranges.map(range => range.map(update.changes))
    }
    var curOp = this.curOp = this.curOp || ({} as Operation);
    update.changes.iterChanges((fromA: number, toA: number, fromB: number, toB: number, text: Text) => {
      if (curOp.$changeStart == null || curOp.$changeStart > fromB)
        curOp.$changeStart = fromB;
      this.$lastChangeEndOffset = toB;
      var change = { text: text.toJSON() };
      if (!curOp.lastChange) {
        curOp.lastChange = curOp.change = change;
      } else {
        curOp.lastChange.next = curOp.lastChange = change;
      }
    }, true);
    if (!curOp.changeHandlers)
      curOp.changeHandlers = this._handlers["change"] && this._handlers["change"].slice();
  };
  onSelectionChange() {
    var curOp = this.curOp = this.curOp || ({} as Operation);
    if (!curOp.cursorActivityHandlers)
      curOp.cursorActivityHandlers = this._handlers["cursorActivity"] && this._handlers["cursorActivity"].slice();
    this.curOp.cursorActivity = true;
  };
  operation(fn: Function, force?: boolean) {
    if (!this.curOp)
      this.curOp = { $d: 0 };
    this.curOp.$d++;
    try {
      var result = fn()
    } finally {
      if (this.curOp) {
        this.curOp.$d--
        if (!this.curOp.$d)
          this.onBeforeEndOperation()
      }
    }
    return result
  };
  onBeforeEndOperation() {
    var op = this.curOp;
    var scrollIntoView = false;
    if (op) {
      if (op.change) { signalTo(op.changeHandlers, this, op.change); }
      if (op && op.cursorActivity) {
        signalTo(op.cursorActivityHandlers, this, null);
        if (op.isVimOp)
          scrollIntoView = true;
      }
      this.curOp = null;
    }
    if (scrollIntoView)
      this.scrollIntoView();
  };
  moveH(increment: number, unit: string) {
    if (unit == 'char') {
      // todo
      var cur = this.getCursor();
      this.setCursor(cur.line, cur.ch + increment);
    }
  };

  setOption(name: string, val: any) {
    switch (name) {
      case "keyMap":
        this.state.keyMap = val;
        break;
      case "textwidth":
        this.state.textwidth = val;
        break;
      // TODO cm6 doesn't provide any method to reconfigure these
      case "tabSize":
      case "indentWithTabs":
        break

    }
  };
  getOption(name:"firstLineNumber"|"tabSize"): number;
  getOption(name:string): number|boolean|string|undefined;
  getOption(name: string) {
    switch (name) {
      case "firstLineNumber": return 1;
      case "tabSize": return this.cm6.state.tabSize || 4;
      case "readOnly": return this.cm6.state.readOnly;
      case "indentWithTabs": return this.cm6.state.facet(indentUnit) == "\t"; // TODO
      case "indentUnit": return this.cm6.state.facet(indentUnit).length || 2;
      case "textwidth": return this.state.textwidth;
      // for tests
      case "keyMap": return this.state.keyMap || "vim";
    }
  };
  toggleOverwrite(on: boolean) {
    this.state.overwrite = on;
  };
  getTokenTypeAt(pos: Pos) {
    // only comment|string are needed
    var offset = this.indexFromPos(pos)
    var tree = ensureSyntaxTree(this.cm6.state, offset)
    var node = tree?.resolve(offset)
    var type = node?.type?.name || ""
    if (/comment/i.test(type)) return "comment";
    if (/string/i.test(type)) return "string";
    return ""
  };

  overWriteSelection(text: string) {
    var doc = this.cm6.state.doc
    var sel = this.cm6.state.selection;
    var ranges = sel.ranges.map(x => {
      if (x.empty) {
        var ch = x.to < doc.length ? doc.sliceString(x.from, x.to + 1) : ""
        if (ch && !/\n/.test(ch))
          return EditorSelection.range(x.from, x.to + 1)
      }
      return x;
    });
    this.cm6.dispatch({
      selection: EditorSelection.create(ranges, sel.mainIndex)
    })
    this.replaceSelection(text)
  }

  /*** multiselect ****/
  isInMultiSelectMode() {
    return this.cm6.state.selection.ranges.length > 1
  }
  virtualSelectionMode() {
    return !!this.virtualSelection
  }
  virtualSelection: Mutable<EditorSelection> | null = null;
  forEachSelection(command: Function) {
    var selection = this.cm6.state.selection;
    this.virtualSelection = EditorSelection.create(selection.ranges, selection.mainIndex)
    for (var i = 0; i < this.virtualSelection.ranges.length; i++) {
      var range = this.virtualSelection.ranges[i]
      if (!range) continue
      this.cm6.dispatch({ selection: EditorSelection.create([range]) });
      command();
      (this.virtualSelection as any).ranges[i] = this.cm6.state.selection.ranges[0]
    }
    this.cm6.dispatch({ selection: this.virtualSelection })
    this.virtualSelection = null;
  }

  hardWrap(options) {
    return hardWrap(this, options);
  }

  showMatchesOnScrollbar?: Function // not implemented
  save?: Function
  static keyName?: Function = undefined
};

type Mutable<Type> = {
  -readonly [Key in keyof Type]: Type[Key];
};

/************* dialog *************/


function dialogDiv(cm: CodeMirror, template: Node, bottom?: boolean) {
  var dialog = document.createElement("div");
  dialog.appendChild(template);
  return dialog;
}

function closeNotification(cm: CodeMirror, newVal?: Function) {
  if (cm.state.currentNotificationClose)
    cm.state.currentNotificationClose();
  cm.state.currentNotificationClose = newVal;
}
interface NotificationOptions { bottom?: boolean, duration?: number }
function openNotification(cm: CodeMirror, template: Node, options: NotificationOptions) {
  closeNotification(cm, close);
  var dialog = dialogDiv(cm, template, options && options.bottom);
  var closed = false;
  var doneTimer: number;
  var duration = options && typeof options.duration !== "undefined" ? options.duration : 5000;

  function close() {
    if (closed) return;
    closed = true;
    clearTimeout(doneTimer);
    dialog.remove();
    hideDialog(cm, dialog)
  }

  dialog.onclick = function (e) {
    e.preventDefault();
    close();
  };

  showDialog(cm, dialog)

  if (duration)
    doneTimer = setTimeout(close, duration);

  return close;
}


function showDialog(cm: CodeMirror, dialog: Element) {
  var oldDialog = cm.state.dialog
  cm.state.dialog = dialog;

  if (dialog && oldDialog !== dialog) {
    if (oldDialog && oldDialog.contains(document.activeElement))
      cm.focus()
    if (oldDialog && oldDialog.parentElement) {
      oldDialog.parentElement.replaceChild(dialog, oldDialog)
    } else if (oldDialog) {
      oldDialog.remove()
    }
    CodeMirror.signal(cm, "dialog")
  }
}

function hideDialog(cm: CodeMirror, dialog: Element) {
  if (cm.state.dialog == dialog) {
    cm.state.dialog = null;
    CodeMirror.signal(cm, "dialog")
  }
}

function openDialog(me: CodeMirror, template: Element, callback: Function, options: any) {
  if (!options) options = {};

  closeNotification(me, undefined);

  var dialog = dialogDiv(me, template, options.bottom);
  var closed = false;
  showDialog(me, dialog);

  function close(newVal?: string) {
    if (typeof newVal == 'string') {
      inp.value = newVal;
    } else {
      if (closed) return;

      closed = true;
      hideDialog(me, dialog)
      if (!me.state.dialog)
        me.focus();

      if (options.onClose) options.onClose(dialog);
    }
  }

  var inp = dialog.getElementsByTagName("input")[0];
  if (inp) {
    if (options.value) {
      inp.value = options.value;
      if (options.selectValueOnOpen !== false) inp.select();
    }

    if (options.onInput)
      CodeMirror.on(inp, "input", function (e: KeyboardEvent) { options.onInput(e, inp.value, close); });
    if (options.onKeyUp)
      CodeMirror.on(inp, "keyup", function (e: KeyboardEvent) { options.onKeyUp(e, inp.value, close); });

    CodeMirror.on(inp, "keydown", function (e: KeyboardEvent) {
      if (options && options.onKeyDown && options.onKeyDown(e, inp.value, close)) { return; }
      if (e.keyCode == 13) callback(inp.value);
      if (e.keyCode == 27 || (options.closeOnEnter !== false && e.keyCode == 13)) {
        inp.blur();
        CodeMirror.e_stop(e);
        close();
      }
    });

    if (options.closeOnBlur !== false) CodeMirror.on(inp, "blur", function () {
      setTimeout(function () {
        if (document.activeElement === inp)
          return;
        close()
      })
    });

    inp.focus();
  }
  return close;
}

var matching: any = { "(": ")>", ")": "(<", "[": "]>", "]": "[<", "{": "}>", "}": "{<", "<": ">>", ">": "<<" };

function bracketRegex(config: any) {
  return config && config.bracketRegex || /[(){}[\]]/
}

function scanForBracket(cm: CodeMirror, where: Pos, dir: -1 | 1, style: any, config: any) {
  var maxScanLen = (config && config.maxScanLineLength) || 10000;
  var maxScanLines = (config && config.maxScanLines) || 1000;

  var stack: string[] = [];
  var re = bracketRegex(config)
  var lineEnd = dir > 0 ? Math.min(where.line + maxScanLines, cm.lastLine() + 1)
    : Math.max(cm.firstLine() - 1, where.line - maxScanLines);
  for (var lineNo = where.line; lineNo != lineEnd; lineNo += dir) {
    var line = cm.getLine(lineNo);
    if (!line) continue;
    var pos = dir > 0 ? 0 : line.length - 1, end = dir > 0 ? line.length : -1;
    if (line.length > maxScanLen) continue;
    if (lineNo == where.line) pos = where.ch - (dir < 0 ? 1 : 0);
    for (; pos != end; pos += dir) {
      var ch = line.charAt(pos);
      if (re.test(ch) /*&& (style === undefined ||
                          (cm.getTokenTypeAt(new Pos(lineNo, pos + 1)) || "") == (style || ""))*/) {
        var match = matching[ch];
        if (match && (match.charAt(1) == ">") == (dir > 0)) stack.push(ch);
        else if (!stack.length) return { pos: new Pos(lineNo, pos), ch: ch };
        else stack.pop();
      }
    }
  }
  return lineNo - dir == (dir > 0 ? cm.lastLine() : cm.firstLine()) ? false : null;
}

function findMatchingTag(cm: CodeMirror, pos: Pos): undefined {
}

function findEnclosingTag(cm: CodeMirror, pos: Pos) {
  var state = cm.cm6.state;
  var offset = cm.indexFromPos(pos);
  if (offset < state.doc.length) {
    var text = state.sliceDoc(offset, offset + 1)
    if (text == "<") offset++;
  }
  var tree = ensureSyntaxTree(state, offset);
  var node = tree?.resolve(offset) || null;
  while (node) {
    if (
      node.firstChild?.type.name == 'OpenTag'
      && node.lastChild?.type.name == 'CloseTag'
    ) {
      return {
        open: convertRange(state.doc, node.firstChild),
        close: convertRange(state.doc, node.lastChild),
      };
    }
    node = node.parent;
  }
}

function convertRange(doc: Text, cm6Range: { from: number, to: number }) {
  return {
    from: posFromIndex(doc, cm6Range.from),
    to: posFromIndex(doc, cm6Range.to)
  }
}



class Marker {
  cm: CodeMirror;
  id: number;
  offset: number | null;
  assoc: number;

  constructor(cm: CodeMirror, offset: number, assoc: number) {
    this.cm = cm;
    this.id = cm.$mid++;
    this.offset = offset;
    this.assoc = assoc;
    cm.marks[this.id] = this;
  };
  clear() { delete this.cm.marks[this.id] };
  find(): Pos | null {
    if (this.offset == null) return null;
    return this.cm.posFromIndex(this.offset)
  };
  update(change: ChangeDesc) {
    if (this.offset != null)
      this.offset = change.mapPos(this.offset, this.assoc, MapMode.TrackDel)
  }
}



function hardWrap(cm, options) {
  var max = options.column || cm.getOption('textwidth') || 80;
  var allowMerge = options.allowMerge != false;

  var row = Math.min(options.from, options.to);
  var endRow = Math.max(options.from, options.to);

  while (row <= endRow) {
    var line = cm.getLine(row);
    if (line.length > max) {
      var space = findSpace(line, max, 5);
      if (space) {
          var indentation = /^\s*/.exec(line)?.[0];
          cm.replaceRange("\n" + indentation, new Pos(row, space.start), new Pos(row, space.end));
      }
      endRow++;
    } else if (allowMerge && /\S/.test(line) && row != endRow) {
      var nextLine = cm.getLine(row + 1);
      if (nextLine && /\S/.test(nextLine)) {
        var trimmedLine = line.replace(/\s+$/, "");
        var trimmedNextLine = nextLine.replace(/^\s+/, "");
        var mergedLine = trimmedLine + " " + trimmedNextLine;

        var space = findSpace(mergedLine, max, 5);
        if (space && space.start > trimmedLine.length || mergedLine.length < max) {
          cm.replaceRange(" ", new Pos(row, trimmedLine.length), new Pos(row + 1, nextLine.length - trimmedNextLine.length));
          row--;
          endRow--;
        } else if (trimmedLine.length < line.length) {
          cm.replaceRange("", new Pos(row, trimmedLine.length), new Pos(row, line.length));
        }
      }
    }
    row++;
  }
  return row;

  function findSpace(line, max, min) {
    if (line.length < max)
      return;
    var before = line.slice(0, max);
    var after = line.slice(max);
    var spaceAfter = /^(?:(\s+)|(\S+)(\s+))/.exec(after);
    var spaceBefore = /(?:(\s+)|(\s+)(\S+))$/.exec(before);
    var start = 0;
    var end = 0;
    if (spaceBefore && !spaceBefore[2]) {
      start = max - spaceBefore[1].length;
      end = max;
    }
    if (spaceAfter && !spaceAfter[2]) {
      if (!start)
        start = max;
      end = max + spaceAfter[1].length;
    }
    if (start) {
      return {
        start: start,
        end: end
      };
    }
    if (spaceBefore && spaceBefore[2] && spaceBefore.index > min) {
      return {
        start: spaceBefore.index,
        end: spaceBefore.index + spaceBefore[2].length
      };
    }
    if (spaceAfter && spaceAfter[2]) {
      start =  max + spaceAfter[2].length;
      return {
        start: start,
        end: start + spaceAfter[3].length
      };
    }
  }
}

