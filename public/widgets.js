document.addEventListener("DOMContentLoaded", function () {
  var zapfeedFrame;
  var zapfeedBtnOpen;
  var zapfeedScript = document.querySelector("script[zapfeed-id]");
  var zapfeedId = zapfeedScript.getAttribute("zapfeed-id") || "";
  var url = zapfeedScript.src.split("/widgets.js")[0] || "";
  var appUrl = url;

  function ZapFeed() {
    var self = this;

    fetch(`${appUrl}/api/team/${zapfeedId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res?.success) {
          var dataTeam = res?.data;
          var css = document.createElement("link");
          css.href = `${url}/widgets.css`;
          css.type = "text/css";
          css.rel = "stylesheet";
          css.media = "screen";

          document.getElementsByTagName("head")[0].appendChild(css);
          document.body.insertAdjacentHTML(
            "beforeend",
            `<a id="zapfeed-btn-open" class="zapfeed-toggle-feedback zapfeed-btn-open-${dataTeam?.style?.button_position}" href="javascript:;" style="background: ${dataTeam?.style?.button_bg};color: ${dataTeam?.style?.button_color}">
            ${dataTeam?.style?.button_text}
          </a>

          <div id="zapfeed-frame" class="zapfeed-frame-closed" style="display:none;">
              <iframe allowfullscreen="true" class="zapfeed-frame-embed" title="ZapFeed" role="dialog" src="${appUrl}/collect/${zapfeedId}"></iframe>
          </div>`
          );

          document.addEventListener("click", function (event) {
            var target = event.target;
            function prevent() {
              event.preventDefault();
              event.stopPropagation();
            }
            if (target.matches(".zapfeed-toggle-feedback")) {
              self.toggle();
              prevent();
            } else if (target.matches(".zapfeed-open-feedback")) {
              self.open();
              prevent();
            } else if (target.matches(".zapfeed-close-feedback")) {
              self.close();
              prevent();
            }
          });

          zapfeedFrame = document.getElementById("zapfeed-frame");
          zapfeedBtnOpen = document.getElementById("zapfeed-btn-open");
        }
      });

    return self;
  }

  ZapFeed.prototype.toggle = function () {
    var self = this;
    zapfeedFrame.style.display = "block";

    var isOpen = zapfeedFrame.classList.contains("zapfeed-frame-open");
    if (isOpen) {
      zapfeedFrame.classList.remove("zapfeed-frame-open");
      zapfeedFrame.classList.add("zapfeed-frame-closed");

      zapfeedBtnOpen.style.display = "inline";
    } else {
      zapfeedFrame.classList.remove("zapfeed-frame-closed");
      zapfeedFrame.classList.add("zapfeed-frame-open");
      zapfeedFrame.classList.add("slide-in-bck-br");

      zapfeedBtnOpen.style.display = "none";
    }

    return self;
  };

  window.zapfeed = new ZapFeed();
  window.addEventListener("message", (event) => {
    if (event.data == "zapfeed-minimized") {
      window.zapfeed.toggle();
    }
    return;
  });
});
