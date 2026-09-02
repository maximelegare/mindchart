/** Injected into the pell WebView to keep content as bullets and shape titled items. */
export const BULLET_EDITOR_GUARD_SCRIPT = `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;

  function mcPh(key, fallback) {
    var p = window.__mcPlaceholders;
    return (p && p[key]) || fallback;
  }

  if (!window.__mcBulletGuardInstalled) {
    window.__mcBulletGuardInstalled = true;
    // Preserve a flag set by setShowTitlesScript; only default when unset.
    if (typeof window.__mcShowTitles !== "boolean") {
      window.__mcShowTitles = false;
    }
    var CATEGORY_FADE_MS = 3000;
    var COLLAPSE_TRANSITION_MS = 380;

    function emptyTitledFieldsHtml() {
      return (
        '<div class="thought-title is-placeholder" data-placeholder="' +
        mcPh("title", "Title") +
        '"><br></div>' +
        '<div class="thought-summary is-placeholder" data-placeholder="' +
        mcPh("summary", "Summary") +
        '"><br></div>'
      );
    }

    function emptyUntitledFieldHtml() {
      return (
        '<div class="thought-summary is-placeholder" data-placeholder="' +
        mcPh("bullet", "Enter a bullet point") +
        '"><br></div>'
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

    function thoughtCheckHtml() {
      return (
        '<button type="button" class="thought-check" contenteditable="false">' +
        '<span class="thought-check-box"></span></button>'
      );
    }

    function thoughtItemInnerHtml(categoryId, fieldsHtml) {
      return (
        '<div class="thought-rail" contenteditable="false">' +
        '<div class="thought-stripe"></div></div>' +
        thoughtCheckHtml() +
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
      if (window.__mcSimplified) return;
      var stripe = li && li.querySelector(".thought-stripe");
      if (!stripe) return;
      stripe.classList.remove("is-bouncing");
      // Retrigger CSS animation.
      void stripe.offsetWidth;
      stripe.classList.add("is-bouncing");
      li.__mcBounceTimer = setTimeout(function () {
        stripe.classList.remove("is-bouncing");
        li.__mcBounceTimer = null;
      }, 1800);
    }

    function collapseThoughtCategory(li) {
      if (!li || window.__mcSimplified) return;
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
      if (!li || window.__mcSimplified) return;
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
      if (window.__mcSimplified) return;
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
          ".thought-rail, .thought-check, .thought-graph, .thought-category, .thought-body, .thought-fields"
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
      if (typeof window.__mcSyncChecklistLayouts === "function") {
        window.__mcSyncChecklistLayouts();
      }
    }

    function ensureUl() {
      if (content.querySelector("ul")) return;
      content.innerHTML =
        '<ul><li class="thought-item" data-category-id="uncategorized" data-completable="false" data-completed="false">' +
        emptyLiHtml("uncategorized") +
        "</li></ul>";
    }

    function clearField(el, placeholder) {
      if (!el) return;
      el.innerHTML = "<br>";
      el.setAttribute("data-placeholder", placeholder);
      el.classList.add("is-placeholder");
      el.classList.remove("is-error-placeholder");
    }

    function repairEmptyField(el, placeholder) {
      if (!el) return;
      if (isEmptyField(el)) {
        // Keep validation error copy until the user types.
        if (!el.classList.contains("is-error-placeholder")) {
          el.setAttribute("data-placeholder", placeholder);
        }
        el.classList.add("is-placeholder");
        var onlyBr =
          el.childNodes.length === 1 &&
          el.firstChild &&
          el.firstChild.nodeName === "BR";
        if (!onlyBr) {
          if (el.classList.contains("is-error-placeholder")) {
            var errPlaceholder =
              el.getAttribute("data-placeholder") || placeholder;
            el.innerHTML = "<br>";
            el.setAttribute("data-placeholder", errPlaceholder);
            el.classList.add("is-placeholder");
            el.classList.add("is-error-placeholder");
          } else {
            clearField(el, placeholder);
          }
        }
      } else {
        el.classList.remove("is-placeholder");
        el.classList.remove("is-error-placeholder");
        el.setAttribute("data-placeholder", placeholder);
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
      e.preventDefault();
      e.stopPropagation();

      if (window.__mcShowTitles) {
        var inTitle = closestClass(anchor, "thought-title");
        if (inTitle) {
          var summary = li.querySelector(".thought-summary");
          if (summary) placeCaretAtStartSoon(summary);
          return;
        }
      }

      var newLi = document.createElement("li");
      var categoryId = liCategoryId(li);
      var completable = li.getAttribute("data-completable") === "true";
      newLi.className = completable ? "thought-item is-checklist" : "thought-item";
      newLi.setAttribute("data-category-id", categoryId);
      newLi.setAttribute("data-completable", completable ? "true" : "false");
      newLi.setAttribute("data-completed", "false");
      newLi.innerHTML = emptyLiHtml(categoryId);
      if (li.nextSibling) {
        li.parentNode.insertBefore(newLi, li.nextSibling);
      } else {
        li.parentNode.appendChild(newLi);
      }
      scheduleCollapse(newLi);
      if (typeof window.__mcSyncChecklistLayouts === "function") {
        window.__mcSyncChecklistLayouts();
      }
      var focusField = window.__mcShowTitles
        ? newLi.querySelector(".thought-title")
        : newLi.querySelector(".thought-summary");
      if (focusField) placeCaretAtStartSoon(focusField);
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
          '<li class="thought-item" data-category-id="uncategorized" data-completable="false" data-completed="false">' +
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
      var now = Date.now();
      if (
        window.__mcCategoryPickerAt &&
        now - window.__mcCategoryPickerAt < 400
      ) {
        return;
      }
      window.__mcCategoryPickerAt = now;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "SELECT_CATEGORY", data: index })
      );
    }

    function onCategoryChromePointer(e) {
      if (window.__mcSimplified) return;
      if (closestClass(e.target, "thought-check")) return;
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
        // Collapsed label is not hittable; stripe/rail expands only.
        return;
      }

      // Expanded: open category picker from label or stripe.
      openCategoryPicker(li);
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

    content.addEventListener("click", onCategoryChromePointer, true);
    // Android WebView often delivers contenteditable=false taps more reliably here.
    content.addEventListener(
      "touchend",
      function (e) {
        var chip = closestClass(e.target, "thought-category");
        var stripe = closestClass(e.target, "thought-stripe");
        var rail = closestClass(e.target, "thought-rail");
        if (!chip && !stripe && !rail) return;
        onCategoryChromePointer(e);
      },
      true
    );

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

const DEFAULT_EMPTY_BULLET_ERROR = "Add at least one bullet point";
const DEFAULT_TITLE_REQUIRED_ERROR = "Title is required";
const DEFAULT_SUMMARY_REQUIRED_ERROR = "Summary is required";

export type ThoughtValidationIncomplete = {
  index: number;
  missingTitle: boolean;
  missingSummary: boolean;
};

/** Highlight empty / incomplete thought fields with red required placeholders. */
export function setThoughtValidationErrorsScript(options: {
  emptyContent: boolean;
  incomplete: ThoughtValidationIncomplete[];
  messages?: {
    titleRequired?: string;
    summaryRequired?: string;
    emptyBullet?: string;
  };
}): string {
  const titleMsg = JSON.stringify(
    options.messages?.titleRequired ?? DEFAULT_TITLE_REQUIRED_ERROR
  );
  const summaryMsg = JSON.stringify(
    options.messages?.summaryRequired ?? DEFAULT_SUMMARY_REQUIRED_ERROR
  );
  const emptyMsg = JSON.stringify(
    options.messages?.emptyBullet ?? DEFAULT_EMPTY_BULLET_ERROR
  );

  return `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return false;

  function clearErrors() {
    var errored = content.querySelectorAll(".is-error-placeholder");
    for (var i = 0; i < errored.length; i++) {
      errored[i].classList.remove("is-error-placeholder");
    }
  }

  function markError(el, placeholder) {
    if (!el) return;
    el.classList.remove("is-error-placeholder");
    el.classList.remove("is-placeholder");
    el.removeAttribute("data-placeholder");
    el.innerHTML = "<br>";
    // Force a style recalc so ::before placeholders reappear after clear.
    void el.offsetWidth;
    el.setAttribute("data-placeholder", placeholder);
    el.classList.add("is-placeholder");
    el.classList.add("is-error-placeholder");
  }

  clearErrors();

  var lis = content.querySelectorAll("ul > li.thought-item, ul > li");
  var emptyContent = ${options.emptyContent ? "true" : "false"};
  var incomplete = ${JSON.stringify(options.incomplete)};
  var titleMsg = ${titleMsg};
  var summaryMsg = ${summaryMsg};
  var emptyMsg = ${emptyMsg};
  var _nonce = ${Date.now()};
  void _nonce;

  if (emptyContent) {
    if (lis.length === 0) {
      var emptyFields = window.__mcShowTitles
        ? '<div class="thought-title is-placeholder is-error-placeholder" data-placeholder="' +
          titleMsg +
          '"><br></div>' +
          '<div class="thought-summary is-placeholder is-error-placeholder" data-placeholder="' +
          summaryMsg +
          '"><br></div>'
        : '<div class="thought-summary is-placeholder is-error-placeholder" data-placeholder="' +
          emptyMsg +
          '"><br></div>';
      content.innerHTML =
        '<ul><li class="thought-item" data-category-id="uncategorized" data-completable="false" data-completed="false">' +
        '<div class="thought-fields">' +
        emptyFields +
        "</div></li></ul>";
      return true;
    }

    for (var i = 0; i < lis.length; i++) {
      var li = lis[i];
      if (window.__mcShowTitles) {
        markError(li.querySelector(".thought-title"), titleMsg);
        markError(li.querySelector(".thought-summary"), summaryMsg);
      } else {
        var summary = li.querySelector(".thought-summary");
        if (summary) {
          markError(summary, emptyMsg);
        } else {
          var fields = li.querySelector(".thought-fields") || li;
          var errorEl = document.createElement("div");
          errorEl.className =
            "thought-summary is-placeholder is-error-placeholder";
          errorEl.setAttribute("data-placeholder", emptyMsg);
          errorEl.innerHTML = "<br>";
          fields.appendChild(errorEl);
        }
      }
    }
    return true;
  }

  for (var j = 0; j < incomplete.length; j++) {
    var item = incomplete[j];
    var row = lis[item.index];
    if (!row) continue;
    if (item.missingTitle) {
      markError(row.querySelector(".thought-title"), titleMsg);
    }
    if (item.missingSummary) {
      markError(row.querySelector(".thought-summary"), summaryMsg);
    }
  }

  return true;
})();
true;
`;
}

export function clearThoughtValidationErrorsScript(): string {
  return `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return false;
  var errored = content.querySelectorAll(".is-error-placeholder");
  for (var i = 0; i < errored.length; i++) {
    var el = errored[i];
    el.classList.remove("is-error-placeholder");
    if (el.classList.contains("thought-title")) {
      el.setAttribute("data-placeholder", "Title");
    } else if (window.__mcShowTitles) {
      el.setAttribute("data-placeholder", "Summary");
    } else {
      el.setAttribute("data-placeholder", "Enter a bullet point");
    }
  }
  return true;
})();
true;
`;
}

/** Toggle simplified (plain bullets) chrome inside the editor WebView. */
export function setSimplifiedModeScript(
  simplified: boolean,
  borderColor: string
): string {
  const css = simplified
    ? `
      .thought-title {
        display: none !important;
        height: 0 !important;
        margin: 0 !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }
      .thought-category {
        display: none !important;
        opacity: 0 !important;
        height: 0 !important;
        margin: 0 !important;
        pointer-events: none !important;
      }
      .thought-rail {
        pointer-events: none !important;
        cursor: default !important;
      }
      .thought-stripe,
      li.thought-item .thought-stripe,
      li.thought-item.is-collapsed .thought-stripe {
        top: 8px !important;
        bottom: auto !important;
        width: 6px !important;
        height: 6px !important;
        margin-left: -3px !important;
        border-radius: 999px !important;
        background-color: ${borderColor} !important;
        transition: none !important;
        animation: none !important;
        transform: none !important;
      }
      .thought-stripe.is-bouncing {
        animation: none !important;
      }
    `
    : "";

  return `
(function () {
  window.__mcSimplified = ${simplified ? "true" : "false"};

  var style = document.getElementById("mc-simplified-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "mc-simplified-style";
    document.head.appendChild(style);
  }
  style.textContent = ${JSON.stringify(css)};

  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (content) {
    var lis = content.querySelectorAll("ul > li.thought-item, ul > li");
    for (var i = 0; i < lis.length; i++) {
      var li = lis[i];
      if (li.__mcCollapseTimer) {
        clearTimeout(li.__mcCollapseTimer);
        li.__mcCollapseTimer = null;
      }
      if (li.__mcBounceTimer) {
        clearTimeout(li.__mcBounceTimer);
        li.__mcBounceTimer = null;
      }
      li.classList.remove("is-collapsed");
      var stripe = li.querySelector(".thought-stripe");
      if (stripe) stripe.classList.remove("is-bouncing");
    }
  }

  if (!window.__mcSimplified && typeof window.__mcRefreshCategoryTimers === "function") {
    window.__mcRefreshCategoryTimers();
  }
  return true;
})();
`;
}

export const REFRESH_CATEGORY_TIMERS_SCRIPT = `
(function () {
  if (typeof window.__mcRefreshCategoryTimers === "function") {
    window.__mcRefreshCategoryTimers();
  }
  true;
})();
`;

/** Category fade/collapse for view-only editors (does not rebuild chrome). */
export const CATEGORY_COLLAPSE_SCRIPT = `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content || window.__mcCategoryCollapseInstalled) return true;
  window.__mcCategoryCollapseInstalled = true;

  var CATEGORY_FADE_MS = 3000;
  var COLLAPSE_TRANSITION_MS = 380;

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

  function clearCollapseTimer(li) {
    if (li && li.__mcCollapseTimer) {
      clearTimeout(li.__mcCollapseTimer);
      li.__mcCollapseTimer = null;
    }
  }

  function bounceStripe(li) {
    if (window.__mcSimplified) return;
    var stripe = li && li.querySelector(".thought-stripe");
    if (!stripe) return;
    if (li.__mcBounceTimer) {
      clearTimeout(li.__mcBounceTimer);
      li.__mcBounceTimer = null;
    }
    stripe.classList.remove("is-bouncing");
    void stripe.offsetWidth;
    stripe.classList.add("is-bouncing");
    li.__mcBounceTimer = setTimeout(function () {
      stripe.classList.remove("is-bouncing");
      li.__mcBounceTimer = null;
    }, 1800);
  }

  function collapseThoughtCategory(li) {
    if (!li || window.__mcSimplified) return;
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
    if (!li || window.__mcSimplified) return;
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
    if (window.__mcSimplified) return;
    var lis = content.querySelectorAll("ul > li.thought-item");
    for (var i = 0; i < lis.length; i++) {
      if (!lis[i].classList.contains("is-collapsed")) {
        scheduleCollapse(lis[i]);
      }
    }
  };

  content.addEventListener(
    "click",
    function (e) {
      // Edit mode owns category chrome clicks (opens the picker).
      if (window.__mcBulletGuardInstalled) return;
      if (window.__mcSimplified) return;
      if (closestClass(e.target, "thought-check")) return;
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
      } else {
        scheduleCollapse(li);
      }
    },
    true
  );

  window.__mcRefreshCategoryTimers();
  return true;
})();
`;

/** Listen for graph button taps inside the editor WebView. */
export const GRAPH_BUTTON_CLICK_SCRIPT = `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content || window.__mcGraphButtonInstalled) return true;
  window.__mcGraphButtonInstalled = true;

  function closestGraph(node) {
    while (node && node !== content) {
      if (
        node.classList &&
        node.classList.contains("thought-graph")
      ) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  content.addEventListener(
    "click",
    function (event) {
      var btn = closestGraph(event.target);
      if (!btn) return;
      event.preventDefault();
      event.stopPropagation();
      var thoughtId = btn.getAttribute("data-thought-id");
      if (!thoughtId || !window.ReactNativeWebView) return;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "OPEN_GRAPH", data: thoughtId })
      );
    },
    true
  );
  return true;
})();
`;

export function setThoughtListTypeScript(completable: boolean): string {
  return `
(function () {
  if (typeof window.__mcSetThoughtListType === "function") {
    window.__mcSetThoughtListType(${completable ? "true" : "false"});
  }
  true;
})();
`;
}

export const SYNC_CHECKLIST_LAYOUT_SCRIPT = `
(function () {
  if (typeof window.__mcSyncChecklistLayouts === "function") {
    window.__mcSyncChecklistLayouts();
  }
  true;
})();
`;

/** Checkbox chrome, layout, and completion toggles inside the pell WebView. */
export const CHECKLIST_SCRIPT = `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;

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

  function isTrueAttr(el, name) {
    var value = el && el.getAttribute(name);
    return value === "true" || value === "1";
  }

  function ensureCheckbox(li) {
    if (!li) return null;
    var check = li.querySelector(".thought-check");
    if (check) return check;
    check = document.createElement("button");
    check.type = "button";
    check.className = "thought-check";
    check.setAttribute("contenteditable", "false");
    check.innerHTML = '<span class="thought-check-box"></span>';
    var rail = li.querySelector(".thought-rail");
    if (rail && rail.nextSibling) {
      li.insertBefore(check, rail.nextSibling);
    } else if (rail) {
      li.appendChild(check);
    } else {
      li.insertBefore(check, li.firstChild);
    }
    return check;
  }

  function syncChecklistLayout(li) {
    if (!li) return;
    var check = ensureCheckbox(li);
    var completable = isTrueAttr(li, "data-completable");
    var completed = completable && isTrueAttr(li, "data-completed");
    li.classList.toggle("is-checklist", completable);
    li.classList.toggle("is-completed", completed);
    if (check) {
      check.setAttribute("aria-checked", completed ? "true" : "false");
    }

    var title = li.querySelector(".thought-title");
    var summary = li.querySelector(".thought-summary");
    var graph = li.querySelector(".thought-graph");
    var hasTitle = !!window.__mcShowTitles && !!title;
    li.classList.toggle("has-title", hasTitle);

    var field = summary || title;
    var fieldH = field ? field.offsetHeight : 0;
    var singleLine = !hasTitle && fieldH <= 40;
    li.classList.toggle("is-single-line", singleLine);
    li.classList.toggle("has-graph", !!graph);

    if (!check) return;
    check.style.left = "";
    check.style.right = "";
    check.style.top = "";
    check.style.transform = "";

    if (!completable) return;

    if (hasTitle) {
      var align = summary || title;
      check.style.left = "-7px";
      var top = align ? align.offsetTop : 0;
      check.style.top = Math.max(0, top - 7) + "px";
    } else if (singleLine) {
      check.style.left = "auto";
      check.style.right = graph ? "32px" : "0px";
      check.style.top = "0px";
    } else {
      check.style.left = "-7px";
      check.style.top = "14px";
    }
  }

  function syncAll() {
    var root =
      document.querySelector(".pell-content") || document.getElementById("editor");
    if (!root) return;
    var lis = root.querySelectorAll("ul > li");
    for (var i = 0; i < lis.length; i++) {
      syncChecklistLayout(lis[i]);
    }
  }

  function postCaretType(li) {
    if (!window.ReactNativeWebView || !li) return;
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "CARET_LIST_TYPE",
        data: { completable: isTrueAttr(li, "data-completable") },
      })
    );
  }

  function toggleCompleted(li) {
    if (!li || !isTrueAttr(li, "data-completable")) return;
    var now = Date.now();
    if (li.__mcCheckAt && now - li.__mcCheckAt < 400) return;
    li.__mcCheckAt = now;
    var next = !isTrueAttr(li, "data-completed");
    li.setAttribute("data-completed", next ? "true" : "false");
    syncChecklistLayout(li);
    try {
      content.dispatchEvent(new Event("input", { bubbles: true }));
    } catch (err) {}
    if (!window.ReactNativeWebView || !li.parentNode) return;
    var index = Array.prototype.indexOf.call(li.parentNode.children, li);
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "TOGGLE_COMPLETED",
        data: { index: index, completed: next },
      })
    );
  }

  window.__mcSyncChecklistLayouts = syncAll;

  window.__mcSetThoughtListType = function (completable) {
    var sel = window.getSelection();
    var li = closestLi(sel && sel.anchorNode);
    if (!li) li = content.querySelector("ul > li");
    if (!li) return true;
    li.setAttribute("data-completable", completable ? "true" : "false");
    if (!completable) {
      li.setAttribute("data-completed", "false");
    }
    syncChecklistLayout(li);
    try {
      content.dispatchEvent(new Event("input", { bubbles: true }));
    } catch (err) {}
    postCaretType(li);
    if (window.ReactNativeWebView && li.parentNode) {
      var index = Array.prototype.indexOf.call(li.parentNode.children, li);
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "LIST_TYPE",
          data: { index: index, completable: !!completable },
        })
      );
    }
    return true;
  };

  if (!window.__mcChecklistInstalled) {
    window.__mcChecklistInstalled = true;

    content.addEventListener(
      "click",
      function (e) {
        var check = closestClass(e.target, "thought-check");
        if (!check) return;
        e.preventDefault();
        e.stopPropagation();
        var li = closestLi(check);
        if (li) toggleCompleted(li);
      },
      true
    );

    content.addEventListener(
      "touchend",
      function (e) {
        var check = closestClass(e.target, "thought-check");
        if (!check) return;
        e.preventDefault();
        e.stopPropagation();
        var li = closestLi(check);
        if (li) toggleCompleted(li);
      },
      true
    );

    document.addEventListener("selectionchange", function () {
      var sel = window.getSelection();
      var li = closestLi(sel && sel.anchorNode);
      if (li) postCaretType(li);
    });

    if (typeof ResizeObserver !== "undefined") {
      var observer = new ResizeObserver(function () {
        syncAll();
      });
      observer.observe(content);
    }
  }

  syncAll();
  return true;
})();
`;
