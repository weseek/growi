const n = "<%= styles %>";
function o() {
  const e = document.createElement("style");
  e.appendChild(document.createTextNode(unescape(n))), document.getElementsByTagName("head")[0].appendChild(e);
}
(function() {
  if (window === window.parent) {
    console.log("[GROWI] Loading styles for HackMD is not processed because currently not in iframe");
    return;
  }
  console.log("[HackMD] Loading GROWI styles for HackMD..."), o(), console.log("[HackMD] GROWI styles for HackMD has successfully loaded.");
})();
//# sourceMappingURL=hackmd-styles.js.map
