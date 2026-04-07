(function () {
  var host = document.currentScript
    ? new URL(document.currentScript.src).origin
    : window.__NAOBOT_HOST__ || "";

  // Avoid double-loading
  if (document.getElementById("naobot-iframe")) return;

  var iframe = document.createElement("iframe");
  iframe.id = "naobot-iframe";
  iframe.src = host + "/widget?host=" + encodeURIComponent(host);
  iframe.allow = "clipboard-write";
  iframe.setAttribute("aria-label", "NaoBot Chat Widget");

  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "0",
    right: "0",
    width: "420px",
    height: "620px",
    border: "none",
    background: "transparent",
    zIndex: "2147483647",
    pointerEvents: "all",
  });

  document.body.appendChild(iframe);
})();
