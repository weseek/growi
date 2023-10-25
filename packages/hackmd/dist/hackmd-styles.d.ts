/**
 * GROWI styles loader for HackMD
 *
 * This file will be transpiled as a single JS
 *  and should be load from HackMD head via 'routes/hackmd.js' route
 *
 * USAGE:
 *  <script src="${hostname of GROWI}/_hackmd/load-styles"></script>
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
declare const styles = "<%= styles %>";
/**
 * Insert link tag to load style file
 */
declare function insertStyle(): void;
