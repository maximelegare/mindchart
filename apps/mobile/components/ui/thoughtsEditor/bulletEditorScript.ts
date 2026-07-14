/** Injected into the pell WebView to keep content as bullets and shape titled items. */
export const BULLET_EDITOR_GUARD_SCRIPT = `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;

  if (!window.__mcBulletGuardInstalled) {
    window.__mcBulletGuardInstalled = true;
    window.__mcShowTitles = false;

    function emptyTitledLiHtml() {
      return (
        '<div class="thought-title is-placeholder" data-placeholder="Title"><br></div>' +
        '<div class="thought-summary is-placeholder" data-placeholder="Summary"><br></div>'
      );
    }

    function closest(node, predicate) {
      while (node && node !== document.body) {
        if (predicate(node)) return node;
        node = node.parentNode;
      }
      return null;
    }

    function closestLi(node) {
      return closest(node, function (n) {
        return n.nodeName === "LI";
      });
    }

    function closestClass(node, className) {
      return closest(node, function (n) {
        return n.classList && n.classList.contains(className);
      });
    }

    function isEmptyField(el) {
      if (!el) return true;
      var text = (el.textContent || "")
        .replace(/\\u00a0/g, " ")
        .replace(/\\n/g, "")
        .trim();
      return text.length === 0;
    }

    function isCaretAtStartOf(el) {
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount || !el) return false;
      var range = sel.getRangeAt(0);
      if (!range.collapsed) return false;
      var probe = range.cloneRange();
      probe.selectNodeContents(el);
      probe.setEnd(range.startContainer, range.startOffset);
      return probe.toString().replace(/\\u00a0/g, " ").trim().length === 0;
    }

    function placeCaretAtStart(el) {
      var sel = window.getSelection();
      if (!el || !sel) return;
      try {
        el.focus();
      } catch (err) {}

      var range = document.createRange();
      if (el.childNodes.length === 1 && el.firstChild.nodeName === "BR") {
        range.setStart(el, 0);
      } else if (el.firstChild && el.firstChild.nodeType === 3) {
        range.setStart(el.firstChild, 0);
      } else if (el.firstChild) {
        range.setStartBefore(el.firstChild);
      } else {
        range.setStart(el, 0);
      }
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    function placeCaretAtEnd(el) {
      var sel = window.getSelection();
      if (!el || !sel) return;
      try {
        el.focus();
      } catch (err) {}

      var range = document.createRange();
      if (el.childNodes.length === 1 && el.firstChild.nodeName === "BR") {
        range.setStart(el, 0);
        range.collapse(true);
      } else {
        range.selectNodeContents(el);
        range.collapse(false);
      }
      sel.removeAllRanges();
      sel.addRange(range);
    }

    function placeCaretAtStartSoon(el) {
      placeCaretAtStart(el);
      setTimeout(function () {
        placeCaretAtStart(el);
      }, 0);
    }

    function placeCaretAtEndSoon(el) {
      placeCaretAtEnd(el);
      setTimeout(function () {
        placeCaretAtEnd(el);
      }, 0);
    }

    function ensureUl() {
      if (content.querySelector("ul")) return;
      content.innerHTML =
        "<ul><li>" +
        (window.__mcShowTitles ? emptyTitledLiHtml() : "<br>") +
        "</li></ul>";
    }

    function clearField(el, placeholder) {
      if (!el) return;
      el.innerHTML = "<br>";
      el.setAttribute("data-placeholder", placeholder);
      el.classList.add("is-placeholder");
    }

    function repairEmptyField(el, placeholder) {
      if (!el) return;
      el.setAttribute("data-placeholder", placeholder);
      if (isEmptyField(el)) {
        el.classList.add("is-placeholder");
        var onlyBr =
          el.childNodes.length === 1 &&
          el.firstChild &&
          el.firstChild.nodeName === "BR";
        // Restore a lone <br> only when backspace left the field truly empty.
        if (!onlyBr) {
          clearField(el, placeholder);
        }
      } else {
        el.classList.remove("is-placeholder");
      }
    }

    function repairAllPlaceholderFields() {
      if (!window.__mcShowTitles) return;
      var titles = content.querySelectorAll(".thought-title");
      var summaries = content.querySelectorAll(".thought-summary");
      for (var t = 0; t < titles.length; t++) {
        repairEmptyField(titles[t], "Title");
      }
      for (var s = 0; s < summaries.length; s++) {
        repairEmptyField(summaries[s], "Summary");
      }
    }

    function normalizeTitledLis() {
      if (!window.__mcShowTitles) return;
      var lis = content.querySelectorAll("ul > li");
      for (var i = 0; i < lis.length; i++) {
        var li = lis[i];
        if (li.querySelector(".thought-title")) {
          // Never drop the summary slot while titles are on.
          if (!li.querySelector(".thought-summary")) {
            var summary = document.createElement("div");
            summary.className = "thought-summary is-placeholder";
            summary.setAttribute("data-placeholder", "Summary");
            summary.innerHTML = "<br>";
            li.appendChild(summary);
          }
          continue;
        }
        var text = (li.textContent || "").trim();
        if (!text) {
          li.innerHTML = emptyTitledLiHtml();
        } else {
          li.innerHTML =
            '<div class="thought-title" data-placeholder="Title">' +
            li.innerHTML +
            '</div><div class="thought-summary is-placeholder" data-placeholder="Summary"><br></div>';
        }
      }
      repairAllPlaceholderFields();
    }

    function notifyChange() {
      try {
        content.dispatchEvent(new Event("input", { bubbles: true }));
      } catch (e) {}
    }

    function handleEnter(e, li, anchor) {
      var inTitle = closestClass(anchor, "thought-title");
      if (inTitle) {
        e.preventDefault();
        e.stopPropagation();
        var summary = li.querySelector(".thought-summary");
        if (summary) placeCaretAtStartSoon(summary);
        return;
      }

      // Enter in summary (or elsewhere) -> new titled bullet.
      e.preventDefault();
      e.stopPropagation();
      var newLi = document.createElement("li");
      newLi.innerHTML = emptyTitledLiHtml();
      if (li.nextSibling) {
        li.parentNode.insertBefore(newLi, li.nextSibling);
      } else {
        li.parentNode.appendChild(newLi);
      }
      var title = newLi.querySelector(".thought-title");
      if (title) placeCaretAtStartSoon(title);
      notifyChange();
    }

    function removeBullet(li) {
      var parent = li.parentNode;
      var prev = li.previousElementSibling;
      var next = li.nextElementSibling;
      parent.removeChild(li);

      // Always keep at least one empty titled bullet.
      if (!parent.querySelector("li")) {
        parent.innerHTML = "<li>" + emptyTitledLiHtml() + "</li>";
        repairAllPlaceholderFields();
        placeCaretAtStartSoon(parent.querySelector(".thought-title"));
        notifyChange();
        return;
      }

      if (prev && prev.nodeName === "LI") {
        placeCaretAtEndSoon(
          prev.querySelector(".thought-summary") ||
            prev.querySelector(".thought-title") ||
            prev
        );
      } else if (next && next.nodeName === "LI") {
        placeCaretAtStartSoon(
          next.querySelector(".thought-title") || next
        );
      }
      notifyChange();
    }

    function handleBackspace(e, li, anchor) {
      var summary = closestClass(anchor, "thought-summary");
      var title = closestClass(anchor, "thought-title");
      var titleEl = li.querySelector(".thought-title");
      var summaryEl = li.querySelector(".thought-summary");
      var bothEmpty = isEmptyField(titleEl) && isEmptyField(summaryEl);

      // In summary: delete text normally; at start/empty, jump to title end
      // unless the whole bullet is empty — then remove it.
      if (summary) {
        var summaryText = (summary.textContent || "")
          .replace(/\\u00a0/g, " ")
          .replace(/\\n/g, "")
          .trim();

        // Last character: must force-clear. preventDefault alone leaves the
        // letter stuck because repairEmptyField only clears already-empty fields.
        if (summaryText.length === 1 && window.getSelection().isCollapsed) {
          e.preventDefault();
          e.stopPropagation();
          clearField(summary, "Summary");
          placeCaretAtStartSoon(summary);
          notifyChange();
          return;
        }

        if (isEmptyField(summary) || isCaretAtStartOf(summary)) {
          e.preventDefault();
          e.stopPropagation();
          // Only wipe when already empty — at-start with text just moves to title.
          if (isEmptyField(summary)) {
            clearField(summary, "Summary");
            if (isEmptyField(titleEl)) {
              removeBullet(li);
              return;
            }
          }
          if (titleEl) placeCaretAtEndSoon(titleEl);
          return;
        }

        return;
      }

      // In title: delete text normally; at start/empty with empty summary,
      // remove the bullet. Otherwise move to the previous bullet.
      if (title && (isEmptyField(title) || isCaretAtStartOf(title))) {
        e.preventDefault();
        e.stopPropagation();

        if (bothEmpty) {
          removeBullet(li);
          return;
        }

        var prev = li.previousElementSibling;
        if (prev && prev.nodeName === "LI") {
          placeCaretAtEndSoon(
            prev.querySelector(".thought-summary") ||
              prev.querySelector(".thought-title") ||
              prev
          );
          return;
        }

        repairEmptyField(title, "Title");
        repairEmptyField(summaryEl, "Summary");
        placeCaretAtStartSoon(title);
      }
    }

    content.addEventListener(
      "keydown",
      function (e) {
        var isEnter = e.key === "Enter";
        var isBackspace = e.key === "Backspace" || e.keyCode === 8;
        if (!isEnter && !isBackspace) return;

        ensureUl();
        if (!content.querySelector("ul")) {
          e.preventDefault();
          return;
        }

        var sel = window.getSelection();
        var anchor = sel && sel.anchorNode;
        var li = closestLi(anchor);

        if (!li) {
          e.preventDefault();
          ensureUl();
          return;
        }

        // Titles off: keep native list editing.
        if (!window.__mcShowTitles) return;

        if (isEnter) {
          handleEnter(e, li, anchor);
          return;
        }

        handleBackspace(e, li, anchor);
      },
      true
    );

    content.addEventListener("input", function () {
      ensureUl();
      normalizeTitledLis();
      repairAllPlaceholderFields();
    });

    ensureUl();
    normalizeTitledLis();
    repairAllPlaceholderFields();
  }

  true;
})();
`;

export function setShowTitlesScript(showTitles: boolean): string {
  return `window.__mcShowTitles = ${showTitles ? "true" : "false"}; true;`;
}
