#!/usr/bin/env node
import kc, { writeFileSync as Nc } from "fs";
import Mc from "node:events";
import Dc from "node:child_process";
import qc from "node:path";
import Fc from "node:fs";
import Vc from "node:process";
import Lc from "util";
import _i from "path";
var j = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Hc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Uc(e) {
  if (e.__esModule) return e;
  var t = e.default;
  if (typeof t == "function") {
    var r = function n() {
      return this instanceof n ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    r.prototype = t.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(e).forEach(function(n) {
    var i = Object.getOwnPropertyDescriptor(e, n);
    Object.defineProperty(r, n, i.get ? i : {
      enumerable: !0,
      get: function() {
        return e[n];
      }
    });
  }), r;
}
var pe = {}, Yt = {}, bt = {};
let ya = class extends Error {
  /**
   * Constructs the CommanderError class
   * @param {number} exitCode suggested exit code which could be used with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   */
  constructor(t, r, n) {
    super(n), Error.captureStackTrace(this, this.constructor), this.name = this.constructor.name, this.code = r, this.exitCode = t, this.nestedError = void 0;
  }
}, zc = class extends ya {
  /**
   * Constructs the InvalidArgumentError class
   * @param {string} [message] explanation of why argument is invalid
   */
  constructor(t) {
    super(1, "commander.invalidArgument", t), Error.captureStackTrace(this, this.constructor), this.name = this.constructor.name;
  }
};
bt.CommanderError = ya;
bt.InvalidArgumentError = zc;
const { InvalidArgumentError: Gc } = bt;
let Bc = class {
  /**
   * Initialize a new command argument with the given name and description.
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @param {string} name
   * @param {string} [description]
   */
  constructor(t, r) {
    switch (this.description = r || "", this.variadic = !1, this.parseArg = void 0, this.defaultValue = void 0, this.defaultValueDescription = void 0, this.argChoices = void 0, t[0]) {
      case "<":
        this.required = !0, this._name = t.slice(1, -1);
        break;
      case "[":
        this.required = !1, this._name = t.slice(1, -1);
        break;
      default:
        this.required = !0, this._name = t;
        break;
    }
    this._name.length > 3 && this._name.slice(-3) === "..." && (this.variadic = !0, this._name = this._name.slice(0, -3));
  }
  /**
   * Return argument name.
   *
   * @return {string}
   */
  name() {
    return this._name;
  }
  /**
   * @package
   */
  _concatValue(t, r) {
    return r === this.defaultValue || !Array.isArray(r) ? [t] : r.concat(t);
  }
  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {*} value
   * @param {string} [description]
   * @return {Argument}
   */
  default(t, r) {
    return this.defaultValue = t, this.defaultValueDescription = r, this;
  }
  /**
   * Set the custom handler for processing CLI command arguments into argument values.
   *
   * @param {Function} [fn]
   * @return {Argument}
   */
  argParser(t) {
    return this.parseArg = t, this;
  }
  /**
   * Only allow argument value to be one of choices.
   *
   * @param {string[]} values
   * @return {Argument}
   */
  choices(t) {
    return this.argChoices = t.slice(), this.parseArg = (r, n) => {
      if (!this.argChoices.includes(r))
        throw new Gc(
          `Allowed choices are ${this.argChoices.join(", ")}.`
        );
      return this.variadic ? this._concatValue(r, n) : r;
    }, this;
  }
  /**
   * Make argument required.
   *
   * @returns {Argument}
   */
  argRequired() {
    return this.required = !0, this;
  }
  /**
   * Make argument optional.
   *
   * @returns {Argument}
   */
  argOptional() {
    return this.required = !1, this;
  }
};
function Kc(e) {
  const t = e.name() + (e.variadic === !0 ? "..." : "");
  return e.required ? "<" + t + ">" : "[" + t + "]";
}
Yt.Argument = Bc;
Yt.humanReadableArgName = Kc;
var vi = {}, qr = {};
const { humanReadableArgName: Wc } = Yt;
let Jc = class {
  constructor() {
    this.helpWidth = void 0, this.minWidthToWrap = 40, this.sortSubcommands = !1, this.sortOptions = !1, this.showGlobalOptions = !1;
  }
  /**
   * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
   * and just before calling `formatHelp()`.
   *
   * Commander just uses the helpWidth and the rest is provided for optional use by more complex subclasses.
   *
   * @param {{ error?: boolean, helpWidth?: number, outputHasColors?: boolean }} contextOptions
   */
  prepareContext(t) {
    this.helpWidth = this.helpWidth ?? t.helpWidth ?? 80;
  }
  /**
   * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
   *
   * @param {Command} cmd
   * @returns {Command[]}
   */
  visibleCommands(t) {
    const r = t.commands.filter((i) => !i._hidden), n = t._getHelpCommand();
    return n && !n._hidden && r.push(n), this.sortSubcommands && r.sort((i, s) => i.name().localeCompare(s.name())), r;
  }
  /**
   * Compare options for sort.
   *
   * @param {Option} a
   * @param {Option} b
   * @returns {number}
   */
  compareOptions(t, r) {
    const n = (i) => i.short ? i.short.replace(/^-/, "") : i.long.replace(/^--/, "");
    return n(t).localeCompare(n(r));
  }
  /**
   * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */
  visibleOptions(t) {
    const r = t.options.filter((i) => !i.hidden), n = t._getHelpOption();
    if (n && !n.hidden) {
      const i = n.short && t._findOption(n.short), s = n.long && t._findOption(n.long);
      !i && !s ? r.push(n) : n.long && !s ? r.push(
        t.createOption(n.long, n.description)
      ) : n.short && !i && r.push(
        t.createOption(n.short, n.description)
      );
    }
    return this.sortOptions && r.sort(this.compareOptions), r;
  }
  /**
   * Get an array of the visible global options. (Not including help.)
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */
  visibleGlobalOptions(t) {
    if (!this.showGlobalOptions) return [];
    const r = [];
    for (let n = t.parent; n; n = n.parent) {
      const i = n.options.filter(
        (s) => !s.hidden
      );
      r.push(...i);
    }
    return this.sortOptions && r.sort(this.compareOptions), r;
  }
  /**
   * Get an array of the arguments if any have a description.
   *
   * @param {Command} cmd
   * @returns {Argument[]}
   */
  visibleArguments(t) {
    return t._argsDescription && t.registeredArguments.forEach((r) => {
      r.description = r.description || t._argsDescription[r.name()] || "";
    }), t.registeredArguments.find((r) => r.description) ? t.registeredArguments : [];
  }
  /**
   * Get the command term to show in the list of subcommands.
   *
   * @param {Command} cmd
   * @returns {string}
   */
  subcommandTerm(t) {
    const r = t.registeredArguments.map((n) => Wc(n)).join(" ");
    return t._name + (t._aliases[0] ? "|" + t._aliases[0] : "") + (t.options.length ? " [options]" : "") + // simplistic check for non-help option
    (r ? " " + r : "");
  }
  /**
   * Get the option term to show in the list of options.
   *
   * @param {Option} option
   * @returns {string}
   */
  optionTerm(t) {
    return t.flags;
  }
  /**
   * Get the argument term to show in the list of arguments.
   *
   * @param {Argument} argument
   * @returns {string}
   */
  argumentTerm(t) {
    return t.name();
  }
  /**
   * Get the longest command term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */
  longestSubcommandTermLength(t, r) {
    return r.visibleCommands(t).reduce((n, i) => Math.max(
      n,
      this.displayWidth(
        r.styleSubcommandTerm(r.subcommandTerm(i))
      )
    ), 0);
  }
  /**
   * Get the longest option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */
  longestOptionTermLength(t, r) {
    return r.visibleOptions(t).reduce((n, i) => Math.max(
      n,
      this.displayWidth(r.styleOptionTerm(r.optionTerm(i)))
    ), 0);
  }
  /**
   * Get the longest global option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */
  longestGlobalOptionTermLength(t, r) {
    return r.visibleGlobalOptions(t).reduce((n, i) => Math.max(
      n,
      this.displayWidth(r.styleOptionTerm(r.optionTerm(i)))
    ), 0);
  }
  /**
   * Get the longest argument term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */
  longestArgumentTermLength(t, r) {
    return r.visibleArguments(t).reduce((n, i) => Math.max(
      n,
      this.displayWidth(
        r.styleArgumentTerm(r.argumentTerm(i))
      )
    ), 0);
  }
  /**
   * Get the command usage to be displayed at the top of the built-in help.
   *
   * @param {Command} cmd
   * @returns {string}
   */
  commandUsage(t) {
    let r = t._name;
    t._aliases[0] && (r = r + "|" + t._aliases[0]);
    let n = "";
    for (let i = t.parent; i; i = i.parent)
      n = i.name() + " " + n;
    return n + r + " " + t.usage();
  }
  /**
   * Get the description for the command.
   *
   * @param {Command} cmd
   * @returns {string}
   */
  commandDescription(t) {
    return t.description();
  }
  /**
   * Get the subcommand summary to show in the list of subcommands.
   * (Fallback to description for backwards compatibility.)
   *
   * @param {Command} cmd
   * @returns {string}
   */
  subcommandDescription(t) {
    return t.summary() || t.description();
  }
  /**
   * Get the option description to show in the list of options.
   *
   * @param {Option} option
   * @return {string}
   */
  optionDescription(t) {
    const r = [];
    if (t.argChoices && r.push(
      // use stringify to match the display of the default value
      `choices: ${t.argChoices.map((n) => JSON.stringify(n)).join(", ")}`
    ), t.defaultValue !== void 0 && (t.required || t.optional || t.isBoolean() && typeof t.defaultValue == "boolean") && r.push(
      `default: ${t.defaultValueDescription || JSON.stringify(t.defaultValue)}`
    ), t.presetArg !== void 0 && t.optional && r.push(`preset: ${JSON.stringify(t.presetArg)}`), t.envVar !== void 0 && r.push(`env: ${t.envVar}`), r.length > 0) {
      const n = `(${r.join(", ")})`;
      return t.description ? `${t.description} ${n}` : n;
    }
    return t.description;
  }
  /**
   * Get the argument description to show in the list of arguments.
   *
   * @param {Argument} argument
   * @return {string}
   */
  argumentDescription(t) {
    const r = [];
    if (t.argChoices && r.push(
      // use stringify to match the display of the default value
      `choices: ${t.argChoices.map((n) => JSON.stringify(n)).join(", ")}`
    ), t.defaultValue !== void 0 && r.push(
      `default: ${t.defaultValueDescription || JSON.stringify(t.defaultValue)}`
    ), r.length > 0) {
      const n = `(${r.join(", ")})`;
      return t.description ? `${t.description} ${n}` : n;
    }
    return t.description;
  }
  /**
   * Format a list of items, given a heading and an array of formatted items.
   *
   * @param {string} heading
   * @param {string[]} items
   * @param {Help} helper
   * @returns string[]
   */
  formatItemList(t, r, n) {
    return r.length === 0 ? [] : [n.styleTitle(t), ...r, ""];
  }
  /**
   * Group items by their help group heading.
   *
   * @param {Command[] | Option[]} unsortedItems
   * @param {Command[] | Option[]} visibleItems
   * @param {Function} getGroup
   * @returns {Map<string, Command[] | Option[]>}
   */
  groupItems(t, r, n) {
    const i = /* @__PURE__ */ new Map();
    return t.forEach((s) => {
      const o = n(s);
      i.has(o) || i.set(o, []);
    }), r.forEach((s) => {
      const o = n(s);
      i.has(o) || i.set(o, []), i.get(o).push(s);
    }), i;
  }
  /**
   * Generate the built-in help text.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {string}
   */
  formatHelp(t, r) {
    const n = r.padWidth(t, r), i = r.helpWidth ?? 80;
    function s(u, h) {
      return r.formatItem(u, n, h, r);
    }
    let o = [
      `${r.styleTitle("Usage:")} ${r.styleUsage(r.commandUsage(t))}`,
      ""
    ];
    const a = r.commandDescription(t);
    a.length > 0 && (o = o.concat([
      r.boxWrap(
        r.styleCommandDescription(a),
        i
      ),
      ""
    ]));
    const l = r.visibleArguments(t).map((u) => s(
      r.styleArgumentTerm(r.argumentTerm(u)),
      r.styleArgumentDescription(r.argumentDescription(u))
    ));
    if (o = o.concat(
      this.formatItemList("Arguments:", l, r)
    ), this.groupItems(
      t.options,
      r.visibleOptions(t),
      (u) => u.helpGroupHeading ?? "Options:"
    ).forEach((u, h) => {
      const y = u.map((_) => s(
        r.styleOptionTerm(r.optionTerm(_)),
        r.styleOptionDescription(r.optionDescription(_))
      ));
      o = o.concat(this.formatItemList(h, y, r));
    }), r.showGlobalOptions) {
      const u = r.visibleGlobalOptions(t).map((h) => s(
        r.styleOptionTerm(r.optionTerm(h)),
        r.styleOptionDescription(r.optionDescription(h))
      ));
      o = o.concat(
        this.formatItemList("Global Options:", u, r)
      );
    }
    return this.groupItems(
      t.commands,
      r.visibleCommands(t),
      (u) => u.helpGroup() || "Commands:"
    ).forEach((u, h) => {
      const y = u.map((_) => s(
        r.styleSubcommandTerm(r.subcommandTerm(_)),
        r.styleSubcommandDescription(r.subcommandDescription(_))
      ));
      o = o.concat(this.formatItemList(h, y, r));
    }), o.join(`
`);
  }
  /**
   * Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations.
   *
   * @param {string} str
   * @returns {number}
   */
  displayWidth(t) {
    return ga(t).length;
  }
  /**
   * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
   *
   * @param {string} str
   * @returns {string}
   */
  styleTitle(t) {
    return t;
  }
  styleUsage(t) {
    return t.split(" ").map((r) => r === "[options]" ? this.styleOptionText(r) : r === "[command]" ? this.styleSubcommandText(r) : r[0] === "[" || r[0] === "<" ? this.styleArgumentText(r) : this.styleCommandText(r)).join(" ");
  }
  styleCommandDescription(t) {
    return this.styleDescriptionText(t);
  }
  styleOptionDescription(t) {
    return this.styleDescriptionText(t);
  }
  styleSubcommandDescription(t) {
    return this.styleDescriptionText(t);
  }
  styleArgumentDescription(t) {
    return this.styleDescriptionText(t);
  }
  styleDescriptionText(t) {
    return t;
  }
  styleOptionTerm(t) {
    return this.styleOptionText(t);
  }
  styleSubcommandTerm(t) {
    return t.split(" ").map((r) => r === "[options]" ? this.styleOptionText(r) : r[0] === "[" || r[0] === "<" ? this.styleArgumentText(r) : this.styleSubcommandText(r)).join(" ");
  }
  styleArgumentTerm(t) {
    return this.styleArgumentText(t);
  }
  styleOptionText(t) {
    return t;
  }
  styleArgumentText(t) {
    return t;
  }
  styleSubcommandText(t) {
    return t;
  }
  styleCommandText(t) {
    return t;
  }
  /**
   * Calculate the pad width from the maximum term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */
  padWidth(t, r) {
    return Math.max(
      r.longestOptionTermLength(t, r),
      r.longestGlobalOptionTermLength(t, r),
      r.longestSubcommandTermLength(t, r),
      r.longestArgumentTermLength(t, r)
    );
  }
  /**
   * Detect manually wrapped and indented strings by checking for line break followed by whitespace.
   *
   * @param {string} str
   * @returns {boolean}
   */
  preformatted(t) {
    return /\n[^\S\r\n]/.test(t);
  }
  /**
   * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
   *
   * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
   *   TTT  DDD DDDD
   *        DD DDD
   *
   * @param {string} term
   * @param {number} termWidth
   * @param {string} description
   * @param {Help} helper
   * @returns {string}
   */
  formatItem(t, r, n, i) {
    const o = " ".repeat(2);
    if (!n) return o + t;
    const a = t.padEnd(
      r + t.length - i.displayWidth(t)
    ), l = 2, f = (this.helpWidth ?? 80) - r - l - 2;
    let u;
    return f < this.minWidthToWrap || i.preformatted(n) ? u = n : u = i.boxWrap(n, f).replace(
      /\n/g,
      `
` + " ".repeat(r + l)
    ), o + a + " ".repeat(l) + u.replace(/\n/g, `
${o}`);
  }
  /**
   * Wrap a string at whitespace, preserving existing line breaks.
   * Wrapping is skipped if the width is less than `minWidthToWrap`.
   *
   * @param {string} str
   * @param {number} width
   * @returns {string}
   */
  boxWrap(t, r) {
    if (r < this.minWidthToWrap) return t;
    const n = t.split(/\r\n|\n/), i = /[\s]*[^\s]+/g, s = [];
    return n.forEach((o) => {
      const a = o.match(i);
      if (a === null) {
        s.push("");
        return;
      }
      let l = [a.shift()], c = this.displayWidth(l[0]);
      a.forEach((f) => {
        const u = this.displayWidth(f);
        if (c + u <= r) {
          l.push(f), c += u;
          return;
        }
        s.push(l.join(""));
        const h = f.trimStart();
        l = [h], c = this.displayWidth(h);
      }), s.push(l.join(""));
    }), s.join(`
`);
  }
};
function ga(e) {
  const t = /\x1b\[\d*(;\d*)*m/g;
  return e.replace(t, "");
}
qr.Help = Jc;
qr.stripColor = ga;
var Fr = {};
const { InvalidArgumentError: Yc } = bt;
let Xc = class {
  /**
   * Initialize a new `Option` with the given `flags` and `description`.
   *
   * @param {string} flags
   * @param {string} [description]
   */
  constructor(t, r) {
    this.flags = t, this.description = r || "", this.required = t.includes("<"), this.optional = t.includes("["), this.variadic = /\w\.\.\.[>\]]$/.test(t), this.mandatory = !1;
    const n = Zc(t);
    this.short = n.shortFlag, this.long = n.longFlag, this.negate = !1, this.long && (this.negate = this.long.startsWith("--no-")), this.defaultValue = void 0, this.defaultValueDescription = void 0, this.presetArg = void 0, this.envVar = void 0, this.parseArg = void 0, this.hidden = !1, this.argChoices = void 0, this.conflictsWith = [], this.implied = void 0, this.helpGroupHeading = void 0;
  }
  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {*} value
   * @param {string} [description]
   * @return {Option}
   */
  default(t, r) {
    return this.defaultValue = t, this.defaultValueDescription = r, this;
  }
  /**
   * Preset to use when option used without option-argument, especially optional but also boolean and negated.
   * The custom processing (parseArg) is called.
   *
   * @example
   * new Option('--color').default('GREYSCALE').preset('RGB');
   * new Option('--donate [amount]').preset('20').argParser(parseFloat);
   *
   * @param {*} arg
   * @return {Option}
   */
  preset(t) {
    return this.presetArg = t, this;
  }
  /**
   * Add option name(s) that conflict with this option.
   * An error will be displayed if conflicting options are found during parsing.
   *
   * @example
   * new Option('--rgb').conflicts('cmyk');
   * new Option('--js').conflicts(['ts', 'jsx']);
   *
   * @param {(string | string[])} names
   * @return {Option}
   */
  conflicts(t) {
    return this.conflictsWith = this.conflictsWith.concat(t), this;
  }
  /**
   * Specify implied option values for when this option is set and the implied options are not.
   *
   * The custom processing (parseArg) is not called on the implied values.
   *
   * @example
   * program
   *   .addOption(new Option('--log', 'write logging information to file'))
   *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
   *
   * @param {object} impliedOptionValues
   * @return {Option}
   */
  implies(t) {
    let r = t;
    return typeof t == "string" && (r = { [t]: !0 }), this.implied = Object.assign(this.implied || {}, r), this;
  }
  /**
   * Set environment variable to check for option value.
   *
   * An environment variable is only used if when processed the current option value is
   * undefined, or the source of the current value is 'default' or 'config' or 'env'.
   *
   * @param {string} name
   * @return {Option}
   */
  env(t) {
    return this.envVar = t, this;
  }
  /**
   * Set the custom handler for processing CLI option arguments into option values.
   *
   * @param {Function} [fn]
   * @return {Option}
   */
  argParser(t) {
    return this.parseArg = t, this;
  }
  /**
   * Whether the option is mandatory and must have a value after parsing.
   *
   * @param {boolean} [mandatory=true]
   * @return {Option}
   */
  makeOptionMandatory(t = !0) {
    return this.mandatory = !!t, this;
  }
  /**
   * Hide option in help.
   *
   * @param {boolean} [hide=true]
   * @return {Option}
   */
  hideHelp(t = !0) {
    return this.hidden = !!t, this;
  }
  /**
   * @package
   */
  _concatValue(t, r) {
    return r === this.defaultValue || !Array.isArray(r) ? [t] : r.concat(t);
  }
  /**
   * Only allow option value to be one of choices.
   *
   * @param {string[]} values
   * @return {Option}
   */
  choices(t) {
    return this.argChoices = t.slice(), this.parseArg = (r, n) => {
      if (!this.argChoices.includes(r))
        throw new Yc(
          `Allowed choices are ${this.argChoices.join(", ")}.`
        );
      return this.variadic ? this._concatValue(r, n) : r;
    }, this;
  }
  /**
   * Return option name.
   *
   * @return {string}
   */
  name() {
    return this.long ? this.long.replace(/^--/, "") : this.short.replace(/^-/, "");
  }
  /**
   * Return option name, in a camelcase format that can be used
   * as an object attribute key.
   *
   * @return {string}
   */
  attributeName() {
    return this.negate ? Ks(this.name().replace(/^no-/, "")) : Ks(this.name());
  }
  /**
   * Set the help group heading.
   *
   * @param {string} heading
   * @return {Option}
   */
  helpGroup(t) {
    return this.helpGroupHeading = t, this;
  }
  /**
   * Check if `arg` matches the short or long flag.
   *
   * @param {string} arg
   * @return {boolean}
   * @package
   */
  is(t) {
    return this.short === t || this.long === t;
  }
  /**
   * Return whether a boolean option.
   *
   * Options are one of boolean, negated, required argument, or optional argument.
   *
   * @return {boolean}
   * @package
   */
  isBoolean() {
    return !this.required && !this.optional && !this.negate;
  }
}, Qc = class {
  /**
   * @param {Option[]} options
   */
  constructor(t) {
    this.positiveOptions = /* @__PURE__ */ new Map(), this.negativeOptions = /* @__PURE__ */ new Map(), this.dualOptions = /* @__PURE__ */ new Set(), t.forEach((r) => {
      r.negate ? this.negativeOptions.set(r.attributeName(), r) : this.positiveOptions.set(r.attributeName(), r);
    }), this.negativeOptions.forEach((r, n) => {
      this.positiveOptions.has(n) && this.dualOptions.add(n);
    });
  }
  /**
   * Did the value come from the option, and not from possible matching dual option?
   *
   * @param {*} value
   * @param {Option} option
   * @returns {boolean}
   */
  valueFromOption(t, r) {
    const n = r.attributeName();
    if (!this.dualOptions.has(n)) return !0;
    const i = this.negativeOptions.get(n).presetArg, s = i !== void 0 ? i : !1;
    return r.negate === (s === t);
  }
};
function Ks(e) {
  return e.split("-").reduce((t, r) => t + r[0].toUpperCase() + r.slice(1));
}
function Zc(e) {
  let t, r;
  const n = /^-[^-]$/, i = /^--[^-]/, s = e.split(/[ |,]+/).concat("guard");
  if (n.test(s[0]) && (t = s.shift()), i.test(s[0]) && (r = s.shift()), !t && n.test(s[0]) && (t = s.shift()), !t && i.test(s[0]) && (t = r, r = s.shift()), s[0].startsWith("-")) {
    const o = s[0], a = `option creation failed due to '${o}' in option flags '${e}'`;
    throw /^-[^-][^-]/.test(o) ? new Error(
      `${a}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`
    ) : n.test(o) ? new Error(`${a}
- too many short flags`) : i.test(o) ? new Error(`${a}
- too many long flags`) : new Error(`${a}
- unrecognised flag format`);
  }
  if (t === void 0 && r === void 0)
    throw new Error(
      `option creation failed due to no flags found in '${e}'.`
    );
  return { shortFlag: t, longFlag: r };
}
Fr.Option = Xc;
Fr.DualOptions = Qc;
var $a = {};
const _a = 3;
function eu(e, t) {
  if (Math.abs(e.length - t.length) > _a)
    return Math.max(e.length, t.length);
  const r = [];
  for (let n = 0; n <= e.length; n++)
    r[n] = [n];
  for (let n = 0; n <= t.length; n++)
    r[0][n] = n;
  for (let n = 1; n <= t.length; n++)
    for (let i = 1; i <= e.length; i++) {
      let s = 1;
      e[i - 1] === t[n - 1] ? s = 0 : s = 1, r[i][n] = Math.min(
        r[i - 1][n] + 1,
        // deletion
        r[i][n - 1] + 1,
        // insertion
        r[i - 1][n - 1] + s
        // substitution
      ), i > 1 && n > 1 && e[i - 1] === t[n - 2] && e[i - 2] === t[n - 1] && (r[i][n] = Math.min(r[i][n], r[i - 2][n - 2] + 1));
    }
  return r[e.length][t.length];
}
function tu(e, t) {
  if (!t || t.length === 0) return "";
  t = Array.from(new Set(t));
  const r = e.startsWith("--");
  r && (e = e.slice(2), t = t.map((o) => o.slice(2)));
  let n = [], i = _a;
  const s = 0.4;
  return t.forEach((o) => {
    if (o.length <= 1) return;
    const a = eu(e, o), l = Math.max(e.length, o.length);
    (l - a) / l > s && (a < i ? (i = a, n = [o]) : a === i && n.push(o));
  }), n.sort((o, a) => o.localeCompare(a)), r && (n = n.map((o) => `--${o}`)), n.length > 1 ? `
(Did you mean one of ${n.join(", ")}?)` : n.length === 1 ? `
(Did you mean ${n[0]}?)` : "";
}
$a.suggestSimilar = tu;
const ru = Mc.EventEmitter, Cn = Dc, Ce = qc, or = Fc, H = Vc, { Argument: nu, humanReadableArgName: iu } = Yt, { CommanderError: In } = bt, { Help: su, stripColor: ou } = qr, { Option: Ws, DualOptions: au } = Fr, { suggestSimilar: Js } = $a;
let lu = class va extends ru {
  /**
   * Initialize a new `Command`.
   *
   * @param {string} [name]
   */
  constructor(t) {
    super(), this.commands = [], this.options = [], this.parent = null, this._allowUnknownOption = !1, this._allowExcessArguments = !1, this.registeredArguments = [], this._args = this.registeredArguments, this.args = [], this.rawArgs = [], this.processedArgs = [], this._scriptPath = null, this._name = t || "", this._optionValues = {}, this._optionValueSources = {}, this._storeOptionsAsProperties = !1, this._actionHandler = null, this._executableHandler = !1, this._executableFile = null, this._executableDir = null, this._defaultCommandName = null, this._exitCallback = null, this._aliases = [], this._combineFlagAndOptionalValue = !0, this._description = "", this._summary = "", this._argsDescription = void 0, this._enablePositionalOptions = !1, this._passThroughOptions = !1, this._lifeCycleHooks = {}, this._showHelpAfterError = !1, this._showSuggestionAfterError = !0, this._savedState = null, this._outputConfiguration = {
      writeOut: (r) => H.stdout.write(r),
      writeErr: (r) => H.stderr.write(r),
      outputError: (r, n) => n(r),
      getOutHelpWidth: () => H.stdout.isTTY ? H.stdout.columns : void 0,
      getErrHelpWidth: () => H.stderr.isTTY ? H.stderr.columns : void 0,
      getOutHasColors: () => {
        var r, n;
        return Kn() ?? (H.stdout.isTTY && ((n = (r = H.stdout).hasColors) == null ? void 0 : n.call(r)));
      },
      getErrHasColors: () => {
        var r, n;
        return Kn() ?? (H.stderr.isTTY && ((n = (r = H.stderr).hasColors) == null ? void 0 : n.call(r)));
      },
      stripColor: (r) => ou(r)
    }, this._hidden = !1, this._helpOption = void 0, this._addImplicitHelpCommand = void 0, this._helpCommand = void 0, this._helpConfiguration = {}, this._helpGroupHeading = void 0, this._defaultCommandGroup = void 0, this._defaultOptionGroup = void 0;
  }
  /**
   * Copy settings that are useful to have in common across root command and subcommands.
   *
   * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
   *
   * @param {Command} sourceCommand
   * @return {Command} `this` command for chaining
   */
  copyInheritedSettings(t) {
    return this._outputConfiguration = t._outputConfiguration, this._helpOption = t._helpOption, this._helpCommand = t._helpCommand, this._helpConfiguration = t._helpConfiguration, this._exitCallback = t._exitCallback, this._storeOptionsAsProperties = t._storeOptionsAsProperties, this._combineFlagAndOptionalValue = t._combineFlagAndOptionalValue, this._allowExcessArguments = t._allowExcessArguments, this._enablePositionalOptions = t._enablePositionalOptions, this._showHelpAfterError = t._showHelpAfterError, this._showSuggestionAfterError = t._showSuggestionAfterError, this;
  }
  /**
   * @returns {Command[]}
   * @private
   */
  _getCommandAndAncestors() {
    const t = [];
    for (let r = this; r; r = r.parent)
      t.push(r);
    return t;
  }
  /**
   * Define a command.
   *
   * There are two styles of command: pay attention to where to put the description.
   *
   * @example
   * // Command implemented using action handler (description is supplied separately to `.command`)
   * program
   *   .command('clone <source> [destination]')
   *   .description('clone a repository into a newly created directory')
   *   .action((source, destination) => {
   *     console.log('clone command called');
   *   });
   *
   * // Command implemented using separate executable file (description is second parameter to `.command`)
   * program
   *   .command('start <service>', 'start named service')
   *   .command('stop [service]', 'stop named service, or all if no name supplied');
   *
   * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
   * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
   * @param {object} [execOpts] - configuration options (for executable)
   * @return {Command} returns new command for action handler, or `this` for executable command
   */
  command(t, r, n) {
    let i = r, s = n;
    typeof i == "object" && i !== null && (s = i, i = null), s = s || {};
    const [, o, a] = t.match(/([^ ]+) *(.*)/), l = this.createCommand(o);
    return i && (l.description(i), l._executableHandler = !0), s.isDefault && (this._defaultCommandName = l._name), l._hidden = !!(s.noHelp || s.hidden), l._executableFile = s.executableFile || null, a && l.arguments(a), this._registerCommand(l), l.parent = this, l.copyInheritedSettings(this), i ? this : l;
  }
  /**
   * Factory routine to create a new unattached command.
   *
   * See .command() for creating an attached subcommand, which uses this routine to
   * create the command. You can override createCommand to customise subcommands.
   *
   * @param {string} [name]
   * @return {Command} new command
   */
  createCommand(t) {
    return new va(t);
  }
  /**
   * You can customise the help with a subclass of Help by overriding createHelp,
   * or by overriding Help properties using configureHelp().
   *
   * @return {Help}
   */
  createHelp() {
    return Object.assign(new su(), this.configureHelp());
  }
  /**
   * You can customise the help by overriding Help properties using configureHelp(),
   * or with a subclass of Help by overriding createHelp().
   *
   * @param {object} [configuration] - configuration options
   * @return {(Command | object)} `this` command for chaining, or stored configuration
   */
  configureHelp(t) {
    return t === void 0 ? this._helpConfiguration : (this._helpConfiguration = t, this);
  }
  /**
   * The default output goes to stdout and stderr. You can customise this for special
   * applications. You can also customise the display of errors by overriding outputError.
   *
   * The configuration properties are all functions:
   *
   *     // change how output being written, defaults to stdout and stderr
   *     writeOut(str)
   *     writeErr(str)
   *     // change how output being written for errors, defaults to writeErr
   *     outputError(str, write) // used for displaying errors and not used for displaying help
   *     // specify width for wrapping help
   *     getOutHelpWidth()
   *     getErrHelpWidth()
   *     // color support, currently only used with Help
   *     getOutHasColors()
   *     getErrHasColors()
   *     stripColor() // used to remove ANSI escape codes if output does not have colors
   *
   * @param {object} [configuration] - configuration options
   * @return {(Command | object)} `this` command for chaining, or stored configuration
   */
  configureOutput(t) {
    return t === void 0 ? this._outputConfiguration : (this._outputConfiguration = Object.assign(
      {},
      this._outputConfiguration,
      t
    ), this);
  }
  /**
   * Display the help or a custom message after an error occurs.
   *
   * @param {(boolean|string)} [displayHelp]
   * @return {Command} `this` command for chaining
   */
  showHelpAfterError(t = !0) {
    return typeof t != "string" && (t = !!t), this._showHelpAfterError = t, this;
  }
  /**
   * Display suggestion of similar commands for unknown commands, or options for unknown options.
   *
   * @param {boolean} [displaySuggestion]
   * @return {Command} `this` command for chaining
   */
  showSuggestionAfterError(t = !0) {
    return this._showSuggestionAfterError = !!t, this;
  }
  /**
   * Add a prepared subcommand.
   *
   * See .command() for creating an attached subcommand which inherits settings from its parent.
   *
   * @param {Command} cmd - new subcommand
   * @param {object} [opts] - configuration options
   * @return {Command} `this` command for chaining
   */
  addCommand(t, r) {
    if (!t._name)
      throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
    return r = r || {}, r.isDefault && (this._defaultCommandName = t._name), (r.noHelp || r.hidden) && (t._hidden = !0), this._registerCommand(t), t.parent = this, t._checkForBrokenPassThrough(), this;
  }
  /**
   * Factory routine to create a new unattached argument.
   *
   * See .argument() for creating an attached argument, which uses this routine to
   * create the argument. You can override createArgument to return a custom argument.
   *
   * @param {string} name
   * @param {string} [description]
   * @return {Argument} new argument
   */
  createArgument(t, r) {
    return new nu(t, r);
  }
  /**
   * Define argument syntax for command.
   *
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @example
   * program.argument('<input-file>');
   * program.argument('[output-file]');
   *
   * @param {string} name
   * @param {string} [description]
   * @param {(Function|*)} [parseArg] - custom argument processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */
  argument(t, r, n, i) {
    const s = this.createArgument(t, r);
    return typeof n == "function" ? s.default(i).argParser(n) : s.default(n), this.addArgument(s), this;
  }
  /**
   * Define argument syntax for command, adding multiple at once (without descriptions).
   *
   * See also .argument().
   *
   * @example
   * program.arguments('<cmd> [env]');
   *
   * @param {string} names
   * @return {Command} `this` command for chaining
   */
  arguments(t) {
    return t.trim().split(/ +/).forEach((r) => {
      this.argument(r);
    }), this;
  }
  /**
   * Define argument syntax for command, adding a prepared argument.
   *
   * @param {Argument} argument
   * @return {Command} `this` command for chaining
   */
  addArgument(t) {
    const r = this.registeredArguments.slice(-1)[0];
    if (r && r.variadic)
      throw new Error(
        `only the last argument can be variadic '${r.name()}'`
      );
    if (t.required && t.defaultValue !== void 0 && t.parseArg === void 0)
      throw new Error(
        `a default value for a required argument is never used: '${t.name()}'`
      );
    return this.registeredArguments.push(t), this;
  }
  /**
   * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
   *
   * @example
   *    program.helpCommand('help [cmd]');
   *    program.helpCommand('help [cmd]', 'show help');
   *    program.helpCommand(false); // suppress default help command
   *    program.helpCommand(true); // add help command even if no subcommands
   *
   * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
   * @param {string} [description] - custom description
   * @return {Command} `this` command for chaining
   */
  helpCommand(t, r) {
    if (typeof t == "boolean")
      return this._addImplicitHelpCommand = t, t && this._defaultCommandGroup && this._initCommandGroup(this._getHelpCommand()), this;
    const n = t ?? "help [command]", [, i, s] = n.match(/([^ ]+) *(.*)/), o = r ?? "display help for command", a = this.createCommand(i);
    return a.helpOption(!1), s && a.arguments(s), o && a.description(o), this._addImplicitHelpCommand = !0, this._helpCommand = a, (t || r) && this._initCommandGroup(a), this;
  }
  /**
   * Add prepared custom help command.
   *
   * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
   * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
   * @return {Command} `this` command for chaining
   */
  addHelpCommand(t, r) {
    return typeof t != "object" ? (this.helpCommand(t, r), this) : (this._addImplicitHelpCommand = !0, this._helpCommand = t, this._initCommandGroup(t), this);
  }
  /**
   * Lazy create help command.
   *
   * @return {(Command|null)}
   * @package
   */
  _getHelpCommand() {
    return this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help")) ? (this._helpCommand === void 0 && this.helpCommand(void 0, void 0), this._helpCommand) : null;
  }
  /**
   * Add hook for life cycle event.
   *
   * @param {string} event
   * @param {Function} listener
   * @return {Command} `this` command for chaining
   */
  hook(t, r) {
    const n = ["preSubcommand", "preAction", "postAction"];
    if (!n.includes(t))
      throw new Error(`Unexpected value for event passed to hook : '${t}'.
Expecting one of '${n.join("', '")}'`);
    return this._lifeCycleHooks[t] ? this._lifeCycleHooks[t].push(r) : this._lifeCycleHooks[t] = [r], this;
  }
  /**
   * Register callback to use as replacement for calling process.exit.
   *
   * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
   * @return {Command} `this` command for chaining
   */
  exitOverride(t) {
    return t ? this._exitCallback = t : this._exitCallback = (r) => {
      if (r.code !== "commander.executeSubCommandAsync")
        throw r;
    }, this;
  }
  /**
   * Call process.exit, and _exitCallback if defined.
   *
   * @param {number} exitCode exit code for using with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   * @return never
   * @private
   */
  _exit(t, r, n) {
    this._exitCallback && this._exitCallback(new In(t, r, n)), H.exit(t);
  }
  /**
   * Register callback `fn` for the command.
   *
   * @example
   * program
   *   .command('serve')
   *   .description('start service')
   *   .action(function() {
   *      // do work here
   *   });
   *
   * @param {Function} fn
   * @return {Command} `this` command for chaining
   */
  action(t) {
    const r = (n) => {
      const i = this.registeredArguments.length, s = n.slice(0, i);
      return this._storeOptionsAsProperties ? s[i] = this : s[i] = this.opts(), s.push(this), t.apply(this, s);
    };
    return this._actionHandler = r, this;
  }
  /**
   * Factory routine to create a new unattached option.
   *
   * See .option() for creating an attached option, which uses this routine to
   * create the option. You can override createOption to return a custom option.
   *
   * @param {string} flags
   * @param {string} [description]
   * @return {Option} new option
   */
  createOption(t, r) {
    return new Ws(t, r);
  }
  /**
   * Wrap parseArgs to catch 'commander.invalidArgument'.
   *
   * @param {(Option | Argument)} target
   * @param {string} value
   * @param {*} previous
   * @param {string} invalidArgumentMessage
   * @private
   */
  _callParseArg(t, r, n, i) {
    try {
      return t.parseArg(r, n);
    } catch (s) {
      if (s.code === "commander.invalidArgument") {
        const o = `${i} ${s.message}`;
        this.error(o, { exitCode: s.exitCode, code: s.code });
      }
      throw s;
    }
  }
  /**
   * Check for option flag conflicts.
   * Register option if no conflicts found, or throw on conflict.
   *
   * @param {Option} option
   * @private
   */
  _registerOption(t) {
    const r = t.short && this._findOption(t.short) || t.long && this._findOption(t.long);
    if (r) {
      const n = t.long && this._findOption(t.long) ? t.long : t.short;
      throw new Error(`Cannot add option '${t.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${n}'
-  already used by option '${r.flags}'`);
    }
    this._initOptionGroup(t), this.options.push(t);
  }
  /**
   * Check for command name and alias conflicts with existing commands.
   * Register command if no conflicts found, or throw on conflict.
   *
   * @param {Command} command
   * @private
   */
  _registerCommand(t) {
    const r = (i) => [i.name()].concat(i.aliases()), n = r(t).find(
      (i) => this._findCommand(i)
    );
    if (n) {
      const i = r(this._findCommand(n)).join("|"), s = r(t).join("|");
      throw new Error(
        `cannot add command '${s}' as already have command '${i}'`
      );
    }
    this._initCommandGroup(t), this.commands.push(t);
  }
  /**
   * Add an option.
   *
   * @param {Option} option
   * @return {Command} `this` command for chaining
   */
  addOption(t) {
    this._registerOption(t);
    const r = t.name(), n = t.attributeName();
    if (t.negate) {
      const s = t.long.replace(/^--no-/, "--");
      this._findOption(s) || this.setOptionValueWithSource(
        n,
        t.defaultValue === void 0 ? !0 : t.defaultValue,
        "default"
      );
    } else t.defaultValue !== void 0 && this.setOptionValueWithSource(n, t.defaultValue, "default");
    const i = (s, o, a) => {
      s == null && t.presetArg !== void 0 && (s = t.presetArg);
      const l = this.getOptionValue(n);
      s !== null && t.parseArg ? s = this._callParseArg(t, s, l, o) : s !== null && t.variadic && (s = t._concatValue(s, l)), s == null && (t.negate ? s = !1 : t.isBoolean() || t.optional ? s = !0 : s = ""), this.setOptionValueWithSource(n, s, a);
    };
    return this.on("option:" + r, (s) => {
      const o = `error: option '${t.flags}' argument '${s}' is invalid.`;
      i(s, o, "cli");
    }), t.envVar && this.on("optionEnv:" + r, (s) => {
      const o = `error: option '${t.flags}' value '${s}' from env '${t.envVar}' is invalid.`;
      i(s, o, "env");
    }), this;
  }
  /**
   * Internal implementation shared by .option() and .requiredOption()
   *
   * @return {Command} `this` command for chaining
   * @private
   */
  _optionEx(t, r, n, i, s) {
    if (typeof r == "object" && r instanceof Ws)
      throw new Error(
        "To add an Option object use addOption() instead of option() or requiredOption()"
      );
    const o = this.createOption(r, n);
    if (o.makeOptionMandatory(!!t.mandatory), typeof i == "function")
      o.default(s).argParser(i);
    else if (i instanceof RegExp) {
      const a = i;
      i = (l, c) => {
        const f = a.exec(l);
        return f ? f[0] : c;
      }, o.default(s).argParser(i);
    } else
      o.default(i);
    return this.addOption(o);
  }
  /**
   * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
   *
   * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
   * option-argument is indicated by `<>` and an optional option-argument by `[]`.
   *
   * See the README for more details, and see also addOption() and requiredOption().
   *
   * @example
   * program
   *     .option('-p, --pepper', 'add pepper')
   *     .option('--pt, --pizza-type <TYPE>', 'type of pizza') // required option-argument
   *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
   *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
   *
   * @param {string} flags
   * @param {string} [description]
   * @param {(Function|*)} [parseArg] - custom option processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */
  option(t, r, n, i) {
    return this._optionEx({}, t, r, n, i);
  }
  /**
   * Add a required option which must have a value after parsing. This usually means
   * the option must be specified on the command line. (Otherwise the same as .option().)
   *
   * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
   *
   * @param {string} flags
   * @param {string} [description]
   * @param {(Function|*)} [parseArg] - custom option processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */
  requiredOption(t, r, n, i) {
    return this._optionEx(
      { mandatory: !0 },
      t,
      r,
      n,
      i
    );
  }
  /**
   * Alter parsing of short flags with optional values.
   *
   * @example
   * // for `.option('-f,--flag [value]'):
   * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
   * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
   *
   * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
   * @return {Command} `this` command for chaining
   */
  combineFlagAndOptionalValue(t = !0) {
    return this._combineFlagAndOptionalValue = !!t, this;
  }
  /**
   * Allow unknown options on the command line.
   *
   * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
   * @return {Command} `this` command for chaining
   */
  allowUnknownOption(t = !0) {
    return this._allowUnknownOption = !!t, this;
  }
  /**
   * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
   *
   * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
   * @return {Command} `this` command for chaining
   */
  allowExcessArguments(t = !0) {
    return this._allowExcessArguments = !!t, this;
  }
  /**
   * Enable positional options. Positional means global options are specified before subcommands which lets
   * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
   * The default behaviour is non-positional and global options may appear anywhere on the command line.
   *
   * @param {boolean} [positional]
   * @return {Command} `this` command for chaining
   */
  enablePositionalOptions(t = !0) {
    return this._enablePositionalOptions = !!t, this;
  }
  /**
   * Pass through options that come after command-arguments rather than treat them as command-options,
   * so actual command-options come before command-arguments. Turning this on for a subcommand requires
   * positional options to have been enabled on the program (parent commands).
   * The default behaviour is non-positional and options may appear before or after command-arguments.
   *
   * @param {boolean} [passThrough] for unknown options.
   * @return {Command} `this` command for chaining
   */
  passThroughOptions(t = !0) {
    return this._passThroughOptions = !!t, this._checkForBrokenPassThrough(), this;
  }
  /**
   * @private
   */
  _checkForBrokenPassThrough() {
    if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions)
      throw new Error(
        `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
      );
  }
  /**
   * Whether to store option values as properties on command object,
   * or store separately (specify false). In both cases the option values can be accessed using .opts().
   *
   * @param {boolean} [storeAsProperties=true]
   * @return {Command} `this` command for chaining
   */
  storeOptionsAsProperties(t = !0) {
    if (this.options.length)
      throw new Error("call .storeOptionsAsProperties() before adding options");
    if (Object.keys(this._optionValues).length)
      throw new Error(
        "call .storeOptionsAsProperties() before setting option values"
      );
    return this._storeOptionsAsProperties = !!t, this;
  }
  /**
   * Retrieve option value.
   *
   * @param {string} key
   * @return {object} value
   */
  getOptionValue(t) {
    return this._storeOptionsAsProperties ? this[t] : this._optionValues[t];
  }
  /**
   * Store option value.
   *
   * @param {string} key
   * @param {object} value
   * @return {Command} `this` command for chaining
   */
  setOptionValue(t, r) {
    return this.setOptionValueWithSource(t, r, void 0);
  }
  /**
   * Store option value and where the value came from.
   *
   * @param {string} key
   * @param {object} value
   * @param {string} source - expected values are default/config/env/cli/implied
   * @return {Command} `this` command for chaining
   */
  setOptionValueWithSource(t, r, n) {
    return this._storeOptionsAsProperties ? this[t] = r : this._optionValues[t] = r, this._optionValueSources[t] = n, this;
  }
  /**
   * Get source of option value.
   * Expected values are default | config | env | cli | implied
   *
   * @param {string} key
   * @return {string}
   */
  getOptionValueSource(t) {
    return this._optionValueSources[t];
  }
  /**
   * Get source of option value. See also .optsWithGlobals().
   * Expected values are default | config | env | cli | implied
   *
   * @param {string} key
   * @return {string}
   */
  getOptionValueSourceWithGlobals(t) {
    let r;
    return this._getCommandAndAncestors().forEach((n) => {
      n.getOptionValueSource(t) !== void 0 && (r = n.getOptionValueSource(t));
    }), r;
  }
  /**
   * Get user arguments from implied or explicit arguments.
   * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
   *
   * @private
   */
  _prepareUserArgs(t, r) {
    var i;
    if (t !== void 0 && !Array.isArray(t))
      throw new Error("first parameter to parse must be array or undefined");
    if (r = r || {}, t === void 0 && r.from === void 0) {
      (i = H.versions) != null && i.electron && (r.from = "electron");
      const s = H.execArgv ?? [];
      (s.includes("-e") || s.includes("--eval") || s.includes("-p") || s.includes("--print")) && (r.from = "eval");
    }
    t === void 0 && (t = H.argv), this.rawArgs = t.slice();
    let n;
    switch (r.from) {
      case void 0:
      case "node":
        this._scriptPath = t[1], n = t.slice(2);
        break;
      case "electron":
        H.defaultApp ? (this._scriptPath = t[1], n = t.slice(2)) : n = t.slice(1);
        break;
      case "user":
        n = t.slice(0);
        break;
      case "eval":
        n = t.slice(1);
        break;
      default:
        throw new Error(
          `unexpected parse option { from: '${r.from}' }`
        );
    }
    return !this._name && this._scriptPath && this.nameFromFilename(this._scriptPath), this._name = this._name || "program", n;
  }
  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * Use parseAsync instead of parse if any of your action handlers are async.
   *
   * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
   *
   * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
   * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
   * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
   * - `'user'`: just user arguments
   *
   * @example
   * program.parse(); // parse process.argv and auto-detect electron and special node flags
   * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
   * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv] - optional, defaults to process.argv
   * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
   * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
   * @return {Command} `this` command for chaining
   */
  parse(t, r) {
    this._prepareForParse();
    const n = this._prepareUserArgs(t, r);
    return this._parseCommand([], n), this;
  }
  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
   *
   * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
   * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
   * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
   * - `'user'`: just user arguments
   *
   * @example
   * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
   * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
   * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv]
   * @param {object} [parseOptions]
   * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
   * @return {Promise}
   */
  async parseAsync(t, r) {
    this._prepareForParse();
    const n = this._prepareUserArgs(t, r);
    return await this._parseCommand([], n), this;
  }
  _prepareForParse() {
    this._savedState === null ? this.saveStateBeforeParse() : this.restoreStateBeforeParse();
  }
  /**
   * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
   * Not usually called directly, but available for subclasses to save their custom state.
   *
   * This is called in a lazy way. Only commands used in parsing chain will have state saved.
   */
  saveStateBeforeParse() {
    this._savedState = {
      // name is stable if supplied by author, but may be unspecified for root command and deduced during parsing
      _name: this._name,
      // option values before parse have default values (including false for negated options)
      // shallow clones
      _optionValues: { ...this._optionValues },
      _optionValueSources: { ...this._optionValueSources }
    };
  }
  /**
   * Restore state before parse for calls after the first.
   * Not usually called directly, but available for subclasses to save their custom state.
   *
   * This is called in a lazy way. Only commands used in parsing chain will have state restored.
   */
  restoreStateBeforeParse() {
    if (this._storeOptionsAsProperties)
      throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
    this._name = this._savedState._name, this._scriptPath = null, this.rawArgs = [], this._optionValues = { ...this._savedState._optionValues }, this._optionValueSources = { ...this._savedState._optionValueSources }, this.args = [], this.processedArgs = [];
  }
  /**
   * Throw if expected executable is missing. Add lots of help for author.
   *
   * @param {string} executableFile
   * @param {string} executableDir
   * @param {string} subcommandName
   */
  _checkForMissingExecutable(t, r, n) {
    if (or.existsSync(t)) return;
    const i = r ? `searched for local subcommand relative to directory '${r}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory", s = `'${t}' does not exist
 - if '${n}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${i}`;
    throw new Error(s);
  }
  /**
   * Execute a sub-command executable.
   *
   * @private
   */
  _executeSubCommand(t, r) {
    r = r.slice();
    let n = !1;
    const i = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
    function s(f, u) {
      const h = Ce.resolve(f, u);
      if (or.existsSync(h)) return h;
      if (i.includes(Ce.extname(u))) return;
      const y = i.find(
        (_) => or.existsSync(`${h}${_}`)
      );
      if (y) return `${h}${y}`;
    }
    this._checkForMissingMandatoryOptions(), this._checkForConflictingOptions();
    let o = t._executableFile || `${this._name}-${t._name}`, a = this._executableDir || "";
    if (this._scriptPath) {
      let f;
      try {
        f = or.realpathSync(this._scriptPath);
      } catch {
        f = this._scriptPath;
      }
      a = Ce.resolve(
        Ce.dirname(f),
        a
      );
    }
    if (a) {
      let f = s(a, o);
      if (!f && !t._executableFile && this._scriptPath) {
        const u = Ce.basename(
          this._scriptPath,
          Ce.extname(this._scriptPath)
        );
        u !== this._name && (f = s(
          a,
          `${u}-${t._name}`
        ));
      }
      o = f || o;
    }
    n = i.includes(Ce.extname(o));
    let l;
    H.platform !== "win32" ? n ? (r.unshift(o), r = Ys(H.execArgv).concat(r), l = Cn.spawn(H.argv[0], r, { stdio: "inherit" })) : l = Cn.spawn(o, r, { stdio: "inherit" }) : (this._checkForMissingExecutable(
      o,
      a,
      t._name
    ), r.unshift(o), r = Ys(H.execArgv).concat(r), l = Cn.spawn(H.execPath, r, { stdio: "inherit" })), l.killed || ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"].forEach((u) => {
      H.on(u, () => {
        l.killed === !1 && l.exitCode === null && l.kill(u);
      });
    });
    const c = this._exitCallback;
    l.on("close", (f) => {
      f = f ?? 1, c ? c(
        new In(
          f,
          "commander.executeSubCommandAsync",
          "(close)"
        )
      ) : H.exit(f);
    }), l.on("error", (f) => {
      if (f.code === "ENOENT")
        this._checkForMissingExecutable(
          o,
          a,
          t._name
        );
      else if (f.code === "EACCES")
        throw new Error(`'${o}' not executable`);
      if (!c)
        H.exit(1);
      else {
        const u = new In(
          1,
          "commander.executeSubCommandAsync",
          "(error)"
        );
        u.nestedError = f, c(u);
      }
    }), this.runningCommand = l;
  }
  /**
   * @private
   */
  _dispatchSubcommand(t, r, n) {
    const i = this._findCommand(t);
    i || this.help({ error: !0 }), i._prepareForParse();
    let s;
    return s = this._chainOrCallSubCommandHook(
      s,
      i,
      "preSubcommand"
    ), s = this._chainOrCall(s, () => {
      if (i._executableHandler)
        this._executeSubCommand(i, r.concat(n));
      else
        return i._parseCommand(r, n);
    }), s;
  }
  /**
   * Invoke help directly if possible, or dispatch if necessary.
   * e.g. help foo
   *
   * @private
   */
  _dispatchHelpCommand(t) {
    var n, i;
    t || this.help();
    const r = this._findCommand(t);
    return r && !r._executableHandler && r.help(), this._dispatchSubcommand(
      t,
      [],
      [((n = this._getHelpOption()) == null ? void 0 : n.long) ?? ((i = this._getHelpOption()) == null ? void 0 : i.short) ?? "--help"]
    );
  }
  /**
   * Check this.args against expected this.registeredArguments.
   *
   * @private
   */
  _checkNumberOfArguments() {
    this.registeredArguments.forEach((t, r) => {
      t.required && this.args[r] == null && this.missingArgument(t.name());
    }), !(this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) && this.args.length > this.registeredArguments.length && this._excessArguments(this.args);
  }
  /**
   * Process this.args using this.registeredArguments and save as this.processedArgs!
   *
   * @private
   */
  _processArguments() {
    const t = (n, i, s) => {
      let o = i;
      if (i !== null && n.parseArg) {
        const a = `error: command-argument value '${i}' is invalid for argument '${n.name()}'.`;
        o = this._callParseArg(
          n,
          i,
          s,
          a
        );
      }
      return o;
    };
    this._checkNumberOfArguments();
    const r = [];
    this.registeredArguments.forEach((n, i) => {
      let s = n.defaultValue;
      n.variadic ? i < this.args.length ? (s = this.args.slice(i), n.parseArg && (s = s.reduce((o, a) => t(n, a, o), n.defaultValue))) : s === void 0 && (s = []) : i < this.args.length && (s = this.args[i], n.parseArg && (s = t(n, s, n.defaultValue))), r[i] = s;
    }), this.processedArgs = r;
  }
  /**
   * Once we have a promise we chain, but call synchronously until then.
   *
   * @param {(Promise|undefined)} promise
   * @param {Function} fn
   * @return {(Promise|undefined)}
   * @private
   */
  _chainOrCall(t, r) {
    return t && t.then && typeof t.then == "function" ? t.then(() => r()) : r();
  }
  /**
   *
   * @param {(Promise|undefined)} promise
   * @param {string} event
   * @return {(Promise|undefined)}
   * @private
   */
  _chainOrCallHooks(t, r) {
    let n = t;
    const i = [];
    return this._getCommandAndAncestors().reverse().filter((s) => s._lifeCycleHooks[r] !== void 0).forEach((s) => {
      s._lifeCycleHooks[r].forEach((o) => {
        i.push({ hookedCommand: s, callback: o });
      });
    }), r === "postAction" && i.reverse(), i.forEach((s) => {
      n = this._chainOrCall(n, () => s.callback(s.hookedCommand, this));
    }), n;
  }
  /**
   *
   * @param {(Promise|undefined)} promise
   * @param {Command} subCommand
   * @param {string} event
   * @return {(Promise|undefined)}
   * @private
   */
  _chainOrCallSubCommandHook(t, r, n) {
    let i = t;
    return this._lifeCycleHooks[n] !== void 0 && this._lifeCycleHooks[n].forEach((s) => {
      i = this._chainOrCall(i, () => s(this, r));
    }), i;
  }
  /**
   * Process arguments in context of this command.
   * Returns action result, in case it is a promise.
   *
   * @private
   */
  _parseCommand(t, r) {
    const n = this.parseOptions(r);
    if (this._parseOptionsEnv(), this._parseOptionsImplied(), t = t.concat(n.operands), r = n.unknown, this.args = t.concat(r), t && this._findCommand(t[0]))
      return this._dispatchSubcommand(t[0], t.slice(1), r);
    if (this._getHelpCommand() && t[0] === this._getHelpCommand().name())
      return this._dispatchHelpCommand(t[1]);
    if (this._defaultCommandName)
      return this._outputHelpIfRequested(r), this._dispatchSubcommand(
        this._defaultCommandName,
        t,
        r
      );
    this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName && this.help({ error: !0 }), this._outputHelpIfRequested(n.unknown), this._checkForMissingMandatoryOptions(), this._checkForConflictingOptions();
    const i = () => {
      n.unknown.length > 0 && this.unknownOption(n.unknown[0]);
    }, s = `command:${this.name()}`;
    if (this._actionHandler) {
      i(), this._processArguments();
      let o;
      return o = this._chainOrCallHooks(o, "preAction"), o = this._chainOrCall(
        o,
        () => this._actionHandler(this.processedArgs)
      ), this.parent && (o = this._chainOrCall(o, () => {
        this.parent.emit(s, t, r);
      })), o = this._chainOrCallHooks(o, "postAction"), o;
    }
    if (this.parent && this.parent.listenerCount(s))
      i(), this._processArguments(), this.parent.emit(s, t, r);
    else if (t.length) {
      if (this._findCommand("*"))
        return this._dispatchSubcommand("*", t, r);
      this.listenerCount("command:*") ? this.emit("command:*", t, r) : this.commands.length ? this.unknownCommand() : (i(), this._processArguments());
    } else this.commands.length ? (i(), this.help({ error: !0 })) : (i(), this._processArguments());
  }
  /**
   * Find matching command.
   *
   * @private
   * @return {Command | undefined}
   */
  _findCommand(t) {
    if (t)
      return this.commands.find(
        (r) => r._name === t || r._aliases.includes(t)
      );
  }
  /**
   * Return an option matching `arg` if any.
   *
   * @param {string} arg
   * @return {Option}
   * @package
   */
  _findOption(t) {
    return this.options.find((r) => r.is(t));
  }
  /**
   * Display an error message if a mandatory option does not have a value.
   * Called after checking for help flags in leaf subcommand.
   *
   * @private
   */
  _checkForMissingMandatoryOptions() {
    this._getCommandAndAncestors().forEach((t) => {
      t.options.forEach((r) => {
        r.mandatory && t.getOptionValue(r.attributeName()) === void 0 && t.missingMandatoryOptionValue(r);
      });
    });
  }
  /**
   * Display an error message if conflicting options are used together in this.
   *
   * @private
   */
  _checkForConflictingLocalOptions() {
    const t = this.options.filter((n) => {
      const i = n.attributeName();
      return this.getOptionValue(i) === void 0 ? !1 : this.getOptionValueSource(i) !== "default";
    });
    t.filter(
      (n) => n.conflictsWith.length > 0
    ).forEach((n) => {
      const i = t.find(
        (s) => n.conflictsWith.includes(s.attributeName())
      );
      i && this._conflictingOption(n, i);
    });
  }
  /**
   * Display an error message if conflicting options are used together.
   * Called after checking for help flags in leaf subcommand.
   *
   * @private
   */
  _checkForConflictingOptions() {
    this._getCommandAndAncestors().forEach((t) => {
      t._checkForConflictingLocalOptions();
    });
  }
  /**
   * Parse options from `argv` removing known options,
   * and return argv split into operands and unknown arguments.
   *
   * Side effects: modifies command by storing options. Does not reset state if called again.
   *
   * Examples:
   *
   *     argv => operands, unknown
   *     --known kkk op => [op], []
   *     op --known kkk => [op], []
   *     sub --unknown uuu op => [sub], [--unknown uuu op]
   *     sub -- --unknown uuu op => [sub --unknown uuu op], []
   *
   * @param {string[]} argv
   * @return {{operands: string[], unknown: string[]}}
   */
  parseOptions(t) {
    const r = [], n = [];
    let i = r;
    const s = t.slice();
    function o(c) {
      return c.length > 1 && c[0] === "-";
    }
    const a = (c) => /^-\d*\.?\d+(e[+-]?\d+)?$/.test(c) ? !this._getCommandAndAncestors().some(
      (f) => f.options.map((u) => u.short).some((u) => /^-\d$/.test(u))
    ) : !1;
    let l = null;
    for (; s.length; ) {
      const c = s.shift();
      if (c === "--") {
        i === n && i.push(c), i.push(...s);
        break;
      }
      if (l && (!o(c) || a(c))) {
        this.emit(`option:${l.name()}`, c);
        continue;
      }
      if (l = null, o(c)) {
        const f = this._findOption(c);
        if (f) {
          if (f.required) {
            const u = s.shift();
            u === void 0 && this.optionMissingArgument(f), this.emit(`option:${f.name()}`, u);
          } else if (f.optional) {
            let u = null;
            s.length > 0 && (!o(s[0]) || a(s[0])) && (u = s.shift()), this.emit(`option:${f.name()}`, u);
          } else
            this.emit(`option:${f.name()}`);
          l = f.variadic ? f : null;
          continue;
        }
      }
      if (c.length > 2 && c[0] === "-" && c[1] !== "-") {
        const f = this._findOption(`-${c[1]}`);
        if (f) {
          f.required || f.optional && this._combineFlagAndOptionalValue ? this.emit(`option:${f.name()}`, c.slice(2)) : (this.emit(`option:${f.name()}`), s.unshift(`-${c.slice(2)}`));
          continue;
        }
      }
      if (/^--[^=]+=/.test(c)) {
        const f = c.indexOf("="), u = this._findOption(c.slice(0, f));
        if (u && (u.required || u.optional)) {
          this.emit(`option:${u.name()}`, c.slice(f + 1));
          continue;
        }
      }
      if (i === r && o(c) && !(this.commands.length === 0 && a(c)) && (i = n), (this._enablePositionalOptions || this._passThroughOptions) && r.length === 0 && n.length === 0) {
        if (this._findCommand(c)) {
          r.push(c), s.length > 0 && n.push(...s);
          break;
        } else if (this._getHelpCommand() && c === this._getHelpCommand().name()) {
          r.push(c), s.length > 0 && r.push(...s);
          break;
        } else if (this._defaultCommandName) {
          n.push(c), s.length > 0 && n.push(...s);
          break;
        }
      }
      if (this._passThroughOptions) {
        i.push(c), s.length > 0 && i.push(...s);
        break;
      }
      i.push(c);
    }
    return { operands: r, unknown: n };
  }
  /**
   * Return an object containing local option values as key-value pairs.
   *
   * @return {object}
   */
  opts() {
    if (this._storeOptionsAsProperties) {
      const t = {}, r = this.options.length;
      for (let n = 0; n < r; n++) {
        const i = this.options[n].attributeName();
        t[i] = i === this._versionOptionName ? this._version : this[i];
      }
      return t;
    }
    return this._optionValues;
  }
  /**
   * Return an object containing merged local and global option values as key-value pairs.
   *
   * @return {object}
   */
  optsWithGlobals() {
    return this._getCommandAndAncestors().reduce(
      (t, r) => Object.assign(t, r.opts()),
      {}
    );
  }
  /**
   * Display error message and exit (or call exitOverride).
   *
   * @param {string} message
   * @param {object} [errorOptions]
   * @param {string} [errorOptions.code] - an id string representing the error
   * @param {number} [errorOptions.exitCode] - used with process.exit
   */
  error(t, r) {
    this._outputConfiguration.outputError(
      `${t}
`,
      this._outputConfiguration.writeErr
    ), typeof this._showHelpAfterError == "string" ? this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`) : this._showHelpAfterError && (this._outputConfiguration.writeErr(`
`), this.outputHelp({ error: !0 }));
    const n = r || {}, i = n.exitCode || 1, s = n.code || "commander.error";
    this._exit(i, s, t);
  }
  /**
   * Apply any option related environment variables, if option does
   * not have a value from cli or client code.
   *
   * @private
   */
  _parseOptionsEnv() {
    this.options.forEach((t) => {
      if (t.envVar && t.envVar in H.env) {
        const r = t.attributeName();
        (this.getOptionValue(r) === void 0 || ["default", "config", "env"].includes(
          this.getOptionValueSource(r)
        )) && (t.required || t.optional ? this.emit(`optionEnv:${t.name()}`, H.env[t.envVar]) : this.emit(`optionEnv:${t.name()}`));
      }
    });
  }
  /**
   * Apply any implied option values, if option is undefined or default value.
   *
   * @private
   */
  _parseOptionsImplied() {
    const t = new au(this.options), r = (n) => this.getOptionValue(n) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(n));
    this.options.filter(
      (n) => n.implied !== void 0 && r(n.attributeName()) && t.valueFromOption(
        this.getOptionValue(n.attributeName()),
        n
      )
    ).forEach((n) => {
      Object.keys(n.implied).filter((i) => !r(i)).forEach((i) => {
        this.setOptionValueWithSource(
          i,
          n.implied[i],
          "implied"
        );
      });
    });
  }
  /**
   * Argument `name` is missing.
   *
   * @param {string} name
   * @private
   */
  missingArgument(t) {
    const r = `error: missing required argument '${t}'`;
    this.error(r, { code: "commander.missingArgument" });
  }
  /**
   * `Option` is missing an argument.
   *
   * @param {Option} option
   * @private
   */
  optionMissingArgument(t) {
    const r = `error: option '${t.flags}' argument missing`;
    this.error(r, { code: "commander.optionMissingArgument" });
  }
  /**
   * `Option` does not have a value, and is a mandatory option.
   *
   * @param {Option} option
   * @private
   */
  missingMandatoryOptionValue(t) {
    const r = `error: required option '${t.flags}' not specified`;
    this.error(r, { code: "commander.missingMandatoryOptionValue" });
  }
  /**
   * `Option` conflicts with another option.
   *
   * @param {Option} option
   * @param {Option} conflictingOption
   * @private
   */
  _conflictingOption(t, r) {
    const n = (o) => {
      const a = o.attributeName(), l = this.getOptionValue(a), c = this.options.find(
        (u) => u.negate && a === u.attributeName()
      ), f = this.options.find(
        (u) => !u.negate && a === u.attributeName()
      );
      return c && (c.presetArg === void 0 && l === !1 || c.presetArg !== void 0 && l === c.presetArg) ? c : f || o;
    }, i = (o) => {
      const a = n(o), l = a.attributeName();
      return this.getOptionValueSource(l) === "env" ? `environment variable '${a.envVar}'` : `option '${a.flags}'`;
    }, s = `error: ${i(t)} cannot be used with ${i(r)}`;
    this.error(s, { code: "commander.conflictingOption" });
  }
  /**
   * Unknown option `flag`.
   *
   * @param {string} flag
   * @private
   */
  unknownOption(t) {
    if (this._allowUnknownOption) return;
    let r = "";
    if (t.startsWith("--") && this._showSuggestionAfterError) {
      let i = [], s = this;
      do {
        const o = s.createHelp().visibleOptions(s).filter((a) => a.long).map((a) => a.long);
        i = i.concat(o), s = s.parent;
      } while (s && !s._enablePositionalOptions);
      r = Js(t, i);
    }
    const n = `error: unknown option '${t}'${r}`;
    this.error(n, { code: "commander.unknownOption" });
  }
  /**
   * Excess arguments, more than expected.
   *
   * @param {string[]} receivedArgs
   * @private
   */
  _excessArguments(t) {
    if (this._allowExcessArguments) return;
    const r = this.registeredArguments.length, n = r === 1 ? "" : "s", s = `error: too many arguments${this.parent ? ` for '${this.name()}'` : ""}. Expected ${r} argument${n} but got ${t.length}.`;
    this.error(s, { code: "commander.excessArguments" });
  }
  /**
   * Unknown command.
   *
   * @private
   */
  unknownCommand() {
    const t = this.args[0];
    let r = "";
    if (this._showSuggestionAfterError) {
      const i = [];
      this.createHelp().visibleCommands(this).forEach((s) => {
        i.push(s.name()), s.alias() && i.push(s.alias());
      }), r = Js(t, i);
    }
    const n = `error: unknown command '${t}'${r}`;
    this.error(n, { code: "commander.unknownCommand" });
  }
  /**
   * Get or set the program version.
   *
   * This method auto-registers the "-V, --version" option which will print the version number.
   *
   * You can optionally supply the flags and description to override the defaults.
   *
   * @param {string} [str]
   * @param {string} [flags]
   * @param {string} [description]
   * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
   */
  version(t, r, n) {
    if (t === void 0) return this._version;
    this._version = t, r = r || "-V, --version", n = n || "output the version number";
    const i = this.createOption(r, n);
    return this._versionOptionName = i.attributeName(), this._registerOption(i), this.on("option:" + i.name(), () => {
      this._outputConfiguration.writeOut(`${t}
`), this._exit(0, "commander.version", t);
    }), this;
  }
  /**
   * Set the description.
   *
   * @param {string} [str]
   * @param {object} [argsDescription]
   * @return {(string|Command)}
   */
  description(t, r) {
    return t === void 0 && r === void 0 ? this._description : (this._description = t, r && (this._argsDescription = r), this);
  }
  /**
   * Set the summary. Used when listed as subcommand of parent.
   *
   * @param {string} [str]
   * @return {(string|Command)}
   */
  summary(t) {
    return t === void 0 ? this._summary : (this._summary = t, this);
  }
  /**
   * Set an alias for the command.
   *
   * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
   *
   * @param {string} [alias]
   * @return {(string|Command)}
   */
  alias(t) {
    var i;
    if (t === void 0) return this._aliases[0];
    let r = this;
    if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler && (r = this.commands[this.commands.length - 1]), t === r._name)
      throw new Error("Command alias can't be the same as its name");
    const n = (i = this.parent) == null ? void 0 : i._findCommand(t);
    if (n) {
      const s = [n.name()].concat(n.aliases()).join("|");
      throw new Error(
        `cannot add alias '${t}' to command '${this.name()}' as already have command '${s}'`
      );
    }
    return r._aliases.push(t), this;
  }
  /**
   * Set aliases for the command.
   *
   * Only the first alias is shown in the auto-generated help.
   *
   * @param {string[]} [aliases]
   * @return {(string[]|Command)}
   */
  aliases(t) {
    return t === void 0 ? this._aliases : (t.forEach((r) => this.alias(r)), this);
  }
  /**
   * Set / get the command usage `str`.
   *
   * @param {string} [str]
   * @return {(string|Command)}
   */
  usage(t) {
    if (t === void 0) {
      if (this._usage) return this._usage;
      const r = this.registeredArguments.map((n) => iu(n));
      return [].concat(
        this.options.length || this._helpOption !== null ? "[options]" : [],
        this.commands.length ? "[command]" : [],
        this.registeredArguments.length ? r : []
      ).join(" ");
    }
    return this._usage = t, this;
  }
  /**
   * Get or set the name of the command.
   *
   * @param {string} [str]
   * @return {(string|Command)}
   */
  name(t) {
    return t === void 0 ? this._name : (this._name = t, this);
  }
  /**
   * Set/get the help group heading for this subcommand in parent command's help.
   *
   * @param {string} [heading]
   * @return {Command | string}
   */
  helpGroup(t) {
    return t === void 0 ? this._helpGroupHeading ?? "" : (this._helpGroupHeading = t, this);
  }
  /**
   * Set/get the default help group heading for subcommands added to this command.
   * (This does not override a group set directly on the subcommand using .helpGroup().)
   *
   * @example
   * program.commandsGroup('Development Commands:);
   * program.command('watch')...
   * program.command('lint')...
   * ...
   *
   * @param {string} [heading]
   * @returns {Command | string}
   */
  commandsGroup(t) {
    return t === void 0 ? this._defaultCommandGroup ?? "" : (this._defaultCommandGroup = t, this);
  }
  /**
   * Set/get the default help group heading for options added to this command.
   * (This does not override a group set directly on the option using .helpGroup().)
   *
   * @example
   * program
   *   .optionsGroup('Development Options:')
   *   .option('-d, --debug', 'output extra debugging')
   *   .option('-p, --profile', 'output profiling information')
   *
   * @param {string} [heading]
   * @returns {Command | string}
   */
  optionsGroup(t) {
    return t === void 0 ? this._defaultOptionGroup ?? "" : (this._defaultOptionGroup = t, this);
  }
  /**
   * @param {Option} option
   * @private
   */
  _initOptionGroup(t) {
    this._defaultOptionGroup && !t.helpGroupHeading && t.helpGroup(this._defaultOptionGroup);
  }
  /**
   * @param {Command} cmd
   * @private
   */
  _initCommandGroup(t) {
    this._defaultCommandGroup && !t.helpGroup() && t.helpGroup(this._defaultCommandGroup);
  }
  /**
   * Set the name of the command from script filename, such as process.argv[1],
   * or require.main.filename, or __filename.
   *
   * (Used internally and public although not documented in README.)
   *
   * @example
   * program.nameFromFilename(require.main.filename);
   *
   * @param {string} filename
   * @return {Command}
   */
  nameFromFilename(t) {
    return this._name = Ce.basename(t, Ce.extname(t)), this;
  }
  /**
   * Get or set the directory for searching for executable subcommands of this command.
   *
   * @example
   * program.executableDir(__dirname);
   * // or
   * program.executableDir('subcommands');
   *
   * @param {string} [path]
   * @return {(string|null|Command)}
   */
  executableDir(t) {
    return t === void 0 ? this._executableDir : (this._executableDir = t, this);
  }
  /**
   * Return program help documentation.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
   * @return {string}
   */
  helpInformation(t) {
    const r = this.createHelp(), n = this._getOutputContext(t);
    r.prepareContext({
      error: n.error,
      helpWidth: n.helpWidth,
      outputHasColors: n.hasColors
    });
    const i = r.formatHelp(this, r);
    return n.hasColors ? i : this._outputConfiguration.stripColor(i);
  }
  /**
   * @typedef HelpContext
   * @type {object}
   * @property {boolean} error
   * @property {number} helpWidth
   * @property {boolean} hasColors
   * @property {function} write - includes stripColor if needed
   *
   * @returns {HelpContext}
   * @private
   */
  _getOutputContext(t) {
    t = t || {};
    const r = !!t.error;
    let n, i, s;
    return r ? (n = (a) => this._outputConfiguration.writeErr(a), i = this._outputConfiguration.getErrHasColors(), s = this._outputConfiguration.getErrHelpWidth()) : (n = (a) => this._outputConfiguration.writeOut(a), i = this._outputConfiguration.getOutHasColors(), s = this._outputConfiguration.getOutHelpWidth()), { error: r, write: (a) => (i || (a = this._outputConfiguration.stripColor(a)), n(a)), hasColors: i, helpWidth: s };
  }
  /**
   * Output help information for this command.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */
  outputHelp(t) {
    var o;
    let r;
    typeof t == "function" && (r = t, t = void 0);
    const n = this._getOutputContext(t), i = {
      error: n.error,
      write: n.write,
      command: this
    };
    this._getCommandAndAncestors().reverse().forEach((a) => a.emit("beforeAllHelp", i)), this.emit("beforeHelp", i);
    let s = this.helpInformation({ error: n.error });
    if (r && (s = r(s), typeof s != "string" && !Buffer.isBuffer(s)))
      throw new Error("outputHelp callback must return a string or a Buffer");
    n.write(s), (o = this._getHelpOption()) != null && o.long && this.emit(this._getHelpOption().long), this.emit("afterHelp", i), this._getCommandAndAncestors().forEach(
      (a) => a.emit("afterAllHelp", i)
    );
  }
  /**
   * You can pass in flags and a description to customise the built-in help option.
   * Pass in false to disable the built-in help option.
   *
   * @example
   * program.helpOption('-?, --help' 'show help'); // customise
   * program.helpOption(false); // disable
   *
   * @param {(string | boolean)} flags
   * @param {string} [description]
   * @return {Command} `this` command for chaining
   */
  helpOption(t, r) {
    return typeof t == "boolean" ? (t ? (this._helpOption === null && (this._helpOption = void 0), this._defaultOptionGroup && this._initOptionGroup(this._getHelpOption())) : this._helpOption = null, this) : (this._helpOption = this.createOption(
      t ?? "-h, --help",
      r ?? "display help for command"
    ), (t || r) && this._initOptionGroup(this._helpOption), this);
  }
  /**
   * Lazy create help option.
   * Returns null if has been disabled with .helpOption(false).
   *
   * @returns {(Option | null)} the help option
   * @package
   */
  _getHelpOption() {
    return this._helpOption === void 0 && this.helpOption(void 0, void 0), this._helpOption;
  }
  /**
   * Supply your own option to use for the built-in help option.
   * This is an alternative to using helpOption() to customise the flags and description etc.
   *
   * @param {Option} option
   * @return {Command} `this` command for chaining
   */
  addHelpOption(t) {
    return this._helpOption = t, this._initOptionGroup(t), this;
  }
  /**
   * Output help information and exit.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */
  help(t) {
    this.outputHelp(t);
    let r = Number(H.exitCode ?? 0);
    r === 0 && t && typeof t != "function" && t.error && (r = 1), this._exit(r, "commander.help", "(outputHelp)");
  }
  /**
   * // Do a little typing to coordinate emit and listener for the help text events.
   * @typedef HelpTextEventContext
   * @type {object}
   * @property {boolean} error
   * @property {Command} command
   * @property {function} write
   */
  /**
   * Add additional text to be displayed with the built-in help.
   *
   * Position is 'before' or 'after' to affect just this command,
   * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
   *
   * @param {string} position - before or after built-in help
   * @param {(string | Function)} text - string to add, or a function returning a string
   * @return {Command} `this` command for chaining
   */
  addHelpText(t, r) {
    const n = ["beforeAll", "before", "after", "afterAll"];
    if (!n.includes(t))
      throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${n.join("', '")}'`);
    const i = `${t}Help`;
    return this.on(i, (s) => {
      let o;
      typeof r == "function" ? o = r({ error: s.error, command: s.command }) : o = r, o && s.write(`${o}
`);
    }), this;
  }
  /**
   * Output help information if help flags specified
   *
   * @param {Array} args - array of options to search for help flags
   * @private
   */
  _outputHelpIfRequested(t) {
    const r = this._getHelpOption();
    r && t.find((i) => r.is(i)) && (this.outputHelp(), this._exit(0, "commander.helpDisplayed", "(outputHelp)"));
  }
};
function Ys(e) {
  return e.map((t) => {
    if (!t.startsWith("--inspect"))
      return t;
    let r, n = "127.0.0.1", i = "9229", s;
    return (s = t.match(/^(--inspect(-brk)?)$/)) !== null ? r = s[1] : (s = t.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null ? (r = s[1], /^\d+$/.test(s[3]) ? i = s[3] : n = s[3]) : (s = t.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null && (r = s[1], n = s[3], i = s[4]), r && i !== "0" ? `${r}=${n}:${parseInt(i) + 1}` : t;
  });
}
function Kn() {
  if (H.env.NO_COLOR || H.env.FORCE_COLOR === "0" || H.env.FORCE_COLOR === "false")
    return !1;
  if (H.env.FORCE_COLOR || H.env.CLICOLOR_FORCE !== void 0)
    return !0;
}
vi.Command = lu;
vi.useColor = Kn;
const { Argument: ba } = Yt, { Command: bi } = vi, { CommanderError: cu, InvalidArgumentError: wa } = bt, { Help: uu } = qr, { Option: Pa } = Fr;
pe.program = new bi();
pe.createCommand = (e) => new bi(e);
pe.createOption = (e, t) => new Pa(e, t);
pe.createArgument = (e, t) => new ba(e, t);
pe.Command = bi;
pe.Option = Pa;
pe.Argument = ba;
pe.Help = uu;
pe.CommanderError = cu;
pe.InvalidArgumentError = wa;
pe.InvalidOptionArgumentError = wa;
const {
  Command: fu
} = pe;
var nt = {};
const Oa = Lc;
nt.format = Oa.format;
nt.inherits = Oa.inherits;
const du = (e) => new URL(e);
nt.swaggerParamRegExp = /\{([^/}]+)}/g;
const pu = ["get", "post", "put", "delete", "patch", "options", "head", "trace"];
function Tn(e, t) {
  if (e.url && e.url.startsWith("/")) {
    const r = du(t), n = r.protocol + "//" + r.hostname + e.url;
    return e.url = n, e;
  }
}
function hu(e, t) {
  e.openapi && t && (t.startsWith("http:") || t.startsWith("https:")) && (e.servers && e.servers.map((r) => Tn(r, t)), ["paths", "webhooks"].forEach((r) => {
    Object.keys(e[r] || []).forEach((n) => {
      const i = e[r][n];
      Object.keys(i).forEach((s) => {
        s === "servers" ? i[s].map((o) => Tn(o, t)) : pu.includes(s) && i[s].servers && i[s].servers.map((o) => Tn(o, t));
      });
    });
  }));
}
nt.fixOasRelativeServers = hu;
const mu = !1, yu = /\r?\n/, gu = /\bono[ @]/;
function $u(e) {
  return !!(e && e.configurable && typeof e.get == "function");
}
function _u(e) {
  return !!// If there is no stack property, then it's writable, since assigning it will create it
  (!e || e.writable || typeof e.set == "function");
}
function Ea(e, t) {
  let r = Sa(e.stack), n = t ? t.stack : void 0;
  return r && n ? r + `

` + n : r || n;
}
function vu(e, t, r) {
  r ? Object.defineProperty(t, "stack", {
    get: () => {
      let n = e.get.apply(t);
      return Ea({ stack: n }, r);
    },
    enumerable: !1,
    configurable: !0
  }) : bu(t, e);
}
function Sa(e) {
  if (e) {
    let t = e.split(yu), r;
    for (let n = 0; n < t.length; n++) {
      let i = t[n];
      if (gu.test(i))
        r === void 0 && (r = n);
      else if (r !== void 0) {
        t.splice(r, n - r);
        break;
      }
    }
    if (t.length > 0)
      return t.join(`
`);
  }
  return e;
}
function bu(e, t) {
  Object.defineProperty(e, "stack", {
    get: () => Sa(t.get.apply(e)),
    enumerable: !1,
    configurable: !0
  });
}
const wu = ["function", "symbol", "undefined"], Pu = ["constructor", "prototype", "__proto__"], Ou = Object.getPrototypeOf({});
function xa() {
  let e = {}, t = this;
  for (let r of ja(t))
    if (typeof r == "string") {
      let n = t[r], i = typeof n;
      wu.includes(i) || (e[r] = n);
    }
  return e;
}
function ja(e, t = []) {
  let r = [];
  for (; e && e !== Ou; )
    r = r.concat(Object.getOwnPropertyNames(e), Object.getOwnPropertySymbols(e)), e = Object.getPrototypeOf(e);
  let n = new Set(r);
  for (let i of t.concat(Pu))
    n.delete(i);
  return n;
}
const Eu = ["name", "message", "stack"];
function gr(e, t, r) {
  let n = e;
  return Su(n, t), t && typeof t == "object" && xu(n, t), n.toJSON = xa, r && typeof r == "object" && Object.assign(n, r), n;
}
function Su(e, t) {
  let r = Object.getOwnPropertyDescriptor(e, "stack");
  $u(r) ? vu(r, e, t) : _u(r) && (e.stack = Ea(e, t));
}
function xu(e, t) {
  let r = ja(t, Eu), n = e, i = t;
  for (let s of r)
    if (n[s] === void 0)
      try {
        n[s] = i[s];
      } catch {
      }
}
function ju(e) {
  return e = e || {}, {
    concatMessages: e.concatMessages === void 0 ? !0 : !!e.concatMessages,
    format: e.format === void 0 ? mu : typeof e.format == "function" ? e.format : !1
  };
}
function Au(e, t) {
  let r, n, i, s = "";
  return typeof e[0] == "string" ? i = e : typeof e[1] == "string" ? (e[0] instanceof Error ? r = e[0] : n = e[0], i = e.slice(1)) : (r = e[0], n = e[1], i = e.slice(2)), i.length > 0 && (t.format ? s = t.format.apply(void 0, i) : s = i.join(" ")), t.concatMessages && r && r.message && (s += (s ? ` 
` : "") + r.message), { originalError: r, props: n, message: s };
}
const Ke = wi;
function wi(e, t) {
  t = ju(t);
  function r(...n) {
    let { originalError: i, props: s, message: o } = Au(n, t), a = new e(o);
    return gr(a, i, s);
  }
  return r[Symbol.species] = e, r;
}
wi.toJSON = function(t) {
  return xa.call(t);
};
wi.extend = function(t, r, n) {
  return n || r instanceof Error ? gr(t, r, n) : r ? gr(t, void 0, r) : gr(t);
};
const Xs = xe;
xe.error = new Ke(Error);
xe.eval = new Ke(EvalError);
xe.range = new Ke(RangeError);
xe.reference = new Ke(ReferenceError);
xe.syntax = new Ke(SyntaxError);
xe.type = new Ke(TypeError);
xe.uri = new Ke(URIError);
const Cu = xe;
function xe(...e) {
  let t = e[0];
  if (typeof t == "object" && typeof t.name == "string") {
    for (let r of Object.values(Cu))
      if (typeof r == "function" && r.name === "ono") {
        let n = r[Symbol.species];
        if (n && n !== Error && (t instanceof n || t.name === n.name))
          return r.apply(void 0, e);
      }
  }
  return xe.error.apply(void 0, e);
}
typeof module == "object" && typeof module.exports == "object" && (module.exports = Object.assign(module.exports.default, module.exports));
const Iu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Ono: Ke,
  default: Xs,
  ono: Xs
}, Symbol.toStringTag, { value: "Module" })), je = /* @__PURE__ */ Uc(Iu);
var Wn = { exports: {} }, mt = {}, $e = {}, $t = {}, Xt = {}, D = {}, zt = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(m) {
      if (super(), !e.IDENTIFIER.test(m))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = m;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(m) {
      super(), this._items = typeof m == "string" ? [m] : m;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const m = this._items[0];
      return m === "" || m === '""';
    }
    get str() {
      var m;
      return (m = this._str) !== null && m !== void 0 ? m : this._str = this._items.reduce(($, E) => `${$}${E}`, "");
    }
    get names() {
      var m;
      return (m = this._names) !== null && m !== void 0 ? m : this._names = this._items.reduce(($, E) => (E instanceof r && ($[E.str] = ($[E.str] || 0) + 1), $), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function i(p, ...m) {
    const $ = [p[0]];
    let E = 0;
    for (; E < m.length; )
      a($, m[E]), $.push(p[++E]);
    return new n($);
  }
  e._ = i;
  const s = new n("+");
  function o(p, ...m) {
    const $ = [y(p[0])];
    let E = 0;
    for (; E < m.length; )
      $.push(s), a($, m[E]), $.push(s, y(p[++E]));
    return l($), new n($);
  }
  e.str = o;
  function a(p, m) {
    m instanceof n ? p.push(...m._items) : m instanceof r ? p.push(m) : p.push(u(m));
  }
  e.addCodeArg = a;
  function l(p) {
    let m = 1;
    for (; m < p.length - 1; ) {
      if (p[m] === s) {
        const $ = c(p[m - 1], p[m + 1]);
        if ($ !== void 0) {
          p.splice(m - 1, 3, $);
          continue;
        }
        p[m++] = "+";
      }
      m++;
    }
  }
  function c(p, m) {
    if (m === '""')
      return p;
    if (p === '""')
      return m;
    if (typeof p == "string")
      return m instanceof r || p[p.length - 1] !== '"' ? void 0 : typeof m != "string" ? `${p.slice(0, -1)}${m}"` : m[0] === '"' ? p.slice(0, -1) + m.slice(1) : void 0;
    if (typeof m == "string" && m[0] === '"' && !(p instanceof r))
      return `"${p}${m.slice(1)}`;
  }
  function f(p, m) {
    return m.emptyStr() ? p : p.emptyStr() ? m : o`${p}${m}`;
  }
  e.strConcat = f;
  function u(p) {
    return typeof p == "number" || typeof p == "boolean" || p === null ? p : y(Array.isArray(p) ? p.join(",") : p);
  }
  function h(p) {
    return new n(y(p));
  }
  e.stringify = h;
  function y(p) {
    return JSON.stringify(p).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = y;
  function _(p) {
    return typeof p == "string" && e.IDENTIFIER.test(p) ? new n(`.${p}`) : i`[${p}]`;
  }
  e.getProperty = _;
  function b(p) {
    if (typeof p == "string" && e.IDENTIFIER.test(p))
      return new n(`${p}`);
    throw new Error(`CodeGen: invalid export name: ${p}, use explicit $id name mapping`);
  }
  e.getEsmExportName = b;
  function v(p) {
    return new n(p.toString());
  }
  e.regexpCode = v;
})(zt);
var Jn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = zt;
  class r extends Error {
    constructor(c) {
      super(`CodeGen: "code" for ${c} not defined`), this.value = c.value;
    }
  }
  var n;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class i {
    constructor({ prefixes: c, parent: f } = {}) {
      this._names = {}, this._prefixes = c, this._parent = f;
    }
    toName(c) {
      return c instanceof t.Name ? c : this.name(c);
    }
    name(c) {
      return new t.Name(this._newName(c));
    }
    _newName(c) {
      const f = this._names[c] || this._nameGroup(c);
      return `${c}${f.index++}`;
    }
    _nameGroup(c) {
      var f, u;
      if (!((u = (f = this._parent) === null || f === void 0 ? void 0 : f._prefixes) === null || u === void 0) && u.has(c) || this._prefixes && !this._prefixes.has(c))
        throw new Error(`CodeGen: prefix "${c}" is not allowed in this scope`);
      return this._names[c] = { prefix: c, index: 0 };
    }
  }
  e.Scope = i;
  class s extends t.Name {
    constructor(c, f) {
      super(f), this.prefix = c;
    }
    setValue(c, { property: f, itemIndex: u }) {
      this.value = c, this.scopePath = (0, t._)`.${new t.Name(f)}[${u}]`;
    }
  }
  e.ValueScopeName = s;
  const o = (0, t._)`\n`;
  class a extends i {
    constructor(c) {
      super(c), this._values = {}, this._scope = c.scope, this.opts = { ...c, _n: c.lines ? o : t.nil };
    }
    get() {
      return this._scope;
    }
    name(c) {
      return new s(c, this._newName(c));
    }
    value(c, f) {
      var u;
      if (f.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const h = this.toName(c), { prefix: y } = h, _ = (u = f.key) !== null && u !== void 0 ? u : f.ref;
      let b = this._values[y];
      if (b) {
        const m = b.get(_);
        if (m)
          return m;
      } else
        b = this._values[y] = /* @__PURE__ */ new Map();
      b.set(_, h);
      const v = this._scope[y] || (this._scope[y] = []), p = v.length;
      return v[p] = f.ref, h.setValue(f, { property: y, itemIndex: p }), h;
    }
    getValue(c, f) {
      const u = this._values[c];
      if (u)
        return u.get(f);
    }
    scopeRefs(c, f = this._values) {
      return this._reduceValues(f, (u) => {
        if (u.scopePath === void 0)
          throw new Error(`CodeGen: name "${u}" has no value`);
        return (0, t._)`${c}${u.scopePath}`;
      });
    }
    scopeCode(c = this._values, f, u) {
      return this._reduceValues(c, (h) => {
        if (h.value === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return h.value.code;
      }, f, u);
    }
    _reduceValues(c, f, u = {}, h) {
      let y = t.nil;
      for (const _ in c) {
        const b = c[_];
        if (!b)
          continue;
        const v = u[_] = u[_] || /* @__PURE__ */ new Map();
        b.forEach((p) => {
          if (v.has(p))
            return;
          v.set(p, n.Started);
          let m = f(p);
          if (m) {
            const $ = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            y = (0, t._)`${y}${$} ${p} = ${m};${this.opts._n}`;
          } else if (m = h == null ? void 0 : h(p))
            y = (0, t._)`${y}${m}${this.opts._n}`;
          else
            throw new r(p);
          v.set(p, n.Completed);
        });
      }
      return y;
    }
  }
  e.ValueScope = a;
})(Jn);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = zt, r = Jn;
  var n = zt;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var i = Jn;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return i.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return i.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return i.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return i.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class s {
    optimizeNodes() {
      return this;
    }
    optimizeNames(d, g) {
      return this;
    }
  }
  class o extends s {
    constructor(d, g, O) {
      super(), this.varKind = d, this.name = g, this.rhs = O;
    }
    render({ es5: d, _n: g }) {
      const O = d ? r.varKinds.var : this.varKind, R = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${O} ${this.name}${R};` + g;
    }
    optimizeNames(d, g) {
      if (d[this.name.str])
        return this.rhs && (this.rhs = Me(this.rhs, d, g)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class a extends s {
    constructor(d, g, O) {
      super(), this.lhs = d, this.rhs = g, this.sideEffects = O;
    }
    render({ _n: d }) {
      return `${this.lhs} = ${this.rhs};` + d;
    }
    optimizeNames(d, g) {
      if (!(this.lhs instanceof t.Name && !d[this.lhs.str] && !this.sideEffects))
        return this.rhs = Me(this.rhs, d, g), this;
    }
    get names() {
      const d = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return st(d, this.rhs);
    }
  }
  class l extends a {
    constructor(d, g, O, R) {
      super(d, O, R), this.op = g;
    }
    render({ _n: d }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + d;
    }
  }
  class c extends s {
    constructor(d) {
      super(), this.label = d, this.names = {};
    }
    render({ _n: d }) {
      return `${this.label}:` + d;
    }
  }
  class f extends s {
    constructor(d) {
      super(), this.label = d, this.names = {};
    }
    render({ _n: d }) {
      return `break${this.label ? ` ${this.label}` : ""};` + d;
    }
  }
  class u extends s {
    constructor(d) {
      super(), this.error = d;
    }
    render({ _n: d }) {
      return `throw ${this.error};` + d;
    }
    get names() {
      return this.error.names;
    }
  }
  class h extends s {
    constructor(d) {
      super(), this.code = d;
    }
    render({ _n: d }) {
      return `${this.code};` + d;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(d, g) {
      return this.code = Me(this.code, d, g), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class y extends s {
    constructor(d = []) {
      super(), this.nodes = d;
    }
    render(d) {
      return this.nodes.reduce((g, O) => g + O.render(d), "");
    }
    optimizeNodes() {
      const { nodes: d } = this;
      let g = d.length;
      for (; g--; ) {
        const O = d[g].optimizeNodes();
        Array.isArray(O) ? d.splice(g, 1, ...O) : O ? d[g] = O : d.splice(g, 1);
      }
      return d.length > 0 ? this : void 0;
    }
    optimizeNames(d, g) {
      const { nodes: O } = this;
      let R = O.length;
      for (; R--; ) {
        const N = O[R];
        N.optimizeNames(d, g) || (At(d, N.names), O.splice(R, 1));
      }
      return O.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((d, g) => Ae(d, g.names), {});
    }
  }
  class _ extends y {
    render(d) {
      return "{" + d._n + super.render(d) + "}" + d._n;
    }
  }
  class b extends y {
  }
  class v extends _ {
  }
  v.kind = "else";
  class p extends _ {
    constructor(d, g) {
      super(g), this.condition = d;
    }
    render(d) {
      let g = `if(${this.condition})` + super.render(d);
      return this.else && (g += "else " + this.else.render(d)), g;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const d = this.condition;
      if (d === !0)
        return this.nodes;
      let g = this.else;
      if (g) {
        const O = g.optimizeNodes();
        g = this.else = Array.isArray(O) ? new v(O) : O;
      }
      if (g)
        return d === !1 ? g instanceof p ? g : g.nodes : this.nodes.length ? this : new p(ir(d), g instanceof p ? [g] : g.nodes);
      if (!(d === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(d, g) {
      var O;
      if (this.else = (O = this.else) === null || O === void 0 ? void 0 : O.optimizeNames(d, g), !!(super.optimizeNames(d, g) || this.else))
        return this.condition = Me(this.condition, d, g), this;
    }
    get names() {
      const d = super.names;
      return st(d, this.condition), this.else && Ae(d, this.else.names), d;
    }
  }
  p.kind = "if";
  class m extends _ {
  }
  m.kind = "for";
  class $ extends m {
    constructor(d) {
      super(), this.iteration = d;
    }
    render(d) {
      return `for(${this.iteration})` + super.render(d);
    }
    optimizeNames(d, g) {
      if (super.optimizeNames(d, g))
        return this.iteration = Me(this.iteration, d, g), this;
    }
    get names() {
      return Ae(super.names, this.iteration.names);
    }
  }
  class E extends m {
    constructor(d, g, O, R) {
      super(), this.varKind = d, this.name = g, this.from = O, this.to = R;
    }
    render(d) {
      const g = d.es5 ? r.varKinds.var : this.varKind, { name: O, from: R, to: N } = this;
      return `for(${g} ${O}=${R}; ${O}<${N}; ${O}++)` + super.render(d);
    }
    get names() {
      const d = st(super.names, this.from);
      return st(d, this.to);
    }
  }
  class S extends m {
    constructor(d, g, O, R) {
      super(), this.loop = d, this.varKind = g, this.name = O, this.iterable = R;
    }
    render(d) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(d);
    }
    optimizeNames(d, g) {
      if (super.optimizeNames(d, g))
        return this.iterable = Me(this.iterable, d, g), this;
    }
    get names() {
      return Ae(super.names, this.iterable.names);
    }
  }
  class A extends _ {
    constructor(d, g, O) {
      super(), this.name = d, this.args = g, this.async = O;
    }
    render(d) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(d);
    }
  }
  A.kind = "func";
  class U extends y {
    render(d) {
      return "return " + super.render(d);
    }
  }
  U.kind = "return";
  class fe extends _ {
    render(d) {
      let g = "try" + super.render(d);
      return this.catch && (g += this.catch.render(d)), this.finally && (g += this.finally.render(d)), g;
    }
    optimizeNodes() {
      var d, g;
      return super.optimizeNodes(), (d = this.catch) === null || d === void 0 || d.optimizeNodes(), (g = this.finally) === null || g === void 0 || g.optimizeNodes(), this;
    }
    optimizeNames(d, g) {
      var O, R;
      return super.optimizeNames(d, g), (O = this.catch) === null || O === void 0 || O.optimizeNames(d, g), (R = this.finally) === null || R === void 0 || R.optimizeNames(d, g), this;
    }
    get names() {
      const d = super.names;
      return this.catch && Ae(d, this.catch.names), this.finally && Ae(d, this.finally.names), d;
    }
  }
  class ce extends _ {
    constructor(d) {
      super(), this.error = d;
    }
    render(d) {
      return `catch(${this.error})` + super.render(d);
    }
  }
  ce.kind = "catch";
  class ve extends _ {
    render(d) {
      return "finally" + super.render(d);
    }
  }
  ve.kind = "finally";
  class jt {
    constructor(d, g = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...g, _n: g.lines ? `
` : "" }, this._extScope = d, this._scope = new r.Scope({ parent: d }), this._nodes = [new b()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(d) {
      return this._scope.name(d);
    }
    // reserves unique name in the external scope
    scopeName(d) {
      return this._extScope.name(d);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(d, g) {
      const O = this._extScope.value(d, g);
      return (this._values[O.prefix] || (this._values[O.prefix] = /* @__PURE__ */ new Set())).add(O), O;
    }
    getScopeValue(d, g) {
      return this._extScope.getValue(d, g);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(d) {
      return this._extScope.scopeRefs(d, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(d, g, O, R) {
      const N = this._scope.toName(g);
      return O !== void 0 && R && (this._constants[N.str] = O), this._leafNode(new o(d, N, O)), N;
    }
    // `const` declaration (`var` in es5 mode)
    const(d, g, O) {
      return this._def(r.varKinds.const, d, g, O);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(d, g, O) {
      return this._def(r.varKinds.let, d, g, O);
    }
    // `var` declaration with optional assignment
    var(d, g, O) {
      return this._def(r.varKinds.var, d, g, O);
    }
    // assignment code
    assign(d, g, O) {
      return this._leafNode(new a(d, g, O));
    }
    // `+=` code
    add(d, g) {
      return this._leafNode(new l(d, e.operators.ADD, g));
    }
    // appends passed SafeExpr to code or executes Block
    code(d) {
      return typeof d == "function" ? d() : d !== t.nil && this._leafNode(new h(d)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...d) {
      const g = ["{"];
      for (const [O, R] of d)
        g.length > 1 && g.push(","), g.push(O), (O !== R || this.opts.es5) && (g.push(":"), (0, t.addCodeArg)(g, R));
      return g.push("}"), new t._Code(g);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(d, g, O) {
      if (this._blockNode(new p(d)), g && O)
        this.code(g).else().code(O).endIf();
      else if (g)
        this.code(g).endIf();
      else if (O)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(d) {
      return this._elseNode(new p(d));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new v());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(p, v);
    }
    _for(d, g) {
      return this._blockNode(d), g && this.code(g).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(d, g) {
      return this._for(new $(d), g);
    }
    // `for` statement for a range of values
    forRange(d, g, O, R, N = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const z = this._scope.toName(d);
      return this._for(new E(N, z, g, O), () => R(z));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(d, g, O, R = r.varKinds.const) {
      const N = this._scope.toName(d);
      if (this.opts.es5) {
        const z = g instanceof t.Name ? g : this.var("_arr", g);
        return this.forRange("_i", 0, (0, t._)`${z}.length`, (L) => {
          this.var(N, (0, t._)`${z}[${L}]`), O(N);
        });
      }
      return this._for(new S("of", R, N, g), () => O(N));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(d, g, O, R = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(d, (0, t._)`Object.keys(${g})`, O);
      const N = this._scope.toName(d);
      return this._for(new S("in", R, N, g), () => O(N));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(m);
    }
    // `label` statement
    label(d) {
      return this._leafNode(new c(d));
    }
    // `break` statement
    break(d) {
      return this._leafNode(new f(d));
    }
    // `return` statement
    return(d) {
      const g = new U();
      if (this._blockNode(g), this.code(d), g.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(U);
    }
    // `try` statement
    try(d, g, O) {
      if (!g && !O)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const R = new fe();
      if (this._blockNode(R), this.code(d), g) {
        const N = this.name("e");
        this._currNode = R.catch = new ce(N), g(N);
      }
      return O && (this._currNode = R.finally = new ve(), this.code(O)), this._endBlockNode(ce, ve);
    }
    // `throw` statement
    throw(d) {
      return this._leafNode(new u(d));
    }
    // start self-balancing block
    block(d, g) {
      return this._blockStarts.push(this._nodes.length), d && this.code(d).endBlock(g), this;
    }
    // end the current self-balancing block
    endBlock(d) {
      const g = this._blockStarts.pop();
      if (g === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const O = this._nodes.length - g;
      if (O < 0 || d !== void 0 && O !== d)
        throw new Error(`CodeGen: wrong number of nodes: ${O} vs ${d} expected`);
      return this._nodes.length = g, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(d, g = t.nil, O, R) {
      return this._blockNode(new A(d, g, O)), R && this.code(R).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(A);
    }
    optimize(d = 1) {
      for (; d-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(d) {
      return this._currNode.nodes.push(d), this;
    }
    _blockNode(d) {
      this._currNode.nodes.push(d), this._nodes.push(d);
    }
    _endBlockNode(d, g) {
      const O = this._currNode;
      if (O instanceof d || g && O instanceof g)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${g ? `${d.kind}/${g.kind}` : d.kind}"`);
    }
    _elseNode(d) {
      const g = this._currNode;
      if (!(g instanceof p))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = g.else = d, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const d = this._nodes;
      return d[d.length - 1];
    }
    set _currNode(d) {
      const g = this._nodes;
      g[g.length - 1] = d;
    }
  }
  e.CodeGen = jt;
  function Ae(P, d) {
    for (const g in d)
      P[g] = (P[g] || 0) + (d[g] || 0);
    return P;
  }
  function st(P, d) {
    return d instanceof t._CodeOrName ? Ae(P, d.names) : P;
  }
  function Me(P, d, g) {
    if (P instanceof t.Name)
      return O(P);
    if (!R(P))
      return P;
    return new t._Code(P._items.reduce((N, z) => (z instanceof t.Name && (z = O(z)), z instanceof t._Code ? N.push(...z._items) : N.push(z), N), []));
    function O(N) {
      const z = g[N.str];
      return z === void 0 || d[N.str] !== 1 ? N : (delete d[N.str], z);
    }
    function R(N) {
      return N instanceof t._Code && N._items.some((z) => z instanceof t.Name && d[z.str] === 1 && g[z.str] !== void 0);
    }
  }
  function At(P, d) {
    for (const g in d)
      P[g] = (P[g] || 0) - (d[g] || 0);
  }
  function ir(P) {
    return typeof P == "boolean" || typeof P == "number" || P === null ? !P : (0, t._)`!${x(P)}`;
  }
  e.not = ir;
  const hn = w(e.operators.AND);
  function mn(...P) {
    return P.reduce(hn);
  }
  e.and = mn;
  const sr = w(e.operators.OR);
  function C(...P) {
    return P.reduce(sr);
  }
  e.or = C;
  function w(P) {
    return (d, g) => d === t.nil ? g : g === t.nil ? d : (0, t._)`${x(d)} ${P} ${x(g)}`;
  }
  function x(P) {
    return P instanceof t.Name ? P : (0, t._)`(${P})`;
  }
})(D);
var I = {};
Object.defineProperty(I, "__esModule", { value: !0 });
I.checkStrictMode = I.getErrorPath = I.Type = I.useFunc = I.setEvaluated = I.evaluatedPropsToName = I.mergeEvaluated = I.eachItem = I.unescapeJsonPointer = I.escapeJsonPointer = I.escapeFragment = I.unescapeFragment = I.schemaRefOrVal = I.schemaHasRulesButRef = I.schemaHasRules = I.checkUnknownRules = I.alwaysValidSchema = I.toHash = void 0;
const G = D, Tu = zt;
function Ru(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
I.toHash = Ru;
function ku(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Aa(e, t), !Ca(t, e.self.RULES.all));
}
I.alwaysValidSchema = ku;
function Aa(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const i = n.RULES.keywords;
  for (const s in t)
    i[s] || Ra(e, `unknown keyword: "${s}"`);
}
I.checkUnknownRules = Aa;
function Ca(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
I.schemaHasRules = Ca;
function Nu(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
I.schemaHasRulesButRef = Nu;
function Mu({ topSchemaRef: e, schemaPath: t }, r, n, i) {
  if (!i) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, G._)`${r}`;
  }
  return (0, G._)`${e}${t}${(0, G.getProperty)(n)}`;
}
I.schemaRefOrVal = Mu;
function Du(e) {
  return Ia(decodeURIComponent(e));
}
I.unescapeFragment = Du;
function qu(e) {
  return encodeURIComponent(Pi(e));
}
I.escapeFragment = qu;
function Pi(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
I.escapeJsonPointer = Pi;
function Ia(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
I.unescapeJsonPointer = Ia;
function Fu(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
I.eachItem = Fu;
function Qs({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (i, s, o, a) => {
    const l = o === void 0 ? s : o instanceof G.Name ? (s instanceof G.Name ? e(i, s, o) : t(i, s, o), o) : s instanceof G.Name ? (t(i, o, s), s) : r(s, o);
    return a === G.Name && !(l instanceof G.Name) ? n(i, l) : l;
  };
}
I.mergeEvaluated = {
  props: Qs({
    mergeNames: (e, t, r) => e.if((0, G._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, G._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, G._)`${r} || {}`).code((0, G._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, G._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, G._)`${r} || {}`), Oi(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: Ta
  }),
  items: Qs({
    mergeNames: (e, t, r) => e.if((0, G._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, G._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, G._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, G._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function Ta(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, G._)`{}`);
  return t !== void 0 && Oi(e, r, t), r;
}
I.evaluatedPropsToName = Ta;
function Oi(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, G._)`${t}${(0, G.getProperty)(n)}`, !0));
}
I.setEvaluated = Oi;
const Zs = {};
function Vu(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Zs[t.code] || (Zs[t.code] = new Tu._Code(t.code))
  });
}
I.useFunc = Vu;
var Yn;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Yn || (I.Type = Yn = {}));
function Lu(e, t, r) {
  if (e instanceof G.Name) {
    const n = t === Yn.Num;
    return r ? n ? (0, G._)`"[" + ${e} + "]"` : (0, G._)`"['" + ${e} + "']"` : n ? (0, G._)`"/" + ${e}` : (0, G._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, G.getProperty)(e).toString() : "/" + Pi(e);
}
I.getErrorPath = Lu;
function Ra(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
I.checkStrictMode = Ra;
var ue = {};
Object.defineProperty(ue, "__esModule", { value: !0 });
const ee = D, Hu = {
  // validation function arguments
  data: new ee.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new ee.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new ee.Name("instancePath"),
  parentData: new ee.Name("parentData"),
  parentDataProperty: new ee.Name("parentDataProperty"),
  rootData: new ee.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new ee.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new ee.Name("vErrors"),
  // null or array of validation errors
  errors: new ee.Name("errors"),
  // counter of validation errors
  this: new ee.Name("this"),
  // "globals"
  self: new ee.Name("self"),
  scope: new ee.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new ee.Name("json"),
  jsonPos: new ee.Name("jsonPos"),
  jsonLen: new ee.Name("jsonLen"),
  jsonPart: new ee.Name("jsonPart")
};
ue.default = Hu;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = D, r = I, n = ue;
  e.keywordError = {
    message: ({ keyword: v }) => (0, t.str)`must pass "${v}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: v, schemaType: p }) => p ? (0, t.str)`"${v}" keyword must be ${p} ($data)` : (0, t.str)`"${v}" keyword is invalid ($data)`
  };
  function i(v, p = e.keywordError, m, $) {
    const { it: E } = v, { gen: S, compositeRule: A, allErrors: U } = E, fe = u(v, p, m);
    $ ?? (A || U) ? l(S, fe) : c(E, (0, t._)`[${fe}]`);
  }
  e.reportError = i;
  function s(v, p = e.keywordError, m) {
    const { it: $ } = v, { gen: E, compositeRule: S, allErrors: A } = $, U = u(v, p, m);
    l(E, U), S || A || c($, n.default.vErrors);
  }
  e.reportExtraError = s;
  function o(v, p) {
    v.assign(n.default.errors, p), v.if((0, t._)`${n.default.vErrors} !== null`, () => v.if(p, () => v.assign((0, t._)`${n.default.vErrors}.length`, p), () => v.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function a({ gen: v, keyword: p, schemaValue: m, data: $, errsCount: E, it: S }) {
    if (E === void 0)
      throw new Error("ajv implementation error");
    const A = v.name("err");
    v.forRange("i", E, n.default.errors, (U) => {
      v.const(A, (0, t._)`${n.default.vErrors}[${U}]`), v.if((0, t._)`${A}.instancePath === undefined`, () => v.assign((0, t._)`${A}.instancePath`, (0, t.strConcat)(n.default.instancePath, S.errorPath))), v.assign((0, t._)`${A}.schemaPath`, (0, t.str)`${S.errSchemaPath}/${p}`), S.opts.verbose && (v.assign((0, t._)`${A}.schema`, m), v.assign((0, t._)`${A}.data`, $));
    });
  }
  e.extendErrors = a;
  function l(v, p) {
    const m = v.const("err", p);
    v.if((0, t._)`${n.default.vErrors} === null`, () => v.assign(n.default.vErrors, (0, t._)`[${m}]`), (0, t._)`${n.default.vErrors}.push(${m})`), v.code((0, t._)`${n.default.errors}++`);
  }
  function c(v, p) {
    const { gen: m, validateName: $, schemaEnv: E } = v;
    E.$async ? m.throw((0, t._)`new ${v.ValidationError}(${p})`) : (m.assign((0, t._)`${$}.errors`, p), m.return(!1));
  }
  const f = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function u(v, p, m) {
    const { createErrors: $ } = v.it;
    return $ === !1 ? (0, t._)`{}` : h(v, p, m);
  }
  function h(v, p, m = {}) {
    const { gen: $, it: E } = v, S = [
      y(E, m),
      _(v, m)
    ];
    return b(v, p, S), $.object(...S);
  }
  function y({ errorPath: v }, { instancePath: p }) {
    const m = p ? (0, t.str)`${v}${(0, r.getErrorPath)(p, r.Type.Str)}` : v;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, m)];
  }
  function _({ keyword: v, it: { errSchemaPath: p } }, { schemaPath: m, parentSchema: $ }) {
    let E = $ ? p : (0, t.str)`${p}/${v}`;
    return m && (E = (0, t.str)`${E}${(0, r.getErrorPath)(m, r.Type.Str)}`), [f.schemaPath, E];
  }
  function b(v, { params: p, message: m }, $) {
    const { keyword: E, data: S, schemaValue: A, it: U } = v, { opts: fe, propertyName: ce, topSchemaRef: ve, schemaPath: jt } = U;
    $.push([f.keyword, E], [f.params, typeof p == "function" ? p(v) : p || (0, t._)`{}`]), fe.messages && $.push([f.message, typeof m == "function" ? m(v) : m]), fe.verbose && $.push([f.schema, A], [f.parentSchema, (0, t._)`${ve}${jt}`], [n.default.data, S]), ce && $.push([f.propertyName, ce]);
  }
})(Xt);
Object.defineProperty($t, "__esModule", { value: !0 });
$t.boolOrEmptySchema = $t.topBoolOrEmptySchema = void 0;
const Uu = Xt, zu = D, Gu = ue, Bu = {
  message: "boolean schema is false"
};
function Ku(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? ka(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(Gu.default.data) : (t.assign((0, zu._)`${n}.errors`, null), t.return(!0));
}
$t.topBoolOrEmptySchema = Ku;
function Wu(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), ka(e)) : r.var(t, !0);
}
$t.boolOrEmptySchema = Wu;
function ka(e, t) {
  const { gen: r, data: n } = e, i = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, Uu.reportError)(i, Bu, void 0, t);
}
var Y = {}, rt = {};
Object.defineProperty(rt, "__esModule", { value: !0 });
rt.getRules = rt.isJSONType = void 0;
const Ju = ["string", "number", "integer", "boolean", "null", "object", "array"], Yu = new Set(Ju);
function Xu(e) {
  return typeof e == "string" && Yu.has(e);
}
rt.isJSONType = Xu;
function Qu() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
rt.getRules = Qu;
var Ie = {};
Object.defineProperty(Ie, "__esModule", { value: !0 });
Ie.shouldUseRule = Ie.shouldUseGroup = Ie.schemaHasRulesForType = void 0;
function Zu({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && Na(e, n);
}
Ie.schemaHasRulesForType = Zu;
function Na(e, t) {
  return t.rules.some((r) => Ma(e, r));
}
Ie.shouldUseGroup = Na;
function Ma(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
Ie.shouldUseRule = Ma;
Object.defineProperty(Y, "__esModule", { value: !0 });
Y.reportTypeError = Y.checkDataTypes = Y.checkDataType = Y.coerceAndCheckDataType = Y.getJSONTypes = Y.getSchemaTypes = Y.DataType = void 0;
const ef = rt, tf = Ie, rf = Xt, q = D, Da = I;
var yt;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(yt || (Y.DataType = yt = {}));
function nf(e) {
  const t = qa(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
Y.getSchemaTypes = nf;
function qa(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(ef.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
Y.getJSONTypes = qa;
function sf(e, t) {
  const { gen: r, data: n, opts: i } = e, s = of(t, i.coerceTypes), o = t.length > 0 && !(s.length === 0 && t.length === 1 && (0, tf.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const a = Ei(t, n, i.strictNumbers, yt.Wrong);
    r.if(a, () => {
      s.length ? af(e, t, s) : Si(e);
    });
  }
  return o;
}
Y.coerceAndCheckDataType = sf;
const Fa = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function of(e, t) {
  return t ? e.filter((r) => Fa.has(r) || t === "array" && r === "array") : [];
}
function af(e, t, r) {
  const { gen: n, data: i, opts: s } = e, o = n.let("dataType", (0, q._)`typeof ${i}`), a = n.let("coerced", (0, q._)`undefined`);
  s.coerceTypes === "array" && n.if((0, q._)`${o} == 'object' && Array.isArray(${i}) && ${i}.length == 1`, () => n.assign(i, (0, q._)`${i}[0]`).assign(o, (0, q._)`typeof ${i}`).if(Ei(t, i, s.strictNumbers), () => n.assign(a, i))), n.if((0, q._)`${a} !== undefined`);
  for (const c of r)
    (Fa.has(c) || c === "array" && s.coerceTypes === "array") && l(c);
  n.else(), Si(e), n.endIf(), n.if((0, q._)`${a} !== undefined`, () => {
    n.assign(i, a), lf(e, a);
  });
  function l(c) {
    switch (c) {
      case "string":
        n.elseIf((0, q._)`${o} == "number" || ${o} == "boolean"`).assign(a, (0, q._)`"" + ${i}`).elseIf((0, q._)`${i} === null`).assign(a, (0, q._)`""`);
        return;
      case "number":
        n.elseIf((0, q._)`${o} == "boolean" || ${i} === null
              || (${o} == "string" && ${i} && ${i} == +${i})`).assign(a, (0, q._)`+${i}`);
        return;
      case "integer":
        n.elseIf((0, q._)`${o} === "boolean" || ${i} === null
              || (${o} === "string" && ${i} && ${i} == +${i} && !(${i} % 1))`).assign(a, (0, q._)`+${i}`);
        return;
      case "boolean":
        n.elseIf((0, q._)`${i} === "false" || ${i} === 0 || ${i} === null`).assign(a, !1).elseIf((0, q._)`${i} === "true" || ${i} === 1`).assign(a, !0);
        return;
      case "null":
        n.elseIf((0, q._)`${i} === "" || ${i} === 0 || ${i} === false`), n.assign(a, null);
        return;
      case "array":
        n.elseIf((0, q._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${i} === null`).assign(a, (0, q._)`[${i}]`);
    }
  }
}
function lf({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, q._)`${t} !== undefined`, () => e.assign((0, q._)`${t}[${r}]`, n));
}
function Xn(e, t, r, n = yt.Correct) {
  const i = n === yt.Correct ? q.operators.EQ : q.operators.NEQ;
  let s;
  switch (e) {
    case "null":
      return (0, q._)`${t} ${i} null`;
    case "array":
      s = (0, q._)`Array.isArray(${t})`;
      break;
    case "object":
      s = (0, q._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      s = o((0, q._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      s = o();
      break;
    default:
      return (0, q._)`typeof ${t} ${i} ${e}`;
  }
  return n === yt.Correct ? s : (0, q.not)(s);
  function o(a = q.nil) {
    return (0, q.and)((0, q._)`typeof ${t} == "number"`, a, r ? (0, q._)`isFinite(${t})` : q.nil);
  }
}
Y.checkDataType = Xn;
function Ei(e, t, r, n) {
  if (e.length === 1)
    return Xn(e[0], t, r, n);
  let i;
  const s = (0, Da.toHash)(e);
  if (s.array && s.object) {
    const o = (0, q._)`typeof ${t} != "object"`;
    i = s.null ? o : (0, q._)`!${t} || ${o}`, delete s.null, delete s.array, delete s.object;
  } else
    i = q.nil;
  s.number && delete s.integer;
  for (const o in s)
    i = (0, q.and)(i, Xn(o, t, r, n));
  return i;
}
Y.checkDataTypes = Ei;
const cf = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, q._)`{type: ${e}}` : (0, q._)`{type: ${t}}`
};
function Si(e) {
  const t = uf(e);
  (0, rf.reportError)(t, cf);
}
Y.reportTypeError = Si;
function uf(e) {
  const { gen: t, data: r, schema: n } = e, i = (0, Da.schemaRefOrVal)(e, n, "type");
  return {
    gen: t,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: i,
    schemaValue: i,
    parentSchema: n,
    params: {},
    it: e
  };
}
var Vr = {};
Object.defineProperty(Vr, "__esModule", { value: !0 });
Vr.assignDefaults = void 0;
const at = D, ff = I;
function df(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const i in r)
      eo(e, i, r[i].default);
  else t === "array" && Array.isArray(n) && n.forEach((i, s) => eo(e, s, i.default));
}
Vr.assignDefaults = df;
function eo(e, t, r) {
  const { gen: n, compositeRule: i, data: s, opts: o } = e;
  if (r === void 0)
    return;
  const a = (0, at._)`${s}${(0, at.getProperty)(t)}`;
  if (i) {
    (0, ff.checkStrictMode)(e, `default is ignored for: ${a}`);
    return;
  }
  let l = (0, at._)`${a} === undefined`;
  o.useDefaults === "empty" && (l = (0, at._)`${l} || ${a} === null || ${a} === ""`), n.if(l, (0, at._)`${a} = ${(0, at.stringify)(r)}`);
}
var we = {}, F = {};
Object.defineProperty(F, "__esModule", { value: !0 });
F.validateUnion = F.validateArray = F.usePattern = F.callValidateCode = F.schemaProperties = F.allSchemaProperties = F.noPropertyInData = F.propertyInData = F.isOwnProperty = F.hasPropFunc = F.reportMissingProp = F.checkMissingProp = F.checkReportMissingProp = void 0;
const K = D, xi = I, De = ue, pf = I;
function hf(e, t) {
  const { gen: r, data: n, it: i } = e;
  r.if(Ai(r, n, t, i.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, K._)`${t}` }, !0), e.error();
  });
}
F.checkReportMissingProp = hf;
function mf({ gen: e, data: t, it: { opts: r } }, n, i) {
  return (0, K.or)(...n.map((s) => (0, K.and)(Ai(e, t, s, r.ownProperties), (0, K._)`${i} = ${s}`)));
}
F.checkMissingProp = mf;
function yf(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
F.reportMissingProp = yf;
function Va(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, K._)`Object.prototype.hasOwnProperty`
  });
}
F.hasPropFunc = Va;
function ji(e, t, r) {
  return (0, K._)`${Va(e)}.call(${t}, ${r})`;
}
F.isOwnProperty = ji;
function gf(e, t, r, n) {
  const i = (0, K._)`${t}${(0, K.getProperty)(r)} !== undefined`;
  return n ? (0, K._)`${i} && ${ji(e, t, r)}` : i;
}
F.propertyInData = gf;
function Ai(e, t, r, n) {
  const i = (0, K._)`${t}${(0, K.getProperty)(r)} === undefined`;
  return n ? (0, K.or)(i, (0, K.not)(ji(e, t, r))) : i;
}
F.noPropertyInData = Ai;
function La(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
F.allSchemaProperties = La;
function $f(e, t) {
  return La(t).filter((r) => !(0, xi.alwaysValidSchema)(e, t[r]));
}
F.schemaProperties = $f;
function _f({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: i, errorPath: s }, it: o }, a, l, c) {
  const f = c ? (0, K._)`${e}, ${t}, ${n}${i}` : t, u = [
    [De.default.instancePath, (0, K.strConcat)(De.default.instancePath, s)],
    [De.default.parentData, o.parentData],
    [De.default.parentDataProperty, o.parentDataProperty],
    [De.default.rootData, De.default.rootData]
  ];
  o.opts.dynamicRef && u.push([De.default.dynamicAnchors, De.default.dynamicAnchors]);
  const h = (0, K._)`${f}, ${r.object(...u)}`;
  return l !== K.nil ? (0, K._)`${a}.call(${l}, ${h})` : (0, K._)`${a}(${h})`;
}
F.callValidateCode = _f;
const vf = (0, K._)`new RegExp`;
function bf({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: i } = t.code, s = i(r, n);
  return e.scopeValue("pattern", {
    key: s.toString(),
    ref: s,
    code: (0, K._)`${i.code === "new RegExp" ? vf : (0, pf.useFunc)(e, i)}(${r}, ${n})`
  });
}
F.usePattern = bf;
function wf(e) {
  const { gen: t, data: r, keyword: n, it: i } = e, s = t.name("valid");
  if (i.allErrors) {
    const a = t.let("valid", !0);
    return o(() => t.assign(a, !1)), a;
  }
  return t.var(s, !0), o(() => t.break()), s;
  function o(a) {
    const l = t.const("len", (0, K._)`${r}.length`);
    t.forRange("i", 0, l, (c) => {
      e.subschema({
        keyword: n,
        dataProp: c,
        dataPropType: xi.Type.Num
      }, s), t.if((0, K.not)(s), a);
    });
  }
}
F.validateArray = wf;
function Pf(e) {
  const { gen: t, schema: r, keyword: n, it: i } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, xi.alwaysValidSchema)(i, l)) && !i.opts.unevaluated)
    return;
  const o = t.let("valid", !1), a = t.name("_valid");
  t.block(() => r.forEach((l, c) => {
    const f = e.subschema({
      keyword: n,
      schemaProp: c,
      compositeRule: !0
    }, a);
    t.assign(o, (0, K._)`${o} || ${a}`), e.mergeValidEvaluated(f, a) || t.if((0, K.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
F.validateUnion = Pf;
Object.defineProperty(we, "__esModule", { value: !0 });
we.validateKeywordUsage = we.validSchemaType = we.funcKeywordCode = we.macroKeywordCode = void 0;
const ie = D, Je = ue, Of = F, Ef = Xt;
function Sf(e, t) {
  const { gen: r, keyword: n, schema: i, parentSchema: s, it: o } = e, a = t.macro.call(o.self, i, s, o), l = Ha(r, n, a);
  o.opts.validateSchema !== !1 && o.self.validateSchema(a, !0);
  const c = r.name("valid");
  e.subschema({
    schema: a,
    schemaPath: ie.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: l,
    compositeRule: !0
  }, c), e.pass(c, () => e.error(!0));
}
we.macroKeywordCode = Sf;
function xf(e, t) {
  var r;
  const { gen: n, keyword: i, schema: s, parentSchema: o, $data: a, it: l } = e;
  Af(l, t);
  const c = !a && t.compile ? t.compile.call(l.self, s, o, l) : t.validate, f = Ha(n, i, c), u = n.let("valid");
  e.block$data(u, h), e.ok((r = t.valid) !== null && r !== void 0 ? r : u);
  function h() {
    if (t.errors === !1)
      b(), t.modifying && to(e), v(() => e.error());
    else {
      const p = t.async ? y() : _();
      t.modifying && to(e), v(() => jf(e, p));
    }
  }
  function y() {
    const p = n.let("ruleErrs", null);
    return n.try(() => b((0, ie._)`await `), (m) => n.assign(u, !1).if((0, ie._)`${m} instanceof ${l.ValidationError}`, () => n.assign(p, (0, ie._)`${m}.errors`), () => n.throw(m))), p;
  }
  function _() {
    const p = (0, ie._)`${f}.errors`;
    return n.assign(p, null), b(ie.nil), p;
  }
  function b(p = t.async ? (0, ie._)`await ` : ie.nil) {
    const m = l.opts.passContext ? Je.default.this : Je.default.self, $ = !("compile" in t && !a || t.schema === !1);
    n.assign(u, (0, ie._)`${p}${(0, Of.callValidateCode)(e, f, m, $)}`, t.modifying);
  }
  function v(p) {
    var m;
    n.if((0, ie.not)((m = t.valid) !== null && m !== void 0 ? m : u), p);
  }
}
we.funcKeywordCode = xf;
function to(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, ie._)`${n.parentData}[${n.parentDataProperty}]`));
}
function jf(e, t) {
  const { gen: r } = e;
  r.if((0, ie._)`Array.isArray(${t})`, () => {
    r.assign(Je.default.vErrors, (0, ie._)`${Je.default.vErrors} === null ? ${t} : ${Je.default.vErrors}.concat(${t})`).assign(Je.default.errors, (0, ie._)`${Je.default.vErrors}.length`), (0, Ef.extendErrors)(e);
  }, () => e.error());
}
function Af({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function Ha(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, ie.stringify)(r) });
}
function Cf(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
we.validSchemaType = Cf;
function If({ schema: e, opts: t, self: r, errSchemaPath: n }, i, s) {
  if (Array.isArray(i.keyword) ? !i.keyword.includes(s) : i.keyword !== s)
    throw new Error("ajv implementation error");
  const o = i.dependencies;
  if (o != null && o.some((a) => !Object.prototype.hasOwnProperty.call(e, a)))
    throw new Error(`parent schema must have dependencies of ${s}: ${o.join(",")}`);
  if (i.validateSchema && !i.validateSchema(e[s])) {
    const l = `keyword "${s}" value is invalid at path "${n}": ` + r.errorsText(i.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(l);
    else
      throw new Error(l);
  }
}
we.validateKeywordUsage = If;
var ze = {};
Object.defineProperty(ze, "__esModule", { value: !0 });
ze.extendSubschemaMode = ze.extendSubschemaData = ze.getSubschema = void 0;
const be = D, Ua = I;
function Tf(e, { keyword: t, schemaProp: r, schema: n, schemaPath: i, errSchemaPath: s, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const a = e.schema[t];
    return r === void 0 ? {
      schema: a,
      schemaPath: (0, be._)`${e.schemaPath}${(0, be.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: a[r],
      schemaPath: (0, be._)`${e.schemaPath}${(0, be.getProperty)(t)}${(0, be.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, Ua.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (i === void 0 || s === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: i,
      topSchemaRef: o,
      errSchemaPath: s
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
ze.getSubschema = Tf;
function Rf(e, t, { dataProp: r, dataPropType: n, data: i, dataTypes: s, propertyName: o }) {
  if (i !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: a } = t;
  if (r !== void 0) {
    const { errorPath: c, dataPathArr: f, opts: u } = t, h = a.let("data", (0, be._)`${t.data}${(0, be.getProperty)(r)}`, !0);
    l(h), e.errorPath = (0, be.str)`${c}${(0, Ua.getErrorPath)(r, n, u.jsPropertySyntax)}`, e.parentDataProperty = (0, be._)`${r}`, e.dataPathArr = [...f, e.parentDataProperty];
  }
  if (i !== void 0) {
    const c = i instanceof be.Name ? i : a.let("data", i, !0);
    l(c), o !== void 0 && (e.propertyName = o);
  }
  s && (e.dataTypes = s);
  function l(c) {
    e.data = c, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, c];
  }
}
ze.extendSubschemaData = Rf;
function kf(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: i, allErrors: s }) {
  n !== void 0 && (e.compositeRule = n), i !== void 0 && (e.createErrors = i), s !== void 0 && (e.allErrors = s), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
ze.extendSubschemaMode = kf;
var Z = {}, za = function e(t, r) {
  if (t === r) return !0;
  if (t && r && typeof t == "object" && typeof r == "object") {
    if (t.constructor !== r.constructor) return !1;
    var n, i, s;
    if (Array.isArray(t)) {
      if (n = t.length, n != r.length) return !1;
      for (i = n; i-- !== 0; )
        if (!e(t[i], r[i])) return !1;
      return !0;
    }
    if (t.constructor === RegExp) return t.source === r.source && t.flags === r.flags;
    if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === r.valueOf();
    if (t.toString !== Object.prototype.toString) return t.toString() === r.toString();
    if (s = Object.keys(t), n = s.length, n !== Object.keys(r).length) return !1;
    for (i = n; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(r, s[i])) return !1;
    for (i = n; i-- !== 0; ) {
      var o = s[i];
      if (!e(t[o], r[o])) return !1;
    }
    return !0;
  }
  return t !== t && r !== r;
}, Ga = { exports: {} }, He = Ga.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, i = r.post || function() {
  };
  $r(t, n, i, e, "", e);
};
He.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
He.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
He.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
He.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function $r(e, t, r, n, i, s, o, a, l, c) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, i, s, o, a, l, c);
    for (var f in n) {
      var u = n[f];
      if (Array.isArray(u)) {
        if (f in He.arrayKeywords)
          for (var h = 0; h < u.length; h++)
            $r(e, t, r, u[h], i + "/" + f + "/" + h, s, i, f, n, h);
      } else if (f in He.propsKeywords) {
        if (u && typeof u == "object")
          for (var y in u)
            $r(e, t, r, u[y], i + "/" + f + "/" + Nf(y), s, i, f, n, y);
      } else (f in He.keywords || e.allKeys && !(f in He.skipKeywords)) && $r(e, t, r, u, i + "/" + f, s, i, f, n);
    }
    r(n, i, s, o, a, l, c);
  }
}
function Nf(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Mf = Ga.exports;
Object.defineProperty(Z, "__esModule", { value: !0 });
Z.getSchemaRefs = Z.resolveUrl = Z.normalizeId = Z._getFullPath = Z.getFullPath = Z.inlineRef = void 0;
const Df = I, qf = za, Ff = Mf, Vf = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function Lf(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Qn(e) : t ? Ba(e) <= t : !1;
}
Z.inlineRef = Lf;
const Hf = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Qn(e) {
  for (const t in e) {
    if (Hf.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Qn) || typeof r == "object" && Qn(r))
      return !0;
  }
  return !1;
}
function Ba(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !Vf.has(r) && (typeof e[r] == "object" && (0, Df.eachItem)(e[r], (n) => t += Ba(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function Ka(e, t = "", r) {
  r !== !1 && (t = gt(t));
  const n = e.parse(t);
  return Wa(e, n);
}
Z.getFullPath = Ka;
function Wa(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Z._getFullPath = Wa;
const Uf = /#\/?$/;
function gt(e) {
  return e ? e.replace(Uf, "") : "";
}
Z.normalizeId = gt;
function zf(e, t, r) {
  return r = gt(r), e.resolve(t, r);
}
Z.resolveUrl = zf;
const Gf = /^[a-z_][-a-z0-9._]*$/i;
function Bf(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, i = gt(e[r] || t), s = { "": i }, o = Ka(n, i, !1), a = {}, l = /* @__PURE__ */ new Set();
  return Ff(e, { allKeys: !0 }, (u, h, y, _) => {
    if (_ === void 0)
      return;
    const b = o + h;
    let v = s[_];
    typeof u[r] == "string" && (v = p.call(this, u[r])), m.call(this, u.$anchor), m.call(this, u.$dynamicAnchor), s[h] = v;
    function p($) {
      const E = this.opts.uriResolver.resolve;
      if ($ = gt(v ? E(v, $) : $), l.has($))
        throw f($);
      l.add($);
      let S = this.refs[$];
      return typeof S == "string" && (S = this.refs[S]), typeof S == "object" ? c(u, S.schema, $) : $ !== gt(b) && ($[0] === "#" ? (c(u, a[$], $), a[$] = u) : this.refs[$] = b), $;
    }
    function m($) {
      if (typeof $ == "string") {
        if (!Gf.test($))
          throw new Error(`invalid anchor "${$}"`);
        p.call(this, `#${$}`);
      }
    }
  }), a;
  function c(u, h, y) {
    if (h !== void 0 && !qf(u, h))
      throw f(y);
  }
  function f(u) {
    return new Error(`reference "${u}" resolves to more than one schema`);
  }
}
Z.getSchemaRefs = Bf;
Object.defineProperty($e, "__esModule", { value: !0 });
$e.getData = $e.KeywordCxt = $e.validateFunctionCode = void 0;
const Ja = $t, ro = Y, Ci = Ie, Er = Y, Kf = Vr, qt = we, Rn = ze, T = D, M = ue, Wf = Z, Te = I, It = Xt;
function Jf(e) {
  if (Qa(e) && (Za(e), Xa(e))) {
    Qf(e);
    return;
  }
  Ya(e, () => (0, Ja.topBoolOrEmptySchema)(e));
}
$e.validateFunctionCode = Jf;
function Ya({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: i }, s) {
  i.code.es5 ? e.func(t, (0, T._)`${M.default.data}, ${M.default.valCxt}`, n.$async, () => {
    e.code((0, T._)`"use strict"; ${no(r, i)}`), Xf(e, i), e.code(s);
  }) : e.func(t, (0, T._)`${M.default.data}, ${Yf(i)}`, n.$async, () => e.code(no(r, i)).code(s));
}
function Yf(e) {
  return (0, T._)`{${M.default.instancePath}="", ${M.default.parentData}, ${M.default.parentDataProperty}, ${M.default.rootData}=${M.default.data}${e.dynamicRef ? (0, T._)`, ${M.default.dynamicAnchors}={}` : T.nil}}={}`;
}
function Xf(e, t) {
  e.if(M.default.valCxt, () => {
    e.var(M.default.instancePath, (0, T._)`${M.default.valCxt}.${M.default.instancePath}`), e.var(M.default.parentData, (0, T._)`${M.default.valCxt}.${M.default.parentData}`), e.var(M.default.parentDataProperty, (0, T._)`${M.default.valCxt}.${M.default.parentDataProperty}`), e.var(M.default.rootData, (0, T._)`${M.default.valCxt}.${M.default.rootData}`), t.dynamicRef && e.var(M.default.dynamicAnchors, (0, T._)`${M.default.valCxt}.${M.default.dynamicAnchors}`);
  }, () => {
    e.var(M.default.instancePath, (0, T._)`""`), e.var(M.default.parentData, (0, T._)`undefined`), e.var(M.default.parentDataProperty, (0, T._)`undefined`), e.var(M.default.rootData, M.default.data), t.dynamicRef && e.var(M.default.dynamicAnchors, (0, T._)`{}`);
  });
}
function Qf(e) {
  const { schema: t, opts: r, gen: n } = e;
  Ya(e, () => {
    r.$comment && t.$comment && tl(e), nd(e), n.let(M.default.vErrors, null), n.let(M.default.errors, 0), r.unevaluated && Zf(e), el(e), od(e);
  });
}
function Zf(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, T._)`${r}.evaluated`), t.if((0, T._)`${e.evaluated}.dynamicProps`, () => t.assign((0, T._)`${e.evaluated}.props`, (0, T._)`undefined`)), t.if((0, T._)`${e.evaluated}.dynamicItems`, () => t.assign((0, T._)`${e.evaluated}.items`, (0, T._)`undefined`));
}
function no(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, T._)`/*# sourceURL=${r} */` : T.nil;
}
function ed(e, t) {
  if (Qa(e) && (Za(e), Xa(e))) {
    td(e, t);
    return;
  }
  (0, Ja.boolOrEmptySchema)(e, t);
}
function Xa({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function Qa(e) {
  return typeof e.schema != "boolean";
}
function td(e, t) {
  const { schema: r, gen: n, opts: i } = e;
  i.$comment && r.$comment && tl(e), id(e), sd(e);
  const s = n.const("_errs", M.default.errors);
  el(e, s), n.var(t, (0, T._)`${s} === ${M.default.errors}`);
}
function Za(e) {
  (0, Te.checkUnknownRules)(e), rd(e);
}
function el(e, t) {
  if (e.opts.jtd)
    return io(e, [], !1, t);
  const r = (0, ro.getSchemaTypes)(e.schema), n = (0, ro.coerceAndCheckDataType)(e, r);
  io(e, r, !n, t);
}
function rd(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: i } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, Te.schemaHasRulesButRef)(t, i.RULES) && i.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function nd(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, Te.checkStrictMode)(e, "default is ignored in the schema root");
}
function id(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, Wf.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function sd(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function tl({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: i }) {
  const s = r.$comment;
  if (i.$comment === !0)
    e.code((0, T._)`${M.default.self}.logger.log(${s})`);
  else if (typeof i.$comment == "function") {
    const o = (0, T.str)`${n}/$comment`, a = e.scopeValue("root", { ref: t.root });
    e.code((0, T._)`${M.default.self}.opts.$comment(${s}, ${o}, ${a}.schema)`);
  }
}
function od(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: i, opts: s } = e;
  r.$async ? t.if((0, T._)`${M.default.errors} === 0`, () => t.return(M.default.data), () => t.throw((0, T._)`new ${i}(${M.default.vErrors})`)) : (t.assign((0, T._)`${n}.errors`, M.default.vErrors), s.unevaluated && ad(e), t.return((0, T._)`${M.default.errors} === 0`));
}
function ad({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof T.Name && e.assign((0, T._)`${t}.props`, r), n instanceof T.Name && e.assign((0, T._)`${t}.items`, n);
}
function io(e, t, r, n) {
  const { gen: i, schema: s, data: o, allErrors: a, opts: l, self: c } = e, { RULES: f } = c;
  if (s.$ref && (l.ignoreKeywordsWithRef || !(0, Te.schemaHasRulesButRef)(s, f))) {
    i.block(() => il(e, "$ref", f.all.$ref.definition));
    return;
  }
  l.jtd || ld(e, t), i.block(() => {
    for (const h of f.rules)
      u(h);
    u(f.post);
  });
  function u(h) {
    (0, Ci.shouldUseGroup)(s, h) && (h.type ? (i.if((0, Er.checkDataType)(h.type, o, l.strictNumbers)), so(e, h), t.length === 1 && t[0] === h.type && r && (i.else(), (0, Er.reportTypeError)(e)), i.endIf()) : so(e, h), a || i.if((0, T._)`${M.default.errors} === ${n || 0}`));
  }
}
function so(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: i } } = e;
  i && (0, Kf.assignDefaults)(e, t.type), r.block(() => {
    for (const s of t.rules)
      (0, Ci.shouldUseRule)(n, s) && il(e, s.keyword, s.definition, t.type);
  });
}
function ld(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (cd(e, t), e.opts.allowUnionTypes || ud(e, t), fd(e, e.dataTypes));
}
function cd(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      rl(e.dataTypes, r) || Ii(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), pd(e, t);
  }
}
function ud(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Ii(e, "use allowUnionTypes to allow union type keyword");
}
function fd(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const i = r[n];
    if (typeof i == "object" && (0, Ci.shouldUseRule)(e.schema, i)) {
      const { type: s } = i.definition;
      s.length && !s.some((o) => dd(t, o)) && Ii(e, `missing type "${s.join(",")}" for keyword "${n}"`);
    }
  }
}
function dd(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function rl(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function pd(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    rl(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Ii(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, Te.checkStrictMode)(e, t, e.opts.strictTypes);
}
class nl {
  constructor(t, r, n) {
    if ((0, qt.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, Te.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", sl(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, qt.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", M.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, T.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, T.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, T._)`${r} !== undefined && (${(0, T.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? It.reportExtraError : It.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, It.reportError)(this, this.def.$dataError || It.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, It.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = T.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = T.nil, r = T.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: i, schemaType: s, def: o } = this;
    n.if((0, T.or)((0, T._)`${i} === undefined`, r)), t !== T.nil && n.assign(t, !0), (s.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== T.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: i, it: s } = this;
    return (0, T.or)(o(), a());
    function o() {
      if (n.length) {
        if (!(r instanceof T.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(n) ? n : [n];
        return (0, T._)`${(0, Er.checkDataTypes)(l, r, s.opts.strictNumbers, Er.DataType.Wrong)}`;
      }
      return T.nil;
    }
    function a() {
      if (i.validateSchema) {
        const l = t.scopeValue("validate$data", { ref: i.validateSchema });
        return (0, T._)`!${l}(${r})`;
      }
      return T.nil;
    }
  }
  subschema(t, r) {
    const n = (0, Rn.getSubschema)(this.it, t);
    (0, Rn.extendSubschemaData)(n, this.it, t), (0, Rn.extendSubschemaMode)(n, t);
    const i = { ...this.it, ...n, items: void 0, props: void 0 };
    return ed(i, r), i;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: i } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = Te.mergeEvaluated.props(i, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = Te.mergeEvaluated.items(i, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: i } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return i.if(r, () => this.mergeEvaluated(t, T.Name)), !0;
  }
}
$e.KeywordCxt = nl;
function il(e, t, r, n) {
  const i = new nl(e, r, t);
  "code" in r ? r.code(i, n) : i.$data && r.validate ? (0, qt.funcKeywordCode)(i, r) : "macro" in r ? (0, qt.macroKeywordCode)(i, r) : (r.compile || r.validate) && (0, qt.funcKeywordCode)(i, r);
}
const hd = /^\/(?:[^~]|~0|~1)*$/, md = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function sl(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let i, s;
  if (e === "")
    return M.default.rootData;
  if (e[0] === "/") {
    if (!hd.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    i = e, s = M.default.rootData;
  } else {
    const c = md.exec(e);
    if (!c)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const f = +c[1];
    if (i = c[2], i === "#") {
      if (f >= t)
        throw new Error(l("property/index", f));
      return n[t - f];
    }
    if (f > t)
      throw new Error(l("data", f));
    if (s = r[t - f], !i)
      return s;
  }
  let o = s;
  const a = i.split("/");
  for (const c of a)
    c && (s = (0, T._)`${s}${(0, T.getProperty)((0, Te.unescapeJsonPointer)(c))}`, o = (0, T._)`${o} && ${s}`);
  return o;
  function l(c, f) {
    return `Cannot access ${c} ${f} levels up, current level is ${t}`;
  }
}
$e.getData = sl;
var Qt = {};
Object.defineProperty(Qt, "__esModule", { value: !0 });
class yd extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
Qt.default = yd;
var wt = {};
Object.defineProperty(wt, "__esModule", { value: !0 });
const kn = Z;
class gd extends Error {
  constructor(t, r, n, i) {
    super(i || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, kn.resolveUrl)(t, r, n), this.missingSchema = (0, kn.normalizeId)((0, kn.getFullPath)(t, this.missingRef));
  }
}
wt.default = gd;
var se = {};
Object.defineProperty(se, "__esModule", { value: !0 });
se.resolveSchema = se.getCompilingSchema = se.resolveRef = se.compileSchema = se.SchemaEnv = void 0;
const he = D, $d = Qt, We = ue, ge = Z, oo = I, _d = $e;
class Lr {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, ge.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
se.SchemaEnv = Lr;
function Ti(e) {
  const t = ol.call(this, e);
  if (t)
    return t;
  const r = (0, ge.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: i } = this.opts.code, { ownProperties: s } = this.opts, o = new he.CodeGen(this.scope, { es5: n, lines: i, ownProperties: s });
  let a;
  e.$async && (a = o.scopeValue("Error", {
    ref: $d.default,
    code: (0, he._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = o.scopeName("validate");
  e.validateName = l;
  const c = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: We.default.data,
    parentData: We.default.parentData,
    parentDataProperty: We.default.parentDataProperty,
    dataNames: [We.default.data],
    dataPathArr: [he.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, he.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: a,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: he.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, he._)`""`,
    opts: this.opts,
    self: this
  };
  let f;
  try {
    this._compilations.add(e), (0, _d.validateFunctionCode)(c), o.optimize(this.opts.code.optimize);
    const u = o.toString();
    f = `${o.scopeRefs(We.default.scope)}return ${u}`, this.opts.code.process && (f = this.opts.code.process(f, e));
    const y = new Function(`${We.default.self}`, `${We.default.scope}`, f)(this, this.scope.get());
    if (this.scope.value(l, { ref: y }), y.errors = null, y.schema = e.schema, y.schemaEnv = e, e.$async && (y.$async = !0), this.opts.code.source === !0 && (y.source = { validateName: l, validateCode: u, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: _, items: b } = c;
      y.evaluated = {
        props: _ instanceof he.Name ? void 0 : _,
        items: b instanceof he.Name ? void 0 : b,
        dynamicProps: _ instanceof he.Name,
        dynamicItems: b instanceof he.Name
      }, y.source && (y.source.evaluated = (0, he.stringify)(y.evaluated));
    }
    return e.validate = y, e;
  } catch (u) {
    throw delete e.validate, delete e.validateName, f && this.logger.error("Error compiling schema, function code:", f), u;
  } finally {
    this._compilations.delete(e);
  }
}
se.compileSchema = Ti;
function vd(e, t, r) {
  var n;
  r = (0, ge.resolveUrl)(this.opts.uriResolver, t, r);
  const i = e.refs[r];
  if (i)
    return i;
  let s = Pd.call(this, e, r);
  if (s === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: a } = this.opts;
    o && (s = new Lr({ schema: o, schemaId: a, root: e, baseId: t }));
  }
  if (s !== void 0)
    return e.refs[r] = bd.call(this, s);
}
se.resolveRef = vd;
function bd(e) {
  return (0, ge.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Ti.call(this, e);
}
function ol(e) {
  for (const t of this._compilations)
    if (wd(t, e))
      return t;
}
se.getCompilingSchema = ol;
function wd(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function Pd(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || Hr.call(this, e, t);
}
function Hr(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, ge._getFullPath)(this.opts.uriResolver, r);
  let i = (0, ge.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === i)
    return Nn.call(this, r, e);
  const s = (0, ge.normalizeId)(n), o = this.refs[s] || this.schemas[s];
  if (typeof o == "string") {
    const a = Hr.call(this, e, o);
    return typeof (a == null ? void 0 : a.schema) != "object" ? void 0 : Nn.call(this, r, a);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || Ti.call(this, o), s === (0, ge.normalizeId)(t)) {
      const { schema: a } = o, { schemaId: l } = this.opts, c = a[l];
      return c && (i = (0, ge.resolveUrl)(this.opts.uriResolver, i, c)), new Lr({ schema: a, schemaId: l, root: e, baseId: i });
    }
    return Nn.call(this, r, o);
  }
}
se.resolveSchema = Hr;
const Od = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Nn(e, { baseId: t, schema: r, root: n }) {
  var i;
  if (((i = e.fragment) === null || i === void 0 ? void 0 : i[0]) !== "/")
    return;
  for (const a of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const l = r[(0, oo.unescapeFragment)(a)];
    if (l === void 0)
      return;
    r = l;
    const c = typeof r == "object" && r[this.opts.schemaId];
    !Od.has(a) && c && (t = (0, ge.resolveUrl)(this.opts.uriResolver, t, c));
  }
  let s;
  if (typeof r != "boolean" && r.$ref && !(0, oo.schemaHasRulesButRef)(r, this.RULES)) {
    const a = (0, ge.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    s = Hr.call(this, n, a);
  }
  const { schemaId: o } = this.opts;
  if (s = s || new Lr({ schema: r, schemaId: o, root: n, baseId: t }), s.schema !== s.root.schema)
    return s;
}
const Ed = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Sd = "Meta-schema for $data reference (JSON AnySchema extension proposal)", xd = "object", jd = [
  "$data"
], Ad = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, Cd = !1, Id = {
  $id: Ed,
  description: Sd,
  type: xd,
  required: jd,
  properties: Ad,
  additionalProperties: Cd
};
var Ri = {}, Ur = { exports: {} };
const Td = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  A: 10,
  b: 11,
  B: 11,
  c: 12,
  C: 12,
  d: 13,
  D: 13,
  e: 14,
  E: 14,
  f: 15,
  F: 15
};
var Rd = {
  HEX: Td
};
const { HEX: kd } = Rd, Nd = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u;
function al(e) {
  if (cl(e, ".") < 3)
    return { host: e, isIPV4: !1 };
  const t = e.match(Nd) || [], [r] = t;
  return r ? { host: Dd(r, "."), isIPV4: !0 } : { host: e, isIPV4: !1 };
}
function ao(e, t = !1) {
  let r = "", n = !0;
  for (const i of e) {
    if (kd[i] === void 0) return;
    i !== "0" && n === !0 && (n = !1), n || (r += i);
  }
  return t && r.length === 0 && (r = "0"), r;
}
function Md(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], i = [];
  let s = !1, o = !1, a = !1;
  function l() {
    if (i.length) {
      if (s === !1) {
        const c = ao(i);
        if (c !== void 0)
          n.push(c);
        else
          return r.error = !0, !1;
      }
      i.length = 0;
    }
    return !0;
  }
  for (let c = 0; c < e.length; c++) {
    const f = e[c];
    if (!(f === "[" || f === "]"))
      if (f === ":") {
        if (o === !0 && (a = !0), !l())
          break;
        if (t++, n.push(":"), t > 7) {
          r.error = !0;
          break;
        }
        c - 1 >= 0 && e[c - 1] === ":" && (o = !0);
        continue;
      } else if (f === "%") {
        if (!l())
          break;
        s = !0;
      } else {
        i.push(f);
        continue;
      }
  }
  return i.length && (s ? r.zone = i.join("") : a ? n.push(i.join("")) : n.push(ao(i))), r.address = n.join(""), r;
}
function ll(e) {
  if (cl(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = Md(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let r = t.address, n = t.address;
    return t.zone && (r += "%" + t.zone, n += "%25" + t.zone), { host: r, escapedHost: n, isIPV6: !0 };
  }
}
function Dd(e, t) {
  let r = "", n = !0;
  const i = e.length;
  for (let s = 0; s < i; s++) {
    const o = e[s];
    o === "0" && n ? (s + 1 <= i && e[s + 1] === t || s + 1 === i) && (r += o, n = !1) : (o === t ? n = !0 : n = !1, r += o);
  }
  return r;
}
function cl(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
const lo = /^\.\.?\//u, co = /^\/\.(?:\/|$)/u, uo = /^\/\.\.(?:\/|$)/u, qd = /^\/?(?:.|\n)*?(?=\/|$)/u;
function Fd(e) {
  const t = [];
  for (; e.length; )
    if (e.match(lo))
      e = e.replace(lo, "");
    else if (e.match(co))
      e = e.replace(co, "/");
    else if (e.match(uo))
      e = e.replace(uo, "/"), t.pop();
    else if (e === "." || e === "..")
      e = "";
    else {
      const r = e.match(qd);
      if (r) {
        const n = r[0];
        e = e.slice(n.length), t.push(n);
      } else
        throw new Error("Unexpected dot segment condition");
    }
  return t.join("");
}
function Vd(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function Ld(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    const n = al(r);
    if (n.isIPV4)
      r = n.host;
    else {
      const i = ll(n.host);
      i.isIPV6 === !0 ? r = `[${i.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var Hd = {
  recomposeAuthority: Ld,
  normalizeComponentEncoding: Vd,
  removeDotSegments: Fd,
  normalizeIPv4: al,
  normalizeIPv6: ll
};
const Ud = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu, zd = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function ul(e) {
  return typeof e.secure == "boolean" ? e.secure : String(e.scheme).toLowerCase() === "wss";
}
function fl(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function dl(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function Gd(e) {
  return e.secure = ul(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function Bd(e) {
  if ((e.port === (ul(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function Kd(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(zd);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const i = `${n}:${t.nid || e.nid}`, s = ki[i];
    e.path = void 0, s && (e = s.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function Wd(e, t) {
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), i = `${r}:${t.nid || n}`, s = ki[i];
  s && (e = s.serialize(e, t));
  const o = e, a = e.nss;
  return o.path = `${n || t.nid}:${a}`, t.skipEscape = !0, o;
}
function Jd(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !Ud.test(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function Yd(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const pl = {
  scheme: "http",
  domainHost: !0,
  parse: fl,
  serialize: dl
}, Xd = {
  scheme: "https",
  domainHost: pl.domainHost,
  parse: fl,
  serialize: dl
}, _r = {
  scheme: "ws",
  domainHost: !0,
  parse: Gd,
  serialize: Bd
}, Qd = {
  scheme: "wss",
  domainHost: _r.domainHost,
  parse: _r.parse,
  serialize: _r.serialize
}, Zd = {
  scheme: "urn",
  parse: Kd,
  serialize: Wd,
  skipNormalize: !0
}, ep = {
  scheme: "urn:uuid",
  parse: Jd,
  serialize: Yd,
  skipNormalize: !0
}, ki = {
  http: pl,
  https: Xd,
  ws: _r,
  wss: Qd,
  urn: Zd,
  "urn:uuid": ep
};
var tp = ki;
const { normalizeIPv6: rp, normalizeIPv4: np, removeDotSegments: kt, recomposeAuthority: ip, normalizeComponentEncoding: ar } = Hd, Ni = tp;
function sp(e, t) {
  return typeof e == "string" ? e = Pe(Re(e, t), t) : typeof e == "object" && (e = Re(Pe(e, t), t)), e;
}
function op(e, t, r) {
  const n = Object.assign({ scheme: "null" }, r), i = hl(Re(e, n), Re(t, n), n, !0);
  return Pe(i, { ...n, skipEscape: !0 });
}
function hl(e, t, r, n) {
  const i = {};
  return n || (e = Re(Pe(e, r), r), t = Re(Pe(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (i.scheme = t.scheme, i.userinfo = t.userinfo, i.host = t.host, i.port = t.port, i.path = kt(t.path || ""), i.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (i.userinfo = t.userinfo, i.host = t.host, i.port = t.port, i.path = kt(t.path || ""), i.query = t.query) : (t.path ? (t.path.charAt(0) === "/" ? i.path = kt(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? i.path = "/" + t.path : e.path ? i.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : i.path = t.path, i.path = kt(i.path)), i.query = t.query) : (i.path = e.path, t.query !== void 0 ? i.query = t.query : i.query = e.query), i.userinfo = e.userinfo, i.host = e.host, i.port = e.port), i.scheme = e.scheme), i.fragment = t.fragment, i;
}
function ap(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = Pe(ar(Re(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = Pe(ar(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = Pe(ar(Re(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = Pe(ar(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
}
function Pe(e, t) {
  const r = {
    host: e.host,
    scheme: e.scheme,
    userinfo: e.userinfo,
    port: e.port,
    path: e.path,
    query: e.query,
    nid: e.nid,
    nss: e.nss,
    uuid: e.uuid,
    fragment: e.fragment,
    reference: e.reference,
    resourceName: e.resourceName,
    secure: e.secure,
    error: ""
  }, n = Object.assign({}, t), i = [], s = Ni[(n.scheme || r.scheme || "").toLowerCase()];
  s && s.serialize && s.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && i.push(r.scheme, ":");
  const o = ip(r);
  if (o !== void 0 && (n.reference !== "suffix" && i.push("//"), i.push(o), r.path && r.path.charAt(0) !== "/" && i.push("/")), r.path !== void 0) {
    let a = r.path;
    !n.absolutePath && (!s || !s.absolutePath) && (a = kt(a)), o === void 0 && (a = a.replace(/^\/\//u, "/%2F")), i.push(a);
  }
  return r.query !== void 0 && i.push("?", r.query), r.fragment !== void 0 && i.push("#", r.fragment), i.join("");
}
const lp = Array.from({ length: 127 }, (e, t) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(t)));
function cp(e) {
  let t = 0;
  for (let r = 0, n = e.length; r < n; ++r)
    if (t = e.charCodeAt(r), t > 126 || lp[t])
      return !0;
  return !1;
}
const up = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function Re(e, t) {
  const r = Object.assign({}, t), n = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  }, i = e.indexOf("%") !== -1;
  let s = !1;
  r.reference === "suffix" && (e = (r.scheme ? r.scheme + ":" : "") + "//" + e);
  const o = e.match(up);
  if (o) {
    if (n.scheme = o[1], n.userinfo = o[3], n.host = o[4], n.port = parseInt(o[5], 10), n.path = o[6] || "", n.query = o[7], n.fragment = o[8], isNaN(n.port) && (n.port = o[5]), n.host) {
      const l = np(n.host);
      if (l.isIPV4 === !1) {
        const c = rp(l.host);
        n.host = c.host.toLowerCase(), s = c.isIPV6;
      } else
        n.host = l.host, s = !0;
    }
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const a = Ni[(r.scheme || n.scheme || "").toLowerCase()];
    if (!r.unicodeSupport && (!a || !a.unicodeSupport) && n.host && (r.domainHost || a && a.domainHost) && s === !1 && cp(n.host))
      try {
        n.host = URL.domainToASCII(n.host.toLowerCase());
      } catch (l) {
        n.error = n.error || "Host's domain name can not be converted to ASCII: " + l;
      }
    (!a || a && !a.skipNormalize) && (i && n.scheme !== void 0 && (n.scheme = unescape(n.scheme)), i && n.host !== void 0 && (n.host = unescape(n.host)), n.path && (n.path = escape(unescape(n.path))), n.fragment && (n.fragment = encodeURI(decodeURIComponent(n.fragment)))), a && a.parse && a.parse(n, r);
  } else
    n.error = n.error || "URI can not be parsed.";
  return n;
}
const Mi = {
  SCHEMES: Ni,
  normalize: sp,
  resolve: op,
  resolveComponents: hl,
  equal: ap,
  serialize: Pe,
  parse: Re
};
Ur.exports = Mi;
Ur.exports.default = Mi;
Ur.exports.fastUri = Mi;
var fp = Ur.exports;
Object.defineProperty(Ri, "__esModule", { value: !0 });
const ml = fp;
ml.code = 'require("ajv/dist/runtime/uri").default';
Ri.default = ml;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = $e;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = D;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = Qt, i = wt, s = rt, o = se, a = D, l = Z, c = Y, f = I, u = Id, h = Ri, y = (C, w) => new RegExp(C, w);
  y.code = "new RegExp";
  const _ = ["removeAdditional", "useDefaults", "coerceTypes"], b = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), v = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, p = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, m = 200;
  function $(C) {
    var w, x, P, d, g, O, R, N, z, L, X, ot, yn, gn, $n, _n, vn, bn, wn, Pn, On, En, Sn, xn, jn;
    const Ct = C.strict, An = (w = C.code) === null || w === void 0 ? void 0 : w.optimize, Gs = An === !0 || An === void 0 ? 1 : An || 0, Bs = (P = (x = C.code) === null || x === void 0 ? void 0 : x.regExp) !== null && P !== void 0 ? P : y, Rc = (d = C.uriResolver) !== null && d !== void 0 ? d : h.default;
    return {
      strictSchema: (O = (g = C.strictSchema) !== null && g !== void 0 ? g : Ct) !== null && O !== void 0 ? O : !0,
      strictNumbers: (N = (R = C.strictNumbers) !== null && R !== void 0 ? R : Ct) !== null && N !== void 0 ? N : !0,
      strictTypes: (L = (z = C.strictTypes) !== null && z !== void 0 ? z : Ct) !== null && L !== void 0 ? L : "log",
      strictTuples: (ot = (X = C.strictTuples) !== null && X !== void 0 ? X : Ct) !== null && ot !== void 0 ? ot : "log",
      strictRequired: (gn = (yn = C.strictRequired) !== null && yn !== void 0 ? yn : Ct) !== null && gn !== void 0 ? gn : !1,
      code: C.code ? { ...C.code, optimize: Gs, regExp: Bs } : { optimize: Gs, regExp: Bs },
      loopRequired: ($n = C.loopRequired) !== null && $n !== void 0 ? $n : m,
      loopEnum: (_n = C.loopEnum) !== null && _n !== void 0 ? _n : m,
      meta: (vn = C.meta) !== null && vn !== void 0 ? vn : !0,
      messages: (bn = C.messages) !== null && bn !== void 0 ? bn : !0,
      inlineRefs: (wn = C.inlineRefs) !== null && wn !== void 0 ? wn : !0,
      schemaId: (Pn = C.schemaId) !== null && Pn !== void 0 ? Pn : "$id",
      addUsedSchema: (On = C.addUsedSchema) !== null && On !== void 0 ? On : !0,
      validateSchema: (En = C.validateSchema) !== null && En !== void 0 ? En : !0,
      validateFormats: (Sn = C.validateFormats) !== null && Sn !== void 0 ? Sn : !0,
      unicodeRegExp: (xn = C.unicodeRegExp) !== null && xn !== void 0 ? xn : !0,
      int32range: (jn = C.int32range) !== null && jn !== void 0 ? jn : !0,
      uriResolver: Rc
    };
  }
  class E {
    constructor(w = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), w = this.opts = { ...w, ...$(w) };
      const { es5: x, lines: P } = this.opts.code;
      this.scope = new a.ValueScope({ scope: {}, prefixes: b, es5: x, lines: P }), this.logger = Ae(w.logger);
      const d = w.validateFormats;
      w.validateFormats = !1, this.RULES = (0, s.getRules)(), S.call(this, v, w, "NOT SUPPORTED"), S.call(this, p, w, "DEPRECATED", "warn"), this._metaOpts = ve.call(this), w.formats && fe.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), w.keywords && ce.call(this, w.keywords), typeof w.meta == "object" && this.addMetaSchema(w.meta), U.call(this), w.validateFormats = d;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: w, meta: x, schemaId: P } = this.opts;
      let d = u;
      P === "id" && (d = { ...u }, d.id = d.$id, delete d.$id), x && w && this.addMetaSchema(d, d[P], !1);
    }
    defaultMeta() {
      const { meta: w, schemaId: x } = this.opts;
      return this.opts.defaultMeta = typeof w == "object" ? w[x] || w : void 0;
    }
    validate(w, x) {
      let P;
      if (typeof w == "string") {
        if (P = this.getSchema(w), !P)
          throw new Error(`no schema with key or ref "${w}"`);
      } else
        P = this.compile(w);
      const d = P(x);
      return "$async" in P || (this.errors = P.errors), d;
    }
    compile(w, x) {
      const P = this._addSchema(w, x);
      return P.validate || this._compileSchemaEnv(P);
    }
    compileAsync(w, x) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: P } = this.opts;
      return d.call(this, w, x);
      async function d(L, X) {
        await g.call(this, L.$schema);
        const ot = this._addSchema(L, X);
        return ot.validate || O.call(this, ot);
      }
      async function g(L) {
        L && !this.getSchema(L) && await d.call(this, { $ref: L }, !0);
      }
      async function O(L) {
        try {
          return this._compileSchemaEnv(L);
        } catch (X) {
          if (!(X instanceof i.default))
            throw X;
          return R.call(this, X), await N.call(this, X.missingSchema), O.call(this, L);
        }
      }
      function R({ missingSchema: L, missingRef: X }) {
        if (this.refs[L])
          throw new Error(`AnySchema ${L} is loaded but ${X} cannot be resolved`);
      }
      async function N(L) {
        const X = await z.call(this, L);
        this.refs[L] || await g.call(this, X.$schema), this.refs[L] || this.addSchema(X, L, x);
      }
      async function z(L) {
        const X = this._loading[L];
        if (X)
          return X;
        try {
          return await (this._loading[L] = P(L));
        } finally {
          delete this._loading[L];
        }
      }
    }
    // Adds schema to the instance
    addSchema(w, x, P, d = this.opts.validateSchema) {
      if (Array.isArray(w)) {
        for (const O of w)
          this.addSchema(O, void 0, P, d);
        return this;
      }
      let g;
      if (typeof w == "object") {
        const { schemaId: O } = this.opts;
        if (g = w[O], g !== void 0 && typeof g != "string")
          throw new Error(`schema ${O} must be string`);
      }
      return x = (0, l.normalizeId)(x || g), this._checkUnique(x), this.schemas[x] = this._addSchema(w, P, x, d, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(w, x, P = this.opts.validateSchema) {
      return this.addSchema(w, x, !0, P), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(w, x) {
      if (typeof w == "boolean")
        return !0;
      let P;
      if (P = w.$schema, P !== void 0 && typeof P != "string")
        throw new Error("$schema must be a string");
      if (P = P || this.opts.defaultMeta || this.defaultMeta(), !P)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const d = this.validate(P, w);
      if (!d && x) {
        const g = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(g);
        else
          throw new Error(g);
      }
      return d;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(w) {
      let x;
      for (; typeof (x = A.call(this, w)) == "string"; )
        w = x;
      if (x === void 0) {
        const { schemaId: P } = this.opts, d = new o.SchemaEnv({ schema: {}, schemaId: P });
        if (x = o.resolveSchema.call(this, d, w), !x)
          return;
        this.refs[w] = x;
      }
      return x.validate || this._compileSchemaEnv(x);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(w) {
      if (w instanceof RegExp)
        return this._removeAllSchemas(this.schemas, w), this._removeAllSchemas(this.refs, w), this;
      switch (typeof w) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const x = A.call(this, w);
          return typeof x == "object" && this._cache.delete(x.schema), delete this.schemas[w], delete this.refs[w], this;
        }
        case "object": {
          const x = w;
          this._cache.delete(x);
          let P = w[this.opts.schemaId];
          return P && (P = (0, l.normalizeId)(P), delete this.schemas[P], delete this.refs[P]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(w) {
      for (const x of w)
        this.addKeyword(x);
      return this;
    }
    addKeyword(w, x) {
      let P;
      if (typeof w == "string")
        P = w, typeof x == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), x.keyword = P);
      else if (typeof w == "object" && x === void 0) {
        if (x = w, P = x.keyword, Array.isArray(P) && !P.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (Me.call(this, P, x), !x)
        return (0, f.eachItem)(P, (g) => At.call(this, g)), this;
      hn.call(this, x);
      const d = {
        ...x,
        type: (0, c.getJSONTypes)(x.type),
        schemaType: (0, c.getJSONTypes)(x.schemaType)
      };
      return (0, f.eachItem)(P, d.type.length === 0 ? (g) => At.call(this, g, d) : (g) => d.type.forEach((O) => At.call(this, g, d, O))), this;
    }
    getKeyword(w) {
      const x = this.RULES.all[w];
      return typeof x == "object" ? x.definition : !!x;
    }
    // Remove keyword
    removeKeyword(w) {
      const { RULES: x } = this;
      delete x.keywords[w], delete x.all[w];
      for (const P of x.rules) {
        const d = P.rules.findIndex((g) => g.keyword === w);
        d >= 0 && P.rules.splice(d, 1);
      }
      return this;
    }
    // Add format
    addFormat(w, x) {
      return typeof x == "string" && (x = new RegExp(x)), this.formats[w] = x, this;
    }
    errorsText(w = this.errors, { separator: x = ", ", dataVar: P = "data" } = {}) {
      return !w || w.length === 0 ? "No errors" : w.map((d) => `${P}${d.instancePath} ${d.message}`).reduce((d, g) => d + x + g);
    }
    $dataMetaSchema(w, x) {
      const P = this.RULES.all;
      w = JSON.parse(JSON.stringify(w));
      for (const d of x) {
        const g = d.split("/").slice(1);
        let O = w;
        for (const R of g)
          O = O[R];
        for (const R in P) {
          const N = P[R];
          if (typeof N != "object")
            continue;
          const { $data: z } = N.definition, L = O[R];
          z && L && (O[R] = sr(L));
        }
      }
      return w;
    }
    _removeAllSchemas(w, x) {
      for (const P in w) {
        const d = w[P];
        (!x || x.test(P)) && (typeof d == "string" ? delete w[P] : d && !d.meta && (this._cache.delete(d.schema), delete w[P]));
      }
    }
    _addSchema(w, x, P, d = this.opts.validateSchema, g = this.opts.addUsedSchema) {
      let O;
      const { schemaId: R } = this.opts;
      if (typeof w == "object")
        O = w[R];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof w != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let N = this._cache.get(w);
      if (N !== void 0)
        return N;
      P = (0, l.normalizeId)(O || P);
      const z = l.getSchemaRefs.call(this, w, P);
      return N = new o.SchemaEnv({ schema: w, schemaId: R, meta: x, baseId: P, localRefs: z }), this._cache.set(N.schema, N), g && !P.startsWith("#") && (P && this._checkUnique(P), this.refs[P] = N), d && this.validateSchema(w, !0), N;
    }
    _checkUnique(w) {
      if (this.schemas[w] || this.refs[w])
        throw new Error(`schema with key or id "${w}" already exists`);
    }
    _compileSchemaEnv(w) {
      if (w.meta ? this._compileMetaSchema(w) : o.compileSchema.call(this, w), !w.validate)
        throw new Error("ajv implementation error");
      return w.validate;
    }
    _compileMetaSchema(w) {
      const x = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, w);
      } finally {
        this.opts = x;
      }
    }
  }
  E.ValidationError = n.default, E.MissingRefError = i.default, e.default = E;
  function S(C, w, x, P = "error") {
    for (const d in C) {
      const g = d;
      g in w && this.logger[P](`${x}: option ${d}. ${C[g]}`);
    }
  }
  function A(C) {
    return C = (0, l.normalizeId)(C), this.schemas[C] || this.refs[C];
  }
  function U() {
    const C = this.opts.schemas;
    if (C)
      if (Array.isArray(C))
        this.addSchema(C);
      else
        for (const w in C)
          this.addSchema(C[w], w);
  }
  function fe() {
    for (const C in this.opts.formats) {
      const w = this.opts.formats[C];
      w && this.addFormat(C, w);
    }
  }
  function ce(C) {
    if (Array.isArray(C)) {
      this.addVocabulary(C);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const w in C) {
      const x = C[w];
      x.keyword || (x.keyword = w), this.addKeyword(x);
    }
  }
  function ve() {
    const C = { ...this.opts };
    for (const w of _)
      delete C[w];
    return C;
  }
  const jt = { log() {
  }, warn() {
  }, error() {
  } };
  function Ae(C) {
    if (C === !1)
      return jt;
    if (C === void 0)
      return console;
    if (C.log && C.warn && C.error)
      return C;
    throw new Error("logger must implement log, warn and error methods");
  }
  const st = /^[a-z_$][a-z0-9_$:-]*$/i;
  function Me(C, w) {
    const { RULES: x } = this;
    if ((0, f.eachItem)(C, (P) => {
      if (x.keywords[P])
        throw new Error(`Keyword ${P} is already defined`);
      if (!st.test(P))
        throw new Error(`Keyword ${P} has invalid name`);
    }), !!w && w.$data && !("code" in w || "validate" in w))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function At(C, w, x) {
    var P;
    const d = w == null ? void 0 : w.post;
    if (x && d)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: g } = this;
    let O = d ? g.post : g.rules.find(({ type: N }) => N === x);
    if (O || (O = { type: x, rules: [] }, g.rules.push(O)), g.keywords[C] = !0, !w)
      return;
    const R = {
      keyword: C,
      definition: {
        ...w,
        type: (0, c.getJSONTypes)(w.type),
        schemaType: (0, c.getJSONTypes)(w.schemaType)
      }
    };
    w.before ? ir.call(this, O, R, w.before) : O.rules.push(R), g.all[C] = R, (P = w.implements) === null || P === void 0 || P.forEach((N) => this.addKeyword(N));
  }
  function ir(C, w, x) {
    const P = C.rules.findIndex((d) => d.keyword === x);
    P >= 0 ? C.rules.splice(P, 0, w) : (C.rules.push(w), this.logger.warn(`rule ${x} is not defined`));
  }
  function hn(C) {
    let { metaSchema: w } = C;
    w !== void 0 && (C.$data && this.opts.$data && (w = sr(w)), C.validateSchema = this.compile(w, !0));
  }
  const mn = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function sr(C) {
    return { anyOf: [C, mn] };
  }
})(mt);
var Di = {}, qi = {}, Ee = {};
Object.defineProperty(Ee, "__esModule", { value: !0 });
Ee.callRef = Ee.getValidate = void 0;
const dp = wt, fo = F, ae = D, lt = ue, po = se, lr = I, pp = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: i, schemaEnv: s, validateName: o, opts: a, self: l } = n, { root: c } = s;
    if ((r === "#" || r === "#/") && i === c.baseId)
      return u();
    const f = po.resolveRef.call(l, c, i, r);
    if (f === void 0)
      throw new dp.default(n.opts.uriResolver, i, r);
    if (f instanceof po.SchemaEnv)
      return h(f);
    return y(f);
    function u() {
      if (s === c)
        return vr(e, o, s, s.$async);
      const _ = t.scopeValue("root", { ref: c });
      return vr(e, (0, ae._)`${_}.validate`, c, c.$async);
    }
    function h(_) {
      const b = yl(e, _);
      vr(e, b, _, _.$async);
    }
    function y(_) {
      const b = t.scopeValue("schema", a.code.source === !0 ? { ref: _, code: (0, ae.stringify)(_) } : { ref: _ }), v = t.name("valid"), p = e.subschema({
        schema: _,
        dataTypes: [],
        schemaPath: ae.nil,
        topSchemaRef: b,
        errSchemaPath: r
      }, v);
      e.mergeEvaluated(p), e.ok(v);
    }
  }
};
function yl(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, ae._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
Ee.getValidate = yl;
function vr(e, t, r, n) {
  const { gen: i, it: s } = e, { allErrors: o, schemaEnv: a, opts: l } = s, c = l.passContext ? lt.default.this : ae.nil;
  n ? f() : u();
  function f() {
    if (!a.$async)
      throw new Error("async schema referenced by sync schema");
    const _ = i.let("valid");
    i.try(() => {
      i.code((0, ae._)`await ${(0, fo.callValidateCode)(e, t, c)}`), y(t), o || i.assign(_, !0);
    }, (b) => {
      i.if((0, ae._)`!(${b} instanceof ${s.ValidationError})`, () => i.throw(b)), h(b), o || i.assign(_, !1);
    }), e.ok(_);
  }
  function u() {
    e.result((0, fo.callValidateCode)(e, t, c), () => y(t), () => h(t));
  }
  function h(_) {
    const b = (0, ae._)`${_}.errors`;
    i.assign(lt.default.vErrors, (0, ae._)`${lt.default.vErrors} === null ? ${b} : ${lt.default.vErrors}.concat(${b})`), i.assign(lt.default.errors, (0, ae._)`${lt.default.vErrors}.length`);
  }
  function y(_) {
    var b;
    if (!s.opts.unevaluated)
      return;
    const v = (b = r == null ? void 0 : r.validate) === null || b === void 0 ? void 0 : b.evaluated;
    if (s.props !== !0)
      if (v && !v.dynamicProps)
        v.props !== void 0 && (s.props = lr.mergeEvaluated.props(i, v.props, s.props));
      else {
        const p = i.var("props", (0, ae._)`${_}.evaluated.props`);
        s.props = lr.mergeEvaluated.props(i, p, s.props, ae.Name);
      }
    if (s.items !== !0)
      if (v && !v.dynamicItems)
        v.items !== void 0 && (s.items = lr.mergeEvaluated.items(i, v.items, s.items));
      else {
        const p = i.var("items", (0, ae._)`${_}.evaluated.items`);
        s.items = lr.mergeEvaluated.items(i, p, s.items, ae.Name);
      }
  }
}
Ee.callRef = vr;
Ee.default = pp;
Object.defineProperty(qi, "__esModule", { value: !0 });
const hp = Ee, mp = [
  "$schema",
  "id",
  "$defs",
  { keyword: "$comment" },
  "definitions",
  hp.default
];
qi.default = mp;
var Fi = {}, Vi = {};
Object.defineProperty(Vi, "__esModule", { value: !0 });
const Zn = mt, yp = D, qe = yp.operators, ei = {
  maximum: {
    exclusive: "exclusiveMaximum",
    ops: [
      { okStr: "<=", ok: qe.LTE, fail: qe.GT },
      { okStr: "<", ok: qe.LT, fail: qe.GTE }
    ]
  },
  minimum: {
    exclusive: "exclusiveMinimum",
    ops: [
      { okStr: ">=", ok: qe.GTE, fail: qe.LT },
      { okStr: ">", ok: qe.GT, fail: qe.LTE }
    ]
  }
}, gp = {
  message: (e) => Zn.str`must be ${ti(e).okStr} ${e.schemaCode}`,
  params: (e) => Zn._`{comparison: ${ti(e).okStr}, limit: ${e.schemaCode}}`
}, $p = {
  keyword: Object.keys(ei),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: gp,
  code(e) {
    const { data: t, schemaCode: r } = e;
    e.fail$data(Zn._`${t} ${ti(e).fail} ${r} || isNaN(${t})`);
  }
};
function ti(e) {
  var t;
  const r = e.keyword, n = !((t = e.parentSchema) === null || t === void 0) && t[ei[r].exclusive] ? 1 : 0;
  return ei[r].ops[n];
}
Vi.default = $p;
var Li = {};
Object.defineProperty(Li, "__esModule", { value: !0 });
const ho = {
  exclusiveMaximum: "maximum",
  exclusiveMinimum: "minimum"
}, _p = {
  keyword: Object.keys(ho),
  type: "number",
  schemaType: "boolean",
  code({ keyword: e, parentSchema: t }) {
    const r = ho[e];
    if (t[r] === void 0)
      throw new Error(`${e} can only be used with ${r}`);
  }
};
Li.default = _p;
var zr = {};
Object.defineProperty(zr, "__esModule", { value: !0 });
const Ft = D, vp = {
  message: ({ schemaCode: e }) => (0, Ft.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Ft._)`{multipleOf: ${e}}`
}, bp = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: vp,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: i } = e, s = i.opts.multipleOfPrecision, o = t.let("res"), a = s ? (0, Ft._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${s}` : (0, Ft._)`${o} !== parseInt(${o})`;
    e.fail$data((0, Ft._)`(${n} === 0 || (${o} = ${r}/${n}, ${a}))`);
  }
};
zr.default = bp;
var Gr = {}, Hi = {};
Object.defineProperty(Hi, "__esModule", { value: !0 });
function gl(e) {
  const t = e.length;
  let r = 0, n = 0, i;
  for (; n < t; )
    r++, i = e.charCodeAt(n++), i >= 55296 && i <= 56319 && n < t && (i = e.charCodeAt(n), (i & 64512) === 56320 && n++);
  return r;
}
Hi.default = gl;
gl.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Gr, "__esModule", { value: !0 });
const Ye = D, wp = I, Pp = Hi, Op = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Ye.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Ye._)`{limit: ${e}}`
}, Ep = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: Op,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: i } = e, s = t === "maxLength" ? Ye.operators.GT : Ye.operators.LT, o = i.opts.unicode === !1 ? (0, Ye._)`${r}.length` : (0, Ye._)`${(0, wp.useFunc)(e.gen, Pp.default)}(${r})`;
    e.fail$data((0, Ye._)`${o} ${s} ${n}`);
  }
};
Gr.default = Ep;
var Br = {};
Object.defineProperty(Br, "__esModule", { value: !0 });
const Sp = F, Sr = D, xp = {
  message: ({ schemaCode: e }) => (0, Sr.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Sr._)`{pattern: ${e}}`
}, jp = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: xp,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: i, it: s } = e, o = s.opts.unicodeRegExp ? "u" : "", a = r ? (0, Sr._)`(new RegExp(${i}, ${o}))` : (0, Sp.usePattern)(e, n);
    e.fail$data((0, Sr._)`!${a}.test(${t})`);
  }
};
Br.default = jp;
var Kr = {};
Object.defineProperty(Kr, "__esModule", { value: !0 });
const Vt = D, Ap = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Vt.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Vt._)`{limit: ${e}}`
}, Cp = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: Ap,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, i = t === "maxProperties" ? Vt.operators.GT : Vt.operators.LT;
    e.fail$data((0, Vt._)`Object.keys(${r}).length ${i} ${n}`);
  }
};
Kr.default = Cp;
var Wr = {};
Object.defineProperty(Wr, "__esModule", { value: !0 });
const Tt = F, Lt = D, Ip = I, Tp = {
  message: ({ params: { missingProperty: e } }) => (0, Lt.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Lt._)`{missingProperty: ${e}}`
}, Rp = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Tp,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: i, $data: s, it: o } = e, { opts: a } = o;
    if (!s && r.length === 0)
      return;
    const l = r.length >= a.loopRequired;
    if (o.allErrors ? c() : f(), a.strictRequired) {
      const y = e.parentSchema.properties, { definedProperties: _ } = e.it;
      for (const b of r)
        if ((y == null ? void 0 : y[b]) === void 0 && !_.has(b)) {
          const v = o.schemaEnv.baseId + o.errSchemaPath, p = `required property "${b}" is not defined at "${v}" (strictRequired)`;
          (0, Ip.checkStrictMode)(o, p, o.opts.strictRequired);
        }
    }
    function c() {
      if (l || s)
        e.block$data(Lt.nil, u);
      else
        for (const y of r)
          (0, Tt.checkReportMissingProp)(e, y);
    }
    function f() {
      const y = t.let("missing");
      if (l || s) {
        const _ = t.let("valid", !0);
        e.block$data(_, () => h(y, _)), e.ok(_);
      } else
        t.if((0, Tt.checkMissingProp)(e, r, y)), (0, Tt.reportMissingProp)(e, y), t.else();
    }
    function u() {
      t.forOf("prop", n, (y) => {
        e.setParams({ missingProperty: y }), t.if((0, Tt.noPropertyInData)(t, i, y, a.ownProperties), () => e.error());
      });
    }
    function h(y, _) {
      e.setParams({ missingProperty: y }), t.forOf(y, n, () => {
        t.assign(_, (0, Tt.propertyInData)(t, i, y, a.ownProperties)), t.if((0, Lt.not)(_), () => {
          e.error(), t.break();
        });
      }, Lt.nil);
    }
  }
};
Wr.default = Rp;
var Jr = {};
Object.defineProperty(Jr, "__esModule", { value: !0 });
const Ht = D, kp = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Ht.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Ht._)`{limit: ${e}}`
}, Np = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: kp,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, i = t === "maxItems" ? Ht.operators.GT : Ht.operators.LT;
    e.fail$data((0, Ht._)`${r}.length ${i} ${n}`);
  }
};
Jr.default = Np;
var Yr = {}, Zt = {};
Object.defineProperty(Zt, "__esModule", { value: !0 });
const $l = za;
$l.code = 'require("ajv/dist/runtime/equal").default';
Zt.default = $l;
Object.defineProperty(Yr, "__esModule", { value: !0 });
const Mn = Y, Q = D, Mp = I, Dp = Zt, qp = {
  message: ({ params: { i: e, j: t } }) => (0, Q.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Q._)`{i: ${e}, j: ${t}}`
}, Fp = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: qp,
  code(e) {
    const { gen: t, data: r, $data: n, schema: i, parentSchema: s, schemaCode: o, it: a } = e;
    if (!n && !i)
      return;
    const l = t.let("valid"), c = s.items ? (0, Mn.getSchemaTypes)(s.items) : [];
    e.block$data(l, f, (0, Q._)`${o} === false`), e.ok(l);
    function f() {
      const _ = t.let("i", (0, Q._)`${r}.length`), b = t.let("j");
      e.setParams({ i: _, j: b }), t.assign(l, !0), t.if((0, Q._)`${_} > 1`, () => (u() ? h : y)(_, b));
    }
    function u() {
      return c.length > 0 && !c.some((_) => _ === "object" || _ === "array");
    }
    function h(_, b) {
      const v = t.name("item"), p = (0, Mn.checkDataTypes)(c, v, a.opts.strictNumbers, Mn.DataType.Wrong), m = t.const("indices", (0, Q._)`{}`);
      t.for((0, Q._)`;${_}--;`, () => {
        t.let(v, (0, Q._)`${r}[${_}]`), t.if(p, (0, Q._)`continue`), c.length > 1 && t.if((0, Q._)`typeof ${v} == "string"`, (0, Q._)`${v} += "_"`), t.if((0, Q._)`typeof ${m}[${v}] == "number"`, () => {
          t.assign(b, (0, Q._)`${m}[${v}]`), e.error(), t.assign(l, !1).break();
        }).code((0, Q._)`${m}[${v}] = ${_}`);
      });
    }
    function y(_, b) {
      const v = (0, Mp.useFunc)(t, Dp.default), p = t.name("outer");
      t.label(p).for((0, Q._)`;${_}--;`, () => t.for((0, Q._)`${b} = ${_}; ${b}--;`, () => t.if((0, Q._)`${v}(${r}[${_}], ${r}[${b}])`, () => {
        e.error(), t.assign(l, !1).break(p);
      })));
    }
  }
};
Yr.default = Fp;
var Xr = {};
Object.defineProperty(Xr, "__esModule", { value: !0 });
const ri = D, Vp = I, Lp = Zt, Hp = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, ri._)`{allowedValue: ${e}}`
}, Up = {
  keyword: "const",
  $data: !0,
  error: Hp,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: i, schema: s } = e;
    n || s && typeof s == "object" ? e.fail$data((0, ri._)`!${(0, Vp.useFunc)(t, Lp.default)}(${r}, ${i})`) : e.fail((0, ri._)`${s} !== ${r}`);
  }
};
Xr.default = Up;
var Qr = {};
Object.defineProperty(Qr, "__esModule", { value: !0 });
const Nt = D, zp = I, Gp = Zt, Bp = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Nt._)`{allowedValues: ${e}}`
}, Kp = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: Bp,
  code(e) {
    const { gen: t, data: r, $data: n, schema: i, schemaCode: s, it: o } = e;
    if (!n && i.length === 0)
      throw new Error("enum must have non-empty array");
    const a = i.length >= o.opts.loopEnum;
    let l;
    const c = () => l ?? (l = (0, zp.useFunc)(t, Gp.default));
    let f;
    if (a || n)
      f = t.let("valid"), e.block$data(f, u);
    else {
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      const y = t.const("vSchema", s);
      f = (0, Nt.or)(...i.map((_, b) => h(y, b)));
    }
    e.pass(f);
    function u() {
      t.assign(f, !1), t.forOf("v", s, (y) => t.if((0, Nt._)`${c()}(${r}, ${y})`, () => t.assign(f, !0).break()));
    }
    function h(y, _) {
      const b = i[_];
      return typeof b == "object" && b !== null ? (0, Nt._)`${c()}(${r}, ${y}[${_}])` : (0, Nt._)`${r} === ${b}`;
    }
  }
};
Qr.default = Kp;
Object.defineProperty(Fi, "__esModule", { value: !0 });
const Wp = Vi, Jp = Li, Yp = zr, Xp = Gr, Qp = Br, Zp = Kr, eh = Wr, th = Jr, rh = Yr, nh = Xr, ih = Qr, sh = [
  // number
  Wp.default,
  Jp.default,
  Yp.default,
  // string
  Xp.default,
  Qp.default,
  // object
  Zp.default,
  eh.default,
  // array
  th.default,
  rh.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  nh.default,
  ih.default
];
Fi.default = sh;
var Zr = {}, Pt = {};
Object.defineProperty(Pt, "__esModule", { value: !0 });
Pt.validateAdditionalItems = void 0;
const Xe = D, ni = I, oh = {
  message: ({ params: { len: e } }) => (0, Xe.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Xe._)`{limit: ${e}}`
}, ah = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: oh,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, ni.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    _l(e, n);
  }
};
function _l(e, t) {
  const { gen: r, schema: n, data: i, keyword: s, it: o } = e;
  o.items = !0;
  const a = r.const("len", (0, Xe._)`${i}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Xe._)`${a} <= ${t.length}`);
  else if (typeof n == "object" && !(0, ni.alwaysValidSchema)(o, n)) {
    const c = r.var("valid", (0, Xe._)`${a} <= ${t.length}`);
    r.if((0, Xe.not)(c), () => l(c)), e.ok(c);
  }
  function l(c) {
    r.forRange("i", t.length, a, (f) => {
      e.subschema({ keyword: s, dataProp: f, dataPropType: ni.Type.Num }, c), o.allErrors || r.if((0, Xe.not)(c), () => r.break());
    });
  }
}
Pt.validateAdditionalItems = _l;
Pt.default = ah;
var Ui = {}, Ot = {};
Object.defineProperty(Ot, "__esModule", { value: !0 });
Ot.validateTuple = void 0;
const mo = D, br = I, lh = F, ch = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return vl(e, "additionalItems", t);
    r.items = !0, !(0, br.alwaysValidSchema)(r, t) && e.ok((0, lh.validateArray)(e));
  }
};
function vl(e, t, r = e.schema) {
  const { gen: n, parentSchema: i, data: s, keyword: o, it: a } = e;
  f(i), a.opts.unevaluated && r.length && a.items !== !0 && (a.items = br.mergeEvaluated.items(n, r.length, a.items));
  const l = n.name("valid"), c = n.const("len", (0, mo._)`${s}.length`);
  r.forEach((u, h) => {
    (0, br.alwaysValidSchema)(a, u) || (n.if((0, mo._)`${c} > ${h}`, () => e.subschema({
      keyword: o,
      schemaProp: h,
      dataProp: h
    }, l)), e.ok(l));
  });
  function f(u) {
    const { opts: h, errSchemaPath: y } = a, _ = r.length, b = _ === u.minItems && (_ === u.maxItems || u[t] === !1);
    if (h.strictTuples && !b) {
      const v = `"${o}" is ${_}-tuple, but minItems or maxItems/${t} are not specified or different at path "${y}"`;
      (0, br.checkStrictMode)(a, v, h.strictTuples);
    }
  }
}
Ot.validateTuple = vl;
Ot.default = ch;
Object.defineProperty(Ui, "__esModule", { value: !0 });
const uh = Ot, fh = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, uh.validateTuple)(e, "items")
};
Ui.default = fh;
var zi = {};
Object.defineProperty(zi, "__esModule", { value: !0 });
const yo = D, dh = I, ph = F, hh = Pt, mh = {
  message: ({ params: { len: e } }) => (0, yo.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, yo._)`{limit: ${e}}`
}, yh = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: mh,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: i } = r;
    n.items = !0, !(0, dh.alwaysValidSchema)(n, t) && (i ? (0, hh.validateAdditionalItems)(e, i) : e.ok((0, ph.validateArray)(e)));
  }
};
zi.default = yh;
var Gi = {};
Object.defineProperty(Gi, "__esModule", { value: !0 });
const de = D, cr = I, gh = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, de.str)`must contain at least ${e} valid item(s)` : (0, de.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, de._)`{minContains: ${e}}` : (0, de._)`{minContains: ${e}, maxContains: ${t}}`
}, $h = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: gh,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: i, it: s } = e;
    let o, a;
    const { minContains: l, maxContains: c } = n;
    s.opts.next ? (o = l === void 0 ? 1 : l, a = c) : o = 1;
    const f = t.const("len", (0, de._)`${i}.length`);
    if (e.setParams({ min: o, max: a }), a === void 0 && o === 0) {
      (0, cr.checkStrictMode)(s, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (a !== void 0 && o > a) {
      (0, cr.checkStrictMode)(s, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, cr.alwaysValidSchema)(s, r)) {
      let b = (0, de._)`${f} >= ${o}`;
      a !== void 0 && (b = (0, de._)`${b} && ${f} <= ${a}`), e.pass(b);
      return;
    }
    s.items = !0;
    const u = t.name("valid");
    a === void 0 && o === 1 ? y(u, () => t.if(u, () => t.break())) : o === 0 ? (t.let(u, !0), a !== void 0 && t.if((0, de._)`${i}.length > 0`, h)) : (t.let(u, !1), h()), e.result(u, () => e.reset());
    function h() {
      const b = t.name("_valid"), v = t.let("count", 0);
      y(b, () => t.if(b, () => _(v)));
    }
    function y(b, v) {
      t.forRange("i", 0, f, (p) => {
        e.subschema({
          keyword: "contains",
          dataProp: p,
          dataPropType: cr.Type.Num,
          compositeRule: !0
        }, b), v();
      });
    }
    function _(b) {
      t.code((0, de._)`${b}++`), a === void 0 ? t.if((0, de._)`${b} >= ${o}`, () => t.assign(u, !0).break()) : (t.if((0, de._)`${b} > ${a}`, () => t.assign(u, !1).break()), o === 1 ? t.assign(u, !0) : t.if((0, de._)`${b} >= ${o}`, () => t.assign(u, !0)));
    }
  }
};
Gi.default = $h;
var en = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = D, r = I, n = F;
  e.error = {
    message: ({ params: { property: l, depsCount: c, deps: f } }) => {
      const u = c === 1 ? "property" : "properties";
      return (0, t.str)`must have ${u} ${f} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: c, deps: f, missingProperty: u } }) => (0, t._)`{property: ${l},
    missingProperty: ${u},
    depsCount: ${c},
    deps: ${f}}`
    // TODO change to reference
  };
  const i = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(l) {
      const [c, f] = s(l);
      o(l, c), a(l, f);
    }
  };
  function s({ schema: l }) {
    const c = {}, f = {};
    for (const u in l) {
      if (u === "__proto__")
        continue;
      const h = Array.isArray(l[u]) ? c : f;
      h[u] = l[u];
    }
    return [c, f];
  }
  function o(l, c = l.schema) {
    const { gen: f, data: u, it: h } = l;
    if (Object.keys(c).length === 0)
      return;
    const y = f.let("missing");
    for (const _ in c) {
      const b = c[_];
      if (b.length === 0)
        continue;
      const v = (0, n.propertyInData)(f, u, _, h.opts.ownProperties);
      l.setParams({
        property: _,
        depsCount: b.length,
        deps: b.join(", ")
      }), h.allErrors ? f.if(v, () => {
        for (const p of b)
          (0, n.checkReportMissingProp)(l, p);
      }) : (f.if((0, t._)`${v} && (${(0, n.checkMissingProp)(l, b, y)})`), (0, n.reportMissingProp)(l, y), f.else());
    }
  }
  e.validatePropertyDeps = o;
  function a(l, c = l.schema) {
    const { gen: f, data: u, keyword: h, it: y } = l, _ = f.name("valid");
    for (const b in c)
      (0, r.alwaysValidSchema)(y, c[b]) || (f.if(
        (0, n.propertyInData)(f, u, b, y.opts.ownProperties),
        () => {
          const v = l.subschema({ keyword: h, schemaProp: b }, _);
          l.mergeValidEvaluated(v, _);
        },
        () => f.var(_, !0)
        // TODO var
      ), l.ok(_));
  }
  e.validateSchemaDeps = a, e.default = i;
})(en);
var Bi = {};
Object.defineProperty(Bi, "__esModule", { value: !0 });
const bl = D, _h = I, vh = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, bl._)`{propertyName: ${e.propertyName}}`
}, bh = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: vh,
  code(e) {
    const { gen: t, schema: r, data: n, it: i } = e;
    if ((0, _h.alwaysValidSchema)(i, r))
      return;
    const s = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, s), t.if((0, bl.not)(s), () => {
        e.error(!0), i.allErrors || t.break();
      });
    }), e.ok(s);
  }
};
Bi.default = bh;
var tn = {};
Object.defineProperty(tn, "__esModule", { value: !0 });
const ur = F, ye = D, wh = ue, fr = I, Ph = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, ye._)`{additionalProperty: ${e.additionalProperty}}`
}, Oh = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: Ph,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: i, errsCount: s, it: o } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: a, opts: l } = o;
    if (o.props = !0, l.removeAdditional !== "all" && (0, fr.alwaysValidSchema)(o, r))
      return;
    const c = (0, ur.allSchemaProperties)(n.properties), f = (0, ur.allSchemaProperties)(n.patternProperties);
    u(), e.ok((0, ye._)`${s} === ${wh.default.errors}`);
    function u() {
      t.forIn("key", i, (v) => {
        !c.length && !f.length ? _(v) : t.if(h(v), () => _(v));
      });
    }
    function h(v) {
      let p;
      if (c.length > 8) {
        const m = (0, fr.schemaRefOrVal)(o, n.properties, "properties");
        p = (0, ur.isOwnProperty)(t, m, v);
      } else c.length ? p = (0, ye.or)(...c.map((m) => (0, ye._)`${v} === ${m}`)) : p = ye.nil;
      return f.length && (p = (0, ye.or)(p, ...f.map((m) => (0, ye._)`${(0, ur.usePattern)(e, m)}.test(${v})`))), (0, ye.not)(p);
    }
    function y(v) {
      t.code((0, ye._)`delete ${i}[${v}]`);
    }
    function _(v) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        y(v);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: v }), e.error(), a || t.break();
        return;
      }
      if (typeof r == "object" && !(0, fr.alwaysValidSchema)(o, r)) {
        const p = t.name("valid");
        l.removeAdditional === "failing" ? (b(v, p, !1), t.if((0, ye.not)(p), () => {
          e.reset(), y(v);
        })) : (b(v, p), a || t.if((0, ye.not)(p), () => t.break()));
      }
    }
    function b(v, p, m) {
      const $ = {
        keyword: "additionalProperties",
        dataProp: v,
        dataPropType: fr.Type.Str
      };
      m === !1 && Object.assign($, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema($, p);
    }
  }
};
tn.default = Oh;
var Ki = {};
Object.defineProperty(Ki, "__esModule", { value: !0 });
const Eh = $e, go = F, Dn = I, $o = tn, Sh = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: i, it: s } = e;
    s.opts.removeAdditional === "all" && n.additionalProperties === void 0 && $o.default.code(new Eh.KeywordCxt(s, $o.default, "additionalProperties"));
    const o = (0, go.allSchemaProperties)(r);
    for (const u of o)
      s.definedProperties.add(u);
    s.opts.unevaluated && o.length && s.props !== !0 && (s.props = Dn.mergeEvaluated.props(t, (0, Dn.toHash)(o), s.props));
    const a = o.filter((u) => !(0, Dn.alwaysValidSchema)(s, r[u]));
    if (a.length === 0)
      return;
    const l = t.name("valid");
    for (const u of a)
      c(u) ? f(u) : (t.if((0, go.propertyInData)(t, i, u, s.opts.ownProperties)), f(u), s.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(u), e.ok(l);
    function c(u) {
      return s.opts.useDefaults && !s.compositeRule && r[u].default !== void 0;
    }
    function f(u) {
      e.subschema({
        keyword: "properties",
        schemaProp: u,
        dataProp: u
      }, l);
    }
  }
};
Ki.default = Sh;
var Wi = {};
Object.defineProperty(Wi, "__esModule", { value: !0 });
const _o = F, dr = D, vo = I, bo = I, xh = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: i, it: s } = e, { opts: o } = s, a = (0, _o.allSchemaProperties)(r), l = a.filter((b) => (0, vo.alwaysValidSchema)(s, r[b]));
    if (a.length === 0 || l.length === a.length && (!s.opts.unevaluated || s.props === !0))
      return;
    const c = o.strictSchema && !o.allowMatchingProperties && i.properties, f = t.name("valid");
    s.props !== !0 && !(s.props instanceof dr.Name) && (s.props = (0, bo.evaluatedPropsToName)(t, s.props));
    const { props: u } = s;
    h();
    function h() {
      for (const b of a)
        c && y(b), s.allErrors ? _(b) : (t.var(f, !0), _(b), t.if(f));
    }
    function y(b) {
      for (const v in c)
        new RegExp(b).test(v) && (0, vo.checkStrictMode)(s, `property ${v} matches pattern ${b} (use allowMatchingProperties)`);
    }
    function _(b) {
      t.forIn("key", n, (v) => {
        t.if((0, dr._)`${(0, _o.usePattern)(e, b)}.test(${v})`, () => {
          const p = l.includes(b);
          p || e.subschema({
            keyword: "patternProperties",
            schemaProp: b,
            dataProp: v,
            dataPropType: bo.Type.Str
          }, f), s.opts.unevaluated && u !== !0 ? t.assign((0, dr._)`${u}[${v}]`, !0) : !p && !s.allErrors && t.if((0, dr.not)(f), () => t.break());
        });
      });
    }
  }
};
Wi.default = xh;
var Ji = {};
Object.defineProperty(Ji, "__esModule", { value: !0 });
const jh = I, Ah = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, jh.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const i = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, i), e.failResult(i, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
Ji.default = Ah;
var Yi = {};
Object.defineProperty(Yi, "__esModule", { value: !0 });
const Ch = F, Ih = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Ch.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Yi.default = Ih;
var Xi = {};
Object.defineProperty(Xi, "__esModule", { value: !0 });
const wr = D, Th = I, Rh = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, wr._)`{passingSchemas: ${e.passing}}`
}, kh = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Rh,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: i } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (i.opts.discriminator && n.discriminator)
      return;
    const s = r, o = t.let("valid", !1), a = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: a }), t.block(c), e.result(o, () => e.reset(), () => e.error(!0));
    function c() {
      s.forEach((f, u) => {
        let h;
        (0, Th.alwaysValidSchema)(i, f) ? t.var(l, !0) : h = e.subschema({
          keyword: "oneOf",
          schemaProp: u,
          compositeRule: !0
        }, l), u > 0 && t.if((0, wr._)`${l} && ${o}`).assign(o, !1).assign(a, (0, wr._)`[${a}, ${u}]`).else(), t.if(l, () => {
          t.assign(o, !0), t.assign(a, u), h && e.mergeEvaluated(h, wr.Name);
        });
      });
    }
  }
};
Xi.default = kh;
var Qi = {};
Object.defineProperty(Qi, "__esModule", { value: !0 });
const Nh = I, Mh = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const i = t.name("valid");
    r.forEach((s, o) => {
      if ((0, Nh.alwaysValidSchema)(n, s))
        return;
      const a = e.subschema({ keyword: "allOf", schemaProp: o }, i);
      e.ok(i), e.mergeEvaluated(a);
    });
  }
};
Qi.default = Mh;
var Zi = {};
Object.defineProperty(Zi, "__esModule", { value: !0 });
const xr = D, wl = I, Dh = {
  message: ({ params: e }) => (0, xr.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, xr._)`{failingKeyword: ${e.ifClause}}`
}, qh = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Dh,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, wl.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const i = wo(n, "then"), s = wo(n, "else");
    if (!i && !s)
      return;
    const o = t.let("valid", !0), a = t.name("_valid");
    if (l(), e.reset(), i && s) {
      const f = t.let("ifClause");
      e.setParams({ ifClause: f }), t.if(a, c("then", f), c("else", f));
    } else i ? t.if(a, c("then")) : t.if((0, xr.not)(a), c("else"));
    e.pass(o, () => e.error(!0));
    function l() {
      const f = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, a);
      e.mergeEvaluated(f);
    }
    function c(f, u) {
      return () => {
        const h = e.subschema({ keyword: f }, a);
        t.assign(o, a), e.mergeValidEvaluated(h, o), u ? t.assign(u, (0, xr._)`${f}`) : e.setParams({ ifClause: f });
      };
    }
  }
};
function wo(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, wl.alwaysValidSchema)(e, r);
}
Zi.default = qh;
var es = {};
Object.defineProperty(es, "__esModule", { value: !0 });
const Fh = I, Vh = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Fh.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
es.default = Vh;
Object.defineProperty(Zr, "__esModule", { value: !0 });
const Lh = Pt, Hh = Ui, Uh = Ot, zh = zi, Gh = Gi, Bh = en, Kh = Bi, Wh = tn, Jh = Ki, Yh = Wi, Xh = Ji, Qh = Yi, Zh = Xi, em = Qi, tm = Zi, rm = es;
function nm(e = !1) {
  const t = [
    // any
    Xh.default,
    Qh.default,
    Zh.default,
    em.default,
    tm.default,
    rm.default,
    // object
    Kh.default,
    Wh.default,
    Bh.default,
    Jh.default,
    Yh.default
  ];
  return e ? t.push(Hh.default, zh.default) : t.push(Lh.default, Uh.default), t.push(Gh.default), t;
}
Zr.default = nm;
var rn = {}, ts = {};
Object.defineProperty(ts, "__esModule", { value: !0 });
const W = D, im = {
  message: ({ schemaCode: e }) => (0, W.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, W._)`{format: ${e}}`
}, sm = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: im,
  code(e, t) {
    const { gen: r, data: n, $data: i, schema: s, schemaCode: o, it: a } = e, { opts: l, errSchemaPath: c, schemaEnv: f, self: u } = a;
    if (!l.validateFormats)
      return;
    i ? h() : y();
    function h() {
      const _ = r.scopeValue("formats", {
        ref: u.formats,
        code: l.code.formats
      }), b = r.const("fDef", (0, W._)`${_}[${o}]`), v = r.let("fType"), p = r.let("format");
      r.if((0, W._)`typeof ${b} == "object" && !(${b} instanceof RegExp)`, () => r.assign(v, (0, W._)`${b}.type || "string"`).assign(p, (0, W._)`${b}.validate`), () => r.assign(v, (0, W._)`"string"`).assign(p, b)), e.fail$data((0, W.or)(m(), $()));
      function m() {
        return l.strictSchema === !1 ? W.nil : (0, W._)`${o} && !${p}`;
      }
      function $() {
        const E = f.$async ? (0, W._)`(${b}.async ? await ${p}(${n}) : ${p}(${n}))` : (0, W._)`${p}(${n})`, S = (0, W._)`(typeof ${p} == "function" ? ${E} : ${p}.test(${n}))`;
        return (0, W._)`${p} && ${p} !== true && ${v} === ${t} && !${S}`;
      }
    }
    function y() {
      const _ = u.formats[s];
      if (!_) {
        m();
        return;
      }
      if (_ === !0)
        return;
      const [b, v, p] = $(_);
      b === t && e.pass(E());
      function m() {
        if (l.strictSchema === !1) {
          u.logger.warn(S());
          return;
        }
        throw new Error(S());
        function S() {
          return `unknown format "${s}" ignored in schema at path "${c}"`;
        }
      }
      function $(S) {
        const A = S instanceof RegExp ? (0, W.regexpCode)(S) : l.code.formats ? (0, W._)`${l.code.formats}${(0, W.getProperty)(s)}` : void 0, U = r.scopeValue("formats", { key: s, ref: S, code: A });
        return typeof S == "object" && !(S instanceof RegExp) ? [S.type || "string", S.validate, (0, W._)`${U}.validate`] : ["string", S, U];
      }
      function E() {
        if (typeof _ == "object" && !(_ instanceof RegExp) && _.async) {
          if (!f.$async)
            throw new Error("async format in sync schema");
          return (0, W._)`await ${p}(${n})`;
        }
        return typeof v == "function" ? (0, W._)`${p}(${n})` : (0, W._)`${p}.test(${n})`;
      }
    }
  }
};
ts.default = sm;
Object.defineProperty(rn, "__esModule", { value: !0 });
const om = ts, am = [om.default];
rn.default = am;
Object.defineProperty(Di, "__esModule", { value: !0 });
const lm = qi, cm = Fi, um = Zr, fm = rn, dm = ["title", "description", "default"], pm = [
  lm.default,
  cm.default,
  um.default(),
  fm.default,
  dm
];
Di.default = pm;
var nn = {}, sn = {};
Object.defineProperty(sn, "__esModule", { value: !0 });
sn.DiscrError = void 0;
var Po;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Po || (sn.DiscrError = Po = {}));
Object.defineProperty(nn, "__esModule", { value: !0 });
const ft = D, ii = sn, Oo = se, hm = wt, mm = I, ym = {
  message: ({ params: { discrError: e, tagName: t } }) => e === ii.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, ft._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, gm = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: ym,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: i, it: s } = e, { oneOf: o } = i;
    if (!s.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const a = n.propertyName;
    if (typeof a != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), c = t.const("tag", (0, ft._)`${r}${(0, ft.getProperty)(a)}`);
    t.if((0, ft._)`typeof ${c} == "string"`, () => f(), () => e.error(!1, { discrError: ii.DiscrError.Tag, tag: c, tagName: a })), e.ok(l);
    function f() {
      const y = h();
      t.if(!1);
      for (const _ in y)
        t.elseIf((0, ft._)`${c} === ${_}`), t.assign(l, u(y[_]));
      t.else(), e.error(!1, { discrError: ii.DiscrError.Mapping, tag: c, tagName: a }), t.endIf();
    }
    function u(y) {
      const _ = t.name("valid"), b = e.subschema({ keyword: "oneOf", schemaProp: y }, _);
      return e.mergeEvaluated(b, ft.Name), _;
    }
    function h() {
      var y;
      const _ = {}, b = p(i);
      let v = !0;
      for (let E = 0; E < o.length; E++) {
        let S = o[E];
        if (S != null && S.$ref && !(0, mm.schemaHasRulesButRef)(S, s.self.RULES)) {
          const U = S.$ref;
          if (S = Oo.resolveRef.call(s.self, s.schemaEnv.root, s.baseId, U), S instanceof Oo.SchemaEnv && (S = S.schema), S === void 0)
            throw new hm.default(s.opts.uriResolver, s.baseId, U);
        }
        const A = (y = S == null ? void 0 : S.properties) === null || y === void 0 ? void 0 : y[a];
        if (typeof A != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${a}"`);
        v = v && (b || p(S)), m(A, E);
      }
      if (!v)
        throw new Error(`discriminator: "${a}" must be required`);
      return _;
      function p({ required: E }) {
        return Array.isArray(E) && E.includes(a);
      }
      function m(E, S) {
        if (E.const)
          $(E.const, S);
        else if (E.enum)
          for (const A of E.enum)
            $(A, S);
        else
          throw new Error(`discriminator: "properties/${a}" must have "const" or "enum"`);
      }
      function $(E, S) {
        if (typeof E != "string" || E in _)
          throw new Error(`discriminator: "${a}" values must be unique strings`);
        _[E] = S;
      }
    }
  }
};
nn.default = gm;
const $m = "http://json-schema.org/draft-04/schema#", _m = "http://json-schema.org/draft-04/schema#", vm = "Core schema meta-schema", bm = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  positiveInteger: {
    type: "integer",
    minimum: 0
  },
  positiveIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/positiveInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    minItems: 1,
    uniqueItems: !0
  }
}, wm = "object", Pm = {
  id: {
    type: "string",
    format: "uri"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: {},
  multipleOf: {
    type: "number",
    minimum: 0,
    exclusiveMinimum: !0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "boolean",
    default: !1
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "boolean",
    default: !1
  },
  maxLength: {
    $ref: "#/definitions/positiveInteger"
  },
  minLength: {
    $ref: "#/definitions/positiveIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    anyOf: [
      {
        type: "boolean"
      },
      {
        $ref: "#"
      }
    ],
    default: {}
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: {}
  },
  maxItems: {
    $ref: "#/definitions/positiveInteger"
  },
  minItems: {
    $ref: "#/definitions/positiveIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  maxProperties: {
    $ref: "#/definitions/positiveInteger"
  },
  minProperties: {
    $ref: "#/definitions/positiveIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    anyOf: [
      {
        type: "boolean"
      },
      {
        $ref: "#"
      }
    ],
    default: {}
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  enum: {
    type: "array",
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, Om = {
  exclusiveMaximum: [
    "maximum"
  ],
  exclusiveMinimum: [
    "minimum"
  ]
}, Em = {
  id: $m,
  $schema: _m,
  description: vm,
  definitions: bm,
  type: wm,
  properties: Pm,
  dependencies: Om,
  default: {}
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = void 0;
  const r = mt, n = Di, i = nn, s = Em, o = ["/properties"], a = "http://json-schema.org/draft-04/schema";
  class l extends r.default {
    constructor(h = {}) {
      super({
        ...h,
        schemaId: "id"
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((h) => this.addVocabulary(h)), this.opts.discriminator && this.addKeyword(i.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const h = this.opts.$data ? this.$dataMetaSchema(s, o) : s;
      this.addMetaSchema(h, a, !1), this.refs["http://json-schema.org/schema"] = a;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(a) ? a : void 0);
    }
  }
  e.exports = t = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var c = mt;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return c.KeywordCxt;
  } });
  var f = mt;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return f._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return f.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return f.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return f.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return f.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return f.CodeGen;
  } });
})(Wn, Wn.exports);
var Sm = Wn.exports, si = { exports: {} }, rs = {}, ns = {}, is = {};
Object.defineProperty(is, "__esModule", { value: !0 });
const xm = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
is.default = xm;
Object.defineProperty(ns, "__esModule", { value: !0 });
const jm = is, Am = Ee, Cm = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  jm.default,
  Am.default
];
ns.default = Cm;
var ss = {}, os = {};
Object.defineProperty(os, "__esModule", { value: !0 });
const jr = D, Fe = jr.operators, Ar = {
  maximum: { okStr: "<=", ok: Fe.LTE, fail: Fe.GT },
  minimum: { okStr: ">=", ok: Fe.GTE, fail: Fe.LT },
  exclusiveMaximum: { okStr: "<", ok: Fe.LT, fail: Fe.GTE },
  exclusiveMinimum: { okStr: ">", ok: Fe.GT, fail: Fe.LTE }
}, Im = {
  message: ({ keyword: e, schemaCode: t }) => (0, jr.str)`must be ${Ar[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, jr._)`{comparison: ${Ar[e].okStr}, limit: ${t}}`
}, Tm = {
  keyword: Object.keys(Ar),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Im,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, jr._)`${r} ${Ar[t].fail} ${n} || isNaN(${r})`);
  }
};
os.default = Tm;
Object.defineProperty(ss, "__esModule", { value: !0 });
const Rm = os, km = zr, Nm = Gr, Mm = Br, Dm = Kr, qm = Wr, Fm = Jr, Vm = Yr, Lm = Xr, Hm = Qr, Um = [
  // number
  Rm.default,
  km.default,
  // string
  Nm.default,
  Mm.default,
  // object
  Dm.default,
  qm.default,
  // array
  Fm.default,
  Vm.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Lm.default,
  Hm.default
];
ss.default = Um;
var as = {}, Et = {};
Object.defineProperty(Et, "__esModule", { value: !0 });
Et.dynamicAnchor = void 0;
const qn = D, zm = ue, Eo = se, Gm = Ee, Bm = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => Pl(e, e.schema)
};
function Pl(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const i = (0, qn._)`${zm.default.dynamicAnchors}${(0, qn.getProperty)(t)}`, s = n.errSchemaPath === "#" ? n.validateName : Km(e);
  r.if((0, qn._)`!${i}`, () => r.assign(i, s));
}
Et.dynamicAnchor = Pl;
function Km(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: i, baseId: s, localRefs: o, meta: a } = t.root, { schemaId: l } = n.opts, c = new Eo.SchemaEnv({ schema: r, schemaId: l, root: i, baseId: s, localRefs: o, meta: a });
  return Eo.compileSchema.call(n, c), (0, Gm.getValidate)(e, c);
}
Et.default = Bm;
var St = {};
Object.defineProperty(St, "__esModule", { value: !0 });
St.dynamicRef = void 0;
const So = D, Wm = ue, xo = Ee, Jm = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => Ol(e, e.schema)
};
function Ol(e, t) {
  const { gen: r, keyword: n, it: i } = e;
  if (t[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const s = t.slice(1);
  if (i.allErrors)
    o();
  else {
    const l = r.let("valid", !1);
    o(l), e.ok(l);
  }
  function o(l) {
    if (i.schemaEnv.root.dynamicAnchors[s]) {
      const c = r.let("_v", (0, So._)`${Wm.default.dynamicAnchors}${(0, So.getProperty)(s)}`);
      r.if(c, a(c, l), a(i.validateName, l));
    } else
      a(i.validateName, l)();
  }
  function a(l, c) {
    return c ? () => r.block(() => {
      (0, xo.callRef)(e, l), r.let(c, !0);
    }) : () => (0, xo.callRef)(e, l);
  }
}
St.dynamicRef = Ol;
St.default = Jm;
var ls = {};
Object.defineProperty(ls, "__esModule", { value: !0 });
const Ym = Et, Xm = I, Qm = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, Ym.dynamicAnchor)(e, "") : (0, Xm.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
ls.default = Qm;
var cs = {};
Object.defineProperty(cs, "__esModule", { value: !0 });
const Zm = St, ey = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, Zm.dynamicRef)(e, e.schema)
};
cs.default = ey;
Object.defineProperty(as, "__esModule", { value: !0 });
const ty = Et, ry = St, ny = ls, iy = cs, sy = [ty.default, ry.default, ny.default, iy.default];
as.default = sy;
var us = {}, fs = {};
Object.defineProperty(fs, "__esModule", { value: !0 });
const jo = en, oy = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: jo.error,
  code: (e) => (0, jo.validatePropertyDeps)(e)
};
fs.default = oy;
var ds = {};
Object.defineProperty(ds, "__esModule", { value: !0 });
const ay = en, ly = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, ay.validateSchemaDeps)(e)
};
ds.default = ly;
var ps = {};
Object.defineProperty(ps, "__esModule", { value: !0 });
const cy = I, uy = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, cy.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
ps.default = uy;
Object.defineProperty(us, "__esModule", { value: !0 });
const fy = fs, dy = ds, py = ps, hy = [fy.default, dy.default, py.default];
us.default = hy;
var hs = {}, ms = {};
Object.defineProperty(ms, "__esModule", { value: !0 });
const Ve = D, Ao = I, my = ue, yy = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, Ve._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, gy = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: yy,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: i, it: s } = e;
    if (!i)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: a } = s;
    a instanceof Ve.Name ? t.if((0, Ve._)`${a} !== true`, () => t.forIn("key", n, (u) => t.if(c(a, u), () => l(u)))) : a !== !0 && t.forIn("key", n, (u) => a === void 0 ? l(u) : t.if(f(a, u), () => l(u))), s.props = !0, e.ok((0, Ve._)`${i} === ${my.default.errors}`);
    function l(u) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: u }), e.error(), o || t.break();
        return;
      }
      if (!(0, Ao.alwaysValidSchema)(s, r)) {
        const h = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: u,
          dataPropType: Ao.Type.Str
        }, h), o || t.if((0, Ve.not)(h), () => t.break());
      }
    }
    function c(u, h) {
      return (0, Ve._)`!${u} || !${u}[${h}]`;
    }
    function f(u, h) {
      const y = [];
      for (const _ in u)
        u[_] === !0 && y.push((0, Ve._)`${h} !== ${_}`);
      return (0, Ve.and)(...y);
    }
  }
};
ms.default = gy;
var ys = {};
Object.defineProperty(ys, "__esModule", { value: !0 });
const Qe = D, Co = I, $y = {
  message: ({ params: { len: e } }) => (0, Qe.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Qe._)`{limit: ${e}}`
}, _y = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: $y,
  code(e) {
    const { gen: t, schema: r, data: n, it: i } = e, s = i.items || 0;
    if (s === !0)
      return;
    const o = t.const("len", (0, Qe._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: s }), e.fail((0, Qe._)`${o} > ${s}`);
    else if (typeof r == "object" && !(0, Co.alwaysValidSchema)(i, r)) {
      const l = t.var("valid", (0, Qe._)`${o} <= ${s}`);
      t.if((0, Qe.not)(l), () => a(l, s)), e.ok(l);
    }
    i.items = !0;
    function a(l, c) {
      t.forRange("i", c, o, (f) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: f, dataPropType: Co.Type.Num }, l), i.allErrors || t.if((0, Qe.not)(l), () => t.break());
      });
    }
  }
};
ys.default = _y;
Object.defineProperty(hs, "__esModule", { value: !0 });
const vy = ms, by = ys, wy = [vy.default, by.default];
hs.default = wy;
var _t = {};
Object.defineProperty(_t, "__esModule", { value: !0 });
_t.contentVocabulary = _t.metadataVocabulary = void 0;
_t.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
_t.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(rs, "__esModule", { value: !0 });
const Py = ns, Oy = ss, Ey = Zr, Sy = as, xy = us, jy = hs, Ay = rn, Io = _t, Cy = [
  Sy.default,
  Py.default,
  Oy.default,
  (0, Ey.default)(!0),
  Ay.default,
  Io.metadataVocabulary,
  Io.contentVocabulary,
  xy.default,
  jy.default
];
rs.default = Cy;
var gs = {};
const Iy = "https://json-schema.org/draft/2020-12/schema", Ty = "https://json-schema.org/draft/2020-12/schema", Ry = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, ky = "meta", Ny = "Core and Validation specifications meta-schema", My = [
  {
    $ref: "meta/core"
  },
  {
    $ref: "meta/applicator"
  },
  {
    $ref: "meta/unevaluated"
  },
  {
    $ref: "meta/validation"
  },
  {
    $ref: "meta/meta-data"
  },
  {
    $ref: "meta/format-annotation"
  },
  {
    $ref: "meta/content"
  }
], Dy = [
  "object",
  "boolean"
], qy = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Fy = {
  definitions: {
    $comment: '"definitions" has been replaced by "$defs".',
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    deprecated: !0,
    default: {}
  },
  dependencies: {
    $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $dynamicRef: "#meta"
        },
        {
          $ref: "meta/validation#/$defs/stringArray"
        }
      ]
    },
    deprecated: !0,
    default: {}
  },
  $recursiveAnchor: {
    $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
    $ref: "meta/core#/$defs/anchorString",
    deprecated: !0
  },
  $recursiveRef: {
    $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
    $ref: "meta/core#/$defs/uriReferenceString",
    deprecated: !0
  }
}, Vy = {
  $schema: Iy,
  $id: Ty,
  $vocabulary: Ry,
  $dynamicAnchor: ky,
  title: Ny,
  allOf: My,
  type: Dy,
  $comment: qy,
  properties: Fy
}, Ly = "https://json-schema.org/draft/2020-12/schema", Hy = "https://json-schema.org/draft/2020-12/meta/applicator", Uy = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, zy = "meta", Gy = "Applicator vocabulary meta-schema", By = [
  "object",
  "boolean"
], Ky = {
  prefixItems: {
    $ref: "#/$defs/schemaArray"
  },
  items: {
    $dynamicRef: "#meta"
  },
  contains: {
    $dynamicRef: "#meta"
  },
  additionalProperties: {
    $dynamicRef: "#meta"
  },
  properties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependentSchemas: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  propertyNames: {
    $dynamicRef: "#meta"
  },
  if: {
    $dynamicRef: "#meta"
  },
  then: {
    $dynamicRef: "#meta"
  },
  else: {
    $dynamicRef: "#meta"
  },
  allOf: {
    $ref: "#/$defs/schemaArray"
  },
  anyOf: {
    $ref: "#/$defs/schemaArray"
  },
  oneOf: {
    $ref: "#/$defs/schemaArray"
  },
  not: {
    $dynamicRef: "#meta"
  }
}, Wy = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, Jy = {
  $schema: Ly,
  $id: Hy,
  $vocabulary: Uy,
  $dynamicAnchor: zy,
  title: Gy,
  type: By,
  properties: Ky,
  $defs: Wy
}, Yy = "https://json-schema.org/draft/2020-12/schema", Xy = "https://json-schema.org/draft/2020-12/meta/unevaluated", Qy = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, Zy = "meta", eg = "Unevaluated applicator vocabulary meta-schema", tg = [
  "object",
  "boolean"
], rg = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, ng = {
  $schema: Yy,
  $id: Xy,
  $vocabulary: Qy,
  $dynamicAnchor: Zy,
  title: eg,
  type: tg,
  properties: rg
}, ig = "https://json-schema.org/draft/2020-12/schema", sg = "https://json-schema.org/draft/2020-12/meta/content", og = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, ag = "meta", lg = "Content vocabulary meta-schema", cg = [
  "object",
  "boolean"
], ug = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, fg = {
  $schema: ig,
  $id: sg,
  $vocabulary: og,
  $dynamicAnchor: ag,
  title: lg,
  type: cg,
  properties: ug
}, dg = "https://json-schema.org/draft/2020-12/schema", pg = "https://json-schema.org/draft/2020-12/meta/core", hg = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, mg = "meta", yg = "Core vocabulary meta-schema", gg = [
  "object",
  "boolean"
], $g = {
  $id: {
    $ref: "#/$defs/uriReferenceString",
    $comment: "Non-empty fragments not allowed.",
    pattern: "^[^#]*#?$"
  },
  $schema: {
    $ref: "#/$defs/uriString"
  },
  $ref: {
    $ref: "#/$defs/uriReferenceString"
  },
  $anchor: {
    $ref: "#/$defs/anchorString"
  },
  $dynamicRef: {
    $ref: "#/$defs/uriReferenceString"
  },
  $dynamicAnchor: {
    $ref: "#/$defs/anchorString"
  },
  $vocabulary: {
    type: "object",
    propertyNames: {
      $ref: "#/$defs/uriString"
    },
    additionalProperties: {
      type: "boolean"
    }
  },
  $comment: {
    type: "string"
  },
  $defs: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    }
  }
}, _g = {
  anchorString: {
    type: "string",
    pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
  },
  uriString: {
    type: "string",
    format: "uri"
  },
  uriReferenceString: {
    type: "string",
    format: "uri-reference"
  }
}, vg = {
  $schema: dg,
  $id: pg,
  $vocabulary: hg,
  $dynamicAnchor: mg,
  title: yg,
  type: gg,
  properties: $g,
  $defs: _g
}, bg = "https://json-schema.org/draft/2020-12/schema", wg = "https://json-schema.org/draft/2020-12/meta/format-annotation", Pg = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, Og = "meta", Eg = "Format vocabulary meta-schema for annotation results", Sg = [
  "object",
  "boolean"
], xg = {
  format: {
    type: "string"
  }
}, jg = {
  $schema: bg,
  $id: wg,
  $vocabulary: Pg,
  $dynamicAnchor: Og,
  title: Eg,
  type: Sg,
  properties: xg
}, Ag = "https://json-schema.org/draft/2020-12/schema", Cg = "https://json-schema.org/draft/2020-12/meta/meta-data", Ig = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, Tg = "meta", Rg = "Meta-data vocabulary meta-schema", kg = [
  "object",
  "boolean"
], Ng = {
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  deprecated: {
    type: "boolean",
    default: !1
  },
  readOnly: {
    type: "boolean",
    default: !1
  },
  writeOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  }
}, Mg = {
  $schema: Ag,
  $id: Cg,
  $vocabulary: Ig,
  $dynamicAnchor: Tg,
  title: Rg,
  type: kg,
  properties: Ng
}, Dg = "https://json-schema.org/draft/2020-12/schema", qg = "https://json-schema.org/draft/2020-12/meta/validation", Fg = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, Vg = "meta", Lg = "Validation vocabulary meta-schema", Hg = [
  "object",
  "boolean"
], Ug = {
  type: {
    anyOf: [
      {
        $ref: "#/$defs/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/$defs/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  const: !0,
  enum: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  maxItems: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  maxContains: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minContains: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 1
  },
  maxProperties: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/$defs/stringArray"
  },
  dependentRequired: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/stringArray"
    }
  }
}, zg = {
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 0
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, Gg = {
  $schema: Dg,
  $id: qg,
  $vocabulary: Fg,
  $dynamicAnchor: Vg,
  title: Lg,
  type: Hg,
  properties: Ug,
  $defs: zg
};
Object.defineProperty(gs, "__esModule", { value: !0 });
const Bg = Vy, Kg = Jy, Wg = ng, Jg = fg, Yg = vg, Xg = jg, Qg = Mg, Zg = Gg, e$ = ["/properties"];
function t$(e) {
  return [
    Bg,
    Kg,
    Wg,
    Jg,
    Yg,
    t(this, Xg),
    Qg,
    t(this, Zg)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, e$) : n;
  }
}
gs.default = t$;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = mt, n = rs, i = nn, s = gs, o = "https://json-schema.org/draft/2020-12/schema";
  class a extends r.default {
    constructor(y = {}) {
      super({
        ...y,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((y) => this.addVocabulary(y)), this.opts.discriminator && this.addKeyword(i.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: y, meta: _ } = this.opts;
      _ && (s.default.call(this, y), this.refs["http://json-schema.org/schema"] = o);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv2020 = a, e.exports = t = a, e.exports.Ajv2020 = a, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = a;
  var l = $e;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return l.KeywordCxt;
  } });
  var c = D;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return c._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return c.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return c.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return c.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return c.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return c.CodeGen;
  } });
  var f = Qt;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return f.default;
  } });
  var u = wt;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return u.default;
  } });
})(si, si.exports);
var r$ = si.exports, oi = { exports: {} };
const n$ = "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v1.2/apiDeclaration.json#", i$ = "http://json-schema.org/draft-04/schema#", s$ = "object", o$ = [
  "swaggerVersion",
  "basePath",
  "apis"
], a$ = {
  swaggerVersion: {
    enum: [
      "1.2"
    ]
  },
  apiVersion: {
    type: "string"
  },
  basePath: {
    type: "string",
    format: "uri",
    pattern: "^https?://"
  },
  resourcePath: {
    type: "string",
    format: "uri",
    pattern: "^/"
  },
  apis: {
    type: "array",
    items: {
      $ref: "#/definitions/apiObject"
    }
  },
  models: {
    type: "object",
    additionalProperties: {
      $ref: "modelsObject.json#"
    }
  },
  produces: {
    $ref: "#/definitions/mimeTypeArray"
  },
  consumes: {
    $ref: "#/definitions/mimeTypeArray"
  },
  authorizations: {
    $ref: "authorizationObject.json#"
  }
}, l$ = !1, c$ = {
  apiObject: {
    type: "object",
    required: [
      "path",
      "operations"
    ],
    properties: {
      path: {
        type: "string",
        format: "uri-template",
        pattern: "^/"
      },
      description: {
        type: "string"
      },
      operations: {
        type: "array",
        items: {
          $ref: "operationObject.json#"
        }
      }
    },
    additionalProperties: !1
  },
  mimeTypeArray: {
    type: "array",
    items: {
      type: "string",
      format: "mime-type"
    },
    uniqueItems: !0
  }
}, u$ = {
  id: n$,
  $schema: i$,
  type: s$,
  required: o$,
  properties: a$,
  additionalProperties: l$,
  definitions: c$
}, f$ = "A JSON Schema for Swagger 2.0 API.", d$ = "http://swagger.io/v2/schema.json#", p$ = "http://json-schema.org/draft-04/schema#", h$ = "object", m$ = [
  "swagger",
  "info",
  "paths"
], y$ = !1, g$ = {
  "^x-": {
    $ref: "#/definitions/vendorExtension"
  }
}, $$ = {
  swagger: {
    type: "string",
    enum: [
      "2.0"
    ],
    description: "The Swagger version of this document."
  },
  info: {
    $ref: "#/definitions/info"
  },
  host: {
    type: "string",
    pattern: "^[^{}/ :\\\\]+(?::\\d+)?$",
    description: "The host (name or ip) of the API. Example: 'swagger.io'"
  },
  basePath: {
    type: "string",
    pattern: "^/",
    description: "The base path to the API. Example: '/api'."
  },
  schemes: {
    $ref: "#/definitions/schemesList"
  },
  consumes: {
    description: "A list of MIME types accepted by the API.",
    allOf: [
      {
        $ref: "#/definitions/mediaTypeList"
      }
    ]
  },
  produces: {
    description: "A list of MIME types the API can produce.",
    allOf: [
      {
        $ref: "#/definitions/mediaTypeList"
      }
    ]
  },
  paths: {
    $ref: "#/definitions/paths"
  },
  definitions: {
    $ref: "#/definitions/definitions"
  },
  parameters: {
    $ref: "#/definitions/parameterDefinitions"
  },
  responses: {
    $ref: "#/definitions/responseDefinitions"
  },
  security: {
    $ref: "#/definitions/security"
  },
  securityDefinitions: {
    $ref: "#/definitions/securityDefinitions"
  },
  tags: {
    type: "array",
    items: {
      $ref: "#/definitions/tag"
    },
    uniqueItems: !0
  },
  externalDocs: {
    $ref: "#/definitions/externalDocs"
  }
}, _$ = {
  info: {
    type: "object",
    description: "General information about the API.",
    required: [
      "version",
      "title"
    ],
    additionalProperties: !1,
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    },
    properties: {
      title: {
        type: "string",
        description: "A unique and precise title of the API."
      },
      version: {
        type: "string",
        description: "A semantic version number of the API."
      },
      description: {
        type: "string",
        description: "A longer description of the API. Should be different from the title.  GitHub Flavored Markdown is allowed."
      },
      termsOfService: {
        type: "string",
        description: "The terms of service for the API."
      },
      contact: {
        $ref: "#/definitions/contact"
      },
      license: {
        $ref: "#/definitions/license"
      }
    }
  },
  contact: {
    type: "object",
    description: "Contact information for the owners of the API.",
    additionalProperties: !1,
    properties: {
      name: {
        type: "string",
        description: "The identifying name of the contact person/organization."
      },
      url: {
        type: "string",
        description: "The URL pointing to the contact information.",
        format: "uri"
      },
      email: {
        type: "string",
        description: "The email address of the contact person/organization.",
        format: "email"
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  license: {
    type: "object",
    required: [
      "name"
    ],
    additionalProperties: !1,
    properties: {
      name: {
        type: "string",
        description: "The name of the license type. It's encouraged to use an OSI compatible license."
      },
      url: {
        type: "string",
        description: "The URL pointing to the license.",
        format: "uri"
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  paths: {
    type: "object",
    description: "Relative paths to the individual endpoints. They must be relative to the 'basePath'.",
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      },
      "^/": {
        $ref: "#/definitions/pathItem"
      }
    },
    additionalProperties: !1
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#/definitions/schema"
    },
    description: "One or more JSON objects describing the schemas being consumed and produced by the API."
  },
  parameterDefinitions: {
    type: "object",
    additionalProperties: {
      $ref: "#/definitions/parameter"
    },
    description: "One or more JSON representations for parameters"
  },
  responseDefinitions: {
    type: "object",
    additionalProperties: {
      $ref: "#/definitions/response"
    },
    description: "One or more JSON representations for responses"
  },
  externalDocs: {
    type: "object",
    additionalProperties: !1,
    description: "information about external documentation",
    required: [
      "url"
    ],
    properties: {
      description: {
        type: "string"
      },
      url: {
        type: "string",
        format: "uri"
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  examples: {
    type: "object",
    additionalProperties: !0
  },
  mimeType: {
    type: "string",
    description: "The MIME type of the HTTP message."
  },
  operation: {
    type: "object",
    required: [
      "responses"
    ],
    additionalProperties: !1,
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    },
    properties: {
      tags: {
        type: "array",
        items: {
          type: "string"
        },
        uniqueItems: !0
      },
      summary: {
        type: "string",
        description: "A brief summary of the operation."
      },
      description: {
        type: "string",
        description: "A longer description of the operation, GitHub Flavored Markdown is allowed."
      },
      externalDocs: {
        $ref: "#/definitions/externalDocs"
      },
      operationId: {
        type: "string",
        description: "A unique identifier of the operation."
      },
      produces: {
        description: "A list of MIME types the API can produce.",
        allOf: [
          {
            $ref: "#/definitions/mediaTypeList"
          }
        ]
      },
      consumes: {
        description: "A list of MIME types the API can consume.",
        allOf: [
          {
            $ref: "#/definitions/mediaTypeList"
          }
        ]
      },
      parameters: {
        $ref: "#/definitions/parametersList"
      },
      responses: {
        $ref: "#/definitions/responses"
      },
      schemes: {
        $ref: "#/definitions/schemesList"
      },
      deprecated: {
        type: "boolean",
        default: !1
      },
      security: {
        $ref: "#/definitions/security"
      }
    }
  },
  pathItem: {
    type: "object",
    additionalProperties: !1,
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    },
    properties: {
      $ref: {
        type: "string"
      },
      get: {
        $ref: "#/definitions/operation"
      },
      put: {
        $ref: "#/definitions/operation"
      },
      post: {
        $ref: "#/definitions/operation"
      },
      delete: {
        $ref: "#/definitions/operation"
      },
      options: {
        $ref: "#/definitions/operation"
      },
      head: {
        $ref: "#/definitions/operation"
      },
      patch: {
        $ref: "#/definitions/operation"
      },
      parameters: {
        $ref: "#/definitions/parametersList"
      }
    }
  },
  responses: {
    type: "object",
    description: "Response objects names can either be any valid HTTP status code or 'default'.",
    minProperties: 1,
    additionalProperties: !1,
    patternProperties: {
      "^([0-9]{3})$|^(default)$": {
        $ref: "#/definitions/responseValue"
      },
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    },
    not: {
      type: "object",
      additionalProperties: !1,
      patternProperties: {
        "^x-": {
          $ref: "#/definitions/vendorExtension"
        }
      }
    }
  },
  responseValue: {
    oneOf: [
      {
        $ref: "#/definitions/response"
      },
      {
        $ref: "#/definitions/jsonReference"
      }
    ]
  },
  response: {
    type: "object",
    required: [
      "description"
    ],
    properties: {
      description: {
        type: "string"
      },
      schema: {
        oneOf: [
          {
            $ref: "#/definitions/schema"
          },
          {
            $ref: "#/definitions/fileSchema"
          }
        ]
      },
      headers: {
        $ref: "#/definitions/headers"
      },
      examples: {
        $ref: "#/definitions/examples"
      }
    },
    additionalProperties: !1,
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  headers: {
    type: "object",
    additionalProperties: {
      $ref: "#/definitions/header"
    }
  },
  header: {
    type: "object",
    additionalProperties: !1,
    required: [
      "type"
    ],
    properties: {
      type: {
        type: "string",
        enum: [
          "string",
          "number",
          "integer",
          "boolean",
          "array"
        ]
      },
      format: {
        type: "string"
      },
      items: {
        $ref: "#/definitions/primitivesItems"
      },
      collectionFormat: {
        $ref: "#/definitions/collectionFormat"
      },
      default: {
        $ref: "#/definitions/default"
      },
      maximum: {
        $ref: "#/definitions/maximum"
      },
      exclusiveMaximum: {
        $ref: "#/definitions/exclusiveMaximum"
      },
      minimum: {
        $ref: "#/definitions/minimum"
      },
      exclusiveMinimum: {
        $ref: "#/definitions/exclusiveMinimum"
      },
      maxLength: {
        $ref: "#/definitions/maxLength"
      },
      minLength: {
        $ref: "#/definitions/minLength"
      },
      pattern: {
        $ref: "#/definitions/pattern"
      },
      maxItems: {
        $ref: "#/definitions/maxItems"
      },
      minItems: {
        $ref: "#/definitions/minItems"
      },
      uniqueItems: {
        $ref: "#/definitions/uniqueItems"
      },
      enum: {
        $ref: "#/definitions/enum"
      },
      multipleOf: {
        $ref: "#/definitions/multipleOf"
      },
      description: {
        type: "string"
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  vendorExtension: {
    description: "Any property starting with x- is valid.",
    additionalProperties: !0,
    additionalItems: !0
  },
  bodyParameter: {
    type: "object",
    required: [
      "name",
      "in",
      "schema"
    ],
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    },
    properties: {
      description: {
        type: "string",
        description: "A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed."
      },
      name: {
        type: "string",
        description: "The name of the parameter."
      },
      in: {
        type: "string",
        description: "Determines the location of the parameter.",
        enum: [
          "body"
        ]
      },
      required: {
        type: "boolean",
        description: "Determines whether or not this parameter is required or optional.",
        default: !1
      },
      schema: {
        $ref: "#/definitions/schema"
      }
    },
    additionalProperties: !1
  },
  headerParameterSubSchema: {
    additionalProperties: !1,
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    },
    properties: {
      required: {
        type: "boolean",
        description: "Determines whether or not this parameter is required or optional.",
        default: !1
      },
      in: {
        type: "string",
        description: "Determines the location of the parameter.",
        enum: [
          "header"
        ]
      },
      description: {
        type: "string",
        description: "A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed."
      },
      name: {
        type: "string",
        description: "The name of the parameter."
      },
      type: {
        type: "string",
        enum: [
          "string",
          "number",
          "boolean",
          "integer",
          "array"
        ]
      },
      format: {
        type: "string"
      },
      items: {
        $ref: "#/definitions/primitivesItems"
      },
      collectionFormat: {
        $ref: "#/definitions/collectionFormat"
      },
      default: {
        $ref: "#/definitions/default"
      },
      maximum: {
        $ref: "#/definitions/maximum"
      },
      exclusiveMaximum: {
        $ref: "#/definitions/exclusiveMaximum"
      },
      minimum: {
        $ref: "#/definitions/minimum"
      },
      exclusiveMinimum: {
        $ref: "#/definitions/exclusiveMinimum"
      },
      maxLength: {
        $ref: "#/definitions/maxLength"
      },
      minLength: {
        $ref: "#/definitions/minLength"
      },
      pattern: {
        $ref: "#/definitions/pattern"
      },
      maxItems: {
        $ref: "#/definitions/maxItems"
      },
      minItems: {
        $ref: "#/definitions/minItems"
      },
      uniqueItems: {
        $ref: "#/definitions/uniqueItems"
      },
      enum: {
        $ref: "#/definitions/enum"
      },
      multipleOf: {
        $ref: "#/definitions/multipleOf"
      }
    }
  },
  queryParameterSubSchema: {
    additionalProperties: !1,
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    },
    properties: {
      required: {
        type: "boolean",
        description: "Determines whether or not this parameter is required or optional.",
        default: !1
      },
      in: {
        type: "string",
        description: "Determines the location of the parameter.",
        enum: [
          "query"
        ]
      },
      description: {
        type: "string",
        description: "A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed."
      },
      name: {
        type: "string",
        description: "The name of the parameter."
      },
      allowEmptyValue: {
        type: "boolean",
        default: !1,
        description: "allows sending a parameter by name only or with an empty value."
      },
      type: {
        type: "string",
        enum: [
          "string",
          "number",
          "boolean",
          "integer",
          "array"
        ]
      },
      format: {
        type: "string"
      },
      items: {
        $ref: "#/definitions/primitivesItems"
      },
      collectionFormat: {
        $ref: "#/definitions/collectionFormatWithMulti"
      },
      default: {
        $ref: "#/definitions/default"
      },
      maximum: {
        $ref: "#/definitions/maximum"
      },
      exclusiveMaximum: {
        $ref: "#/definitions/exclusiveMaximum"
      },
      minimum: {
        $ref: "#/definitions/minimum"
      },
      exclusiveMinimum: {
        $ref: "#/definitions/exclusiveMinimum"
      },
      maxLength: {
        $ref: "#/definitions/maxLength"
      },
      minLength: {
        $ref: "#/definitions/minLength"
      },
      pattern: {
        $ref: "#/definitions/pattern"
      },
      maxItems: {
        $ref: "#/definitions/maxItems"
      },
      minItems: {
        $ref: "#/definitions/minItems"
      },
      uniqueItems: {
        $ref: "#/definitions/uniqueItems"
      },
      enum: {
        $ref: "#/definitions/enum"
      },
      multipleOf: {
        $ref: "#/definitions/multipleOf"
      }
    }
  },
  formDataParameterSubSchema: {
    additionalProperties: !1,
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    },
    properties: {
      required: {
        type: "boolean",
        description: "Determines whether or not this parameter is required or optional.",
        default: !1
      },
      in: {
        type: "string",
        description: "Determines the location of the parameter.",
        enum: [
          "formData"
        ]
      },
      description: {
        type: "string",
        description: "A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed."
      },
      name: {
        type: "string",
        description: "The name of the parameter."
      },
      allowEmptyValue: {
        type: "boolean",
        default: !1,
        description: "allows sending a parameter by name only or with an empty value."
      },
      type: {
        type: "string",
        enum: [
          "string",
          "number",
          "boolean",
          "integer",
          "array",
          "file"
        ]
      },
      format: {
        type: "string"
      },
      items: {
        $ref: "#/definitions/primitivesItems"
      },
      collectionFormat: {
        $ref: "#/definitions/collectionFormatWithMulti"
      },
      default: {
        $ref: "#/definitions/default"
      },
      maximum: {
        $ref: "#/definitions/maximum"
      },
      exclusiveMaximum: {
        $ref: "#/definitions/exclusiveMaximum"
      },
      minimum: {
        $ref: "#/definitions/minimum"
      },
      exclusiveMinimum: {
        $ref: "#/definitions/exclusiveMinimum"
      },
      maxLength: {
        $ref: "#/definitions/maxLength"
      },
      minLength: {
        $ref: "#/definitions/minLength"
      },
      pattern: {
        $ref: "#/definitions/pattern"
      },
      maxItems: {
        $ref: "#/definitions/maxItems"
      },
      minItems: {
        $ref: "#/definitions/minItems"
      },
      uniqueItems: {
        $ref: "#/definitions/uniqueItems"
      },
      enum: {
        $ref: "#/definitions/enum"
      },
      multipleOf: {
        $ref: "#/definitions/multipleOf"
      }
    }
  },
  pathParameterSubSchema: {
    additionalProperties: !1,
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    },
    required: [
      "required"
    ],
    properties: {
      required: {
        type: "boolean",
        enum: [
          !0
        ],
        description: "Determines whether or not this parameter is required or optional."
      },
      in: {
        type: "string",
        description: "Determines the location of the parameter.",
        enum: [
          "path"
        ]
      },
      description: {
        type: "string",
        description: "A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed."
      },
      name: {
        type: "string",
        description: "The name of the parameter."
      },
      type: {
        type: "string",
        enum: [
          "string",
          "number",
          "boolean",
          "integer",
          "array"
        ]
      },
      format: {
        type: "string"
      },
      items: {
        $ref: "#/definitions/primitivesItems"
      },
      collectionFormat: {
        $ref: "#/definitions/collectionFormat"
      },
      default: {
        $ref: "#/definitions/default"
      },
      maximum: {
        $ref: "#/definitions/maximum"
      },
      exclusiveMaximum: {
        $ref: "#/definitions/exclusiveMaximum"
      },
      minimum: {
        $ref: "#/definitions/minimum"
      },
      exclusiveMinimum: {
        $ref: "#/definitions/exclusiveMinimum"
      },
      maxLength: {
        $ref: "#/definitions/maxLength"
      },
      minLength: {
        $ref: "#/definitions/minLength"
      },
      pattern: {
        $ref: "#/definitions/pattern"
      },
      maxItems: {
        $ref: "#/definitions/maxItems"
      },
      minItems: {
        $ref: "#/definitions/minItems"
      },
      uniqueItems: {
        $ref: "#/definitions/uniqueItems"
      },
      enum: {
        $ref: "#/definitions/enum"
      },
      multipleOf: {
        $ref: "#/definitions/multipleOf"
      }
    }
  },
  nonBodyParameter: {
    type: "object",
    required: [
      "name",
      "in",
      "type"
    ],
    oneOf: [
      {
        $ref: "#/definitions/headerParameterSubSchema"
      },
      {
        $ref: "#/definitions/formDataParameterSubSchema"
      },
      {
        $ref: "#/definitions/queryParameterSubSchema"
      },
      {
        $ref: "#/definitions/pathParameterSubSchema"
      }
    ]
  },
  parameter: {
    oneOf: [
      {
        $ref: "#/definitions/bodyParameter"
      },
      {
        $ref: "#/definitions/nonBodyParameter"
      }
    ]
  },
  schema: {
    type: "object",
    description: "A deterministic version of a JSON Schema object.",
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    },
    properties: {
      $ref: {
        type: "string"
      },
      format: {
        type: "string"
      },
      title: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/title"
      },
      description: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/description"
      },
      default: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/default"
      },
      multipleOf: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/multipleOf"
      },
      maximum: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/maximum"
      },
      exclusiveMaximum: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/exclusiveMaximum"
      },
      minimum: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/minimum"
      },
      exclusiveMinimum: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/exclusiveMinimum"
      },
      maxLength: {
        $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
      },
      minLength: {
        $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
      },
      pattern: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/pattern"
      },
      maxItems: {
        $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
      },
      minItems: {
        $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
      },
      uniqueItems: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/uniqueItems"
      },
      maxProperties: {
        $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
      },
      minProperties: {
        $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
      },
      required: {
        $ref: "http://json-schema.org/draft-04/schema#/definitions/stringArray"
      },
      enum: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/enum"
      },
      additionalProperties: {
        anyOf: [
          {
            $ref: "#/definitions/schema"
          },
          {
            type: "boolean"
          }
        ],
        default: {}
      },
      type: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/type"
      },
      items: {
        anyOf: [
          {
            $ref: "#/definitions/schema"
          },
          {
            type: "array",
            minItems: 1,
            items: {
              $ref: "#/definitions/schema"
            }
          }
        ],
        default: {}
      },
      allOf: {
        type: "array",
        minItems: 1,
        items: {
          $ref: "#/definitions/schema"
        }
      },
      properties: {
        type: "object",
        additionalProperties: {
          $ref: "#/definitions/schema"
        },
        default: {}
      },
      discriminator: {
        type: "string"
      },
      readOnly: {
        type: "boolean",
        default: !1
      },
      xml: {
        $ref: "#/definitions/xml"
      },
      externalDocs: {
        $ref: "#/definitions/externalDocs"
      },
      example: {}
    },
    additionalProperties: !1
  },
  fileSchema: {
    type: "object",
    description: "A deterministic version of a JSON Schema object.",
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    },
    required: [
      "type"
    ],
    properties: {
      format: {
        type: "string"
      },
      title: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/title"
      },
      description: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/description"
      },
      default: {
        $ref: "http://json-schema.org/draft-04/schema#/properties/default"
      },
      required: {
        $ref: "http://json-schema.org/draft-04/schema#/definitions/stringArray"
      },
      type: {
        type: "string",
        enum: [
          "file"
        ]
      },
      readOnly: {
        type: "boolean",
        default: !1
      },
      externalDocs: {
        $ref: "#/definitions/externalDocs"
      },
      example: {}
    },
    additionalProperties: !1
  },
  primitivesItems: {
    type: "object",
    additionalProperties: !1,
    properties: {
      type: {
        type: "string",
        enum: [
          "string",
          "number",
          "integer",
          "boolean",
          "array"
        ]
      },
      format: {
        type: "string"
      },
      items: {
        $ref: "#/definitions/primitivesItems"
      },
      collectionFormat: {
        $ref: "#/definitions/collectionFormat"
      },
      default: {
        $ref: "#/definitions/default"
      },
      maximum: {
        $ref: "#/definitions/maximum"
      },
      exclusiveMaximum: {
        $ref: "#/definitions/exclusiveMaximum"
      },
      minimum: {
        $ref: "#/definitions/minimum"
      },
      exclusiveMinimum: {
        $ref: "#/definitions/exclusiveMinimum"
      },
      maxLength: {
        $ref: "#/definitions/maxLength"
      },
      minLength: {
        $ref: "#/definitions/minLength"
      },
      pattern: {
        $ref: "#/definitions/pattern"
      },
      maxItems: {
        $ref: "#/definitions/maxItems"
      },
      minItems: {
        $ref: "#/definitions/minItems"
      },
      uniqueItems: {
        $ref: "#/definitions/uniqueItems"
      },
      enum: {
        $ref: "#/definitions/enum"
      },
      multipleOf: {
        $ref: "#/definitions/multipleOf"
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  security: {
    type: "array",
    items: {
      $ref: "#/definitions/securityRequirement"
    },
    uniqueItems: !0
  },
  securityRequirement: {
    type: "object",
    additionalProperties: {
      type: "array",
      items: {
        type: "string"
      },
      uniqueItems: !0
    }
  },
  xml: {
    type: "object",
    additionalProperties: !1,
    properties: {
      name: {
        type: "string"
      },
      namespace: {
        type: "string"
      },
      prefix: {
        type: "string"
      },
      attribute: {
        type: "boolean",
        default: !1
      },
      wrapped: {
        type: "boolean",
        default: !1
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  tag: {
    type: "object",
    additionalProperties: !1,
    required: [
      "name"
    ],
    properties: {
      name: {
        type: "string"
      },
      description: {
        type: "string"
      },
      externalDocs: {
        $ref: "#/definitions/externalDocs"
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  securityDefinitions: {
    type: "object",
    additionalProperties: {
      oneOf: [
        {
          $ref: "#/definitions/basicAuthenticationSecurity"
        },
        {
          $ref: "#/definitions/apiKeySecurity"
        },
        {
          $ref: "#/definitions/oauth2ImplicitSecurity"
        },
        {
          $ref: "#/definitions/oauth2PasswordSecurity"
        },
        {
          $ref: "#/definitions/oauth2ApplicationSecurity"
        },
        {
          $ref: "#/definitions/oauth2AccessCodeSecurity"
        }
      ]
    }
  },
  basicAuthenticationSecurity: {
    type: "object",
    additionalProperties: !1,
    required: [
      "type"
    ],
    properties: {
      type: {
        type: "string",
        enum: [
          "basic"
        ]
      },
      description: {
        type: "string"
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  apiKeySecurity: {
    type: "object",
    additionalProperties: !1,
    required: [
      "type",
      "name",
      "in"
    ],
    properties: {
      type: {
        type: "string",
        enum: [
          "apiKey"
        ]
      },
      name: {
        type: "string"
      },
      in: {
        type: "string",
        enum: [
          "header",
          "query"
        ]
      },
      description: {
        type: "string"
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  oauth2ImplicitSecurity: {
    type: "object",
    additionalProperties: !1,
    required: [
      "type",
      "flow",
      "authorizationUrl"
    ],
    properties: {
      type: {
        type: "string",
        enum: [
          "oauth2"
        ]
      },
      flow: {
        type: "string",
        enum: [
          "implicit"
        ]
      },
      scopes: {
        $ref: "#/definitions/oauth2Scopes"
      },
      authorizationUrl: {
        type: "string",
        format: "uri"
      },
      description: {
        type: "string"
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  oauth2PasswordSecurity: {
    type: "object",
    additionalProperties: !1,
    required: [
      "type",
      "flow",
      "tokenUrl"
    ],
    properties: {
      type: {
        type: "string",
        enum: [
          "oauth2"
        ]
      },
      flow: {
        type: "string",
        enum: [
          "password"
        ]
      },
      scopes: {
        $ref: "#/definitions/oauth2Scopes"
      },
      tokenUrl: {
        type: "string",
        format: "uri"
      },
      description: {
        type: "string"
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  oauth2ApplicationSecurity: {
    type: "object",
    additionalProperties: !1,
    required: [
      "type",
      "flow",
      "tokenUrl"
    ],
    properties: {
      type: {
        type: "string",
        enum: [
          "oauth2"
        ]
      },
      flow: {
        type: "string",
        enum: [
          "application"
        ]
      },
      scopes: {
        $ref: "#/definitions/oauth2Scopes"
      },
      tokenUrl: {
        type: "string",
        format: "uri"
      },
      description: {
        type: "string"
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  oauth2AccessCodeSecurity: {
    type: "object",
    additionalProperties: !1,
    required: [
      "type",
      "flow",
      "authorizationUrl",
      "tokenUrl"
    ],
    properties: {
      type: {
        type: "string",
        enum: [
          "oauth2"
        ]
      },
      flow: {
        type: "string",
        enum: [
          "accessCode"
        ]
      },
      scopes: {
        $ref: "#/definitions/oauth2Scopes"
      },
      authorizationUrl: {
        type: "string",
        format: "uri"
      },
      tokenUrl: {
        type: "string",
        format: "uri"
      },
      description: {
        type: "string"
      }
    },
    patternProperties: {
      "^x-": {
        $ref: "#/definitions/vendorExtension"
      }
    }
  },
  oauth2Scopes: {
    type: "object",
    additionalProperties: {
      type: "string"
    }
  },
  mediaTypeList: {
    type: "array",
    items: {
      $ref: "#/definitions/mimeType"
    },
    uniqueItems: !0
  },
  parametersList: {
    type: "array",
    description: "The parameters needed to send a valid API call.",
    additionalItems: !1,
    items: {
      oneOf: [
        {
          $ref: "#/definitions/parameter"
        },
        {
          $ref: "#/definitions/jsonReference"
        }
      ]
    },
    uniqueItems: !0
  },
  schemesList: {
    type: "array",
    description: "The transfer protocol of the API.",
    items: {
      type: "string",
      enum: [
        "http",
        "https",
        "ws",
        "wss"
      ]
    },
    uniqueItems: !0
  },
  collectionFormat: {
    type: "string",
    enum: [
      "csv",
      "ssv",
      "tsv",
      "pipes"
    ],
    default: "csv"
  },
  collectionFormatWithMulti: {
    type: "string",
    enum: [
      "csv",
      "ssv",
      "tsv",
      "pipes",
      "multi"
    ],
    default: "csv"
  },
  title: {
    $ref: "http://json-schema.org/draft-04/schema#/properties/title"
  },
  description: {
    $ref: "http://json-schema.org/draft-04/schema#/properties/description"
  },
  default: {
    $ref: "http://json-schema.org/draft-04/schema#/properties/default"
  },
  multipleOf: {
    $ref: "http://json-schema.org/draft-04/schema#/properties/multipleOf"
  },
  maximum: {
    $ref: "http://json-schema.org/draft-04/schema#/properties/maximum"
  },
  exclusiveMaximum: {
    $ref: "http://json-schema.org/draft-04/schema#/properties/exclusiveMaximum"
  },
  minimum: {
    $ref: "http://json-schema.org/draft-04/schema#/properties/minimum"
  },
  exclusiveMinimum: {
    $ref: "http://json-schema.org/draft-04/schema#/properties/exclusiveMinimum"
  },
  maxLength: {
    $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
  },
  minLength: {
    $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
  },
  pattern: {
    $ref: "http://json-schema.org/draft-04/schema#/properties/pattern"
  },
  maxItems: {
    $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
  },
  minItems: {
    $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
  },
  uniqueItems: {
    $ref: "http://json-schema.org/draft-04/schema#/properties/uniqueItems"
  },
  enum: {
    $ref: "http://json-schema.org/draft-04/schema#/properties/enum"
  },
  jsonReference: {
    type: "object",
    required: [
      "$ref"
    ],
    additionalProperties: !1,
    properties: {
      $ref: {
        type: "string"
      }
    }
  }
}, v$ = {
  title: f$,
  id: d$,
  $schema: p$,
  type: h$,
  required: m$,
  additionalProperties: y$,
  patternProperties: g$,
  properties: $$,
  definitions: _$
}, b$ = "https://spec.openapis.org/oas/3.0/schema/2019-04-02", w$ = "http://json-schema.org/draft-04/schema#", P$ = "Validation schema for OpenAPI Specification 3.0.X.", O$ = "object", E$ = [
  "openapi",
  "info",
  "paths"
], S$ = {
  openapi: {
    type: "string",
    pattern: "^3\\.0\\.\\d(-.+)?$"
  },
  info: {
    $ref: "#/definitions/Info"
  },
  externalDocs: {
    $ref: "#/definitions/ExternalDocumentation"
  },
  servers: {
    type: "array",
    items: {
      $ref: "#/definitions/Server"
    }
  },
  security: {
    type: "array",
    items: {
      $ref: "#/definitions/SecurityRequirement"
    }
  },
  tags: {
    type: "array",
    items: {
      $ref: "#/definitions/Tag"
    },
    uniqueItems: !0
  },
  paths: {
    $ref: "#/definitions/Paths"
  },
  components: {
    $ref: "#/definitions/Components"
  }
}, x$ = {
  "^x-": {}
}, j$ = !1, A$ = {
  Reference: {
    type: "object",
    required: [
      "$ref"
    ],
    patternProperties: {
      "^\\$ref$": {
        type: "string",
        format: "uri-reference"
      }
    }
  },
  Info: {
    type: "object",
    required: [
      "title",
      "version"
    ],
    properties: {
      title: {
        type: "string"
      },
      description: {
        type: "string"
      },
      termsOfService: {
        type: "string",
        format: "uri-reference"
      },
      contact: {
        $ref: "#/definitions/Contact"
      },
      license: {
        $ref: "#/definitions/License"
      },
      version: {
        type: "string"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  Contact: {
    type: "object",
    properties: {
      name: {
        type: "string"
      },
      url: {
        type: "string",
        format: "uri-reference"
      },
      email: {
        type: "string",
        format: "email"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  License: {
    type: "object",
    required: [
      "name"
    ],
    properties: {
      name: {
        type: "string"
      },
      url: {
        type: "string",
        format: "uri-reference"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  Server: {
    type: "object",
    required: [
      "url"
    ],
    properties: {
      url: {
        type: "string"
      },
      description: {
        type: "string"
      },
      variables: {
        type: "object",
        additionalProperties: {
          $ref: "#/definitions/ServerVariable"
        }
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  ServerVariable: {
    type: "object",
    required: [
      "default"
    ],
    properties: {
      enum: {
        type: "array",
        items: {
          type: "string"
        }
      },
      default: {
        type: "string"
      },
      description: {
        type: "string"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  Components: {
    type: "object",
    properties: {
      schemas: {
        type: "object",
        patternProperties: {
          "^[a-zA-Z0-9\\.\\-_]+$": {
            oneOf: [
              {
                $ref: "#/definitions/Schema"
              },
              {
                $ref: "#/definitions/Reference"
              }
            ]
          }
        }
      },
      responses: {
        type: "object",
        patternProperties: {
          "^[a-zA-Z0-9\\.\\-_]+$": {
            oneOf: [
              {
                $ref: "#/definitions/Reference"
              },
              {
                $ref: "#/definitions/Response"
              }
            ]
          }
        }
      },
      parameters: {
        type: "object",
        patternProperties: {
          "^[a-zA-Z0-9\\.\\-_]+$": {
            oneOf: [
              {
                $ref: "#/definitions/Reference"
              },
              {
                $ref: "#/definitions/Parameter"
              }
            ]
          }
        }
      },
      examples: {
        type: "object",
        patternProperties: {
          "^[a-zA-Z0-9\\.\\-_]+$": {
            oneOf: [
              {
                $ref: "#/definitions/Reference"
              },
              {
                $ref: "#/definitions/Example"
              }
            ]
          }
        }
      },
      requestBodies: {
        type: "object",
        patternProperties: {
          "^[a-zA-Z0-9\\.\\-_]+$": {
            oneOf: [
              {
                $ref: "#/definitions/Reference"
              },
              {
                $ref: "#/definitions/RequestBody"
              }
            ]
          }
        }
      },
      headers: {
        type: "object",
        patternProperties: {
          "^[a-zA-Z0-9\\.\\-_]+$": {
            oneOf: [
              {
                $ref: "#/definitions/Reference"
              },
              {
                $ref: "#/definitions/Header"
              }
            ]
          }
        }
      },
      securitySchemes: {
        type: "object",
        patternProperties: {
          "^[a-zA-Z0-9\\.\\-_]+$": {
            oneOf: [
              {
                $ref: "#/definitions/Reference"
              },
              {
                $ref: "#/definitions/SecurityScheme"
              }
            ]
          }
        }
      },
      links: {
        type: "object",
        patternProperties: {
          "^[a-zA-Z0-9\\.\\-_]+$": {
            oneOf: [
              {
                $ref: "#/definitions/Reference"
              },
              {
                $ref: "#/definitions/Link"
              }
            ]
          }
        }
      },
      callbacks: {
        type: "object",
        patternProperties: {
          "^[a-zA-Z0-9\\.\\-_]+$": {
            oneOf: [
              {
                $ref: "#/definitions/Reference"
              },
              {
                $ref: "#/definitions/Callback"
              }
            ]
          }
        }
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  Schema: {
    type: "object",
    properties: {
      title: {
        type: "string"
      },
      multipleOf: {
        type: "number",
        minimum: 0,
        exclusiveMinimum: !0
      },
      maximum: {
        type: "number"
      },
      exclusiveMaximum: {
        type: "boolean",
        default: !1
      },
      minimum: {
        type: "number"
      },
      exclusiveMinimum: {
        type: "boolean",
        default: !1
      },
      maxLength: {
        type: "integer",
        minimum: 0
      },
      minLength: {
        type: "integer",
        minimum: 0,
        default: 0
      },
      pattern: {
        type: "string",
        format: "regex"
      },
      maxItems: {
        type: "integer",
        minimum: 0
      },
      minItems: {
        type: "integer",
        minimum: 0,
        default: 0
      },
      uniqueItems: {
        type: "boolean",
        default: !1
      },
      maxProperties: {
        type: "integer",
        minimum: 0
      },
      minProperties: {
        type: "integer",
        minimum: 0,
        default: 0
      },
      required: {
        type: "array",
        items: {
          type: "string"
        },
        minItems: 1,
        uniqueItems: !0
      },
      enum: {
        type: "array",
        items: {},
        minItems: 1,
        uniqueItems: !1
      },
      type: {
        type: "string",
        enum: [
          "array",
          "boolean",
          "integer",
          "number",
          "object",
          "string"
        ]
      },
      not: {
        oneOf: [
          {
            $ref: "#/definitions/Schema"
          },
          {
            $ref: "#/definitions/Reference"
          }
        ]
      },
      allOf: {
        type: "array",
        items: {
          oneOf: [
            {
              $ref: "#/definitions/Schema"
            },
            {
              $ref: "#/definitions/Reference"
            }
          ]
        }
      },
      oneOf: {
        type: "array",
        items: {
          oneOf: [
            {
              $ref: "#/definitions/Schema"
            },
            {
              $ref: "#/definitions/Reference"
            }
          ]
        }
      },
      anyOf: {
        type: "array",
        items: {
          oneOf: [
            {
              $ref: "#/definitions/Schema"
            },
            {
              $ref: "#/definitions/Reference"
            }
          ]
        }
      },
      items: {
        oneOf: [
          {
            $ref: "#/definitions/Schema"
          },
          {
            $ref: "#/definitions/Reference"
          }
        ]
      },
      properties: {
        type: "object",
        additionalProperties: {
          oneOf: [
            {
              $ref: "#/definitions/Schema"
            },
            {
              $ref: "#/definitions/Reference"
            }
          ]
        }
      },
      additionalProperties: {
        oneOf: [
          {
            $ref: "#/definitions/Schema"
          },
          {
            $ref: "#/definitions/Reference"
          },
          {
            type: "boolean"
          }
        ],
        default: !0
      },
      description: {
        type: "string"
      },
      format: {
        type: "string"
      },
      default: {},
      nullable: {
        type: "boolean",
        default: !1
      },
      discriminator: {
        $ref: "#/definitions/Discriminator"
      },
      readOnly: {
        type: "boolean",
        default: !1
      },
      writeOnly: {
        type: "boolean",
        default: !1
      },
      example: {},
      externalDocs: {
        $ref: "#/definitions/ExternalDocumentation"
      },
      deprecated: {
        type: "boolean",
        default: !1
      },
      xml: {
        $ref: "#/definitions/XML"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  Discriminator: {
    type: "object",
    required: [
      "propertyName"
    ],
    properties: {
      propertyName: {
        type: "string"
      },
      mapping: {
        type: "object",
        additionalProperties: {
          type: "string"
        }
      }
    }
  },
  XML: {
    type: "object",
    properties: {
      name: {
        type: "string"
      },
      namespace: {
        type: "string",
        format: "uri"
      },
      prefix: {
        type: "string"
      },
      attribute: {
        type: "boolean",
        default: !1
      },
      wrapped: {
        type: "boolean",
        default: !1
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  Response: {
    type: "object",
    required: [
      "description"
    ],
    properties: {
      description: {
        type: "string"
      },
      headers: {
        type: "object",
        additionalProperties: {
          oneOf: [
            {
              $ref: "#/definitions/Header"
            },
            {
              $ref: "#/definitions/Reference"
            }
          ]
        }
      },
      content: {
        type: "object",
        additionalProperties: {
          $ref: "#/definitions/MediaType"
        }
      },
      links: {
        type: "object",
        additionalProperties: {
          oneOf: [
            {
              $ref: "#/definitions/Link"
            },
            {
              $ref: "#/definitions/Reference"
            }
          ]
        }
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  MediaType: {
    type: "object",
    properties: {
      schema: {
        oneOf: [
          {
            $ref: "#/definitions/Schema"
          },
          {
            $ref: "#/definitions/Reference"
          }
        ]
      },
      example: {},
      examples: {
        type: "object",
        additionalProperties: {
          oneOf: [
            {
              $ref: "#/definitions/Example"
            },
            {
              $ref: "#/definitions/Reference"
            }
          ]
        }
      },
      encoding: {
        type: "object",
        additionalProperties: {
          $ref: "#/definitions/Encoding"
        }
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1,
    allOf: [
      {
        $ref: "#/definitions/ExampleXORExamples"
      }
    ]
  },
  Example: {
    type: "object",
    properties: {
      summary: {
        type: "string"
      },
      description: {
        type: "string"
      },
      value: {},
      externalValue: {
        type: "string",
        format: "uri-reference"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  Header: {
    type: "object",
    properties: {
      description: {
        type: "string"
      },
      required: {
        type: "boolean",
        default: !1
      },
      deprecated: {
        type: "boolean",
        default: !1
      },
      allowEmptyValue: {
        type: "boolean",
        default: !1
      },
      style: {
        type: "string",
        enum: [
          "simple"
        ],
        default: "simple"
      },
      explode: {
        type: "boolean"
      },
      allowReserved: {
        type: "boolean",
        default: !1
      },
      schema: {
        oneOf: [
          {
            $ref: "#/definitions/Schema"
          },
          {
            $ref: "#/definitions/Reference"
          }
        ]
      },
      content: {
        type: "object",
        additionalProperties: {
          $ref: "#/definitions/MediaType"
        },
        minProperties: 1,
        maxProperties: 1
      },
      example: {},
      examples: {
        type: "object",
        additionalProperties: {
          oneOf: [
            {
              $ref: "#/definitions/Example"
            },
            {
              $ref: "#/definitions/Reference"
            }
          ]
        }
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1,
    allOf: [
      {
        $ref: "#/definitions/ExampleXORExamples"
      },
      {
        $ref: "#/definitions/SchemaXORContent"
      }
    ]
  },
  Paths: {
    type: "object",
    patternProperties: {
      "^\\/": {
        $ref: "#/definitions/PathItem"
      },
      "^x-": {}
    },
    additionalProperties: !1
  },
  PathItem: {
    type: "object",
    properties: {
      $ref: {
        type: "string"
      },
      summary: {
        type: "string"
      },
      description: {
        type: "string"
      },
      servers: {
        type: "array",
        items: {
          $ref: "#/definitions/Server"
        }
      },
      parameters: {
        type: "array",
        items: {
          oneOf: [
            {
              $ref: "#/definitions/Parameter"
            },
            {
              $ref: "#/definitions/Reference"
            }
          ]
        },
        uniqueItems: !0
      }
    },
    patternProperties: {
      "^(get|put|post|delete|options|head|patch|trace)$": {
        $ref: "#/definitions/Operation"
      },
      "^x-": {}
    },
    additionalProperties: !1
  },
  Operation: {
    type: "object",
    required: [
      "responses"
    ],
    properties: {
      tags: {
        type: "array",
        items: {
          type: "string"
        }
      },
      summary: {
        type: "string"
      },
      description: {
        type: "string"
      },
      externalDocs: {
        $ref: "#/definitions/ExternalDocumentation"
      },
      operationId: {
        type: "string"
      },
      parameters: {
        type: "array",
        items: {
          oneOf: [
            {
              $ref: "#/definitions/Parameter"
            },
            {
              $ref: "#/definitions/Reference"
            }
          ]
        },
        uniqueItems: !0
      },
      requestBody: {
        oneOf: [
          {
            $ref: "#/definitions/RequestBody"
          },
          {
            $ref: "#/definitions/Reference"
          }
        ]
      },
      responses: {
        $ref: "#/definitions/Responses"
      },
      callbacks: {
        type: "object",
        additionalProperties: {
          oneOf: [
            {
              $ref: "#/definitions/Callback"
            },
            {
              $ref: "#/definitions/Reference"
            }
          ]
        }
      },
      deprecated: {
        type: "boolean",
        default: !1
      },
      security: {
        type: "array",
        items: {
          $ref: "#/definitions/SecurityRequirement"
        }
      },
      servers: {
        type: "array",
        items: {
          $ref: "#/definitions/Server"
        }
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  Responses: {
    type: "object",
    properties: {
      default: {
        oneOf: [
          {
            $ref: "#/definitions/Response"
          },
          {
            $ref: "#/definitions/Reference"
          }
        ]
      }
    },
    patternProperties: {
      "^[1-5](?:\\d{2}|XX)$": {
        oneOf: [
          {
            $ref: "#/definitions/Response"
          },
          {
            $ref: "#/definitions/Reference"
          }
        ]
      },
      "^x-": {}
    },
    minProperties: 1,
    additionalProperties: !1
  },
  SecurityRequirement: {
    type: "object",
    additionalProperties: {
      type: "array",
      items: {
        type: "string"
      }
    }
  },
  Tag: {
    type: "object",
    required: [
      "name"
    ],
    properties: {
      name: {
        type: "string"
      },
      description: {
        type: "string"
      },
      externalDocs: {
        $ref: "#/definitions/ExternalDocumentation"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  ExternalDocumentation: {
    type: "object",
    required: [
      "url"
    ],
    properties: {
      description: {
        type: "string"
      },
      url: {
        type: "string",
        format: "uri-reference"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  ExampleXORExamples: {
    description: "Example and examples are mutually exclusive",
    not: {
      required: [
        "example",
        "examples"
      ]
    }
  },
  SchemaXORContent: {
    description: "Schema and content are mutually exclusive, at least one is required",
    not: {
      required: [
        "schema",
        "content"
      ]
    },
    oneOf: [
      {
        required: [
          "schema"
        ]
      },
      {
        required: [
          "content"
        ],
        description: "Some properties are not allowed if content is present",
        allOf: [
          {
            not: {
              required: [
                "style"
              ]
            }
          },
          {
            not: {
              required: [
                "explode"
              ]
            }
          },
          {
            not: {
              required: [
                "allowReserved"
              ]
            }
          },
          {
            not: {
              required: [
                "example"
              ]
            }
          },
          {
            not: {
              required: [
                "examples"
              ]
            }
          }
        ]
      }
    ]
  },
  Parameter: {
    type: "object",
    properties: {
      name: {
        type: "string"
      },
      in: {
        type: "string"
      },
      description: {
        type: "string"
      },
      required: {
        type: "boolean",
        default: !1
      },
      deprecated: {
        type: "boolean",
        default: !1
      },
      allowEmptyValue: {
        type: "boolean",
        default: !1
      },
      style: {
        type: "string"
      },
      explode: {
        type: "boolean"
      },
      allowReserved: {
        type: "boolean",
        default: !1
      },
      schema: {
        oneOf: [
          {
            $ref: "#/definitions/Schema"
          },
          {
            $ref: "#/definitions/Reference"
          }
        ]
      },
      content: {
        type: "object",
        additionalProperties: {
          $ref: "#/definitions/MediaType"
        },
        minProperties: 1,
        maxProperties: 1
      },
      example: {},
      examples: {
        type: "object",
        additionalProperties: {
          oneOf: [
            {
              $ref: "#/definitions/Example"
            },
            {
              $ref: "#/definitions/Reference"
            }
          ]
        }
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1,
    required: [
      "name",
      "in"
    ],
    allOf: [
      {
        $ref: "#/definitions/ExampleXORExamples"
      },
      {
        $ref: "#/definitions/SchemaXORContent"
      },
      {
        $ref: "#/definitions/ParameterLocation"
      }
    ]
  },
  ParameterLocation: {
    description: "Parameter location",
    oneOf: [
      {
        description: "Parameter in path",
        required: [
          "required"
        ],
        properties: {
          in: {
            enum: [
              "path"
            ]
          },
          style: {
            enum: [
              "matrix",
              "label",
              "simple"
            ],
            default: "simple"
          },
          required: {
            enum: [
              !0
            ]
          }
        }
      },
      {
        description: "Parameter in query",
        properties: {
          in: {
            enum: [
              "query"
            ]
          },
          style: {
            enum: [
              "form",
              "spaceDelimited",
              "pipeDelimited",
              "deepObject"
            ],
            default: "form"
          }
        }
      },
      {
        description: "Parameter in header",
        properties: {
          in: {
            enum: [
              "header"
            ]
          },
          style: {
            enum: [
              "simple"
            ],
            default: "simple"
          }
        }
      },
      {
        description: "Parameter in cookie",
        properties: {
          in: {
            enum: [
              "cookie"
            ]
          },
          style: {
            enum: [
              "form"
            ],
            default: "form"
          }
        }
      }
    ]
  },
  RequestBody: {
    type: "object",
    required: [
      "content"
    ],
    properties: {
      description: {
        type: "string"
      },
      content: {
        type: "object",
        additionalProperties: {
          $ref: "#/definitions/MediaType"
        }
      },
      required: {
        type: "boolean",
        default: !1
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  SecurityScheme: {
    oneOf: [
      {
        $ref: "#/definitions/APIKeySecurityScheme"
      },
      {
        $ref: "#/definitions/HTTPSecurityScheme"
      },
      {
        $ref: "#/definitions/OAuth2SecurityScheme"
      },
      {
        $ref: "#/definitions/OpenIdConnectSecurityScheme"
      }
    ]
  },
  APIKeySecurityScheme: {
    type: "object",
    required: [
      "type",
      "name",
      "in"
    ],
    properties: {
      type: {
        type: "string",
        enum: [
          "apiKey"
        ]
      },
      name: {
        type: "string"
      },
      in: {
        type: "string",
        enum: [
          "header",
          "query",
          "cookie"
        ]
      },
      description: {
        type: "string"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  HTTPSecurityScheme: {
    type: "object",
    required: [
      "scheme",
      "type"
    ],
    properties: {
      scheme: {
        type: "string"
      },
      bearerFormat: {
        type: "string"
      },
      description: {
        type: "string"
      },
      type: {
        type: "string",
        enum: [
          "http"
        ]
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1,
    oneOf: [
      {
        description: "Bearer",
        properties: {
          scheme: {
            enum: [
              "bearer"
            ]
          }
        }
      },
      {
        description: "Non Bearer",
        not: {
          required: [
            "bearerFormat"
          ]
        },
        properties: {
          scheme: {
            not: {
              enum: [
                "bearer"
              ]
            }
          }
        }
      }
    ]
  },
  OAuth2SecurityScheme: {
    type: "object",
    required: [
      "type",
      "flows"
    ],
    properties: {
      type: {
        type: "string",
        enum: [
          "oauth2"
        ]
      },
      flows: {
        $ref: "#/definitions/OAuthFlows"
      },
      description: {
        type: "string"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  OpenIdConnectSecurityScheme: {
    type: "object",
    required: [
      "type",
      "openIdConnectUrl"
    ],
    properties: {
      type: {
        type: "string",
        enum: [
          "openIdConnect"
        ]
      },
      openIdConnectUrl: {
        type: "string",
        format: "uri-reference"
      },
      description: {
        type: "string"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  OAuthFlows: {
    type: "object",
    properties: {
      implicit: {
        $ref: "#/definitions/ImplicitOAuthFlow"
      },
      password: {
        $ref: "#/definitions/PasswordOAuthFlow"
      },
      clientCredentials: {
        $ref: "#/definitions/ClientCredentialsFlow"
      },
      authorizationCode: {
        $ref: "#/definitions/AuthorizationCodeOAuthFlow"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  ImplicitOAuthFlow: {
    type: "object",
    required: [
      "authorizationUrl",
      "scopes"
    ],
    properties: {
      authorizationUrl: {
        type: "string",
        format: "uri-reference"
      },
      refreshUrl: {
        type: "string",
        format: "uri-reference"
      },
      scopes: {
        type: "object",
        additionalProperties: {
          type: "string"
        }
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  PasswordOAuthFlow: {
    type: "object",
    required: [
      "tokenUrl"
    ],
    properties: {
      tokenUrl: {
        type: "string",
        format: "uri-reference"
      },
      refreshUrl: {
        type: "string",
        format: "uri-reference"
      },
      scopes: {
        type: "object",
        additionalProperties: {
          type: "string"
        }
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  ClientCredentialsFlow: {
    type: "object",
    required: [
      "tokenUrl"
    ],
    properties: {
      tokenUrl: {
        type: "string",
        format: "uri-reference"
      },
      refreshUrl: {
        type: "string",
        format: "uri-reference"
      },
      scopes: {
        type: "object",
        additionalProperties: {
          type: "string"
        }
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  AuthorizationCodeOAuthFlow: {
    type: "object",
    required: [
      "authorizationUrl",
      "tokenUrl"
    ],
    properties: {
      authorizationUrl: {
        type: "string",
        format: "uri-reference"
      },
      tokenUrl: {
        type: "string",
        format: "uri-reference"
      },
      refreshUrl: {
        type: "string",
        format: "uri-reference"
      },
      scopes: {
        type: "object",
        additionalProperties: {
          type: "string"
        }
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1
  },
  Link: {
    type: "object",
    properties: {
      operationId: {
        type: "string"
      },
      operationRef: {
        type: "string",
        format: "uri-reference"
      },
      parameters: {
        type: "object",
        additionalProperties: {}
      },
      requestBody: {},
      description: {
        type: "string"
      },
      server: {
        $ref: "#/definitions/Server"
      }
    },
    patternProperties: {
      "^x-": {}
    },
    additionalProperties: !1,
    not: {
      description: "Operation Id and Operation Ref are mutually exclusive",
      required: [
        "operationId",
        "operationRef"
      ]
    }
  },
  Callback: {
    type: "object",
    additionalProperties: {
      $ref: "#/definitions/PathItem"
    },
    patternProperties: {
      "^x-": {}
    }
  },
  Encoding: {
    type: "object",
    properties: {
      contentType: {
        type: "string"
      },
      headers: {
        type: "object",
        additionalProperties: {
          $ref: "#/definitions/Header"
        }
      },
      style: {
        type: "string",
        enum: [
          "form",
          "spaceDelimited",
          "pipeDelimited",
          "deepObject"
        ]
      },
      explode: {
        type: "boolean"
      },
      allowReserved: {
        type: "boolean",
        default: !1
      }
    },
    additionalProperties: !1
  }
}, C$ = {
  id: b$,
  $schema: w$,
  description: P$,
  type: O$,
  required: E$,
  properties: S$,
  patternProperties: x$,
  additionalProperties: j$,
  definitions: A$
}, I$ = "https://spec.openapis.org/oas/3.1/schema/2021-04-15", T$ = "https://json-schema.org/draft/2020-12/schema", R$ = "object", k$ = {
  openapi: {
    type: "string",
    pattern: "^3\\.1\\.\\d+(-.+)?$"
  },
  info: {
    $ref: "#/$defs/info"
  },
  jsonSchemaDialect: {
    $ref: "#/$defs/uri",
    default: "https://spec.openapis.org/oas/3.1/dialect/base"
  },
  servers: {
    type: "array",
    items: {
      $ref: "#/$defs/server"
    }
  },
  paths: {
    $ref: "#/$defs/paths"
  },
  webhooks: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/path-item-or-reference"
    }
  },
  components: {
    $ref: "#/$defs/components"
  },
  security: {
    type: "array",
    items: {
      $ref: "#/$defs/security-requirement"
    }
  },
  tags: {
    type: "array",
    items: {
      $ref: "#/$defs/tag"
    }
  },
  externalDocs: {
    $ref: "#/$defs/external-documentation"
  }
}, N$ = [
  "openapi",
  "info"
], M$ = [
  {
    required: [
      "paths"
    ]
  },
  {
    required: [
      "components"
    ]
  },
  {
    required: [
      "webhooks"
    ]
  }
], D$ = "#/$defs/specification-extensions", q$ = !1, F$ = {
  info: {
    type: "object",
    properties: {
      title: {
        type: "string"
      },
      summary: {
        type: "string"
      },
      description: {
        type: "string"
      },
      termsOfService: {
        type: "string"
      },
      contact: {
        $ref: "#/$defs/contact"
      },
      license: {
        $ref: "#/$defs/license"
      },
      version: {
        type: "string"
      }
    },
    required: [
      "title",
      "version"
    ],
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  contact: {
    type: "object",
    properties: {
      name: {
        type: "string"
      },
      url: {
        type: "string"
      },
      email: {
        type: "string"
      }
    },
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  license: {
    type: "object",
    properties: {
      name: {
        type: "string"
      },
      identifier: {
        type: "string"
      },
      url: {
        $ref: "#/$defs/uri"
      }
    },
    required: [
      "name"
    ],
    oneOf: [
      {
        required: [
          "identifier"
        ]
      },
      {
        required: [
          "url"
        ]
      }
    ],
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  server: {
    type: "object",
    properties: {
      url: {
        $ref: "#/$defs/uri"
      },
      description: {
        type: "string"
      },
      variables: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/server-variable"
        }
      }
    },
    required: [
      "url"
    ],
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  "server-variable": {
    type: "object",
    properties: {
      enum: {
        type: "array",
        items: {
          type: "string"
        },
        minItems: 1
      },
      default: {
        type: "string"
      },
      descriptions: {
        type: "string"
      }
    },
    required: [
      "default"
    ],
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  components: {
    type: "object",
    properties: {
      schemas: {
        type: "object",
        additionalProperties: {
          $dynamicRef: "#meta"
        }
      },
      responses: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/response-or-reference"
        }
      },
      parameters: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/parameter-or-reference"
        }
      },
      examples: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/example-or-reference"
        }
      },
      requestBodies: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/request-body-or-reference"
        }
      },
      headers: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/header-or-reference"
        }
      },
      securitySchemes: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/security-scheme-or-reference"
        }
      },
      links: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/link-or-reference"
        }
      },
      callbacks: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/callbacks-or-reference"
        }
      },
      pathItems: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/path-item-or-reference"
        }
      }
    },
    patternProperties: {
      "^(schemas|responses|parameters|examples|requestBodies|headers|securitySchemes|links|callbacks|pathItems)$": {
        $comment: "Enumerating all of the property names in the regex above is necessary for unevaluatedProperties to work as expected",
        propertyNames: {
          pattern: "^[a-zA-Z0-9._-]+$"
        }
      }
    },
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  paths: {
    type: "object",
    patternProperties: {
      "^/": {
        $ref: "#/$defs/path-item"
      }
    },
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  "path-item": {
    type: "object",
    properties: {
      summary: {
        type: "string"
      },
      description: {
        type: "string"
      },
      servers: {
        type: "array",
        items: {
          $ref: "#/$defs/server"
        }
      },
      parameters: {
        type: "array",
        items: {
          $ref: "#/$defs/parameter-or-reference"
        }
      }
    },
    patternProperties: {
      "^(get|put|post|delete|options|head|patch|trace)$": {
        $ref: "#/$defs/operation"
      }
    },
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  "path-item-or-reference": {
    if: {
      required: [
        "$ref"
      ]
    },
    then: {
      $ref: "#/$defs/reference"
    },
    else: {
      $ref: "#/$defs/path-item"
    }
  },
  operation: {
    type: "object",
    properties: {
      tags: {
        type: "array",
        items: {
          type: "string"
        }
      },
      summary: {
        type: "string"
      },
      description: {
        type: "string"
      },
      externalDocs: {
        $ref: "#/$defs/external-documentation"
      },
      operationId: {
        type: "string"
      },
      parameters: {
        type: "array",
        items: {
          $ref: "#/$defs/parameter-or-reference"
        }
      },
      requestBody: {
        $ref: "#/$defs/request-body-or-reference"
      },
      responses: {
        $ref: "#/$defs/responses"
      },
      callbacks: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/callbacks-or-reference"
        }
      },
      deprecated: {
        default: !1,
        type: "boolean"
      },
      security: {
        type: "array",
        items: {
          $ref: "#/$defs/security-requirement"
        }
      },
      servers: {
        type: "array",
        items: {
          $ref: "#/$defs/server"
        }
      }
    },
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  "external-documentation": {
    type: "object",
    properties: {
      description: {
        type: "string"
      },
      url: {
        $ref: "#/$defs/uri"
      }
    },
    required: [
      "url"
    ],
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  parameter: {
    type: "object",
    properties: {
      name: {
        type: "string"
      },
      in: {
        enum: [
          "query",
          "header",
          "path",
          "cookie"
        ]
      },
      description: {
        type: "string"
      },
      required: {
        default: !1,
        type: "boolean"
      },
      deprecated: {
        default: !1,
        type: "boolean"
      },
      allowEmptyValue: {
        default: !1,
        type: "boolean"
      },
      schema: {
        $dynamicRef: "#meta"
      },
      content: {
        $ref: "#/$defs/content"
      }
    },
    required: [
      "in"
    ],
    oneOf: [
      {
        required: [
          "schema"
        ]
      },
      {
        required: [
          "content"
        ]
      }
    ],
    dependentSchemas: {
      schema: {
        properties: {
          style: {
            type: "string"
          },
          explode: {
            type: "boolean"
          },
          allowReserved: {
            default: !1,
            type: "boolean"
          }
        },
        allOf: [
          {
            $ref: "#/$defs/examples"
          },
          {
            $ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-path"
          },
          {
            $ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-header"
          },
          {
            $ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-query"
          },
          {
            $ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-cookie"
          },
          {
            $ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-form"
          }
        ],
        $defs: {
          "styles-for-path": {
            if: {
              properties: {
                in: {
                  const: "path"
                }
              },
              required: [
                "in"
              ]
            },
            then: {
              properties: {
                style: {
                  default: "simple",
                  enum: [
                    "matrix",
                    "label",
                    "simple"
                  ]
                },
                required: {
                  const: !0
                }
              },
              required: [
                "required"
              ]
            }
          },
          "styles-for-header": {
            if: {
              properties: {
                in: {
                  const: "header"
                }
              },
              required: [
                "in"
              ]
            },
            then: {
              properties: {
                style: {
                  default: "simple",
                  enum: [
                    "simple"
                  ]
                }
              }
            }
          },
          "styles-for-query": {
            if: {
              properties: {
                in: {
                  const: "query"
                }
              },
              required: [
                "in"
              ]
            },
            then: {
              properties: {
                style: {
                  default: "form",
                  enum: [
                    "form",
                    "spaceDelimited",
                    "pipeDelimited",
                    "deepObject"
                  ]
                }
              }
            }
          },
          "styles-for-cookie": {
            if: {
              properties: {
                in: {
                  const: "cookie"
                }
              },
              required: [
                "in"
              ]
            },
            then: {
              properties: {
                style: {
                  default: "form",
                  enum: [
                    "form"
                  ]
                }
              }
            }
          },
          "styles-for-form": {
            if: {
              properties: {
                style: {
                  const: "form"
                }
              },
              required: [
                "style"
              ]
            },
            then: {
              properties: {
                explode: {
                  default: !0
                }
              }
            },
            else: {
              properties: {
                explode: {
                  default: !1
                }
              }
            }
          }
        }
      }
    },
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  "parameter-or-reference": {
    if: {
      required: [
        "$ref"
      ]
    },
    then: {
      $ref: "#/$defs/reference"
    },
    else: {
      $ref: "#/$defs/parameter"
    }
  },
  "request-body": {
    type: "object",
    properties: {
      description: {
        type: "string"
      },
      content: {
        $ref: "#/$defs/content"
      },
      required: {
        default: !1,
        type: "boolean"
      }
    },
    required: [
      "content"
    ],
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  "request-body-or-reference": {
    if: {
      required: [
        "$ref"
      ]
    },
    then: {
      $ref: "#/$defs/reference"
    },
    else: {
      $ref: "#/$defs/request-body"
    }
  },
  content: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/media-type"
    },
    propertyNames: {
      format: "media-range"
    }
  },
  "media-type": {
    type: "object",
    properties: {
      schema: {
        $dynamicRef: "#meta"
      },
      encoding: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/encoding"
        }
      }
    },
    allOf: [
      {
        $ref: "#/$defs/specification-extensions"
      },
      {
        $ref: "#/$defs/examples"
      }
    ],
    unevaluatedProperties: !1
  },
  encoding: {
    type: "object",
    properties: {
      contentType: {
        type: "string",
        format: "media-range"
      },
      headers: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/header-or-reference"
        }
      },
      style: {
        default: "form",
        enum: [
          "form",
          "spaceDelimited",
          "pipeDelimited",
          "deepObject"
        ]
      },
      explode: {
        type: "boolean"
      },
      allowReserved: {
        default: !1,
        type: "boolean"
      }
    },
    allOf: [
      {
        $ref: "#/$defs/specification-extensions"
      },
      {
        $ref: "#/$defs/encoding/$defs/explode-default"
      }
    ],
    unevaluatedProperties: !1,
    $defs: {
      "explode-default": {
        if: {
          properties: {
            style: {
              const: "form"
            }
          },
          required: [
            "style"
          ]
        },
        then: {
          properties: {
            explode: {
              default: !0
            }
          }
        },
        else: {
          properties: {
            explode: {
              default: !1
            }
          }
        }
      }
    }
  },
  responses: {
    type: "object",
    properties: {
      default: {
        $ref: "#/$defs/response-or-reference"
      }
    },
    patternProperties: {
      "^[1-5][0-9X]{2}$": {
        $ref: "#/$defs/response-or-reference"
      }
    },
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  response: {
    type: "object",
    properties: {
      description: {
        type: "string"
      },
      headers: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/header-or-reference"
        }
      },
      content: {
        $ref: "#/$defs/content"
      },
      links: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/link-or-reference"
        }
      }
    },
    required: [
      "description"
    ],
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  "response-or-reference": {
    if: {
      required: [
        "$ref"
      ]
    },
    then: {
      $ref: "#/$defs/reference"
    },
    else: {
      $ref: "#/$defs/response"
    }
  },
  callbacks: {
    type: "object",
    $ref: "#/$defs/specification-extensions",
    additionalProperties: {
      $ref: "#/$defs/path-item-or-reference"
    }
  },
  "callbacks-or-reference": {
    if: {
      required: [
        "$ref"
      ]
    },
    then: {
      $ref: "#/$defs/reference"
    },
    else: {
      $ref: "#/$defs/callbacks"
    }
  },
  example: {
    type: "object",
    properties: {
      summary: {
        type: "string"
      },
      description: {
        type: "string"
      },
      value: !0,
      externalValue: {
        $ref: "#/$defs/uri"
      }
    },
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  "example-or-reference": {
    if: {
      required: [
        "$ref"
      ]
    },
    then: {
      $ref: "#/$defs/reference"
    },
    else: {
      $ref: "#/$defs/example"
    }
  },
  link: {
    type: "object",
    properties: {
      operationRef: {
        $ref: "#/$defs/uri"
      },
      operationId: !0,
      parameters: {
        $ref: "#/$defs/map-of-strings"
      },
      requestBody: !0,
      description: {
        type: "string"
      },
      body: {
        $ref: "#/$defs/server"
      }
    },
    oneOf: [
      {
        required: [
          "operationRef"
        ]
      },
      {
        required: [
          "operationId"
        ]
      }
    ],
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  "link-or-reference": {
    if: {
      required: [
        "$ref"
      ]
    },
    then: {
      $ref: "#/$defs/reference"
    },
    else: {
      $ref: "#/$defs/link"
    }
  },
  header: {
    type: "object",
    properties: {
      description: {
        type: "string"
      },
      required: {
        default: !1,
        type: "boolean"
      },
      deprecated: {
        default: !1,
        type: "boolean"
      },
      allowEmptyValue: {
        default: !1,
        type: "boolean"
      }
    },
    dependentSchemas: {
      schema: {
        properties: {
          style: {
            default: "simple",
            enum: [
              "simple"
            ]
          },
          explode: {
            default: !1,
            type: "boolean"
          },
          allowReserved: {
            default: !1,
            type: "boolean"
          },
          schema: {
            $dynamicRef: "#meta"
          }
        },
        $ref: "#/$defs/examples"
      },
      content: {
        properties: {
          content: {
            $ref: "#/$defs/content"
          }
        }
      }
    },
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  "header-or-reference": {
    if: {
      required: [
        "$ref"
      ]
    },
    then: {
      $ref: "#/$defs/reference"
    },
    else: {
      $ref: "#/$defs/header"
    }
  },
  tag: {
    type: "object",
    properties: {
      name: {
        type: "string"
      },
      description: {
        type: "string"
      },
      externalDocs: {
        $ref: "#/$defs/external-documentation"
      }
    },
    required: [
      "name"
    ],
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1
  },
  reference: {
    type: "object",
    properties: {
      $ref: {
        $ref: "#/$defs/uri"
      },
      summary: {
        type: "string"
      },
      description: {
        type: "string"
      }
    },
    unevaluatedProperties: !1
  },
  schema: {
    $dynamicAnchor: "meta",
    type: [
      "object",
      "boolean"
    ]
  },
  "security-scheme": {
    type: "object",
    properties: {
      type: {
        enum: [
          "apiKey",
          "http",
          "mutualTLS",
          "oauth2",
          "openIdConnect"
        ]
      },
      description: {
        type: "string"
      }
    },
    required: [
      "type"
    ],
    allOf: [
      {
        $ref: "#/$defs/specification-extensions"
      },
      {
        $ref: "#/$defs/security-scheme/$defs/type-apikey"
      },
      {
        $ref: "#/$defs/security-scheme/$defs/type-http"
      },
      {
        $ref: "#/$defs/security-scheme/$defs/type-http-bearer"
      },
      {
        $ref: "#/$defs/security-scheme/$defs/type-oauth2"
      },
      {
        $ref: "#/$defs/security-scheme/$defs/type-oidc"
      }
    ],
    unevaluatedProperties: !1,
    $defs: {
      "type-apikey": {
        if: {
          properties: {
            type: {
              const: "apiKey"
            }
          },
          required: [
            "type"
          ]
        },
        then: {
          properties: {
            name: {
              type: "string"
            },
            in: {
              enum: [
                "query",
                "header",
                "cookie"
              ]
            }
          },
          required: [
            "name",
            "in"
          ]
        }
      },
      "type-http": {
        if: {
          properties: {
            type: {
              const: "http"
            }
          },
          required: [
            "type"
          ]
        },
        then: {
          properties: {
            scheme: {
              type: "string"
            }
          },
          required: [
            "scheme"
          ]
        }
      },
      "type-http-bearer": {
        if: {
          properties: {
            type: {
              const: "http"
            },
            scheme: {
              const: "bearer"
            }
          },
          required: [
            "type",
            "scheme"
          ]
        },
        then: {
          properties: {
            bearerFormat: {
              type: "string"
            }
          },
          required: [
            "scheme"
          ]
        }
      },
      "type-oauth2": {
        if: {
          properties: {
            type: {
              const: "oauth2"
            }
          },
          required: [
            "type"
          ]
        },
        then: {
          properties: {
            flows: {
              $ref: "#/$defs/oauth-flows"
            }
          },
          required: [
            "flows"
          ]
        }
      },
      "type-oidc": {
        if: {
          properties: {
            type: {
              const: "openIdConnect"
            }
          },
          required: [
            "type"
          ]
        },
        then: {
          properties: {
            openIdConnectUrl: {
              $ref: "#/$defs/uri"
            }
          },
          required: [
            "openIdConnectUrl"
          ]
        }
      }
    }
  },
  "security-scheme-or-reference": {
    if: {
      required: [
        "$ref"
      ]
    },
    then: {
      $ref: "#/$defs/reference"
    },
    else: {
      $ref: "#/$defs/security-scheme"
    }
  },
  "oauth-flows": {
    type: "object",
    properties: {
      implicit: {
        $ref: "#/$defs/oauth-flows/$defs/implicit"
      },
      password: {
        $ref: "#/$defs/oauth-flows/$defs/password"
      },
      clientCredentials: {
        $ref: "#/$defs/oauth-flows/$defs/client-credentials"
      },
      authorizationCode: {
        $ref: "#/$defs/oauth-flows/$defs/authorization-code"
      }
    },
    $ref: "#/$defs/specification-extensions",
    unevaluatedProperties: !1,
    $defs: {
      implicit: {
        type: "object",
        properties: {
          authorizationUrl: {
            type: "string"
          },
          refreshUrl: {
            type: "string"
          },
          scopes: {
            $ref: "#/$defs/map-of-strings"
          }
        },
        required: [
          "authorizationUrl",
          "scopes"
        ],
        $ref: "#/$defs/specification-extensions",
        unevaluatedProperties: !1
      },
      password: {
        type: "object",
        properties: {
          tokenUrl: {
            type: "string"
          },
          refreshUrl: {
            type: "string"
          },
          scopes: {
            $ref: "#/$defs/map-of-strings"
          }
        },
        required: [
          "tokenUrl",
          "scopes"
        ],
        $ref: "#/$defs/specification-extensions",
        unevaluatedProperties: !1
      },
      "client-credentials": {
        type: "object",
        properties: {
          tokenUrl: {
            type: "string"
          },
          refreshUrl: {
            type: "string"
          },
          scopes: {
            $ref: "#/$defs/map-of-strings"
          }
        },
        required: [
          "tokenUrl",
          "scopes"
        ],
        $ref: "#/$defs/specification-extensions",
        unevaluatedProperties: !1
      },
      "authorization-code": {
        type: "object",
        properties: {
          authorizationUrl: {
            type: "string"
          },
          tokenUrl: {
            type: "string"
          },
          refreshUrl: {
            type: "string"
          },
          scopes: {
            $ref: "#/$defs/map-of-strings"
          }
        },
        required: [
          "authorizationUrl",
          "tokenUrl",
          "scopes"
        ],
        $ref: "#/$defs/specification-extensions",
        unevaluatedProperties: !1
      }
    }
  },
  "security-requirement": {
    type: "object",
    additionalProperties: {
      type: "array",
      items: {
        type: "string"
      }
    }
  },
  "specification-extensions": {
    patternProperties: {
      "^x-": !0
    }
  },
  examples: {
    properties: {
      example: !0,
      examples: {
        type: "object",
        additionalProperties: {
          $ref: "#/$defs/example-or-reference"
        }
      }
    }
  },
  uri: {
    type: "string",
    format: "uri"
  },
  "map-of-strings": {
    type: "object",
    additionalProperties: {
      type: "string"
    }
  }
}, V$ = {
  $id: I$,
  $schema: T$,
  type: R$,
  properties: k$,
  required: N$,
  anyOf: M$,
  $ref: D$,
  unevaluatedProperties: q$,
  $defs: F$
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.openapi = t.openapiV31 = t.openapiV3 = t.openapiV2 = t.openapiV1 = void 0, t.openapiV1 = u$, t.openapiV2 = v$, t.openapiV3 = C$, t.openapiV31 = V$, t.openapi = {
    v1: t.openapiV1,
    v2: t.openapiV2,
    v3: t.openapiV3,
    v31: t.openapiV31
  }, t.default = t.openapi, e.exports = Object.assign(e.exports.default, e.exports);
})(oi, oi.exports);
var L$ = oi.exports;
const H$ = nt, { ono: U$ } = je, z$ = Sm, G$ = r$, { openapi: Fn } = L$;
var El = B$;
function B$(e) {
  let t, r;
  if (e.swagger)
    r = Fn.v2, t = Vn();
  else if (e.openapi.startsWith("3.1")) {
    r = Fn.v31;
    const i = r.$defs.schema;
    delete i.$dynamicAnchor, r.$defs.components.properties.schemas.additionalProperties = i, r.$defs.header.dependentSchemas.schema.properties.schema = i, r.$defs["media-type"].properties.schema = i, r.$defs.parameter.properties.schema = i, t = Vn(!1);
  } else
    r = Fn.v3, t = Vn();
  if (!t.validate(r, e)) {
    let i = t.errors, s = `Swagger schema validation failed.
` + K$(i);
    throw U$.syntax(i, { details: i }, s);
  }
}
function Vn(e = !0) {
  const t = {
    allErrors: !0,
    strict: !1,
    validateFormats: !1
  };
  return e ? new z$(t) : new G$(t);
}
function K$(e, t) {
  t = t || "  ";
  let r = "";
  for (let n of e)
    r += H$.format(`${t}#${n.instancePath.length ? n.instancePath : "/"} ${n.message}
`);
  return r;
}
var W$ = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch"
];
const J$ = nt, { ono: te } = je, Y$ = W$, ai = ["array", "boolean", "integer", "number", "string"], Sl = ["array", "boolean", "integer", "number", "string", "object", "null", void 0];
var xl = X$;
function X$(e) {
  if (e.openapi)
    return;
  let t = Object.keys(e.paths || {}), r = [];
  for (let i of t) {
    let s = e.paths[i], o = "/paths" + i;
    s && i.indexOf("/") === 0 && Q$(e, s, o, r);
  }
  let n = Object.keys(e.definitions || {});
  for (let i of n) {
    let s = e.definitions[i], o = "/definitions/" + i;
    jl(s, o);
  }
}
function Q$(e, t, r, n) {
  for (let i of Y$) {
    let s = t[i], o = r + "/" + i;
    if (s) {
      let a = s.operationId;
      if (a)
        if (n.indexOf(a) === -1)
          n.push(a);
        else
          throw te.syntax(`Validation failed. Duplicate operation id '${a}'`);
      Z$(e, t, r, s, o);
      let l = Object.keys(s.responses || {});
      for (let c of l) {
        let f = s.responses[c], u = o + "/responses/" + c;
        n_(c, f || {}, u);
      }
    }
  }
}
function Z$(e, t, r, n, i) {
  let s = t.parameters || [], o = n.parameters || [];
  try {
    To(s);
  } catch (l) {
    throw te.syntax(l, `Validation failed. ${r} has duplicate parameters`);
  }
  try {
    To(o);
  } catch (l) {
    throw te.syntax(l, `Validation failed. ${i} has duplicate parameters`);
  }
  let a = s.reduce((l, c) => (l.some((u) => u.in === c.in && u.name === c.name) || l.push(c), l), o.slice());
  e_(a, i), t_(a, r, i), r_(a, e, n, i);
}
function e_(e, t) {
  let r = e.filter((i) => i.in === "body"), n = e.filter((i) => i.in === "formData");
  if (r.length > 1)
    throw te.syntax(
      `Validation failed. ${t} has ${r.length} body parameters. Only one is allowed.`
    );
  if (r.length > 0 && n.length > 0)
    throw te.syntax(
      `Validation failed. ${t} has body parameters and formData parameters. Only one or the other is allowed.`
    );
}
function t_(e, t, r) {
  let n = t.match(J$.swaggerParamRegExp) || [];
  for (let i = 0; i < n.length; i++)
    for (let s = i + 1; s < n.length; s++)
      if (n[i] === n[s])
        throw te.syntax(
          `Validation failed. ${r} has multiple path placeholders named ${n[i]}`
        );
  e = e.filter((i) => i.in === "path");
  for (let i of e) {
    if (i.required !== !0)
      throw te.syntax(
        `Validation failed. Path parameters cannot be optional. Set required=true for the "${i.name}" parameter at ${r}`
      );
    let s = n.indexOf("{" + i.name + "}");
    if (s === -1)
      throw te.syntax(
        `Validation failed. ${r} has a path parameter named "${i.name}", but there is no corresponding {${i.name}} in the path string`
      );
    n.splice(s, 1);
  }
  if (n.length > 0)
    throw te.syntax(`Validation failed. ${r} is missing path parameter(s) for ${n}`);
}
function r_(e, t, r, n) {
  for (let i of e) {
    let s = n + "/parameters/" + i.name, o, a;
    switch (i.in) {
      case "body":
        o = i.schema, a = Sl;
        break;
      case "formData":
        o = i, a = ai.concat("file");
        break;
      default:
        o = i, a = ai;
    }
    if (li(o, s, a), jl(o, s), o.type === "file") {
      let l = /multipart\/(.*\+)?form-data/, c = /application\/(.*\+)?x-www-form-urlencoded/;
      if (!(r.consumes || t.consumes || []).some((h) => l.test(h) || c.test(h)))
        throw te.syntax(
          `Validation failed. ${n} has a file parameter, so it must consume multipart/form-data or application/x-www-form-urlencoded`
        );
    }
  }
}
function To(e) {
  for (let t = 0; t < e.length - 1; t++) {
    let r = e[t];
    for (let n = t + 1; n < e.length; n++) {
      let i = e[n];
      if (r.name === i.name && r.in === i.in)
        throw te.syntax(`Validation failed. Found multiple ${r.in} parameters named "${r.name}"`);
    }
  }
}
function n_(e, t, r) {
  if (e !== "default" && (e < 100 || e > 599))
    throw te.syntax(`Validation failed. ${r} has an invalid response code (${e})`);
  let n = Object.keys(t.headers || {});
  for (let i of n) {
    let s = t.headers[i], o = r + "/headers/" + i;
    li(s, o, ai);
  }
  if (t.schema) {
    let i = Sl.concat("file");
    if (i.indexOf(t.schema.type) === -1)
      throw te.syntax(
        `Validation failed. ${r} has an invalid response schema type (${t.schema.type})`
      );
    li(t.schema, r + "/schema", i);
  }
}
function li(e, t, r) {
  if (r.indexOf(e.type) === -1)
    throw te.syntax(
      `Validation failed. ${t} has an invalid type (${e.type})`
    );
  if (e.type === "array" && !e.items)
    throw te.syntax(`Validation failed. ${t} is an array, so it must include an "items" schema`);
}
function jl(e, t) {
  function r(n, i) {
    if (n.properties)
      for (let s in n.properties)
        n.properties.hasOwnProperty(s) && (i[s] = n.properties[s]);
    if (n.allOf)
      for (let s of n.allOf)
        r(s, i);
  }
  if (!(Array.isArray(e.type) && !e.type.includes("object")) && !(!Array.isArray(e.type) && e.type !== "object") && e.required && Array.isArray(e.required)) {
    let n = {};
    r(e, n);
    for (let i of e.required)
      if (!n[i])
        throw te.syntax(
          `Validation failed. Property '${i}' listed as required but does not exist in '${t}'`
        );
  }
}
var er = {}, $s = {}, pr = {}, hr = {}, B = {}, on = {}, i_ = j && j.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(on, "__esModule", { value: !0 });
on.default = s_;
const Ro = i_(_i);
function s_(e) {
  var r, n, i, s;
  return e.startsWith("\\\\?\\") ? e : e.split((n = (r = Ro.default) == null ? void 0 : r.win32) == null ? void 0 : n.sep).join(((s = (i = Ro.default) == null ? void 0 : i.posix) == null ? void 0 : s.sep) ?? "/");
}
var an = {};
Object.defineProperty(an, "__esModule", { value: !0 });
an.isWindows = void 0;
const o_ = /^win/.test(globalThis.process ? globalThis.process.platform : ""), a_ = () => o_;
an.isWindows = a_;
var l_ = j && j.__createBinding || (Object.create ? function(e, t, r, n) {
  n === void 0 && (n = r);
  var i = Object.getOwnPropertyDescriptor(t, r);
  (!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = { enumerable: !0, get: function() {
    return t[r];
  } }), Object.defineProperty(e, n, i);
} : function(e, t, r, n) {
  n === void 0 && (n = r), e[n] = t[r];
}), c_ = j && j.__setModuleDefault || (Object.create ? function(e, t) {
  Object.defineProperty(e, "default", { enumerable: !0, value: t });
} : function(e, t) {
  e.default = t;
}), u_ = j && j.__importStar || function(e) {
  if (e && e.__esModule) return e;
  var t = {};
  if (e != null) for (var r in e) r !== "default" && Object.prototype.hasOwnProperty.call(e, r) && l_(t, e, r);
  return c_(t, e), t;
}, f_ = j && j.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(B, "__esModule", { value: !0 });
B.parse = void 0;
B.resolve = Al;
B.cwd = Cl;
B.getProtocol = _s;
B.getExtension = __;
B.stripQuery = Il;
B.getHash = Tl;
B.stripHash = ui;
B.isHttp = v_;
B.isFileSystemPath = fi;
B.fromFileSystemPath = b_;
B.toFileSystemPath = w_;
B.safePointerToPath = P_;
B.relative = O_;
const Cr = f_(on), ci = u_(_i), d_ = /\//g, p_ = /^(\w{2,}):\/\//i, h_ = /~1/g, m_ = /~0/g, y_ = _i, Pr = an, g_ = [
  [/\?/g, "%3F"],
  [/#/g, "%23"]
], Ln = [/%23/g, "#", /%24/g, "$", /%26/g, "&", /%2C/g, ",", /%40/g, "@"], $_ = (e) => new URL(e);
B.parse = $_;
function Al(e, t) {
  var s;
  const r = new URL((0, Cr.default)(e), "resolve://"), n = new URL((0, Cr.default)(t), r), i = ((s = t.match(/(\s*)$/)) == null ? void 0 : s[1]) || "";
  if (n.protocol === "resolve:") {
    const { pathname: o, search: a, hash: l } = n;
    return o + a + l + i;
  }
  return n.toString() + i;
}
function Cl() {
  if (typeof window < "u")
    return location.href;
  const e = process.cwd(), t = e.slice(-1);
  return t === "/" || t === "\\" ? e : e + "/";
}
function _s(e) {
  const t = p_.exec(e || "");
  if (t)
    return t[1].toLowerCase();
}
function __(e) {
  const t = e.lastIndexOf(".");
  return t >= 0 ? Il(e.substr(t).toLowerCase()) : "";
}
function Il(e) {
  const t = e.indexOf("?");
  return t >= 0 && (e = e.substr(0, t)), e;
}
function Tl(e) {
  if (!e)
    return "#";
  const t = e.indexOf("#");
  return t >= 0 ? e.substring(t) : "#";
}
function ui(e) {
  if (!e)
    return "";
  const t = e.indexOf("#");
  return t >= 0 && (e = e.substring(0, t)), e;
}
function v_(e) {
  const t = _s(e);
  return t === "http" || t === "https" ? !0 : t === void 0 ? typeof window < "u" : !1;
}
function fi(e) {
  if (typeof window < "u" || typeof process < "u" && process.browser)
    return !1;
  const t = _s(e);
  return t === void 0 || t === "file";
}
function b_(e) {
  var t;
  if ((0, Pr.isWindows)()) {
    const r = Cl(), n = e.toUpperCase(), s = (0, Cr.default)(r).toUpperCase(), o = n.includes(s), a = n.includes(s), l = ((t = ci.win32) == null ? void 0 : t.isAbsolute(e)) || e.startsWith("http://") || e.startsWith("https://") || e.startsWith("file://");
    !(o || a || l) && !r.startsWith("http") && (e = (0, y_.join)(r, e)), e = (0, Cr.default)(e);
  }
  e = encodeURI(e);
  for (const r of g_)
    e = e.replace(r[0], r[1]);
  return e;
}
function w_(e, t) {
  e = decodeURI(e);
  for (let n = 0; n < Ln.length; n += 2)
    e = e.replace(Ln[n], Ln[n + 1]);
  let r = e.substr(0, 7).toLowerCase() === "file://";
  return r && (e = e[7] === "/" ? e.substr(8) : e.substr(7), (0, Pr.isWindows)() && e[1] === "/" && (e = e[0] + ":" + e.substr(1)), t ? e = "file:///" + e : (r = !1, e = (0, Pr.isWindows)() ? e : "/" + e)), (0, Pr.isWindows)() && !r && (e = e.replace(d_, "\\"), e.substr(1, 2) === ":\\" && (e = e[0].toUpperCase() + e.substr(1))), e;
}
function P_(e) {
  return e.length <= 1 || e[0] !== "#" || e[1] !== "/" ? [] : e.slice(2).split("/").map((t) => decodeURIComponent(t).replace(h_, "/").replace(m_, "~"));
}
function O_(e, t) {
  if (!fi(e) || !fi(t))
    return Al(e, t);
  const r = ci.default.dirname(ui(e)), n = ui(t);
  return ci.default.relative(r, n) + Tl(t);
}
var V = {};
Object.defineProperty(V, "__esModule", { value: !0 });
V.InvalidPointerError = V.TimeoutError = V.MissingPointerError = V.UnmatchedResolverError = V.ResolverError = V.UnmatchedParserError = V.ParserError = V.JSONParserErrorGroup = V.JSONParserError = void 0;
V.isHandledError = T_;
V.normalizeError = R_;
const Rl = je, vs = B;
class Ne extends Error {
  constructor(t, r) {
    super(), this.code = "EUNKNOWN", this.name = "JSONParserError", this.message = t, this.source = r, this.path = null, Rl.Ono.extend(this);
  }
  get footprint() {
    return `${this.path}+${this.source}+${this.code}+${this.message}`;
  }
}
V.JSONParserError = Ne;
class ln extends Error {
  constructor(t) {
    super(), this.files = t, this.name = "JSONParserErrorGroup", this.message = `${this.errors.length} error${this.errors.length > 1 ? "s" : ""} occurred while reading '${(0, vs.toFileSystemPath)(t.$refs._root$Ref.path)}'`, Rl.Ono.extend(this);
  }
  static getParserErrors(t) {
    const r = [];
    for (const n of Object.values(t.$refs._$refs))
      n.errors && r.push(...n.errors);
    return r;
  }
  get errors() {
    return ln.getParserErrors(this.files);
  }
}
V.JSONParserErrorGroup = ln;
class E_ extends Ne {
  constructor(t, r) {
    super(`Error parsing ${r}: ${t}`, r), this.code = "EPARSER", this.name = "ParserError";
  }
}
V.ParserError = E_;
class S_ extends Ne {
  constructor(t) {
    super(`Could not find parser for "${t}"`, t), this.code = "EUNMATCHEDPARSER", this.name = "UnmatchedParserError";
  }
}
V.UnmatchedParserError = S_;
class x_ extends Ne {
  constructor(t, r) {
    super(t.message || `Error reading file "${r}"`, r), this.code = "ERESOLVER", this.name = "ResolverError", "code" in t && (this.ioErrorCode = String(t.code));
  }
}
V.ResolverError = x_;
class j_ extends Ne {
  constructor(t) {
    super(`Could not find resolver for "${t}"`, t), this.code = "EUNMATCHEDRESOLVER", this.name = "UnmatchedResolverError";
  }
}
V.UnmatchedResolverError = j_;
class A_ extends Ne {
  constructor(t, r) {
    super(`Token "${t}" does not exist.`, (0, vs.stripHash)(r)), this.code = "EUNMATCHEDRESOLVER", this.name = "MissingPointerError";
  }
}
V.MissingPointerError = A_;
class C_ extends Ne {
  constructor(t) {
    super(`Dereferencing timeout reached: ${t}ms`), this.code = "ETIMEOUT", this.name = "TimeoutError";
  }
}
V.TimeoutError = C_;
class I_ extends Ne {
  constructor(t, r) {
    super(`Invalid $ref pointer "${t}". Pointers must begin with "#/"`, (0, vs.stripHash)(r)), this.code = "EUNMATCHEDRESOLVER", this.name = "InvalidPointerError";
  }
}
V.InvalidPointerError = I_;
function T_(e) {
  return e instanceof Ne || e instanceof ln;
}
function R_(e) {
  return e.path === null && (e.path = []), e;
}
var ko;
function cn() {
  if (ko) return hr;
  ko = 1;
  var e = j && j.__createBinding || (Object.create ? function(p, m, $, E) {
    E === void 0 && (E = $);
    var S = Object.getOwnPropertyDescriptor(m, $);
    (!S || ("get" in S ? !m.__esModule : S.writable || S.configurable)) && (S = { enumerable: !0, get: function() {
      return m[$];
    } }), Object.defineProperty(p, E, S);
  } : function(p, m, $, E) {
    E === void 0 && (E = $), p[E] = m[$];
  }), t = j && j.__setModuleDefault || (Object.create ? function(p, m) {
    Object.defineProperty(p, "default", { enumerable: !0, value: m });
  } : function(p, m) {
    p.default = m;
  }), r = j && j.__importStar || function(p) {
    if (p && p.__esModule) return p;
    var m = {};
    if (p != null) for (var $ in p) $ !== "default" && Object.prototype.hasOwnProperty.call(p, $) && e(m, p, $);
    return t(m, p), m;
  }, n = j && j.__importDefault || function(p) {
    return p && p.__esModule ? p : { default: p };
  };
  Object.defineProperty(hr, "__esModule", { value: !0 });
  const i = n(tr()), s = r(B), o = V, a = /\//g, l = /~/g, c = /~1/g, f = /~0/g, u = (p) => {
    try {
      return decodeURIComponent(p);
    } catch {
      return p;
    }
  };
  class h {
    constructor(m, $, E) {
      this.$ref = m, this.path = $, this.originalPath = E || $, this.value = void 0, this.circular = !1, this.indirections = 0;
    }
    /**
     * Resolves the value of a nested property within the given object.
     *
     * @param obj - The object that will be crawled
     * @param options
     * @param pathFromRoot - the path of place that initiated resolving
     *
     * @returns
     * Returns a JSON pointer whose {@link Pointer#value} is the resolved value.
     * If resolving this value required resolving other JSON references, then
     * the {@link Pointer#$ref} and {@link Pointer#path} will reflect the resolution path
     * of the resolved value.
     */
    resolve(m, $, E) {
      const S = h.parse(this.path, this.originalPath);
      this.value = b(m);
      for (let A = 0; A < S.length; A++) {
        if (y(this, $, E) && (this.path = h.join(this.path, S.slice(A))), typeof this.value == "object" && this.value !== null && !v(E) && "$ref" in this.value)
          return this;
        const U = S[A];
        if (this.value[U] === void 0 || this.value[U] === null && A === S.length - 1) {
          let fe = !1;
          for (let ce = S.length - 1; ce > A; ce--) {
            const ve = S.slice(A, ce + 1).join("/");
            if (this.value[ve] !== void 0) {
              this.value = this.value[ve], A = ce, fe = !0;
              break;
            }
          }
          if (fe)
            continue;
          throw this.value = null, new o.MissingPointerError(U, decodeURI(this.originalPath));
        } else
          this.value = this.value[U];
      }
      return (!this.value || this.value.$ref && s.resolve(this.path, this.value.$ref) !== E) && y(this, $, E), this;
    }
    /**
     * Sets the value of a nested property within the given object.
     *
     * @param obj - The object that will be crawled
     * @param value - the value to assign
     * @param options
     *
     * @returns
     * Returns the modified object, or an entirely new object if the entire object is overwritten.
     */
    set(m, $, E) {
      const S = h.parse(this.path);
      let A;
      if (S.length === 0)
        return this.value = $, $;
      this.value = b(m);
      for (let U = 0; U < S.length - 1; U++)
        y(this, E), A = S[U], this.value && this.value[A] !== void 0 ? this.value = this.value[A] : this.value = _(this, A, {});
      return y(this, E), A = S[S.length - 1], _(this, A, $), m;
    }
    /**
     * Parses a JSON pointer (or a path containing a JSON pointer in the hash)
     * and returns an array of the pointer's tokens.
     * (e.g. "schema.json#/definitions/person/name" => ["definitions", "person", "name"])
     *
     * The pointer is parsed according to RFC 6901
     * {@link https://tools.ietf.org/html/rfc6901#section-3}
     *
     * @param path
     * @param [originalPath]
     * @returns
     */
    static parse(m, $) {
      const E = s.getHash(m).substring(1);
      if (!E)
        return [];
      const S = E.split("/");
      for (let A = 0; A < S.length; A++)
        S[A] = u(S[A].replace(c, "/").replace(f, "~"));
      if (S[0] !== "")
        throw new o.InvalidPointerError(S, $ === void 0 ? m : $);
      return S.slice(1);
    }
    /**
     * Creates a JSON pointer path, by joining one or more tokens to a base path.
     *
     * @param base - The base path (e.g. "schema.json#/definitions/person")
     * @param tokens - The token(s) to append (e.g. ["name", "first"])
     * @returns
     */
    static join(m, $) {
      m.indexOf("#") === -1 && (m += "#"), $ = Array.isArray($) ? $ : [$];
      for (let E = 0; E < $.length; E++) {
        const S = $[E];
        m += "/" + encodeURIComponent(S.replace(l, "~0").replace(a, "~1"));
      }
      return m;
    }
  }
  function y(p, m, $) {
    if (i.default.isAllowed$Ref(p.value, m)) {
      const E = s.resolve(p.path, p.value.$ref);
      if (E === p.path && !v($))
        p.circular = !0;
      else {
        const S = p.$ref.$refs._resolve(E, p.path, m);
        return S === null ? !1 : (p.indirections += S.indirections + 1, i.default.isExtended$Ref(p.value) ? (p.value = i.default.dereference(p.value, S.value), !1) : (p.$ref = S.$ref, p.path = S.path, p.value = S.value, !0));
      }
    }
  }
  hr.default = h;
  function _(p, m, $) {
    if (p.value && typeof p.value == "object")
      m === "-" && Array.isArray(p.value) ? p.value.push($) : p.value[m] = $;
    else
      throw new o.JSONParserError(`Error assigning $ref pointer "${p.path}". 
Cannot set "${m}" of a non-object.`);
    return $;
  }
  function b(p) {
    if ((0, o.isHandledError)(p))
      throw p;
    return p;
  }
  function v(p) {
    return typeof p == "string" && h.parse(p).length == 0;
  }
  return hr;
}
var No;
function tr() {
  if (No) return pr;
  No = 1;
  var e = j && j.__importDefault || function(s) {
    return s && s.__esModule ? s : { default: s };
  };
  Object.defineProperty(pr, "__esModule", { value: !0 });
  const t = e(cn()), r = V, n = B;
  class i {
    constructor(o) {
      this.errors = [], this.$refs = o;
    }
    /**
     * Pushes an error to errors array.
     *
     * @param err - The error to be pushed
     * @returns
     */
    addError(o) {
      this.errors === void 0 && (this.errors = []);
      const a = this.errors.map(({ footprint: l }) => l);
      "errors" in o && Array.isArray(o.errors) ? this.errors.push(...o.errors.map(r.normalizeError).filter(({ footprint: l }) => !a.includes(l))) : (!("footprint" in o) || !a.includes(o.footprint)) && this.errors.push((0, r.normalizeError)(o));
    }
    /**
     * Determines whether the given JSON reference exists within this {@link $Ref#value}.
     *
     * @param path - The full path being resolved, optionally with a JSON pointer in the hash
     * @param options
     * @returns
     */
    exists(o, a) {
      try {
        return this.resolve(o, a), !0;
      } catch {
        return !1;
      }
    }
    /**
     * Resolves the given JSON reference within this {@link $Ref#value} and returns the resolved value.
     *
     * @param path - The full path being resolved, optionally with a JSON pointer in the hash
     * @param options
     * @returns - Returns the resolved value
     */
    get(o, a) {
      var l;
      return (l = this.resolve(o, a)) == null ? void 0 : l.value;
    }
    /**
     * Resolves the given JSON reference within this {@link $Ref#value}.
     *
     * @param path - The full path being resolved, optionally with a JSON pointer in the hash
     * @param options
     * @param friendlyPath - The original user-specified path (used for error messages)
     * @param pathFromRoot - The path of `obj` from the schema root
     * @returns
     */
    resolve(o, a, l, c) {
      const f = new t.default(this, o, l);
      try {
        return f.resolve(this.value, a, c);
      } catch (u) {
        if (!a || !a.continueOnError || !(0, r.isHandledError)(u))
          throw u;
        return u.path === null && (u.path = (0, n.safePointerToPath)((0, n.getHash)(c))), u instanceof r.InvalidPointerError && (u.source = decodeURI((0, n.stripHash)(c))), this.addError(u), null;
      }
    }
    /**
     * Sets the value of a nested property within this {@link $Ref#value}.
     * If the property, or any of its parents don't exist, they will be created.
     *
     * @param path - The full path of the property to set, optionally with a JSON pointer in the hash
     * @param value - The value to assign
     */
    set(o, a) {
      const l = new t.default(this, o);
      this.value = l.set(this.value, a);
    }
    /**
     * Determines whether the given value is a JSON reference.
     *
     * @param value - The value to inspect
     * @returns
     */
    static is$Ref(o) {
      return !!o && typeof o == "object" && o !== null && "$ref" in o && typeof o.$ref == "string" && o.$ref.length > 0;
    }
    /**
     * Determines whether the given value is an external JSON reference.
     *
     * @param value - The value to inspect
     * @returns
     */
    static isExternal$Ref(o) {
      return i.is$Ref(o) && o.$ref[0] !== "#";
    }
    /**
     * Determines whether the given value is a JSON reference, and whether it is allowed by the options.
     * For example, if it references an external file, then options.resolve.external must be true.
     *
     * @param value - The value to inspect
     * @param options
     * @returns
     */
    static isAllowed$Ref(o, a) {
      var l;
      if (this.is$Ref(o)) {
        if (o.$ref.substring(0, 2) === "#/" || o.$ref === "#")
          return !0;
        if (o.$ref[0] !== "#" && (!a || (l = a.resolve) != null && l.external))
          return !0;
      }
    }
    /**
     * Determines whether the given value is a JSON reference that "extends" its resolved value.
     * That is, it has extra properties (in addition to "$ref"), so rather than simply pointing to
     * an existing value, this $ref actually creates a NEW value that is a shallow copy of the resolved
     * value, plus the extra properties.
     *
     * @example: {
       person: {
         properties: {
           firstName: { type: string }
           lastName: { type: string }
         }
       }
       employee: {
         properties: {
           $ref: #/person/properties
           salary: { type: number }
         }
       }
     }
     *  In this example, "employee" is an extended $ref, since it extends "person" with an additional
     *  property (salary).  The result is a NEW value that looks like this:
     *
     *  {
     *    properties: {
     *      firstName: { type: string }
     *      lastName: { type: string }
     *      salary: { type: number }
     *    }
     *  }
     *
     * @param value - The value to inspect
     * @returns
     */
    static isExtended$Ref(o) {
      return i.is$Ref(o) && Object.keys(o).length > 1;
    }
    /**
     * Returns the resolved value of a JSON Reference.
     * If necessary, the resolved value is merged with the JSON Reference to create a new object
     *
     * @example: {
    person: {
      properties: {
        firstName: { type: string }
        lastName: { type: string }
      }
    }
    employee: {
      properties: {
        $ref: #/person/properties
        salary: { type: number }
      }
    }
    } When "person" and "employee" are merged, you end up with the following object:
     *
     *  {
     *    properties: {
     *      firstName: { type: string }
     *      lastName: { type: string }
     *      salary: { type: number }
     *    }
     *  }
     *
     * @param $ref - The JSON reference object (the one with the "$ref" property)
     * @param resolvedValue - The resolved value, which can be any type
     * @returns - Returns the dereferenced value
     */
    static dereference(o, a) {
      if (a && typeof a == "object" && i.isExtended$Ref(o)) {
        const l = {};
        for (const c of Object.keys(o))
          c !== "$ref" && (l[c] = o[c]);
        for (const c of Object.keys(a))
          c in l || (l[c] = a[c]);
        return l;
      } else
        return a;
    }
  }
  return pr.default = i, pr;
}
var k_ = j && j.__createBinding || (Object.create ? function(e, t, r, n) {
  n === void 0 && (n = r);
  var i = Object.getOwnPropertyDescriptor(t, r);
  (!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = { enumerable: !0, get: function() {
    return t[r];
  } }), Object.defineProperty(e, n, i);
} : function(e, t, r, n) {
  n === void 0 && (n = r), e[n] = t[r];
}), N_ = j && j.__setModuleDefault || (Object.create ? function(e, t) {
  Object.defineProperty(e, "default", { enumerable: !0, value: t });
} : function(e, t) {
  e.default = t;
}), M_ = j && j.__importStar || function(e) {
  if (e && e.__esModule) return e;
  var t = {};
  if (e != null) for (var r in e) r !== "default" && Object.prototype.hasOwnProperty.call(e, r) && k_(t, e, r);
  return N_(t, e), t;
}, kl = j && j.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty($s, "__esModule", { value: !0 });
const Mo = je, D_ = kl(tr()), Le = M_(B), Do = kl(on);
class q_ {
  /**
   * Returns the paths/URLs of all the files in your schema (including the main schema file).
   *
   * See https://apitools.dev/json-schema-ref-parser/docs/refs.html#pathstypes
   *
   * @param types (optional) Optionally only return certain types of paths ("file", "http", etc.)
   */
  paths(...t) {
    return qo(this._$refs, t.flat()).map((n) => (0, Do.default)(n.decoded));
  }
  /**
   * Returns a map of paths/URLs and their correspond values.
   *
   * See https://apitools.dev/json-schema-ref-parser/docs/refs.html#valuestypes
   *
   * @param types (optional) Optionally only return values from certain locations ("file", "http", etc.)
   */
  values(...t) {
    const r = this._$refs;
    return qo(r, t.flat()).reduce((i, s) => (i[(0, Do.default)(s.decoded)] = r[s.encoded].value, i), {});
  }
  /**
   * Returns `true` if the given path exists in the schema; otherwise, returns `false`
   *
   * See https://apitools.dev/json-schema-ref-parser/docs/refs.html#existsref
   *
   * @param $ref The JSON Reference path, optionally with a JSON Pointer in the hash
   */
  /**
   * Determines whether the given JSON reference exists.
   *
   * @param path - The path being resolved, optionally with a JSON pointer in the hash
   * @param [options]
   * @returns
   */
  exists(t, r) {
    try {
      return this._resolve(t, "", r), !0;
    } catch {
      return !1;
    }
  }
  /**
   * Resolves the given JSON reference and returns the resolved value.
   *
   * @param path - The path being resolved, with a JSON pointer in the hash
   * @param [options]
   * @returns - Returns the resolved value
   */
  get(t, r) {
    return this._resolve(t, "", r).value;
  }
  /**
   * Sets the value at the given path in the schema. If the property, or any of its parents, don't exist, they will be created.
   *
   * @param path The JSON Reference path, optionally with a JSON Pointer in the hash
   * @param value The value to assign. Can be anything (object, string, number, etc.)
   */
  set(t, r) {
    const n = Le.resolve(this._root$Ref.path, t), i = Le.stripHash(n), s = this._$refs[i];
    if (!s)
      throw (0, Mo.ono)(`Error resolving $ref pointer "${t}". 
"${i}" not found.`);
    s.set(n, r);
  }
  /**
   * Returns the specified {@link $Ref} object, or undefined.
   *
   * @param path - The path being resolved, optionally with a JSON pointer in the hash
   * @returns
   * @protected
   */
  _get$Ref(t) {
    t = Le.resolve(this._root$Ref.path, t);
    const r = Le.stripHash(t);
    return this._$refs[r];
  }
  /**
   * Creates a new {@link $Ref} object and adds it to this {@link $Refs} object.
   *
   * @param path  - The file path or URL of the referenced file
   */
  _add(t) {
    const r = Le.stripHash(t), n = new D_.default(this);
    return n.path = r, this._$refs[r] = n, this._root$Ref = this._root$Ref || n, n;
  }
  /**
   * Resolves the given JSON reference.
   *
   * @param path - The path being resolved, optionally with a JSON pointer in the hash
   * @param pathFromRoot - The path of `obj` from the schema root
   * @param [options]
   * @returns
   * @protected
   */
  _resolve(t, r, n) {
    const i = Le.resolve(this._root$Ref.path, t), s = Le.stripHash(i), o = this._$refs[s];
    if (!o)
      throw (0, Mo.ono)(`Error resolving $ref pointer "${t}". 
"${s}" not found.`);
    return o.resolve(i, n, t, r);
  }
  constructor() {
    this._$refs = {}, this.toJSON = this.values, this.circular = !1, this._$refs = {}, this._root$Ref = null;
  }
}
$s.default = q_;
function qo(e, t) {
  let r = Object.keys(e);
  return t = Array.isArray(t[0]) ? t[0] : Array.prototype.slice.call(t), t.length > 0 && t[0] && (r = r.filter((n) => t.includes(e[n].pathType))), r.map((n) => ({
    encoded: n,
    decoded: e[n].pathType === "file" ? Le.toFileSystemPath(n, !0) : n
  }));
}
var un = {}, xt = {};
Object.defineProperty(xt, "__esModule", { value: !0 });
xt.all = F_;
xt.filter = V_;
xt.sort = L_;
xt.run = H_;
function F_(e) {
  return Object.keys(e || {}).filter((t) => typeof e[t] == "object").map((t) => (e[t].name = t, e[t]));
}
function V_(e, t, r) {
  return e.filter((n) => !!Nl(n, t, r));
}
function L_(e) {
  for (const t of e)
    t.order = t.order || Number.MAX_SAFE_INTEGER;
  return e.sort((t, r) => t.order - r.order);
}
async function H_(e, t, r, n) {
  let i, s, o = 0;
  return new Promise((a, l) => {
    c();
    function c() {
      if (i = e[o++], !i)
        return l(s);
      try {
        const y = Nl(i, t, r, f, n);
        if (y && typeof y.then == "function")
          y.then(u, h);
        else if (y !== void 0)
          u(y);
        else if (o === e.length)
          throw new Error("No promise has been returned or callback has been called.");
      } catch (y) {
        h(y);
      }
    }
    function f(y, _) {
      y ? h(y) : u(_);
    }
    function u(y) {
      a({
        plugin: i,
        result: y
      });
    }
    function h(y) {
      s = {
        plugin: i,
        error: y
      }, c();
    }
  });
}
function Nl(e, t, r, n, i) {
  const s = e[t];
  if (typeof s == "function")
    return s.apply(e, [r, n, i]);
  if (!n) {
    if (s instanceof RegExp)
      return s.test(r.url);
    if (typeof s == "string")
      return s === r.extension;
    if (Array.isArray(s))
      return s.indexOf(r.extension) !== -1;
  }
  return s;
}
var U_ = j && j.__createBinding || (Object.create ? function(e, t, r, n) {
  n === void 0 && (n = r);
  var i = Object.getOwnPropertyDescriptor(t, r);
  (!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = { enumerable: !0, get: function() {
    return t[r];
  } }), Object.defineProperty(e, n, i);
} : function(e, t, r, n) {
  n === void 0 && (n = r), e[n] = t[r];
}), z_ = j && j.__setModuleDefault || (Object.create ? function(e, t) {
  Object.defineProperty(e, "default", { enumerable: !0, value: t });
} : function(e, t) {
  e.default = t;
}), Ml = j && j.__importStar || function(e) {
  if (e && e.__esModule) return e;
  var t = {};
  if (e != null) for (var r in e) r !== "default" && Object.prototype.hasOwnProperty.call(e, r) && U_(t, e, r);
  return z_(t, e), t;
};
Object.defineProperty(un, "__esModule", { value: !0 });
const di = je, G_ = Ml(B), Ue = Ml(xt), et = V;
async function B_(e, t, r) {
  const n = e.indexOf("#");
  let i = "";
  n >= 0 && (i = e.substring(n), e = e.substring(0, n));
  const s = t._add(e), o = {
    url: e,
    hash: i,
    extension: G_.getExtension(e)
  };
  try {
    const a = await K_(o, r, t);
    s.pathType = a.plugin.name, o.data = a.result;
    const l = await W_(o, r, t);
    return s.value = l.result, l.result;
  } catch (a) {
    throw (0, et.isHandledError)(a) && (s.value = a), a;
  }
}
async function K_(e, t, r) {
  let n = Ue.all(t.resolve);
  n = Ue.filter(n, "canRead", e), Ue.sort(n);
  try {
    return await Ue.run(n, "read", e, r);
  } catch (i) {
    throw !i && t.continueOnError ? new et.UnmatchedResolverError(e.url) : !i || !("error" in i) ? di.ono.syntax(`Unable to resolve $ref pointer "${e.url}"`) : i.error instanceof et.ResolverError ? i.error : new et.ResolverError(i, e.url);
  }
}
async function W_(e, t, r) {
  const n = Ue.all(t.parse), i = Ue.filter(n, "canParse", e), s = i.length > 0 ? i : n;
  Ue.sort(s);
  try {
    const o = await Ue.run(s, "parse", e, r);
    if (!o.plugin.allowEmpty && J_(o.result))
      throw di.ono.syntax(`Error parsing "${e.url}" as ${o.plugin.name}. 
Parsed value is empty`);
    return o;
  } catch (o) {
    throw !o && t.continueOnError ? new et.UnmatchedParserError(e.url) : o && o.message && o.message.startsWith("Error parsing") ? o : !o || !("error" in o) ? di.ono.syntax(`Unable to parse ${e.url}`) : o.error instanceof et.ParserError ? o.error : new et.ParserError(o.error.message, e.url);
  }
}
function J_(e) {
  return e === void 0 || typeof e == "object" && Object.keys(e).length === 0 || typeof e == "string" && e.trim().length === 0 || Buffer.isBuffer(e) && e.length === 0;
}
un.default = B_;
var fn = {}, bs = {}, ws = {};
Object.defineProperty(ws, "__esModule", { value: !0 });
const Fo = V;
ws.default = {
  /**
   * The order that this parser will run, in relation to other parsers.
   */
  order: 100,
  /**
   * Whether to allow "empty" files. This includes zero-byte files, as well as empty JSON objects.
   */
  allowEmpty: !0,
  /**
   * Determines whether this parser can parse a given file reference.
   * Parsers that match will be tried, in order, until one successfully parses the file.
   * Parsers that don't match will be skipped, UNLESS none of the parsers match, in which case
   * every parser will be tried.
   */
  canParse: ".json",
  /**
   * Allow JSON files with byte order marks (BOM)
   */
  allowBOM: !0,
  /**
   * Parses the given file as JSON
   */
  async parse(e) {
    let t = e.data;
    if (Buffer.isBuffer(t) && (t = t.toString()), typeof t == "string") {
      if (t.trim().length === 0)
        return;
      try {
        return JSON.parse(t);
      } catch (r) {
        if (this.allowBOM)
          try {
            const n = t.indexOf("{");
            return t = t.slice(n), JSON.parse(t);
          } catch (n) {
            throw new Fo.ParserError(n.message, e.url);
          }
        throw new Fo.ParserError(r.message, e.url);
      }
    } else
      return t;
  }
};
var Ps = {}, re = {}, Os = {}, _e = {};
function Dl(e) {
  return typeof e > "u" || e === null;
}
function Y_(e) {
  return typeof e == "object" && e !== null;
}
function X_(e) {
  return Array.isArray(e) ? e : Dl(e) ? [] : [e];
}
function Q_(e, t) {
  var r, n, i, s;
  if (t)
    for (s = Object.keys(t), r = 0, n = s.length; r < n; r += 1)
      i = s[r], e[i] = t[i];
  return e;
}
function Z_(e, t) {
  var r = "", n;
  for (n = 0; n < t; n += 1)
    r += e;
  return r;
}
function ev(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
_e.isNothing = Dl;
_e.isObject = Y_;
_e.toArray = X_;
_e.repeat = Z_;
_e.isNegativeZero = ev;
_e.extend = Q_;
function ql(e, t) {
  var r = "", n = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (r += 'in "' + e.mark.name + '" '), r += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (r += `

` + e.mark.snippet), n + " " + r) : n;
}
function Gt(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = ql(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
Gt.prototype = Object.create(Error.prototype);
Gt.prototype.constructor = Gt;
Gt.prototype.toString = function(t) {
  return this.name + ": " + ql(this, t);
};
var rr = Gt, Mt = _e;
function Hn(e, t, r, n, i) {
  var s = "", o = "", a = Math.floor(i / 2) - 1;
  return n - t > a && (s = " ... ", t = n - a + s.length), r - n > a && (o = " ...", r = n + a - o.length), {
    str: s + e.slice(t, r).replace(/\t/g, "→") + o,
    pos: n - t + s.length
    // relative position
  };
}
function Un(e, t) {
  return Mt.repeat(" ", t - e.length) + e;
}
function tv(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var r = /\r?\n|\r|\0/g, n = [0], i = [], s, o = -1; s = r.exec(e.buffer); )
    i.push(s.index), n.push(s.index + s[0].length), e.position <= s.index && o < 0 && (o = n.length - 2);
  o < 0 && (o = n.length - 1);
  var a = "", l, c, f = Math.min(e.line + t.linesAfter, i.length).toString().length, u = t.maxLength - (t.indent + f + 3);
  for (l = 1; l <= t.linesBefore && !(o - l < 0); l++)
    c = Hn(
      e.buffer,
      n[o - l],
      i[o - l],
      e.position - (n[o] - n[o - l]),
      u
    ), a = Mt.repeat(" ", t.indent) + Un((e.line - l + 1).toString(), f) + " | " + c.str + `
` + a;
  for (c = Hn(e.buffer, n[o], i[o], e.position, u), a += Mt.repeat(" ", t.indent) + Un((e.line + 1).toString(), f) + " | " + c.str + `
`, a += Mt.repeat("-", t.indent + f + 3 + c.pos) + `^
`, l = 1; l <= t.linesAfter && !(o + l >= i.length); l++)
    c = Hn(
      e.buffer,
      n[o + l],
      i[o + l],
      e.position - (n[o] - n[o + l]),
      u
    ), a += Mt.repeat(" ", t.indent) + Un((e.line + l + 1).toString(), f) + " | " + c.str + `
`;
  return a.replace(/\n$/, "");
}
var rv = tv, Vo = rr, nv = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
], iv = [
  "scalar",
  "sequence",
  "mapping"
];
function sv(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(r) {
    e[r].forEach(function(n) {
      t[String(n)] = r;
    });
  }), t;
}
function ov(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(r) {
    if (nv.indexOf(r) === -1)
      throw new Vo('Unknown option "' + r + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(r) {
    return r;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = sv(t.styleAliases || null), iv.indexOf(this.kind) === -1)
    throw new Vo('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var oe = ov, Rt = rr, zn = oe;
function Lo(e, t) {
  var r = [];
  return e[t].forEach(function(n) {
    var i = r.length;
    r.forEach(function(s, o) {
      s.tag === n.tag && s.kind === n.kind && s.multi === n.multi && (i = o);
    }), r[i] = n;
  }), r;
}
function av() {
  var e = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, t, r;
  function n(i) {
    i.multi ? (e.multi[i.kind].push(i), e.multi.fallback.push(i)) : e[i.kind][i.tag] = e.fallback[i.tag] = i;
  }
  for (t = 0, r = arguments.length; t < r; t += 1)
    arguments[t].forEach(n);
  return e;
}
function pi(e) {
  return this.extend(e);
}
pi.prototype.extend = function(t) {
  var r = [], n = [];
  if (t instanceof zn)
    n.push(t);
  else if (Array.isArray(t))
    n = n.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (r = r.concat(t.implicit)), t.explicit && (n = n.concat(t.explicit));
  else
    throw new Rt("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  r.forEach(function(s) {
    if (!(s instanceof zn))
      throw new Rt("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (s.loadKind && s.loadKind !== "scalar")
      throw new Rt("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (s.multi)
      throw new Rt("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), n.forEach(function(s) {
    if (!(s instanceof zn))
      throw new Rt("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var i = Object.create(pi.prototype);
  return i.implicit = (this.implicit || []).concat(r), i.explicit = (this.explicit || []).concat(n), i.compiledImplicit = Lo(i, "implicit"), i.compiledExplicit = Lo(i, "explicit"), i.compiledTypeMap = av(i.compiledImplicit, i.compiledExplicit), i;
};
var Fl = pi, lv = oe, Vl = new lv("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), cv = oe, Ll = new cv("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), uv = oe, Hl = new uv("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), fv = Fl, Ul = new fv({
  explicit: [
    Vl,
    Ll,
    Hl
  ]
}), dv = oe;
function pv(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function hv() {
  return null;
}
function mv(e) {
  return e === null;
}
var zl = new dv("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: pv,
  construct: hv,
  predicate: mv,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
}), yv = oe;
function gv(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function $v(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function _v(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var Gl = new yv("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: gv,
  construct: $v,
  predicate: _v,
  represent: {
    lowercase: function(e) {
      return e ? "true" : "false";
    },
    uppercase: function(e) {
      return e ? "TRUE" : "FALSE";
    },
    camelcase: function(e) {
      return e ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
}), vv = _e, bv = oe;
function wv(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function Pv(e) {
  return 48 <= e && e <= 55;
}
function Ov(e) {
  return 48 <= e && e <= 57;
}
function Ev(e) {
  if (e === null) return !1;
  var t = e.length, r = 0, n = !1, i;
  if (!t) return !1;
  if (i = e[r], (i === "-" || i === "+") && (i = e[++r]), i === "0") {
    if (r + 1 === t) return !0;
    if (i = e[++r], i === "b") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (i !== "0" && i !== "1") return !1;
          n = !0;
        }
      return n && i !== "_";
    }
    if (i === "x") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (!wv(e.charCodeAt(r))) return !1;
          n = !0;
        }
      return n && i !== "_";
    }
    if (i === "o") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (!Pv(e.charCodeAt(r))) return !1;
          n = !0;
        }
      return n && i !== "_";
    }
  }
  if (i === "_") return !1;
  for (; r < t; r++)
    if (i = e[r], i !== "_") {
      if (!Ov(e.charCodeAt(r)))
        return !1;
      n = !0;
    }
  return !(!n || i === "_");
}
function Sv(e) {
  var t = e, r = 1, n;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), n = t[0], (n === "-" || n === "+") && (n === "-" && (r = -1), t = t.slice(1), n = t[0]), t === "0") return 0;
  if (n === "0") {
    if (t[1] === "b") return r * parseInt(t.slice(2), 2);
    if (t[1] === "x") return r * parseInt(t.slice(2), 16);
    if (t[1] === "o") return r * parseInt(t.slice(2), 8);
  }
  return r * parseInt(t, 10);
}
function xv(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !vv.isNegativeZero(e);
}
var Bl = new bv("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: Ev,
  construct: Sv,
  predicate: xv,
  represent: {
    binary: function(e) {
      return e >= 0 ? "0b" + e.toString(2) : "-0b" + e.toString(2).slice(1);
    },
    octal: function(e) {
      return e >= 0 ? "0o" + e.toString(8) : "-0o" + e.toString(8).slice(1);
    },
    decimal: function(e) {
      return e.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(e) {
      return e >= 0 ? "0x" + e.toString(16).toUpperCase() : "-0x" + e.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
}), Kl = _e, jv = oe, Av = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function Cv(e) {
  return !(e === null || !Av.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function Iv(e) {
  var t, r;
  return t = e.replace(/_/g, "").toLowerCase(), r = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? r === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : r * parseFloat(t, 10);
}
var Tv = /^[-+]?[0-9]+e/;
function Rv(e, t) {
  var r;
  if (isNaN(e))
    switch (t) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  else if (Number.POSITIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  else if (Number.NEGATIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  else if (Kl.isNegativeZero(e))
    return "-0.0";
  return r = e.toString(10), Tv.test(r) ? r.replace("e", ".e") : r;
}
function kv(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || Kl.isNegativeZero(e));
}
var Wl = new jv("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: Cv,
  construct: Iv,
  predicate: kv,
  represent: Rv,
  defaultStyle: "lowercase"
}), Jl = Ul.extend({
  implicit: [
    zl,
    Gl,
    Bl,
    Wl
  ]
}), Yl = Jl, Nv = oe, Xl = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), Ql = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function Mv(e) {
  return e === null ? !1 : Xl.exec(e) !== null || Ql.exec(e) !== null;
}
function Dv(e) {
  var t, r, n, i, s, o, a, l = 0, c = null, f, u, h;
  if (t = Xl.exec(e), t === null && (t = Ql.exec(e)), t === null) throw new Error("Date resolve error");
  if (r = +t[1], n = +t[2] - 1, i = +t[3], !t[4])
    return new Date(Date.UTC(r, n, i));
  if (s = +t[4], o = +t[5], a = +t[6], t[7]) {
    for (l = t[7].slice(0, 3); l.length < 3; )
      l += "0";
    l = +l;
  }
  return t[9] && (f = +t[10], u = +(t[11] || 0), c = (f * 60 + u) * 6e4, t[9] === "-" && (c = -c)), h = new Date(Date.UTC(r, n, i, s, o, a, l)), c && h.setTime(h.getTime() - c), h;
}
function qv(e) {
  return e.toISOString();
}
var Zl = new Nv("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: Mv,
  construct: Dv,
  instanceOf: Date,
  represent: qv
}), Fv = oe;
function Vv(e) {
  return e === "<<" || e === null;
}
var ec = new Fv("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: Vv
}), Lv = oe, Es = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function Hv(e) {
  if (e === null) return !1;
  var t, r, n = 0, i = e.length, s = Es;
  for (r = 0; r < i; r++)
    if (t = s.indexOf(e.charAt(r)), !(t > 64)) {
      if (t < 0) return !1;
      n += 6;
    }
  return n % 8 === 0;
}
function Uv(e) {
  var t, r, n = e.replace(/[\r\n=]/g, ""), i = n.length, s = Es, o = 0, a = [];
  for (t = 0; t < i; t++)
    t % 4 === 0 && t && (a.push(o >> 16 & 255), a.push(o >> 8 & 255), a.push(o & 255)), o = o << 6 | s.indexOf(n.charAt(t));
  return r = i % 4 * 6, r === 0 ? (a.push(o >> 16 & 255), a.push(o >> 8 & 255), a.push(o & 255)) : r === 18 ? (a.push(o >> 10 & 255), a.push(o >> 2 & 255)) : r === 12 && a.push(o >> 4 & 255), new Uint8Array(a);
}
function zv(e) {
  var t = "", r = 0, n, i, s = e.length, o = Es;
  for (n = 0; n < s; n++)
    n % 3 === 0 && n && (t += o[r >> 18 & 63], t += o[r >> 12 & 63], t += o[r >> 6 & 63], t += o[r & 63]), r = (r << 8) + e[n];
  return i = s % 3, i === 0 ? (t += o[r >> 18 & 63], t += o[r >> 12 & 63], t += o[r >> 6 & 63], t += o[r & 63]) : i === 2 ? (t += o[r >> 10 & 63], t += o[r >> 4 & 63], t += o[r << 2 & 63], t += o[64]) : i === 1 && (t += o[r >> 2 & 63], t += o[r << 4 & 63], t += o[64], t += o[64]), t;
}
function Gv(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var tc = new Lv("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: Hv,
  construct: Uv,
  predicate: Gv,
  represent: zv
}), Bv = oe, Kv = Object.prototype.hasOwnProperty, Wv = Object.prototype.toString;
function Jv(e) {
  if (e === null) return !0;
  var t = [], r, n, i, s, o, a = e;
  for (r = 0, n = a.length; r < n; r += 1) {
    if (i = a[r], o = !1, Wv.call(i) !== "[object Object]") return !1;
    for (s in i)
      if (Kv.call(i, s))
        if (!o) o = !0;
        else return !1;
    if (!o) return !1;
    if (t.indexOf(s) === -1) t.push(s);
    else return !1;
  }
  return !0;
}
function Yv(e) {
  return e !== null ? e : [];
}
var rc = new Bv("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: Jv,
  construct: Yv
}), Xv = oe, Qv = Object.prototype.toString;
function Zv(e) {
  if (e === null) return !0;
  var t, r, n, i, s, o = e;
  for (s = new Array(o.length), t = 0, r = o.length; t < r; t += 1) {
    if (n = o[t], Qv.call(n) !== "[object Object]" || (i = Object.keys(n), i.length !== 1)) return !1;
    s[t] = [i[0], n[i[0]]];
  }
  return !0;
}
function e0(e) {
  if (e === null) return [];
  var t, r, n, i, s, o = e;
  for (s = new Array(o.length), t = 0, r = o.length; t < r; t += 1)
    n = o[t], i = Object.keys(n), s[t] = [i[0], n[i[0]]];
  return s;
}
var nc = new Xv("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: Zv,
  construct: e0
}), t0 = oe, r0 = Object.prototype.hasOwnProperty;
function n0(e) {
  if (e === null) return !0;
  var t, r = e;
  for (t in r)
    if (r0.call(r, t) && r[t] !== null)
      return !1;
  return !0;
}
function i0(e) {
  return e !== null ? e : {};
}
var ic = new t0("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: n0,
  construct: i0
}), Ss = Yl.extend({
  implicit: [
    Zl,
    ec
  ],
  explicit: [
    tc,
    rc,
    nc,
    ic
  ]
}), Ze = _e, sc = rr, s0 = rv, o0 = Ss, Be = Object.prototype.hasOwnProperty, Ir = 1, oc = 2, ac = 3, Tr = 4, Gn = 1, a0 = 2, Ho = 3, l0 = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, c0 = /[\x85\u2028\u2029]/, u0 = /[,\[\]\{\}]/, lc = /^(?:!|!!|![a-z\-]+!)$/i, cc = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function Uo(e) {
  return Object.prototype.toString.call(e);
}
function Oe(e) {
  return e === 10 || e === 13;
}
function tt(e) {
  return e === 9 || e === 32;
}
function le(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function pt(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function f0(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function d0(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function p0(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function zo(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function h0(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
var uc = new Array(256), fc = new Array(256);
for (var ct = 0; ct < 256; ct++)
  uc[ct] = zo(ct) ? 1 : 0, fc[ct] = zo(ct);
function m0(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || o0, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function dc(e, t) {
  var r = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return r.snippet = s0(r), new sc(t, r);
}
function k(e, t) {
  throw dc(e, t);
}
function Rr(e, t) {
  e.onWarning && e.onWarning.call(null, dc(e, t));
}
var Go = {
  YAML: function(t, r, n) {
    var i, s, o;
    t.version !== null && k(t, "duplication of %YAML directive"), n.length !== 1 && k(t, "YAML directive accepts exactly one argument"), i = /^([0-9]+)\.([0-9]+)$/.exec(n[0]), i === null && k(t, "ill-formed argument of the YAML directive"), s = parseInt(i[1], 10), o = parseInt(i[2], 10), s !== 1 && k(t, "unacceptable YAML version of the document"), t.version = n[0], t.checkLineBreaks = o < 2, o !== 1 && o !== 2 && Rr(t, "unsupported YAML version of the document");
  },
  TAG: function(t, r, n) {
    var i, s;
    n.length !== 2 && k(t, "TAG directive accepts exactly two arguments"), i = n[0], s = n[1], lc.test(i) || k(t, "ill-formed tag handle (first argument) of the TAG directive"), Be.call(t.tagMap, i) && k(t, 'there is a previously declared suffix for "' + i + '" tag handle'), cc.test(s) || k(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      s = decodeURIComponent(s);
    } catch {
      k(t, "tag prefix is malformed: " + s);
    }
    t.tagMap[i] = s;
  }
};
function Ge(e, t, r, n) {
  var i, s, o, a;
  if (t < r) {
    if (a = e.input.slice(t, r), n)
      for (i = 0, s = a.length; i < s; i += 1)
        o = a.charCodeAt(i), o === 9 || 32 <= o && o <= 1114111 || k(e, "expected valid JSON character");
    else l0.test(a) && k(e, "the stream contains non-printable characters");
    e.result += a;
  }
}
function Bo(e, t, r, n) {
  var i, s, o, a;
  for (Ze.isObject(r) || k(e, "cannot merge mappings; the provided source object is unacceptable"), i = Object.keys(r), o = 0, a = i.length; o < a; o += 1)
    s = i[o], Be.call(t, s) || (t[s] = r[s], n[s] = !0);
}
function ht(e, t, r, n, i, s, o, a, l) {
  var c, f;
  if (Array.isArray(i))
    for (i = Array.prototype.slice.call(i), c = 0, f = i.length; c < f; c += 1)
      Array.isArray(i[c]) && k(e, "nested arrays are not supported inside keys"), typeof i == "object" && Uo(i[c]) === "[object Object]" && (i[c] = "[object Object]");
  if (typeof i == "object" && Uo(i) === "[object Object]" && (i = "[object Object]"), i = String(i), t === null && (t = {}), n === "tag:yaml.org,2002:merge")
    if (Array.isArray(s))
      for (c = 0, f = s.length; c < f; c += 1)
        Bo(e, t, s[c], r);
    else
      Bo(e, t, s, r);
  else
    !e.json && !Be.call(r, i) && Be.call(t, i) && (e.line = o || e.line, e.lineStart = a || e.lineStart, e.position = l || e.position, k(e, "duplicated mapping key")), i === "__proto__" ? Object.defineProperty(t, i, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: s
    }) : t[i] = s, delete r[i];
  return t;
}
function xs(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : k(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function J(e, t, r) {
  for (var n = 0, i = e.input.charCodeAt(e.position); i !== 0; ) {
    for (; tt(i); )
      i === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), i = e.input.charCodeAt(++e.position);
    if (t && i === 35)
      do
        i = e.input.charCodeAt(++e.position);
      while (i !== 10 && i !== 13 && i !== 0);
    if (Oe(i))
      for (xs(e), i = e.input.charCodeAt(e.position), n++, e.lineIndent = 0; i === 32; )
        e.lineIndent++, i = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return r !== -1 && n !== 0 && e.lineIndent < r && Rr(e, "deficient indentation"), n;
}
function dn(e) {
  var t = e.position, r;
  return r = e.input.charCodeAt(t), !!((r === 45 || r === 46) && r === e.input.charCodeAt(t + 1) && r === e.input.charCodeAt(t + 2) && (t += 3, r = e.input.charCodeAt(t), r === 0 || le(r)));
}
function js(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += Ze.repeat(`
`, t - 1));
}
function y0(e, t, r) {
  var n, i, s, o, a, l, c, f, u = e.kind, h = e.result, y;
  if (y = e.input.charCodeAt(e.position), le(y) || pt(y) || y === 35 || y === 38 || y === 42 || y === 33 || y === 124 || y === 62 || y === 39 || y === 34 || y === 37 || y === 64 || y === 96 || (y === 63 || y === 45) && (i = e.input.charCodeAt(e.position + 1), le(i) || r && pt(i)))
    return !1;
  for (e.kind = "scalar", e.result = "", s = o = e.position, a = !1; y !== 0; ) {
    if (y === 58) {
      if (i = e.input.charCodeAt(e.position + 1), le(i) || r && pt(i))
        break;
    } else if (y === 35) {
      if (n = e.input.charCodeAt(e.position - 1), le(n))
        break;
    } else {
      if (e.position === e.lineStart && dn(e) || r && pt(y))
        break;
      if (Oe(y))
        if (l = e.line, c = e.lineStart, f = e.lineIndent, J(e, !1, -1), e.lineIndent >= t) {
          a = !0, y = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = o, e.line = l, e.lineStart = c, e.lineIndent = f;
          break;
        }
    }
    a && (Ge(e, s, o, !1), js(e, e.line - l), s = o = e.position, a = !1), tt(y) || (o = e.position + 1), y = e.input.charCodeAt(++e.position);
  }
  return Ge(e, s, o, !1), e.result ? !0 : (e.kind = u, e.result = h, !1);
}
function g0(e, t) {
  var r, n, i;
  if (r = e.input.charCodeAt(e.position), r !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = i = e.position; (r = e.input.charCodeAt(e.position)) !== 0; )
    if (r === 39)
      if (Ge(e, n, e.position, !0), r = e.input.charCodeAt(++e.position), r === 39)
        n = e.position, e.position++, i = e.position;
      else
        return !0;
    else Oe(r) ? (Ge(e, n, i, !0), js(e, J(e, !1, t)), n = i = e.position) : e.position === e.lineStart && dn(e) ? k(e, "unexpected end of the document within a single quoted scalar") : (e.position++, i = e.position);
  k(e, "unexpected end of the stream within a single quoted scalar");
}
function $0(e, t) {
  var r, n, i, s, o, a;
  if (a = e.input.charCodeAt(e.position), a !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, r = n = e.position; (a = e.input.charCodeAt(e.position)) !== 0; ) {
    if (a === 34)
      return Ge(e, r, e.position, !0), e.position++, !0;
    if (a === 92) {
      if (Ge(e, r, e.position, !0), a = e.input.charCodeAt(++e.position), Oe(a))
        J(e, !1, t);
      else if (a < 256 && uc[a])
        e.result += fc[a], e.position++;
      else if ((o = d0(a)) > 0) {
        for (i = o, s = 0; i > 0; i--)
          a = e.input.charCodeAt(++e.position), (o = f0(a)) >= 0 ? s = (s << 4) + o : k(e, "expected hexadecimal character");
        e.result += h0(s), e.position++;
      } else
        k(e, "unknown escape sequence");
      r = n = e.position;
    } else Oe(a) ? (Ge(e, r, n, !0), js(e, J(e, !1, t)), r = n = e.position) : e.position === e.lineStart && dn(e) ? k(e, "unexpected end of the document within a double quoted scalar") : (e.position++, n = e.position);
  }
  k(e, "unexpected end of the stream within a double quoted scalar");
}
function _0(e, t) {
  var r = !0, n, i, s, o = e.tag, a, l = e.anchor, c, f, u, h, y, _ = /* @__PURE__ */ Object.create(null), b, v, p, m;
  if (m = e.input.charCodeAt(e.position), m === 91)
    f = 93, y = !1, a = [];
  else if (m === 123)
    f = 125, y = !0, a = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = a), m = e.input.charCodeAt(++e.position); m !== 0; ) {
    if (J(e, !0, t), m = e.input.charCodeAt(e.position), m === f)
      return e.position++, e.tag = o, e.anchor = l, e.kind = y ? "mapping" : "sequence", e.result = a, !0;
    r ? m === 44 && k(e, "expected the node content, but found ','") : k(e, "missed comma between flow collection entries"), v = b = p = null, u = h = !1, m === 63 && (c = e.input.charCodeAt(e.position + 1), le(c) && (u = h = !0, e.position++, J(e, !0, t))), n = e.line, i = e.lineStart, s = e.position, vt(e, t, Ir, !1, !0), v = e.tag, b = e.result, J(e, !0, t), m = e.input.charCodeAt(e.position), (h || e.line === n) && m === 58 && (u = !0, m = e.input.charCodeAt(++e.position), J(e, !0, t), vt(e, t, Ir, !1, !0), p = e.result), y ? ht(e, a, _, v, b, p, n, i, s) : u ? a.push(ht(e, null, _, v, b, p, n, i, s)) : a.push(b), J(e, !0, t), m = e.input.charCodeAt(e.position), m === 44 ? (r = !0, m = e.input.charCodeAt(++e.position)) : r = !1;
  }
  k(e, "unexpected end of the stream within a flow collection");
}
function v0(e, t) {
  var r, n, i = Gn, s = !1, o = !1, a = t, l = 0, c = !1, f, u;
  if (u = e.input.charCodeAt(e.position), u === 124)
    n = !1;
  else if (u === 62)
    n = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; u !== 0; )
    if (u = e.input.charCodeAt(++e.position), u === 43 || u === 45)
      Gn === i ? i = u === 43 ? Ho : a0 : k(e, "repeat of a chomping mode identifier");
    else if ((f = p0(u)) >= 0)
      f === 0 ? k(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : o ? k(e, "repeat of an indentation width identifier") : (a = t + f - 1, o = !0);
    else
      break;
  if (tt(u)) {
    do
      u = e.input.charCodeAt(++e.position);
    while (tt(u));
    if (u === 35)
      do
        u = e.input.charCodeAt(++e.position);
      while (!Oe(u) && u !== 0);
  }
  for (; u !== 0; ) {
    for (xs(e), e.lineIndent = 0, u = e.input.charCodeAt(e.position); (!o || e.lineIndent < a) && u === 32; )
      e.lineIndent++, u = e.input.charCodeAt(++e.position);
    if (!o && e.lineIndent > a && (a = e.lineIndent), Oe(u)) {
      l++;
      continue;
    }
    if (e.lineIndent < a) {
      i === Ho ? e.result += Ze.repeat(`
`, s ? 1 + l : l) : i === Gn && s && (e.result += `
`);
      break;
    }
    for (n ? tt(u) ? (c = !0, e.result += Ze.repeat(`
`, s ? 1 + l : l)) : c ? (c = !1, e.result += Ze.repeat(`
`, l + 1)) : l === 0 ? s && (e.result += " ") : e.result += Ze.repeat(`
`, l) : e.result += Ze.repeat(`
`, s ? 1 + l : l), s = !0, o = !0, l = 0, r = e.position; !Oe(u) && u !== 0; )
      u = e.input.charCodeAt(++e.position);
    Ge(e, r, e.position, !1);
  }
  return !0;
}
function Ko(e, t) {
  var r, n = e.tag, i = e.anchor, s = [], o, a = !1, l;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), l = e.input.charCodeAt(e.position); l !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, k(e, "tab characters must not be used in indentation")), !(l !== 45 || (o = e.input.charCodeAt(e.position + 1), !le(o)))); ) {
    if (a = !0, e.position++, J(e, !0, -1) && e.lineIndent <= t) {
      s.push(null), l = e.input.charCodeAt(e.position);
      continue;
    }
    if (r = e.line, vt(e, t, ac, !1, !0), s.push(e.result), J(e, !0, -1), l = e.input.charCodeAt(e.position), (e.line === r || e.lineIndent > t) && l !== 0)
      k(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return a ? (e.tag = n, e.anchor = i, e.kind = "sequence", e.result = s, !0) : !1;
}
function b0(e, t, r) {
  var n, i, s, o, a, l, c = e.tag, f = e.anchor, u = {}, h = /* @__PURE__ */ Object.create(null), y = null, _ = null, b = null, v = !1, p = !1, m;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = u), m = e.input.charCodeAt(e.position); m !== 0; ) {
    if (!v && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, k(e, "tab characters must not be used in indentation")), n = e.input.charCodeAt(e.position + 1), s = e.line, (m === 63 || m === 58) && le(n))
      m === 63 ? (v && (ht(e, u, h, y, _, null, o, a, l), y = _ = b = null), p = !0, v = !0, i = !0) : v ? (v = !1, i = !0) : k(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, m = n;
    else {
      if (o = e.line, a = e.lineStart, l = e.position, !vt(e, r, oc, !1, !0))
        break;
      if (e.line === s) {
        for (m = e.input.charCodeAt(e.position); tt(m); )
          m = e.input.charCodeAt(++e.position);
        if (m === 58)
          m = e.input.charCodeAt(++e.position), le(m) || k(e, "a whitespace character is expected after the key-value separator within a block mapping"), v && (ht(e, u, h, y, _, null, o, a, l), y = _ = b = null), p = !0, v = !1, i = !1, y = e.tag, _ = e.result;
        else if (p)
          k(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = c, e.anchor = f, !0;
      } else if (p)
        k(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = c, e.anchor = f, !0;
    }
    if ((e.line === s || e.lineIndent > t) && (v && (o = e.line, a = e.lineStart, l = e.position), vt(e, t, Tr, !0, i) && (v ? _ = e.result : b = e.result), v || (ht(e, u, h, y, _, b, o, a, l), y = _ = b = null), J(e, !0, -1), m = e.input.charCodeAt(e.position)), (e.line === s || e.lineIndent > t) && m !== 0)
      k(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return v && ht(e, u, h, y, _, null, o, a, l), p && (e.tag = c, e.anchor = f, e.kind = "mapping", e.result = u), p;
}
function w0(e) {
  var t, r = !1, n = !1, i, s, o;
  if (o = e.input.charCodeAt(e.position), o !== 33) return !1;
  if (e.tag !== null && k(e, "duplication of a tag property"), o = e.input.charCodeAt(++e.position), o === 60 ? (r = !0, o = e.input.charCodeAt(++e.position)) : o === 33 ? (n = !0, i = "!!", o = e.input.charCodeAt(++e.position)) : i = "!", t = e.position, r) {
    do
      o = e.input.charCodeAt(++e.position);
    while (o !== 0 && o !== 62);
    e.position < e.length ? (s = e.input.slice(t, e.position), o = e.input.charCodeAt(++e.position)) : k(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; o !== 0 && !le(o); )
      o === 33 && (n ? k(e, "tag suffix cannot contain exclamation marks") : (i = e.input.slice(t - 1, e.position + 1), lc.test(i) || k(e, "named tag handle cannot contain such characters"), n = !0, t = e.position + 1)), o = e.input.charCodeAt(++e.position);
    s = e.input.slice(t, e.position), u0.test(s) && k(e, "tag suffix cannot contain flow indicator characters");
  }
  s && !cc.test(s) && k(e, "tag name cannot contain such characters: " + s);
  try {
    s = decodeURIComponent(s);
  } catch {
    k(e, "tag name is malformed: " + s);
  }
  return r ? e.tag = s : Be.call(e.tagMap, i) ? e.tag = e.tagMap[i] + s : i === "!" ? e.tag = "!" + s : i === "!!" ? e.tag = "tag:yaml.org,2002:" + s : k(e, 'undeclared tag handle "' + i + '"'), !0;
}
function P0(e) {
  var t, r;
  if (r = e.input.charCodeAt(e.position), r !== 38) return !1;
  for (e.anchor !== null && k(e, "duplication of an anchor property"), r = e.input.charCodeAt(++e.position), t = e.position; r !== 0 && !le(r) && !pt(r); )
    r = e.input.charCodeAt(++e.position);
  return e.position === t && k(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function O0(e) {
  var t, r, n;
  if (n = e.input.charCodeAt(e.position), n !== 42) return !1;
  for (n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !le(n) && !pt(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && k(e, "name of an alias node must contain at least one character"), r = e.input.slice(t, e.position), Be.call(e.anchorMap, r) || k(e, 'unidentified alias "' + r + '"'), e.result = e.anchorMap[r], J(e, !0, -1), !0;
}
function vt(e, t, r, n, i) {
  var s, o, a, l = 1, c = !1, f = !1, u, h, y, _, b, v;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, s = o = a = Tr === r || ac === r, n && J(e, !0, -1) && (c = !0, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)), l === 1)
    for (; w0(e) || P0(e); )
      J(e, !0, -1) ? (c = !0, a = s, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)) : a = !1;
  if (a && (a = c || i), (l === 1 || Tr === r) && (Ir === r || oc === r ? b = t : b = t + 1, v = e.position - e.lineStart, l === 1 ? a && (Ko(e, v) || b0(e, v, b)) || _0(e, b) ? f = !0 : (o && v0(e, b) || g0(e, b) || $0(e, b) ? f = !0 : O0(e) ? (f = !0, (e.tag !== null || e.anchor !== null) && k(e, "alias node should not have any properties")) : y0(e, b, Ir === r) && (f = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : l === 0 && (f = a && Ko(e, v))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && k(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), u = 0, h = e.implicitTypes.length; u < h; u += 1)
      if (_ = e.implicitTypes[u], _.resolve(e.result)) {
        e.result = _.construct(e.result), e.tag = _.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (Be.call(e.typeMap[e.kind || "fallback"], e.tag))
      _ = e.typeMap[e.kind || "fallback"][e.tag];
    else
      for (_ = null, y = e.typeMap.multi[e.kind || "fallback"], u = 0, h = y.length; u < h; u += 1)
        if (e.tag.slice(0, y[u].tag.length) === y[u].tag) {
          _ = y[u];
          break;
        }
    _ || k(e, "unknown tag !<" + e.tag + ">"), e.result !== null && _.kind !== e.kind && k(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + _.kind + '", not "' + e.kind + '"'), _.resolve(e.result, e.tag) ? (e.result = _.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : k(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || f;
}
function E0(e) {
  var t = e.position, r, n, i, s = !1, o;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (o = e.input.charCodeAt(e.position)) !== 0 && (J(e, !0, -1), o = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || o !== 37)); ) {
    for (s = !0, o = e.input.charCodeAt(++e.position), r = e.position; o !== 0 && !le(o); )
      o = e.input.charCodeAt(++e.position);
    for (n = e.input.slice(r, e.position), i = [], n.length < 1 && k(e, "directive name must not be less than one character in length"); o !== 0; ) {
      for (; tt(o); )
        o = e.input.charCodeAt(++e.position);
      if (o === 35) {
        do
          o = e.input.charCodeAt(++e.position);
        while (o !== 0 && !Oe(o));
        break;
      }
      if (Oe(o)) break;
      for (r = e.position; o !== 0 && !le(o); )
        o = e.input.charCodeAt(++e.position);
      i.push(e.input.slice(r, e.position));
    }
    o !== 0 && xs(e), Be.call(Go, n) ? Go[n](e, n, i) : Rr(e, 'unknown document directive "' + n + '"');
  }
  if (J(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, J(e, !0, -1)) : s && k(e, "directives end mark is expected"), vt(e, e.lineIndent - 1, Tr, !1, !0), J(e, !0, -1), e.checkLineBreaks && c0.test(e.input.slice(t, e.position)) && Rr(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && dn(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, J(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    k(e, "end of the stream or a document separator is expected");
  else
    return;
}
function pc(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var r = new m0(e, t), n = e.indexOf("\0");
  for (n !== -1 && (r.position = n, k(r, "null byte is not allowed in input")), r.input += "\0"; r.input.charCodeAt(r.position) === 32; )
    r.lineIndent += 1, r.position += 1;
  for (; r.position < r.length - 1; )
    E0(r);
  return r.documents;
}
function S0(e, t, r) {
  t !== null && typeof t == "object" && typeof r > "u" && (r = t, t = null);
  var n = pc(e, r);
  if (typeof t != "function")
    return n;
  for (var i = 0, s = n.length; i < s; i += 1)
    t(n[i]);
}
function x0(e, t) {
  var r = pc(e, t);
  if (r.length !== 0) {
    if (r.length === 1)
      return r[0];
    throw new sc("expected a single document in the stream, but found more");
  }
}
Os.loadAll = S0;
Os.load = x0;
var hc = {}, pn = _e, nr = rr, j0 = Ss, mc = Object.prototype.toString, yc = Object.prototype.hasOwnProperty, As = 65279, A0 = 9, Bt = 10, C0 = 13, I0 = 32, T0 = 33, R0 = 34, hi = 35, k0 = 37, N0 = 38, M0 = 39, D0 = 42, gc = 44, q0 = 45, kr = 58, F0 = 61, V0 = 62, L0 = 63, H0 = 64, $c = 91, _c = 93, U0 = 96, vc = 123, z0 = 124, bc = 125, ne = {};
ne[0] = "\\0";
ne[7] = "\\a";
ne[8] = "\\b";
ne[9] = "\\t";
ne[10] = "\\n";
ne[11] = "\\v";
ne[12] = "\\f";
ne[13] = "\\r";
ne[27] = "\\e";
ne[34] = '\\"';
ne[92] = "\\\\";
ne[133] = "\\N";
ne[160] = "\\_";
ne[8232] = "\\L";
ne[8233] = "\\P";
var G0 = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
], B0 = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function K0(e, t) {
  var r, n, i, s, o, a, l;
  if (t === null) return {};
  for (r = {}, n = Object.keys(t), i = 0, s = n.length; i < s; i += 1)
    o = n[i], a = String(t[o]), o.slice(0, 2) === "!!" && (o = "tag:yaml.org,2002:" + o.slice(2)), l = e.compiledTypeMap.fallback[o], l && yc.call(l.styleAliases, a) && (a = l.styleAliases[a]), r[o] = a;
  return r;
}
function W0(e) {
  var t, r, n;
  if (t = e.toString(16).toUpperCase(), e <= 255)
    r = "x", n = 2;
  else if (e <= 65535)
    r = "u", n = 4;
  else if (e <= 4294967295)
    r = "U", n = 8;
  else
    throw new nr("code point within a string may not be greater than 0xFFFFFFFF");
  return "\\" + r + pn.repeat("0", n - t.length) + t;
}
var J0 = 1, Kt = 2;
function Y0(e) {
  this.schema = e.schema || j0, this.indent = Math.max(1, e.indent || 2), this.noArrayIndent = e.noArrayIndent || !1, this.skipInvalid = e.skipInvalid || !1, this.flowLevel = pn.isNothing(e.flowLevel) ? -1 : e.flowLevel, this.styleMap = K0(this.schema, e.styles || null), this.sortKeys = e.sortKeys || !1, this.lineWidth = e.lineWidth || 80, this.noRefs = e.noRefs || !1, this.noCompatMode = e.noCompatMode || !1, this.condenseFlow = e.condenseFlow || !1, this.quotingType = e.quotingType === '"' ? Kt : J0, this.forceQuotes = e.forceQuotes || !1, this.replacer = typeof e.replacer == "function" ? e.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
}
function Wo(e, t) {
  for (var r = pn.repeat(" ", t), n = 0, i = -1, s = "", o, a = e.length; n < a; )
    i = e.indexOf(`
`, n), i === -1 ? (o = e.slice(n), n = a) : (o = e.slice(n, i + 1), n = i + 1), o.length && o !== `
` && (s += r), s += o;
  return s;
}
function mi(e, t) {
  return `
` + pn.repeat(" ", e.indent * t);
}
function X0(e, t) {
  var r, n, i;
  for (r = 0, n = e.implicitTypes.length; r < n; r += 1)
    if (i = e.implicitTypes[r], i.resolve(t))
      return !0;
  return !1;
}
function Nr(e) {
  return e === I0 || e === A0;
}
function Wt(e) {
  return 32 <= e && e <= 126 || 161 <= e && e <= 55295 && e !== 8232 && e !== 8233 || 57344 <= e && e <= 65533 && e !== As || 65536 <= e && e <= 1114111;
}
function Jo(e) {
  return Wt(e) && e !== As && e !== C0 && e !== Bt;
}
function Yo(e, t, r) {
  var n = Jo(e), i = n && !Nr(e);
  return (
    // ns-plain-safe
    (r ? (
      // c = flow-in
      n
    ) : n && e !== gc && e !== $c && e !== _c && e !== vc && e !== bc) && e !== hi && !(t === kr && !i) || Jo(t) && !Nr(t) && e === hi || t === kr && i
  );
}
function Q0(e) {
  return Wt(e) && e !== As && !Nr(e) && e !== q0 && e !== L0 && e !== kr && e !== gc && e !== $c && e !== _c && e !== vc && e !== bc && e !== hi && e !== N0 && e !== D0 && e !== T0 && e !== z0 && e !== F0 && e !== V0 && e !== M0 && e !== R0 && e !== k0 && e !== H0 && e !== U0;
}
function Z0(e) {
  return !Nr(e) && e !== kr;
}
function Dt(e, t) {
  var r = e.charCodeAt(t), n;
  return r >= 55296 && r <= 56319 && t + 1 < e.length && (n = e.charCodeAt(t + 1), n >= 56320 && n <= 57343) ? (r - 55296) * 1024 + n - 56320 + 65536 : r;
}
function wc(e) {
  var t = /^\n* /;
  return t.test(e);
}
var Pc = 1, yi = 2, Oc = 3, Ec = 4, dt = 5;
function eb(e, t, r, n, i, s, o, a) {
  var l, c = 0, f = null, u = !1, h = !1, y = n !== -1, _ = -1, b = Q0(Dt(e, 0)) && Z0(Dt(e, e.length - 1));
  if (t || o)
    for (l = 0; l < e.length; c >= 65536 ? l += 2 : l++) {
      if (c = Dt(e, l), !Wt(c))
        return dt;
      b = b && Yo(c, f, a), f = c;
    }
  else {
    for (l = 0; l < e.length; c >= 65536 ? l += 2 : l++) {
      if (c = Dt(e, l), c === Bt)
        u = !0, y && (h = h || // Foldable line = too long, and not more-indented.
        l - _ - 1 > n && e[_ + 1] !== " ", _ = l);
      else if (!Wt(c))
        return dt;
      b = b && Yo(c, f, a), f = c;
    }
    h = h || y && l - _ - 1 > n && e[_ + 1] !== " ";
  }
  return !u && !h ? b && !o && !i(e) ? Pc : s === Kt ? dt : yi : r > 9 && wc(e) ? dt : o ? s === Kt ? dt : yi : h ? Ec : Oc;
}
function tb(e, t, r, n, i) {
  e.dump = function() {
    if (t.length === 0)
      return e.quotingType === Kt ? '""' : "''";
    if (!e.noCompatMode && (G0.indexOf(t) !== -1 || B0.test(t)))
      return e.quotingType === Kt ? '"' + t + '"' : "'" + t + "'";
    var s = e.indent * Math.max(1, r), o = e.lineWidth === -1 ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - s), a = n || e.flowLevel > -1 && r >= e.flowLevel;
    function l(c) {
      return X0(e, c);
    }
    switch (eb(
      t,
      a,
      e.indent,
      o,
      l,
      e.quotingType,
      e.forceQuotes && !n,
      i
    )) {
      case Pc:
        return t;
      case yi:
        return "'" + t.replace(/'/g, "''") + "'";
      case Oc:
        return "|" + Xo(t, e.indent) + Qo(Wo(t, s));
      case Ec:
        return ">" + Xo(t, e.indent) + Qo(Wo(rb(t, o), s));
      case dt:
        return '"' + nb(t) + '"';
      default:
        throw new nr("impossible error: invalid scalar style");
    }
  }();
}
function Xo(e, t) {
  var r = wc(e) ? String(t) : "", n = e[e.length - 1] === `
`, i = n && (e[e.length - 2] === `
` || e === `
`), s = i ? "+" : n ? "" : "-";
  return r + s + `
`;
}
function Qo(e) {
  return e[e.length - 1] === `
` ? e.slice(0, -1) : e;
}
function rb(e, t) {
  for (var r = /(\n+)([^\n]*)/g, n = function() {
    var c = e.indexOf(`
`);
    return c = c !== -1 ? c : e.length, r.lastIndex = c, Zo(e.slice(0, c), t);
  }(), i = e[0] === `
` || e[0] === " ", s, o; o = r.exec(e); ) {
    var a = o[1], l = o[2];
    s = l[0] === " ", n += a + (!i && !s && l !== "" ? `
` : "") + Zo(l, t), i = s;
  }
  return n;
}
function Zo(e, t) {
  if (e === "" || e[0] === " ") return e;
  for (var r = / [^ ]/g, n, i = 0, s, o = 0, a = 0, l = ""; n = r.exec(e); )
    a = n.index, a - i > t && (s = o > i ? o : a, l += `
` + e.slice(i, s), i = s + 1), o = a;
  return l += `
`, e.length - i > t && o > i ? l += e.slice(i, o) + `
` + e.slice(o + 1) : l += e.slice(i), l.slice(1);
}
function nb(e) {
  for (var t = "", r = 0, n, i = 0; i < e.length; r >= 65536 ? i += 2 : i++)
    r = Dt(e, i), n = ne[r], !n && Wt(r) ? (t += e[i], r >= 65536 && (t += e[i + 1])) : t += n || W0(r);
  return t;
}
function ib(e, t, r) {
  var n = "", i = e.tag, s, o, a;
  for (s = 0, o = r.length; s < o; s += 1)
    a = r[s], e.replacer && (a = e.replacer.call(r, String(s), a)), (ke(e, t, a, !1, !1) || typeof a > "u" && ke(e, t, null, !1, !1)) && (n !== "" && (n += "," + (e.condenseFlow ? "" : " ")), n += e.dump);
  e.tag = i, e.dump = "[" + n + "]";
}
function ea(e, t, r, n) {
  var i = "", s = e.tag, o, a, l;
  for (o = 0, a = r.length; o < a; o += 1)
    l = r[o], e.replacer && (l = e.replacer.call(r, String(o), l)), (ke(e, t + 1, l, !0, !0, !1, !0) || typeof l > "u" && ke(e, t + 1, null, !0, !0, !1, !0)) && ((!n || i !== "") && (i += mi(e, t)), e.dump && Bt === e.dump.charCodeAt(0) ? i += "-" : i += "- ", i += e.dump);
  e.tag = s, e.dump = i || "[]";
}
function sb(e, t, r) {
  var n = "", i = e.tag, s = Object.keys(r), o, a, l, c, f;
  for (o = 0, a = s.length; o < a; o += 1)
    f = "", n !== "" && (f += ", "), e.condenseFlow && (f += '"'), l = s[o], c = r[l], e.replacer && (c = e.replacer.call(r, l, c)), ke(e, t, l, !1, !1) && (e.dump.length > 1024 && (f += "? "), f += e.dump + (e.condenseFlow ? '"' : "") + ":" + (e.condenseFlow ? "" : " "), ke(e, t, c, !1, !1) && (f += e.dump, n += f));
  e.tag = i, e.dump = "{" + n + "}";
}
function ob(e, t, r, n) {
  var i = "", s = e.tag, o = Object.keys(r), a, l, c, f, u, h;
  if (e.sortKeys === !0)
    o.sort();
  else if (typeof e.sortKeys == "function")
    o.sort(e.sortKeys);
  else if (e.sortKeys)
    throw new nr("sortKeys must be a boolean or a function");
  for (a = 0, l = o.length; a < l; a += 1)
    h = "", (!n || i !== "") && (h += mi(e, t)), c = o[a], f = r[c], e.replacer && (f = e.replacer.call(r, c, f)), ke(e, t + 1, c, !0, !0, !0) && (u = e.tag !== null && e.tag !== "?" || e.dump && e.dump.length > 1024, u && (e.dump && Bt === e.dump.charCodeAt(0) ? h += "?" : h += "? "), h += e.dump, u && (h += mi(e, t)), ke(e, t + 1, f, !0, u) && (e.dump && Bt === e.dump.charCodeAt(0) ? h += ":" : h += ": ", h += e.dump, i += h));
  e.tag = s, e.dump = i || "{}";
}
function ta(e, t, r) {
  var n, i, s, o, a, l;
  for (i = r ? e.explicitTypes : e.implicitTypes, s = 0, o = i.length; s < o; s += 1)
    if (a = i[s], (a.instanceOf || a.predicate) && (!a.instanceOf || typeof t == "object" && t instanceof a.instanceOf) && (!a.predicate || a.predicate(t))) {
      if (r ? a.multi && a.representName ? e.tag = a.representName(t) : e.tag = a.tag : e.tag = "?", a.represent) {
        if (l = e.styleMap[a.tag] || a.defaultStyle, mc.call(a.represent) === "[object Function]")
          n = a.represent(t, l);
        else if (yc.call(a.represent, l))
          n = a.represent[l](t, l);
        else
          throw new nr("!<" + a.tag + '> tag resolver accepts not "' + l + '" style');
        e.dump = n;
      }
      return !0;
    }
  return !1;
}
function ke(e, t, r, n, i, s, o) {
  e.tag = null, e.dump = r, ta(e, r, !1) || ta(e, r, !0);
  var a = mc.call(e.dump), l = n, c;
  n && (n = e.flowLevel < 0 || e.flowLevel > t);
  var f = a === "[object Object]" || a === "[object Array]", u, h;
  if (f && (u = e.duplicates.indexOf(r), h = u !== -1), (e.tag !== null && e.tag !== "?" || h || e.indent !== 2 && t > 0) && (i = !1), h && e.usedDuplicates[u])
    e.dump = "*ref_" + u;
  else {
    if (f && h && !e.usedDuplicates[u] && (e.usedDuplicates[u] = !0), a === "[object Object]")
      n && Object.keys(e.dump).length !== 0 ? (ob(e, t, e.dump, i), h && (e.dump = "&ref_" + u + e.dump)) : (sb(e, t, e.dump), h && (e.dump = "&ref_" + u + " " + e.dump));
    else if (a === "[object Array]")
      n && e.dump.length !== 0 ? (e.noArrayIndent && !o && t > 0 ? ea(e, t - 1, e.dump, i) : ea(e, t, e.dump, i), h && (e.dump = "&ref_" + u + e.dump)) : (ib(e, t, e.dump), h && (e.dump = "&ref_" + u + " " + e.dump));
    else if (a === "[object String]")
      e.tag !== "?" && tb(e, e.dump, t, s, l);
    else {
      if (a === "[object Undefined]")
        return !1;
      if (e.skipInvalid) return !1;
      throw new nr("unacceptable kind of an object to dump " + a);
    }
    e.tag !== null && e.tag !== "?" && (c = encodeURI(
      e.tag[0] === "!" ? e.tag.slice(1) : e.tag
    ).replace(/!/g, "%21"), e.tag[0] === "!" ? c = "!" + c : c.slice(0, 18) === "tag:yaml.org,2002:" ? c = "!!" + c.slice(18) : c = "!<" + c + ">", e.dump = c + " " + e.dump);
  }
  return !0;
}
function ab(e, t) {
  var r = [], n = [], i, s;
  for (gi(e, r, n), i = 0, s = n.length; i < s; i += 1)
    t.duplicates.push(r[n[i]]);
  t.usedDuplicates = new Array(s);
}
function gi(e, t, r) {
  var n, i, s;
  if (e !== null && typeof e == "object")
    if (i = t.indexOf(e), i !== -1)
      r.indexOf(i) === -1 && r.push(i);
    else if (t.push(e), Array.isArray(e))
      for (i = 0, s = e.length; i < s; i += 1)
        gi(e[i], t, r);
    else
      for (n = Object.keys(e), i = 0, s = n.length; i < s; i += 1)
        gi(e[n[i]], t, r);
}
function lb(e, t) {
  t = t || {};
  var r = new Y0(t);
  r.noRefs || ab(e, r);
  var n = e;
  return r.replacer && (n = r.replacer.call({ "": n }, "", n)), ke(r, 0, n, !0, !0) ? r.dump + `
` : "";
}
hc.dump = lb;
var Sc = Os, cb = hc;
function Cs(e, t) {
  return function() {
    throw new Error("Function yaml." + e + " is removed in js-yaml 4. Use yaml." + t + " instead, which is now safe by default.");
  };
}
re.Type = oe;
re.Schema = Fl;
re.FAILSAFE_SCHEMA = Ul;
re.JSON_SCHEMA = Jl;
re.CORE_SCHEMA = Yl;
re.DEFAULT_SCHEMA = Ss;
re.load = Sc.load;
re.loadAll = Sc.loadAll;
re.dump = cb.dump;
re.YAMLException = rr;
re.types = {
  binary: tc,
  float: Wl,
  map: Hl,
  null: zl,
  pairs: nc,
  set: ic,
  timestamp: Zl,
  bool: Gl,
  int: Bl,
  merge: ec,
  omap: rc,
  seq: Ll,
  str: Vl
};
re.safeLoad = Cs("safeLoad", "load");
re.safeLoadAll = Cs("safeLoadAll", "loadAll");
re.safeDump = Cs("safeDump", "dump");
var ub = j && j.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(Ps, "__esModule", { value: !0 });
const fb = V, db = ub(re), pb = re;
Ps.default = {
  /**
   * The order that this parser will run, in relation to other parsers.
   */
  order: 200,
  /**
   * Whether to allow "empty" files. This includes zero-byte files, as well as empty JSON objects.
   */
  allowEmpty: !0,
  /**
   * Determines whether this parser can parse a given file reference.
   * Parsers that match will be tried, in order, until one successfully parses the file.
   * Parsers that don't match will be skipped, UNLESS none of the parsers match, in which case
   * every parser will be tried.
   */
  canParse: [".yaml", ".yml", ".json"],
  // JSON is valid YAML
  /**
   * Parses the given file as YAML
   *
   * @param file           - An object containing information about the referenced file
   * @param file.url       - The full URL of the referenced file
   * @param file.extension - The lowercased file extension (e.g. ".txt", ".html", etc.)
   * @param file.data      - The file contents. This will be whatever data type was returned by the resolver
   * @returns
   */
  async parse(e) {
    let t = e.data;
    if (Buffer.isBuffer(t) && (t = t.toString()), typeof t == "string")
      try {
        return db.default.load(t, { schema: pb.JSON_SCHEMA });
      } catch (r) {
        throw new fb.ParserError((r == null ? void 0 : r.message) || "Parser Error", e.url);
      }
    else
      return t;
  }
};
var Is = {};
Object.defineProperty(Is, "__esModule", { value: !0 });
const hb = V, mb = /\.(txt|htm|html|md|xml|js|min|map|css|scss|less|svg)$/i;
Is.default = {
  /**
   * The order that this parser will run, in relation to other parsers.
   */
  order: 300,
  /**
   * Whether to allow "empty" files (zero bytes).
   */
  allowEmpty: !0,
  /**
   * The encoding that the text is expected to be in.
   */
  encoding: "utf8",
  /**
   * Determines whether this parser can parse a given file reference.
   * Parsers that return true will be tried, in order, until one successfully parses the file.
   * Parsers that return false will be skipped, UNLESS all parsers returned false, in which case
   * every parser will be tried.
   */
  canParse(e) {
    return (typeof e.data == "string" || Buffer.isBuffer(e.data)) && mb.test(e.url);
  },
  /**
   * Parses the given file as text
   */
  parse(e) {
    if (typeof e.data == "string")
      return e.data;
    if (Buffer.isBuffer(e.data))
      return e.data.toString(this.encoding);
    throw new hb.ParserError("data is not text", e.url);
  }
};
var Ts = {};
Object.defineProperty(Ts, "__esModule", { value: !0 });
const yb = /\.(jpeg|jpg|gif|png|bmp|ico)$/i;
Ts.default = {
  /**
   * The order that this parser will run, in relation to other parsers.
   */
  order: 400,
  /**
   * Whether to allow "empty" files (zero bytes).
   */
  allowEmpty: !0,
  /**
   * Determines whether this parser can parse a given file reference.
   * Parsers that return true will be tried, in order, until one successfully parses the file.
   * Parsers that return false will be skipped, UNLESS all parsers returned false, in which case
   * every parser will be tried.
   */
  canParse(e) {
    return Buffer.isBuffer(e.data) && yb.test(e.url);
  },
  /**
   * Parses the given data as a Buffer (byte array).
   */
  parse(e) {
    return Buffer.isBuffer(e.data) ? e.data : Buffer.from(e.data);
  }
};
var Rs = {}, gb = j && j.__createBinding || (Object.create ? function(e, t, r, n) {
  n === void 0 && (n = r);
  var i = Object.getOwnPropertyDescriptor(t, r);
  (!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = { enumerable: !0, get: function() {
    return t[r];
  } }), Object.defineProperty(e, n, i);
} : function(e, t, r, n) {
  n === void 0 && (n = r), e[n] = t[r];
}), $b = j && j.__setModuleDefault || (Object.create ? function(e, t) {
  Object.defineProperty(e, "default", { enumerable: !0, value: t });
} : function(e, t) {
  e.default = t;
}), _b = j && j.__importStar || function(e) {
  if (e && e.__esModule) return e;
  var t = {};
  if (e != null) for (var r in e) r !== "default" && Object.prototype.hasOwnProperty.call(e, r) && gb(t, e, r);
  return $b(t, e), t;
}, vb = j && j.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(Rs, "__esModule", { value: !0 });
const bb = vb(kc), ra = je, na = _b(B), ia = V;
Rs.default = {
  /**
   * The order that this resolver will run, in relation to other resolvers.
   */
  order: 100,
  /**
   * Determines whether this resolver can read a given file reference.
   * Resolvers that return true will be tried, in order, until one successfully resolves the file.
   * Resolvers that return false will not be given a chance to resolve the file.
   */
  canRead(e) {
    return na.isFileSystemPath(e.url);
  },
  /**
   * Reads the given file and returns its raw contents as a Buffer.
   */
  async read(e) {
    let t;
    try {
      t = na.toFileSystemPath(e.url);
    } catch (r) {
      throw new ia.ResolverError(ra.ono.uri(r, `Malformed URI: ${e.url}`), e.url);
    }
    try {
      return await bb.default.promises.readFile(t);
    } catch (r) {
      throw new ia.ResolverError((0, ra.ono)(r, `Error opening file "${t}"`), t);
    }
  }
};
var ks = {}, wb = j && j.__createBinding || (Object.create ? function(e, t, r, n) {
  n === void 0 && (n = r);
  var i = Object.getOwnPropertyDescriptor(t, r);
  (!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = { enumerable: !0, get: function() {
    return t[r];
  } }), Object.defineProperty(e, n, i);
} : function(e, t, r, n) {
  n === void 0 && (n = r), e[n] = t[r];
}), Pb = j && j.__setModuleDefault || (Object.create ? function(e, t) {
  Object.defineProperty(e, "default", { enumerable: !0, value: t });
} : function(e, t) {
  e.default = t;
}), Ob = j && j.__importStar || function(e) {
  if (e && e.__esModule) return e;
  var t = {};
  if (e != null) for (var r in e) r !== "default" && Object.prototype.hasOwnProperty.call(e, r) && wb(t, e, r);
  return Pb(t, e), t;
};
Object.defineProperty(ks, "__esModule", { value: !0 });
const mr = je, Ut = Ob(B), sa = V;
ks.default = {
  /**
   * The order that this resolver will run, in relation to other resolvers.
   */
  order: 200,
  /**
   * HTTP headers to send when downloading files.
   *
   * @example:
   * {
   *   "User-Agent": "JSON Schema $Ref Parser",
   *   Accept: "application/json"
   * }
   */
  headers: null,
  /**
   * HTTP request timeout (in milliseconds).
   */
  timeout: 6e4,
  // 60 seconds
  /**
   * The maximum number of HTTP redirects to follow.
   * To disable automatic following of redirects, set this to zero.
   */
  redirects: 5,
  /**
   * The `withCredentials` option of XMLHttpRequest.
   * Set this to `true` if you're downloading files from a CORS-enabled server that requires authentication
   */
  withCredentials: !1,
  /**
   * Determines whether this resolver can read a given file reference.
   * Resolvers that return true will be tried in order, until one successfully resolves the file.
   * Resolvers that return false will not be given a chance to resolve the file.
   */
  canRead(e) {
    return Ut.isHttp(e.url);
  },
  /**
   * Reads the given URL and returns its raw contents as a Buffer.
   */
  read(e) {
    const t = Ut.parse(e.url);
    return typeof window < "u" && !t.protocol && (t.protocol = Ut.parse(location.href).protocol), xc(t, this);
  }
};
async function xc(e, t, r) {
  e = Ut.parse(e);
  const n = r || [];
  n.push(e.href);
  try {
    const i = await Eb(e, t);
    if (i.status >= 400)
      throw (0, mr.ono)({ status: i.status }, `HTTP ERROR ${i.status}`);
    if (i.status >= 300) {
      if (!Number.isNaN(t.redirects) && n.length > t.redirects)
        throw new sa.ResolverError((0, mr.ono)({ status: i.status }, `Error downloading ${n[0]}. 
Too many redirects: 
  ${n.join(` 
  `)}`));
      if (!("location" in i.headers) || !i.headers.location)
        throw (0, mr.ono)({ status: i.status }, `HTTP ${i.status} redirect with no location header`);
      {
        const s = Ut.resolve(e.href, i.headers.location);
        return xc(s, t, n);
      }
    } else {
      if (i.body) {
        const s = await i.arrayBuffer();
        return Buffer.from(s);
      }
      return Buffer.alloc(0);
    }
  } catch (i) {
    throw new sa.ResolverError((0, mr.ono)(i, `Error downloading ${e.href}`), e.href);
  }
}
async function Eb(e, t) {
  let r, n;
  t.timeout && (r = new AbortController(), n = setTimeout(() => r.abort(), t.timeout));
  const i = await fetch(e, {
    method: "GET",
    headers: t.headers || {},
    credentials: t.withCredentials ? "include" : "same-origin",
    signal: r ? r.signal : null
  });
  return n && clearTimeout(n), i;
}
(function(e) {
  var t = j && j.__importDefault || function(h) {
    return h && h.__esModule ? h : { default: h };
  };
  Object.defineProperty(e, "__esModule", { value: !0 }), e.getNewOptions = e.getJsonSchemaRefParserDefaultOptions = void 0;
  const r = t(ws), n = t(Ps), i = t(Is), s = t(Ts), o = t(Rs), a = t(ks), l = () => ({
    /**
     * Determines how different types of files will be parsed.
     *
     * You can add additional parsers of your own, replace an existing one with
     * your own implementation, or disable any parser by setting it to false.
     */
    parse: {
      json: { ...r.default },
      yaml: { ...n.default },
      text: { ...i.default },
      binary: { ...s.default }
    },
    /**
     * Determines how JSON References will be resolved.
     *
     * You can add additional resolvers of your own, replace an existing one with
     * your own implementation, or disable any resolver by setting it to false.
     */
    resolve: {
      file: { ...o.default },
      http: { ...a.default },
      /**
       * Determines whether external $ref pointers will be resolved.
       * If this option is disabled, then none of above resolvers will be called.
       * Instead, external $ref pointers will simply be ignored.
       *
       * @type {boolean}
       */
      external: !0
    },
    /**
     * By default, JSON Schema $Ref Parser throws the first error it encounters. Setting `continueOnError` to `true`
     * causes it to keep processing as much as possible and then throw a single error that contains all errors
     * that were encountered.
     */
    continueOnError: !1,
    /**
     * Determines the types of JSON references that are allowed.
     */
    dereference: {
      /**
       * Dereference circular (recursive) JSON references?
       * If false, then a {@link ReferenceError} will be thrown if a circular reference is found.
       * If "ignore", then circular references will not be dereferenced.
       *
       * @type {boolean|string}
       */
      circular: !0,
      /**
       * A function, called for each path, which can return true to stop this path and all
       * subpaths from being dereferenced further. This is useful in schemas where some
       * subpaths contain literal $ref keys that should not be dereferenced.
       *
       * @type {function}
       */
      excludedPathMatcher: () => !1,
      referenceResolution: "relative"
    },
    mutateInputSchema: !0
  });
  e.getJsonSchemaRefParserDefaultOptions = l;
  const c = (h) => {
    const y = (0, e.getJsonSchemaRefParserDefaultOptions)();
    return h && f(y, h), y;
  };
  e.getNewOptions = c;
  function f(h, y) {
    if (u(y)) {
      const _ = Object.keys(y).filter((b) => !["__proto__", "constructor", "prototype"].includes(b));
      for (let b = 0; b < _.length; b++) {
        const v = _[b], p = y[v], m = h[v];
        u(p) ? h[v] = f(m || {}, p) : p !== void 0 && (h[v] = p);
      }
    }
    return h;
  }
  function u(h) {
    return h && typeof h == "object" && !Array.isArray(h) && !(h instanceof RegExp) && !(h instanceof Date);
  }
})(bs);
Object.defineProperty(fn, "__esModule", { value: !0 });
fn.normalizeArgs = jc;
const Sb = bs;
function jc(e) {
  let t, r, n, i;
  const s = Array.prototype.slice.call(e);
  typeof s[s.length - 1] == "function" && (i = s.pop()), typeof s[0] == "string" ? (t = s[0], typeof s[2] == "object" ? (r = s[1], n = s[2]) : (r = void 0, n = s[1])) : (t = "", r = s[0], n = s[1]);
  try {
    n = (0, Sb.getNewOptions)(n);
  } catch (o) {
    console.error(`JSON Schema Ref Parser: Error normalizing options: ${o}`);
  }
  return !n.mutateInputSchema && typeof r == "object" && (r = JSON.parse(JSON.stringify(r))), {
    path: t,
    schema: r,
    options: n,
    callback: i
  };
}
fn.default = jc;
var Ns = {}, xb = j && j.__createBinding || (Object.create ? function(e, t, r, n) {
  n === void 0 && (n = r);
  var i = Object.getOwnPropertyDescriptor(t, r);
  (!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = { enumerable: !0, get: function() {
    return t[r];
  } }), Object.defineProperty(e, n, i);
} : function(e, t, r, n) {
  n === void 0 && (n = r), e[n] = t[r];
}), jb = j && j.__setModuleDefault || (Object.create ? function(e, t) {
  Object.defineProperty(e, "default", { enumerable: !0, value: t });
} : function(e, t) {
  e.default = t;
}), Ab = j && j.__importStar || function(e) {
  if (e && e.__esModule) return e;
  var t = {};
  if (e != null) for (var r in e) r !== "default" && Object.prototype.hasOwnProperty.call(e, r) && xb(t, e, r);
  return jb(t, e), t;
}, Ms = j && j.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(Ns, "__esModule", { value: !0 });
const Cb = Ms(tr()), Ib = Ms(cn()), Tb = Ms(un), ut = Ab(B), Rb = V;
function kb(e, t) {
  var r;
  if (!((r = t.resolve) != null && r.external))
    return Promise.resolve();
  try {
    const n = Ds(e.schema, e.$refs._root$Ref.path + "#", e.$refs, t);
    return Promise.all(n);
  } catch (n) {
    return Promise.reject(n);
  }
}
function Ds(e, t, r, n, i, s) {
  i || (i = /* @__PURE__ */ new Set());
  let o = [];
  if (e && typeof e == "object" && !ArrayBuffer.isView(e) && !i.has(e)) {
    i.add(e), Cb.default.isExternal$Ref(e) && o.push(Nb(e, t, r, n));
    const a = Object.keys(e);
    for (const l of a) {
      const c = Ib.default.join(t, l), f = e[l];
      o = o.concat(Ds(f, c, r, n, i));
    }
  }
  return o;
}
async function Nb(e, t, r, n) {
  var l;
  const i = ((l = n.dereference) == null ? void 0 : l.externalReferenceResolution) === "root", s = ut.resolve(i ? ut.cwd() : t, e.$ref), o = ut.stripHash(s), a = r._$refs[o];
  if (a)
    return Promise.resolve(a.value);
  try {
    const c = await (0, Tb.default)(s, r, n), f = Ds(c, o + "#", r, n, /* @__PURE__ */ new Set(), !0);
    return Promise.all(f);
  } catch (c) {
    if (!(n != null && n.continueOnError) || !(0, Rb.isHandledError)(c))
      throw c;
    return r._$refs[o] && (c.source = decodeURI(ut.stripHash(t)), c.path = ut.safePointerToPath(ut.getHash(t))), [];
  }
}
Ns.default = kb;
var qs = {}, Mb = j && j.__createBinding || (Object.create ? function(e, t, r, n) {
  n === void 0 && (n = r);
  var i = Object.getOwnPropertyDescriptor(t, r);
  (!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = { enumerable: !0, get: function() {
    return t[r];
  } }), Object.defineProperty(e, n, i);
} : function(e, t, r, n) {
  n === void 0 && (n = r), e[n] = t[r];
}), Db = j && j.__setModuleDefault || (Object.create ? function(e, t) {
  Object.defineProperty(e, "default", { enumerable: !0, value: t });
} : function(e, t) {
  e.default = t;
}), qb = j && j.__importStar || function(e) {
  if (e && e.__esModule) return e;
  var t = {};
  if (e != null) for (var r in e) r !== "default" && Object.prototype.hasOwnProperty.call(e, r) && Mb(t, e, r);
  return Db(t, e), t;
}, Ac = j && j.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(qs, "__esModule", { value: !0 });
const Mr = Ac(tr()), Jt = Ac(cn()), Bn = qb(B);
function Fb(e, t) {
  const r = [];
  Fs(e, "schema", e.$refs._root$Ref.path + "#", "#", 0, r, e.$refs, t), Vb(r);
}
function Fs(e, t, r, n, i, s, o, a) {
  const l = t === null ? e : e[t];
  if (l && typeof l == "object" && !ArrayBuffer.isView(l))
    if (Mr.default.isAllowed$Ref(l))
      oa(e, t, r, n, i, s, o, a);
    else {
      const c = Object.keys(l).sort((f, u) => f === "definitions" ? -1 : u === "definitions" ? 1 : f.length - u.length);
      for (const f of c) {
        const u = Jt.default.join(r, f), h = Jt.default.join(n, f), y = l[f];
        Mr.default.isAllowed$Ref(y) ? oa(l, f, r, h, i, s, o, a) : Fs(l, f, u, h, i, s, o, a);
      }
    }
}
function oa(e, t, r, n, i, s, o, a) {
  const l = t === null ? e : e[t], c = Bn.resolve(r, l.$ref), f = o._resolve(c, n, a);
  if (f === null)
    return;
  const h = Jt.default.parse(n).length, y = Bn.stripHash(f.path), _ = Bn.getHash(f.path), b = y !== o._root$Ref.path, v = Mr.default.isExtended$Ref(l);
  i += f.indirections;
  const p = Lb(s, e, t);
  if (p)
    if (h < p.depth || i < p.indirections)
      Hb(s, p);
    else
      return;
  s.push({
    $ref: l,
    // The JSON Reference (e.g. {$ref: string})
    parent: e,
    // The object that contains this $ref pointer
    key: t,
    // The key in `parent` that is the $ref pointer
    pathFromRoot: n,
    // The path to the $ref pointer, from the JSON Schema root
    depth: h,
    // How far from the JSON Schema root is this $ref pointer?
    file: y,
    // The file that the $ref pointer resolves to
    hash: _,
    // The hash within `file` that the $ref pointer resolves to
    value: f.value,
    // The resolved value of the $ref pointer
    circular: f.circular,
    // Is this $ref pointer DIRECTLY circular? (i.e. it references itself)
    extended: v,
    // Does this $ref extend its resolved value? (i.e. it has extra properties, in addition to "$ref")
    external: b,
    // Does this $ref pointer point to a file other than the main JSON Schema file?
    indirections: i
    // The number of indirect references that were traversed to resolve the value
  }), (!p || b) && Fs(f.value, null, f.path, n, i + 1, s, o, a);
}
function Vb(e) {
  e.sort((i, s) => {
    if (i.file !== s.file)
      return i.file < s.file ? -1 : 1;
    if (i.hash !== s.hash)
      return i.hash < s.hash ? -1 : 1;
    if (i.circular !== s.circular)
      return i.circular ? -1 : 1;
    if (i.extended !== s.extended)
      return i.extended ? 1 : -1;
    if (i.indirections !== s.indirections)
      return i.indirections - s.indirections;
    if (i.depth !== s.depth)
      return i.depth - s.depth;
    {
      const o = i.pathFromRoot.lastIndexOf("/definitions"), a = s.pathFromRoot.lastIndexOf("/definitions");
      return o !== a ? a - o : i.pathFromRoot.length - s.pathFromRoot.length;
    }
  });
  let t, r, n;
  for (const i of e)
    i.external ? i.file === t && i.hash === r ? i.$ref.$ref = n : i.file === t && i.hash.indexOf(r + "/") === 0 ? i.$ref.$ref = Jt.default.join(n, Jt.default.parse(i.hash.replace(r, "#"))) : (t = i.file, r = i.hash, n = i.pathFromRoot, i.$ref = i.parent[i.key] = Mr.default.dereference(i.$ref, i.value), i.circular && (i.$ref.$ref = i.pathFromRoot)) : i.$ref.$ref = i.hash;
}
function Lb(e, t, r) {
  for (const n of e)
    if (n && n.parent === t && n.key === r)
      return n;
}
function Hb(e, t) {
  const r = e.indexOf(t);
  e.splice(r, 1);
}
qs.default = Fb;
var Vs = {}, Ub = j && j.__createBinding || (Object.create ? function(e, t, r, n) {
  n === void 0 && (n = r);
  var i = Object.getOwnPropertyDescriptor(t, r);
  (!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = { enumerable: !0, get: function() {
    return t[r];
  } }), Object.defineProperty(e, n, i);
} : function(e, t, r, n) {
  n === void 0 && (n = r), e[n] = t[r];
}), zb = j && j.__setModuleDefault || (Object.create ? function(e, t) {
  Object.defineProperty(e, "default", { enumerable: !0, value: t });
} : function(e, t) {
  e.default = t;
}), Gb = j && j.__importStar || function(e) {
  if (e && e.__esModule) return e;
  var t = {};
  if (e != null) for (var r in e) r !== "default" && Object.prototype.hasOwnProperty.call(e, r) && Ub(t, e, r);
  return zb(t, e), t;
}, Cc = j && j.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(Vs, "__esModule", { value: !0 });
const Dr = Cc(tr()), aa = Cc(cn()), Bb = je, la = Gb(B), Kb = V;
Vs.default = Wb;
function Wb(e, t) {
  const r = Date.now(), n = Ls(e.schema, e.$refs._root$Ref.path, "#", /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set(), /* @__PURE__ */ new Map(), e.$refs, t, r);
  e.$refs.circular = n.circular, e.schema = n.value;
}
function Ls(e, t, r, n, i, s, o, a, l) {
  var y;
  let c;
  const f = {
    value: e,
    circular: !1
  };
  if (a && a.timeoutMs && Date.now() - l > a.timeoutMs)
    throw new Kb.TimeoutError(a.timeoutMs);
  const u = a.dereference || {}, h = u.excludedPathMatcher || (() => !1);
  if (((u == null ? void 0 : u.circular) === "ignore" || !i.has(e)) && e && typeof e == "object" && !ArrayBuffer.isView(e) && !h(r)) {
    if (n.add(e), i.add(e), Dr.default.isAllowed$Ref(e, a))
      c = ca(e, t, r, n, i, s, o, a, l), f.circular = c.circular, f.value = c.value;
    else
      for (const _ of Object.keys(e)) {
        const b = aa.default.join(t, _), v = aa.default.join(r, _);
        if (h(v))
          continue;
        const p = e[_];
        let m = !1;
        Dr.default.isAllowed$Ref(p, a) ? (c = ca(p, b, v, n, i, s, o, a, l), m = c.circular, e[_] !== c.value && (e[_] = c.value, (y = u == null ? void 0 : u.onDereference) == null || y.call(u, p.$ref, e[_], e, _))) : n.has(p) ? m = Ic(b, o, a) : (c = Ls(p, b, v, n, i, s, o, a, l), m = c.circular, e[_] !== c.value && (e[_] = c.value)), f.circular = f.circular || m;
      }
    n.delete(e);
  }
  return f;
}
function ca(e, t, r, n, i, s, o, a, l) {
  var m, $;
  const f = Dr.default.isExternal$Ref(e) && ((m = a == null ? void 0 : a.dereference) == null ? void 0 : m.externalReferenceResolution) === "root", u = la.resolve(f ? la.cwd() : t, e.$ref), h = s.get(u);
  if (h && !h.circular) {
    const E = Object.keys(e);
    if (E.length > 1) {
      const S = {};
      for (const A of E)
        A !== "$ref" && !(A in h.value) && (S[A] = e[A]);
      return {
        circular: h.circular,
        value: Object.assign({}, h.value, S)
      };
    }
    return h;
  }
  const y = o._resolve(u, t, a);
  if (y === null)
    return {
      circular: !1,
      value: null
    };
  const _ = y.circular;
  let b = _ || n.has(y.value);
  b && Ic(t, o, a);
  let v = Dr.default.dereference(e, y.value);
  if (!b) {
    const E = Ls(v, y.path, r, n, i, s, o, a, l);
    b = E.circular, v = E.value;
  }
  b && !_ && (($ = a.dereference) == null ? void 0 : $.circular) === "ignore" && (v = e), _ && (v.$ref = r);
  const p = {
    circular: b,
    value: v
  };
  return Object.keys(e).length === 1 && s.set(u, p), p;
}
function Ic(e, t, r) {
  if (t.circular = !0, !r.dereference.circular)
    throw Bb.ono.reference(`Circular $ref pointer found at ${e}`);
  return !0;
}
var Hs = {}, Us = {};
Object.defineProperty(Us, "__esModule", { value: !0 });
function Jb() {
  return typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : typeof setImmediate == "function" ? setImmediate : function(t) {
    setTimeout(t, 0);
  };
}
Us.default = Jb();
var Yb = j && j.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(Hs, "__esModule", { value: !0 });
Hs.default = Xb;
const ua = Yb(Us);
function Xb(e, t) {
  if (e) {
    t.then(function(r) {
      (0, ua.default)(function() {
        e(null, r);
      });
    }, function(r) {
      (0, ua.default)(function() {
        e(r);
      });
    });
    return;
  } else
    return t;
}
(function(e) {
  var t = j && j.__createBinding || (Object.create ? function(m, $, E, S) {
    S === void 0 && (S = E);
    var A = Object.getOwnPropertyDescriptor($, E);
    (!A || ("get" in A ? !$.__esModule : A.writable || A.configurable)) && (A = { enumerable: !0, get: function() {
      return $[E];
    } }), Object.defineProperty(m, S, A);
  } : function(m, $, E, S) {
    S === void 0 && (S = E), m[S] = $[E];
  }), r = j && j.__setModuleDefault || (Object.create ? function(m, $) {
    Object.defineProperty(m, "default", { enumerable: !0, value: $ });
  } : function(m, $) {
    m.default = $;
  }), n = j && j.__importStar || function(m) {
    if (m && m.__esModule) return m;
    var $ = {};
    if (m != null) for (var E in m) E !== "default" && Object.prototype.hasOwnProperty.call(m, E) && t($, m, E);
    return r($, m), $;
  }, i = j && j.__importDefault || function(m) {
    return m && m.__esModule ? m : { default: m };
  };
  Object.defineProperty(e, "__esModule", { value: !0 }), e.getJsonSchemaRefParserDefaultOptions = e.jsonSchemaParserNormalizeArgs = e.dereferenceInternal = e.JSONParserErrorGroup = e.isHandledError = e.UnmatchedParserError = e.ParserError = e.ResolverError = e.MissingPointerError = e.InvalidPointerError = e.JSONParserError = e.UnmatchedResolverError = e.dereference = e.bundle = e.resolve = e.parse = e.$RefParser = void 0;
  const s = i($s), o = i(un), a = i(fn);
  e.jsonSchemaParserNormalizeArgs = a.default;
  const l = i(Ns), c = i(qs), f = i(Vs);
  e.dereferenceInternal = f.default;
  const u = n(B), h = V;
  Object.defineProperty(e, "JSONParserError", { enumerable: !0, get: function() {
    return h.JSONParserError;
  } }), Object.defineProperty(e, "InvalidPointerError", { enumerable: !0, get: function() {
    return h.InvalidPointerError;
  } }), Object.defineProperty(e, "MissingPointerError", { enumerable: !0, get: function() {
    return h.MissingPointerError;
  } }), Object.defineProperty(e, "ResolverError", { enumerable: !0, get: function() {
    return h.ResolverError;
  } }), Object.defineProperty(e, "ParserError", { enumerable: !0, get: function() {
    return h.ParserError;
  } }), Object.defineProperty(e, "UnmatchedParserError", { enumerable: !0, get: function() {
    return h.UnmatchedParserError;
  } }), Object.defineProperty(e, "UnmatchedResolverError", { enumerable: !0, get: function() {
    return h.UnmatchedResolverError;
  } }), Object.defineProperty(e, "isHandledError", { enumerable: !0, get: function() {
    return h.isHandledError;
  } }), Object.defineProperty(e, "JSONParserErrorGroup", { enumerable: !0, get: function() {
    return h.JSONParserErrorGroup;
  } });
  const y = je, _ = i(Hs), b = bs;
  Object.defineProperty(e, "getJsonSchemaRefParserDefaultOptions", { enumerable: !0, get: function() {
    return b.getJsonSchemaRefParserDefaultOptions;
  } });
  class v {
    constructor() {
      this.schema = null, this.$refs = new s.default();
    }
    async parse() {
      const $ = (0, a.default)(arguments);
      let E;
      if (!$.path && !$.schema) {
        const A = (0, y.ono)(`Expected a file path, URL, or object. Got ${$.path || $.schema}`);
        return (0, _.default)($.callback, Promise.reject(A));
      }
      this.schema = null, this.$refs = new s.default();
      let S = "http";
      if (u.isFileSystemPath($.path))
        $.path = u.fromFileSystemPath($.path), S = "file";
      else if (!$.path && $.schema && "$id" in $.schema && $.schema.$id) {
        const A = u.parse($.schema.$id), U = A.protocol === "https:" ? 443 : 80;
        $.path = `${A.protocol}//${A.hostname}:${U}`;
      }
      if ($.path = u.resolve(u.cwd(), $.path), $.schema && typeof $.schema == "object") {
        const A = this.$refs._add($.path);
        A.value = $.schema, A.pathType = S, E = Promise.resolve($.schema);
      } else
        E = (0, o.default)($.path, this.$refs, $.options);
      try {
        const A = await E;
        if (A !== null && typeof A == "object" && !Buffer.isBuffer(A))
          return this.schema = A, (0, _.default)($.callback, Promise.resolve(this.schema));
        if ($.options.continueOnError)
          return this.schema = null, (0, _.default)($.callback, Promise.resolve(this.schema));
        throw y.ono.syntax(`"${this.$refs._root$Ref.path || A}" is not a valid JSON Schema`);
      } catch (A) {
        return !$.options.continueOnError || !(0, h.isHandledError)(A) ? (0, _.default)($.callback, Promise.reject(A)) : (this.$refs._$refs[u.stripHash($.path)] && this.$refs._$refs[u.stripHash($.path)].addError(A), (0, _.default)($.callback, Promise.resolve(null)));
      }
    }
    static parse() {
      const $ = new v();
      return $.parse.apply($, arguments);
    }
    async resolve() {
      const $ = (0, a.default)(arguments);
      try {
        return await this.parse($.path, $.schema, $.options), await (0, l.default)(this, $.options), p(this), (0, _.default)($.callback, Promise.resolve(this.$refs));
      } catch (E) {
        return (0, _.default)($.callback, Promise.reject(E));
      }
    }
    static resolve() {
      const $ = new v();
      return $.resolve.apply($, arguments);
    }
    static bundle() {
      const $ = new v();
      return $.bundle.apply($, arguments);
    }
    async bundle() {
      const $ = (0, a.default)(arguments);
      try {
        return await this.resolve($.path, $.schema, $.options), (0, c.default)(this, $.options), p(this), (0, _.default)($.callback, Promise.resolve(this.schema));
      } catch (E) {
        return (0, _.default)($.callback, Promise.reject(E));
      }
    }
    static dereference() {
      const $ = new v();
      return $.dereference.apply($, arguments);
    }
    async dereference() {
      const $ = (0, a.default)(arguments);
      try {
        return await this.resolve($.path, $.schema, $.options), (0, f.default)(this, $.options), p(this), (0, _.default)($.callback, Promise.resolve(this.schema));
      } catch (E) {
        return (0, _.default)($.callback, Promise.reject(E));
      }
    }
  }
  e.$RefParser = v, e.default = v;
  function p(m) {
    if (h.JSONParserErrorGroup.getParserErrors(m).length > 0)
      throw new h.JSONParserErrorGroup(m);
  }
  e.parse = v.parse, e.resolve = v.resolve, e.bundle = v.bundle, e.dereference = v.dereference;
})(er);
const { getJsonSchemaRefParserDefaultOptions: Qb } = er, Zb = El, ew = xl;
var tw = zs;
function $i(e, t) {
  if (fa(t)) {
    const r = Object.keys(t).filter((n) => !["__proto__", "constructor", "prototype"].includes(n));
    for (let n = 0; n < r.length; n++) {
      const i = r[n], s = t[i], o = e[i];
      fa(s) ? e[i] = $i(o || {}, s) : s !== void 0 && (e[i] = s);
    }
  }
  return e;
}
function fa(e) {
  return e && typeof e == "object" && !Array.isArray(e) && !(e instanceof RegExp) && !(e instanceof Date);
}
function zs(e) {
  const t = Qb(), r = $i(t, zs.defaults);
  return $i(r, e);
}
zs.defaults = {
  /**
   * Determines how the API definition will be validated.
   *
   * You can add additional validators of your own, replace an existing one with
   * your own implemenation, or disable any validator by setting it to false.
   */
  validate: {
    schema: Zb,
    spec: ew
  }
};
function rw() {
  return typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : typeof setImmediate == "function" ? setImmediate : function(t) {
    setTimeout(t, 0);
  };
}
var nw = rw(), da = nw, iw = function(t, r) {
  if (t) {
    r.then(function(n) {
      da(function() {
        t(null, n);
      });
    }, function(n) {
      da(function() {
        t(n);
      });
    });
    return;
  } else
    return r;
};
const sw = El, ow = xl, { jsonSchemaParserNormalizeArgs: pa } = er, aw = nt, ha = tw, yr = iw, { ono: me } = je, { $RefParser: lw } = er, { dereferenceInternal: cw } = er, Tc = ["3.1.0", "3.1.1"], uw = ["3.0.0", "3.0.1", "3.0.2", "3.0.3", "3.0.4"], ma = [...Tc, ...uw];
class it extends lw {
  /**
   * Parses the given Swagger API.
   * This method does not resolve any JSON references.
   * It just reads a single file in JSON or YAML format, and parse it as a JavaScript object.
   *
   * @param {string} [path] - The file path or URL of the JSON schema
   * @param {object} [api] - The Swagger API object. This object will be used instead of reading from `path`.
   * @param {ParserOptions} [options] - Options that determine how the API is parsed
   * @param {Function} [callback] - An error-first callback. The second parameter is the parsed API object.
   * @returns {Promise} - The returned promise resolves with the parsed API object.
   */
  async parse(t, r, n, i) {
    let s = pa(arguments);
    s.options = new ha(s.options);
    try {
      let o = await super.parse(s.path, s.schema, s.options);
      if (o.swagger) {
        if (o.swagger === void 0 || o.info === void 0 || o.paths === void 0)
          throw me.syntax(`${s.path || s.schema} is not a valid Swagger API definition`);
        if (typeof o.swagger == "number")
          throw me.syntax('Swagger version number must be a string (e.g. "2.0") not a number.');
        if (typeof o.info.version == "number")
          throw me.syntax('API version number must be a string (e.g. "1.0.0") not a number.');
        if (o.swagger !== "2.0")
          throw me.syntax(`Unrecognized Swagger version: ${o.swagger}. Expected 2.0`);
      } else {
        if (o.openapi === void 0 || o.info === void 0)
          throw me.syntax(`${s.path || s.schema} is not a valid Openapi API definition`);
        if (o.paths === void 0)
          if (Tc.indexOf(o.openapi) !== -1) {
            if (o.webhooks === void 0)
              throw me.syntax(`${s.path || s.schema} is not a valid Openapi API definition`);
          } else
            throw me.syntax(`${s.path || s.schema} is not a valid Openapi API definition`);
        else {
          if (typeof o.openapi == "number")
            throw me.syntax('Openapi version number must be a string (e.g. "3.0.0") not a number.');
          if (typeof o.info.version == "number")
            throw me.syntax('API version number must be a string (e.g. "1.0.0") not a number.');
          if (ma.indexOf(o.openapi) === -1)
            throw me.syntax(
              `Unsupported OpenAPI version: ${o.openapi}. Swagger Parser only supports versions ${ma.join(", ")}`
            );
        }
        aw.fixOasRelativeServers(o, s.path);
      }
      return yr(s.callback, Promise.resolve(o));
    } catch (o) {
      return yr(s.callback, Promise.reject(o));
    }
  }
  /**
   * Parses, dereferences, and validates the given Swagger API.
   * Depending on the options, validation can include JSON Schema validation and/or Swagger Spec validation.
   *
   * @param {string} [path] - The file path or URL of the JSON schema
   * @param {object} [api] - The Swagger API object. This object will be used instead of reading from `path`.
   * @param {ParserOptions} [options] - Options that determine how the API is parsed, dereferenced, and validated
   * @param {Function} [callback] - An error-first callback. The second parameter is the parsed API object.
   * @returns {Promise} - The returned promise resolves with the parsed API object.
   */
  async validate(t, r, n, i) {
    let s = this, o = pa(arguments);
    o.options = new ha(o.options);
    let a = o.options.dereference.circular;
    o.options.validate.schema && (o.options.dereference.circular = "ignore");
    try {
      if (await this.dereference(o.path, o.schema, o.options), o.options.dereference.circular = a, o.options.validate.schema && (sw(s.api), s.$refs.circular)) {
        if (a === !0)
          cw(s, o.options);
        else if (a === !1)
          throw me.reference("The API contains circular references");
      }
      return o.options.validate.spec && ow(s.api), yr(o.callback, Promise.resolve(s.schema));
    } catch (l) {
      return yr(o.callback, Promise.reject(l));
    }
  }
}
Object.defineProperty(it.prototype, "api", {
  configurable: !0,
  enumerable: !0,
  get() {
    return this.schema;
  }
});
const Se = it;
Se.validate = (...e) => new it().validate(...e);
Se.dereference = (...e) => new it().dereference(...e);
Se.bundle = (...e) => new it().bundle(...e);
Se.parse = (...e) => new it().parse(...e);
Se.resolve = (...e) => new it().resolve(...e);
Se.default = Se;
Se.SwaggerParser = Se;
var fw = Se;
const dw = /* @__PURE__ */ Hc(fw), Or = (e) => e.split("-").map((t) => {
  var r;
  return ((r = t[0]) == null ? void 0 : r.toUpperCase()) + t.slice(1);
}).join(""), pw = (e) => e.length > 0 ? e.reverse().map((t) => `By${Or(t.slice(1, -1))}`).join("") : "";
function hw(e, t) {
  const r = t.split("/").filter(Boolean), n = r.filter((l) => l.startsWith("{")), i = r.filter((l) => !l.startsWith("{")), s = pw(n);
  if (i.length <= 1)
    return `${e.toLowerCase()}${Or(i[0] || "root")}${s}`;
  const [o, ...a] = i.reverse();
  return `${e.toLowerCase()}${Or(o)}${s}For${a.reverse().map(Or).join("")}`;
}
async function mw(e, t) {
  const r = await dw.parse(e);
  Object.entries(r.paths || {}).forEach(([i, s]) => {
    const o = s;
    ["get", "post", "put", "delete", "patch", "options", "head", "trace"].forEach((a) => {
      const l = o[a];
      l == null || l.operationId != null && !(t != null && t.overwriteExisting) || (l.operationId = hw(a, i));
    });
  });
  const n = JSON.stringify(r, null, 2);
  if (n == null)
    throw new Error(`Failed to generate operation IDs for ${e}`);
  return n;
}
const yw = async () => {
  const e = new fu();
  e.name("generate-operation-ids").description("Generate operationId for OpenAPI specification").argument("<input-file>", "OpenAPI specification file").option("-o, --out <output-file>", "Output file (defaults to input file)").option("--overwrite-existing", "Overwrite existing operationId values").parse();
  const { out: t, overwriteExisting: r } = e.opts(), [n] = e.args, i = await mw(n, { overwriteExisting: r }).catch(console.error);
  i != null && Nc(t ?? n, i);
};
import.meta.url === `file://${process.argv[1]}` && yw();
export {
  yw as main
};
