/** Injected into the pell WebView to keep content as bullets and shape titled items. */
export const BULLET_EDITOR_GUARD_SCRIPT = `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;

  if (!window.__mcBulletGuardInstalled) {
    window.__mcBulletGuardInstalled = true;
    window.__mcShowTitles = false;
    var CATEGORY_FADE_MS = 5000;
    var COLLAPSE_TRANSITION_MS = 380;

    function emptyTitledFieldsHtml() {
      return (
        '<div class="thought-title is-placeholder" data-placeholder="Title"><br></div>' +
        '<div class="thought-summary is-placeholder" data-placeholder="Summary"><br></div>'
      );
    }

    function emptyUntitledFieldHtml() {
      return (
        '<div class="thought-summary is-placeholder" data-placeholder="Enter a bullet point"><br></div>'
      );
    }

    function categoryLabelHtml(categoryId) {
      var id = categoryId || "uncategorized";
      var label = id.charAt(0).toUpperCase() + id.slice(1);
      return (
        '<div class="thought-category" contenteditable="false" data-category-id="' +
        id +
        '"><span class="thought-category-name">' +
        label +
        "</span></div>"
      );
    }

    function thoughtItemInnerHtml(categoryId, fieldsHtml) {
      return (
        '<div class="thought-rail" contenteditable="false">' +
        '<div class="thought-stripe"></div></div>' +
        '<div class="thought-body">' +
        categoryLabelHtml(categoryId) +
        '<div class="thought-fields">' +
        fieldsHtml +
        "</div></div>"
      );
    }

    function emptyLiHtml(categoryId) {
      var fields = window.__mcShowTitles
        ? emptyTitledFieldsHtml()
        : emptyUntitledFieldHtml();
      return thoughtItemInnerHtml(categoryId, fields);
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

    function postCursorOffset(preferEl) {
      if (!window.ReactNativeWebView) return;
      var sel = window.getSelection();
      var node = (sel && sel.anchorNode) || preferEl;
      if (!node) return;
      var el = node.nodeType === 3 ? node.parentElement : node;
      var field =
        closestClass(el, "thought-summary") ||
        closestClass(el, "thought-title") ||
        preferEl ||
        el;
      if (!field) return;

      var offsetY = 0;
      if (field.getBoundingClientRect) {
        offsetY = Math.round(
          field.getBoundingClientRect().top + (window.scrollY || 0)
        );
      }
      if (!offsetY) {
        var walk = field;
        while (walk) {
          if (walk.offsetTop) {
            offsetY = walk.offsetTop;
            break;
          }
          walk = walk.parentElement;
        }
      }
      if (!offsetY) return;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "OFFSET_Y", data: offsetY })
      );
    }

    function placeCaretAtStartSoon(el) {
      placeCaretAtStart(el);
      setTimeout(function () {
        placeCaretAtStart(el);
        postCursorOffset(el);
      }, 0);
    }

    function placeCaretAtEndSoon(el) {
      placeCaretAtEnd(el);
      setTimeout(function () {
        placeCaretAtEnd(el);
        postCursorOffset(el);
      }, 0);
    }

    function liCategoryId(li) {
      if (!li) return "uncategorized";
      return li.getAttribute("data-category-id") || "uncategorized";
    }

    function clearCollapseTimer(li) {
      if (li && li.__mcCollapseTimer) {
        clearTimeout(li.__mcCollapseTimer);
        li.__mcCollapseTimer = null;
      }
      if (li && li.__mcBounceTimer) {
        clearTimeout(li.__mcBounceTimer);
        li.__mcBounceTimer = null;
      }
    }

    function bounceStripe(li) {
      var stripe = li && li.querySelector(".thought-stripe");
      if (!stripe) return;
      stripe.classList.remove("is-bouncing");
      // Retrigger CSS animation.
      void stripe.offsetWidth;
      stripe.classList.add("is-bouncing");
      li.__mcBounceTimer = setTimeout(function () {
        stripe.classList.remove("is-bouncing");
        li.__mcBounceTimer = null;
      }, 700);
    }

    function collapseThoughtCategory(li) {
      if (!li) return;
      li.classList.add("is-collapsed");
      li.__mcBounceTimer = setTimeout(function () {
        bounceStripe(li);
      }, COLLAPSE_TRANSITION_MS);
    }

    function expandThoughtCategory(li, reschedule) {
      if (!li) return;
      clearCollapseTimer(li);
      var stripe = li.querySelector(".thought-stripe");
      if (stripe) stripe.classList.remove("is-bouncing");
      li.classList.remove("is-collapsed");
      if (reschedule !== false) {
        scheduleCollapse(li);
      }
    }

    function scheduleCollapse(li) {
      if (!li) return;
      clearCollapseTimer(li);
      li.classList.remove("is-collapsed");
      var stripe = li.querySelector(".thought-stripe");
      if (stripe) stripe.classList.remove("is-bouncing");
      li.__mcCollapseTimer = setTimeout(function () {
        collapseThoughtCategory(li);
        li.__mcCollapseTimer = null;
      }, CATEGORY_FADE_MS);
    }

    window.__mcExpandThoughtCategory = function (li) {
      expandThoughtCategory(li, true);
    };

    window.__mcRefreshCategoryTimers = function () {
      var lis = content.querySelectorAll("ul > li");
      for (var i = 0; i < lis.length; i++) {
        ensureCategoryChrome(lis[i]);
        if (!lis[i].classList.contains("is-collapsed")) {
          scheduleCollapse(lis[i]);
        }
      }
    };

    function ensureCategoryChrome(li) {
      if (!li) return;
      var categoryId = liCategoryId(li);
      li.classList.add("thought-item");
      li.setAttribute("data-category-id", categoryId);

      var rail = li.querySelector(".thought-rail");
      var body = li.querySelector(".thought-body");
      var fields = li.querySelector(".thought-fields");
      var chip = li.querySelector(".thought-category");

      if (rail && body && fields && chip) {
        chip.setAttribute("data-category-id", categoryId);
        if (!li.__mcCollapseTimer && !li.classList.contains("is-collapsed")) {
          scheduleCollapse(li);
        }
        return;
      }

      // Rebuild chrome while preserving editable field content.
      var title = li.querySelector(".thought-title");
      var summary = li.querySelector(".thought-summary");
      var fieldsHtml = "";
      if (title || summary) {
        if (title) fieldsHtml += title.outerHTML;
        if (summary) fieldsHtml += summary.outerHTML;
      } else {
        var clone = li.cloneNode(true);
        var stripSel = clone.querySelectorAll(
          ".thought-rail, .thought-category, .thought-body, .thought-fields"
        );
        for (var s = 0; s < stripSel.length; s++) {
          var node = stripSel[s];
          if (node.parentNode) node.parentNode.removeChild(node);
        }
        var text = (clone.textContent || "").trim();
        fieldsHtml = text
          ? clone.innerHTML
          : window.__mcShowTitles
            ? emptyTitledFieldsHtml()
            : emptyUntitledFieldHtml();
      }

      var wasCollapsed = li.classList.contains("is-collapsed");
      li.innerHTML = thoughtItemInnerHtml(categoryId, fieldsHtml);
      if (wasCollapsed) {
        li.classList.add("is-collapsed");
      } else {
        scheduleCollapse(li);
      }
    }

    function ensureUl() {
      if (content.querySelector("ul")) return;
      content.innerHTML =
        '<ul><li class="thought-item" data-category-id="uncategorized">' +
        emptyLiHtml("uncategorized") +
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
        if (!onlyBr) {
          clearField(el, placeholder);
        }
      } else {
        el.classList.remove("is-placeholder");
      }
    }

    function repairAllPlaceholderFields() {
      var titles = content.querySelectorAll(".thought-title");
      var summaries = content.querySelectorAll(".thought-summary");
      for (var t = 0; t < titles.length; t++) {
        repairEmptyField(titles[t], "Title");
      }
      for (var s = 0; s < summaries.length; s++) {
        var summary = summaries[s];
        var li = closestLi(summary);
        var placeholder = window.__mcShowTitles
          ? "Summary"
          : "Enter a bullet point";
        if (!window.__mcShowTitles && li && li.querySelector(".thought-title")) {
          continue;
        }
        repairEmptyField(summary, placeholder);
      }
    }

    function getFieldsContainer(li) {
      return li.querySelector(".thought-fields") || li;
    }

    function normalizeUntitledLis() {
      if (window.__mcShowTitles) return;
      var lis = content.querySelectorAll("ul > li");
      for (var i = 0; i < lis.length; i++) {
        var li = lis[i];
        ensureCategoryChrome(li);

        var title = li.querySelector(".thought-title");
        if (title && title.parentNode) title.parentNode.removeChild(title);

        var summary = li.querySelector(".thought-summary");
        if (summary) {
          summary.setAttribute("data-placeholder", "Enter a bullet point");
          continue;
        }

        var fields = getFieldsContainer(li);
        var text = (fields.textContent || "").trim();
        fields.innerHTML =
          '<div class="thought-summary' +
          (text ? "" : " is-placeholder") +
          '" data-placeholder="Enter a bullet point">' +
          (text ? fields.innerHTML : "<br>") +
          "</div>";
      }
      repairAllPlaceholderFields();
    }

    function normalizeTitledLis() {
      if (!window.__mcShowTitles) return;
      var lis = content.querySelectorAll("ul > li");
      for (var i = 0; i < lis.length; i++) {
        var li = lis[i];
        ensureCategoryChrome(li);

        if (li.querySelector(".thought-title")) {
          if (!li.querySelector(".thought-summary")) {
            var summary = document.createElement("div");
            summary.className = "thought-summary is-placeholder";
            summary.setAttribute("data-placeholder", "Summary");
            summary.innerHTML = "<br>";
            getFieldsContainer(li).appendChild(summary);
          }
          continue;
        }

        var fields = getFieldsContainer(li);
        var existingSummary = fields.querySelector(".thought-summary");
        var text = existingSummary
          ? (existingSummary.textContent || "").trim()
          : (fields.textContent || "").trim();

        if (!text) {
          var wasCollapsed = li.classList.contains("is-collapsed");
          li.innerHTML = emptyLiHtml(liCategoryId(li));
          if (wasCollapsed) li.classList.add("is-collapsed");
          else scheduleCollapse(li);
        } else {
          var body = existingSummary
            ? existingSummary.innerHTML
            : fields.innerHTML;
          fields.innerHTML =
            '<div class="thought-title" data-placeholder="Title">' +
            body +
            '</div><div class="thought-summary is-placeholder" data-placeholder="Summary"><br></div>';
        }
      }
      repairAllPlaceholderFields();
    }

    function normalizeLis() {
      if (window.__mcShowTitles) {
        normalizeTitledLis();
      } else {
        normalizeUntitledLis();
      }
    }

    function notifyChange() {
      try {
        content.dispatchEvent(new Event("input", { bubbles: true }));
      } catch (e) {}
    }

    function handleEnter(e, li, anchor) {
      if (!window.__mcShowTitles) {
        setTimeout(function () {
          var next = li.nextElementSibling;
          if (next && next.nodeName === "LI") {
            next.setAttribute("data-category-id", liCategoryId(li));
            ensureCategoryChrome(next);
            scheduleCollapse(next);
          }
          normalizeLis();
          notifyChange();
          if (next && next.nodeName === "LI") {
            var field = next.querySelector(".thought-summary") || next;
            placeCaretAtStartSoon(field);
          }
        }, 0);
        return;
      }

      var inTitle = closestClass(anchor, "thought-title");
      if (inTitle) {
        e.preventDefault();
        e.stopPropagation();
        var summary = li.querySelector(".thought-summary");
        if (summary) placeCaretAtStartSoon(summary);
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      var newLi = document.createElement("li");
      var categoryId = liCategoryId(li);
      newLi.className = "thought-item";
      newLi.setAttribute("data-category-id", categoryId);
      newLi.innerHTML = emptyLiHtml(categoryId);
      if (li.nextSibling) {
        li.parentNode.insertBefore(newLi, li.nextSibling);
      } else {
        li.parentNode.appendChild(newLi);
      }
      scheduleCollapse(newLi);
      var title = newLi.querySelector(".thought-title");
      if (title) placeCaretAtStartSoon(title);
      notifyChange();
    }

    function removeBullet(li) {
      clearCollapseTimer(li);
      var parent = li.parentNode;
      var prev = li.previousElementSibling;
      var next = li.nextElementSibling;
      parent.removeChild(li);

      if (!parent.querySelector("li")) {
        parent.innerHTML =
          '<li class="thought-item" data-category-id="uncategorized">' +
          emptyLiHtml("uncategorized") +
          "</li>";
        var only = parent.querySelector("li");
        scheduleCollapse(only);
        repairAllPlaceholderFields();
        placeCaretAtStartSoon(
          parent.querySelector(".thought-title") ||
            parent.querySelector(".thought-summary")
        );
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
          next.querySelector(".thought-title") ||
            next.querySelector(".thought-summary") ||
            next
        );
      }
      notifyChange();
    }

    function handleBackspaceUntitled(e, li, anchor) {
      var summaryEl = li.querySelector(".thought-summary") || li;

      if (isEmptyField(summaryEl) || isCaretAtStartOf(summaryEl)) {
        e.preventDefault();
        e.stopPropagation();
        if (isEmptyField(summaryEl)) {
          removeBullet(li);
          return;
        }
        var prev = li.previousElementSibling;
        if (prev && prev.nodeName === "LI") {
          placeCaretAtEndSoon(
            prev.querySelector(".thought-summary") || prev
          );
        }
      }
    }

    function handleBackspace(e, li, anchor) {
      if (!window.__mcShowTitles) {
        handleBackspaceUntitled(e, li, anchor);
        return;
      }

      var summary = closestClass(anchor, "thought-summary");
      var title = closestClass(anchor, "thought-title");
      var titleEl = li.querySelector(".thought-title");
      var summaryEl = li.querySelector(".thought-summary");
      var bothEmpty = isEmptyField(titleEl) && isEmptyField(summaryEl);

      if (summary) {
        var summaryText = (summary.textContent || "")
          .replace(/\\u00a0/g, " ")
          .replace(/\\n/g, "")
          .trim();

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

    function openCategoryPicker(li) {
      if (!li || !li.parentNode || !window.ReactNativeWebView) return;
      var index = Array.prototype.indexOf.call(li.parentNode.children, li);
      if (index < 0) return;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "SELECT_CATEGORY", data: index })
      );
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

        if (
          closestClass(anchor, "thought-category") ||
          closestClass(anchor, "thought-rail")
        ) {
          e.preventDefault();
          return;
        }

        if (isEnter) {
          handleEnter(e, li, anchor);
          return;
        }

        handleBackspace(e, li, anchor);
      },
      true
    );

    content.addEventListener("click", function (e) {
      var rail = closestClass(e.target, "thought-rail");
      var stripe = closestClass(e.target, "thought-stripe");
      var chip = closestClass(e.target, "thought-category");
      if (!rail && !stripe && !chip) return;

      e.preventDefault();
      e.stopPropagation();

      var li = closestLi(e.target);
      if (!li) return;

      if (li.classList.contains("is-collapsed")) {
        expandThoughtCategory(li, true);
        return;
      }

      // Expanded: open category picker from label or stripe.
      openCategoryPicker(li);
    });

    content.addEventListener("input", function () {
      ensureUl();
      normalizeLis();
      repairAllPlaceholderFields();
    });

    ensureUl();
    normalizeLis();
    repairAllPlaceholderFields();
  }

  true;
})();
`;

export function setShowTitlesScript(showTitles: boolean): string {
  return `window.__mcShowTitles = ${showTitles ? "true" : "false"}; true;`;
}

export const REFRESH_CATEGORY_TIMERS_SCRIPT = `
(function () {
  if (typeof window.__mcRefreshCategoryTimers === "function") {
    window.__mcRefreshCategoryTimers();
  }
  true;
})();
`;
