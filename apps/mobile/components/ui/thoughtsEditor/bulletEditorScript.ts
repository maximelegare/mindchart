/** Injected into the pell WebView to keep thoughts as independent items. */
export const BULLET_EDITOR_GUARD_SCRIPT = `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;
  if (document.documentElement) {
    document.documentElement.classList.toggle(
      "mc-editing",
      !!window.__mcEditing
    );
  }
  content.classList.toggle("mc-editing", !!window.__mcEditing);

  function mcPh(key, fallback) {
    var p = window.__mcPlaceholders;
    return (p && p[key]) || fallback;
  }

  if (!window.__mcBulletGuardInstalled) {
    window.__mcBulletGuardInstalled = true;
    if (typeof window.__mcShowTitles !== "boolean") {
      window.__mcShowTitles = false;
    }

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
        mcPh("bullet", "Write Something...") +
        '"><br></div>'
      );
    }

    function thoughtCheckHtml() {
      return (
        '<button type="button" class="thought-check" contenteditable="false">' +
        '<span class="thought-check-box">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.75" aria-hidden="true">' +
        '<path d="M20 6L9 17l-5-5"/></svg></span></button>'
      );
    }

    function thoughtItemInnerHtml(categoryId, fieldsHtml) {
      return (
        '<div class="thought-rail" contenteditable="false">' +
        '<div class="thought-stripe"></div>' +
        '<div class="thought-dot"></div></div>' +
        thoughtCheckHtml() +
        '<div class="thought-body">' +
        '<div class="thought-fields">' +
        fieldsHtml +
        "</div></div>"
      );
    }

    function emptyLiHtml(categoryId) {
      return thoughtItemInnerHtml(
        categoryId,
        window.__mcShowTitles ? emptyTitledFieldsHtml() : emptyUntitledFieldHtml()
      );
    }

    function closest(node, predicate) {
      while (node && node !== document.body) {
        if (predicate(node)) return node;
        node = node.parentNode;
      }
      return null;
    }

    function closestThought(node) {
      return closest(node, function (n) {
        return n.classList && n.classList.contains("thought-item");
      });
    }

    function isThought(node) {
      return !!(node && node.classList && node.classList.contains("thought-item"));
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

    function isCaretAtEndOf(el) {
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount || !el) return true;
      var range = sel.getRangeAt(0);
      var node = range.endContainer;
      if (el !== node && !(el.contains && el.contains(node))) return true;
      var probe = range.cloneRange();
      probe.selectNodeContents(el);
      probe.setStart(range.endContainer, range.endOffset);
      return probe.toString().replace(/\\u00a0/g, " ").trim().length === 0;
    }

    function htmlHasText(html) {
      var probe = document.createElement("div");
      probe.innerHTML = html || "";
      return (
        (probe.textContent || "")
          .replace(/\\u00a0/g, " ")
          .replace(/\\n/g, " ")
          .trim().length > 0
      );
    }

    function stripSplitChrome(el, edge) {
      if (!el) return;
      if (edge === "end") {
        while (el.lastChild && el.lastChild.nodeName === "BR") {
          el.removeChild(el.lastChild);
        }
        return;
      }
      while (el.firstChild && el.firstChild.nodeName === "BR") {
        el.removeChild(el.firstChild);
      }
    }

    function applySummaryHtml(summary, html) {
      if (!summary) return;
      var probe = document.createElement("div");
      probe.innerHTML = html || "";
      var text = (probe.textContent || "")
        .replace(/\\u00a0/g, " ")
        .replace(/\\n/g, " ")
        .trim();
      if (!text) {
        summary.innerHTML = "<br>";
        summary.classList.add("is-placeholder");
        summary.classList.remove("is-error-placeholder");
        return;
      }
      summary.innerHTML = html;
      summary.classList.remove("is-placeholder");
      summary.classList.remove("is-error-placeholder");
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

    function fieldPlainText(el) {
      if (!el) return "";
      return (el.textContent || "")
        .replace(/\\u00a0/g, " ")
        .replace(/\\n/g, " ")
        .trim();
    }

    function liClassifyText(li) {
      var title = fieldPlainText(li.querySelector(".thought-title"));
      var summary = fieldPlainText(li.querySelector(".thought-summary"));
      return (title + " " + summary).trim();
    }

    function requestClassifyBullet(li) {
      if (!li || !li.parentNode || !window.ReactNativeWebView) return;
      var index = Array.prototype.indexOf.call(li.parentNode.children, li);
      if (index < 0) return;
      var text = liClassifyText(li);
      if (!text) return;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "CLASSIFY_BULLET",
          data: { index: index, text: text },
        })
      );
    }

    function requestParagraphSplit(li, newThoughtId) {
      if (!li || !li.parentNode || !window.ReactNativeWebView) return false;
      var text = fieldPlainText(li.querySelector(".thought-summary"));
      if (!text) return false;
      var index = Array.prototype.indexOf.call(li.parentNode.children, li);
      if (index < 0) return false;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "SPLIT_PARAGRAPH",
          data: {
            index: index,
            thoughtId: ensureThoughtId(li),
            newThoughtId: newThoughtId || "",
            text: text,
          },
        })
      );
      return true;
    }

    function applyPieceToThought(li, piece) {
      if (!li || !piece) return;
      li.setAttribute("data-thought-id", piece.id || ensureThoughtId(li));
      li.setAttribute("data-thought-type", "text");
      li.setAttribute("data-category-id", piece.categoryId || "uncategorized");
      li.classList.add("is-block");
      if (piece.inline) {
        li.classList.add("is-inline");
        li.setAttribute("data-inline", "true");
      } else {
        li.classList.remove("is-inline");
        li.removeAttribute("data-inline");
      }
      var summary = li.querySelector(".thought-summary");
      if (summary) {
        summary.textContent = piece.text || "";
        if (piece.text) {
          summary.classList.remove("is-placeholder");
          summary.classList.remove("is-error-placeholder");
        }
      }
      var fields = li.querySelector(".thought-fields") || li;
      var titleEl = li.querySelector(".thought-title");
      if (piece.title) {
        if (!titleEl) {
          titleEl = document.createElement("div");
          titleEl.className = "thought-title";
          titleEl.setAttribute("data-placeholder", mcPh("title", "Title"));
          fields.insertBefore(titleEl, fields.firstChild);
        }
        titleEl.textContent = piece.title;
        titleEl.classList.remove("is-placeholder");
        titleEl.classList.remove("is-error-placeholder");
        li.classList.add("has-entered-title");
      }
      var chip = li.querySelector(".thought-category");
      if (chip) {
        chip.setAttribute("data-category-id", piece.categoryId || "uncategorized");
      }
      ensureCategoryChrome(li);
    }

    function createCheckButton() {
      var check = document.createElement("button");
      check.type = "button";
      check.className = "thought-check";
      check.setAttribute("contenteditable", "false");
      check.innerHTML =
        '<span class="thought-check-box">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.75" aria-hidden="true">' +
        '<path d="M20 6L9 17l-5-5"/></svg></span>';
      return check;
    }

    function isChromeNode(node) {
      if (!node || !node.classList) return false;
      return (
        node.classList.contains("thought-rail") ||
        node.classList.contains("thought-check") ||
        node.classList.contains("thought-body") ||
        node.classList.contains("thought-graph") ||
        node.classList.contains("thought-expand") ||
        node.classList.contains("mc-thoughts")
      );
    }

    function summaryPlaceholder(li) {
      return window.__mcShowTitles || (li && li.querySelector(".thought-title"))
        ? mcPh("summary", "Summary")
        : mcPh("bullet", "Write Something...");
    }

    function newThoughtId() {
      return (
        "t" +
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 10)
      );
    }

    function ensureThoughtId(li) {
      if (!li) return "";
      var id = li.getAttribute("data-thought-id");
      if (id) return id;
      id = newThoughtId();
      li.setAttribute("data-thought-id", id);
      return id;
    }

    function ensureCategoryChrome(li) {
      if (!li) return;
      var categoryId = liCategoryId(li);
      li.classList.add("thought-item");
      ensureThoughtId(li);
      li.setAttribute("data-category-id", categoryId);
      if (!li.getAttribute("data-thought-type")) {
        li.setAttribute("data-thought-type", "li");
        li.setAttribute("data-completable", "false");
        li.setAttribute("data-completed", "false");
      }

      var fields = li.querySelector(".thought-fields");
      var body = li.querySelector(".thought-body");
      var rail = li.querySelector(".thought-rail");
      var check = li.querySelector(".thought-check");
      if (rail && body && fields) {
        if (!check) {
          li.insertBefore(createCheckButton(), body);
        }
        return;
      }

      var graph = li.querySelector(".thought-graph");
      if (graph && graph.parentNode) graph.parentNode.removeChild(graph);

      if (!fields) {
        var title = li.querySelector(".thought-title");
        var summary = li.querySelector(".thought-summary");
        fields = document.createElement("div");
        fields.className = "thought-fields";
        if (title || summary) {
          if (title) fields.appendChild(title);
          if (summary) fields.appendChild(summary);
        } else {
          var leftovers = [];
          while (li.firstChild) {
            var child = li.firstChild;
            li.removeChild(child);
            if (isChromeNode(child)) continue;
            leftovers.push(child);
          }
          for (var i = 0; i < leftovers.length; i++) {
            fields.appendChild(leftovers[i]);
          }
          if (!fields.querySelector(".thought-summary") && !fields.querySelector(".thought-title")) {
            var wrap = document.createElement("div");
            wrap.className =
              "thought-summary" + (isEmptyField(fields) ? " is-placeholder" : "");
            wrap.setAttribute("data-placeholder", summaryPlaceholder(li));
            while (fields.firstChild) wrap.appendChild(fields.firstChild);
            if (!wrap.firstChild) wrap.innerHTML = "<br>";
            fields.appendChild(wrap);
          }
        }
      }

      if (!body) {
        body = document.createElement("div");
        body.className = "thought-body";
      }
      if (fields.parentNode !== body) body.appendChild(fields);

      if (!rail) {
        rail = document.createElement("div");
        rail.className = "thought-rail";
        rail.setAttribute("contenteditable", "false");
        rail.innerHTML =
          '<div class="thought-stripe"></div><div class="thought-dot"></div>';
      }
      if (!check) check = createCheckButton();

      li.appendChild(rail);
      li.appendChild(check);
      li.appendChild(body);
      if (graph) li.appendChild(graph);
    }

    function listItemToThought(li) {
      if (!li) return null;
      if (li.classList && li.classList.contains("thought-item") && li.nodeName !== "LI") {
        return li;
      }
      var thought = document.createElement("div");
      thought.className = li.className || "";
      if (!thought.classList.contains("thought-item")) {
        thought.classList.add("thought-item");
      }
      if (li.attributes) {
        for (var a = 0; a < li.attributes.length; a++) {
          var attr = li.attributes[a];
          if (attr.name === "class") continue;
          thought.setAttribute(attr.name, attr.value);
        }
      }
      while (li.firstChild) thought.appendChild(li.firstChild);
      return thought;
    }

    function unwrapLists() {
      var lists = content.querySelectorAll("ul, ol");
      for (var i = lists.length - 1; i >= 0; i--) {
        var list = lists[i];
        var parent = list.parentNode;
        if (!parent) continue;
        var host = closestThought(list);
        var insertParent = host && host.parentNode ? host.parentNode : parent;
        var insertBefore = host && host.parentNode ? host.nextSibling : list;
        while (list.firstChild) {
          var child = list.firstChild;
          list.removeChild(child);
          var thought =
            child.nodeName === "LI"
              ? listItemToThought(child)
              : child.classList && child.classList.contains("thought-item")
                ? child
                : thoughtFromNode(child, "li");
          if (thought) {
            insertParent.insertBefore(thought, insertBefore);
            ensureCategoryChrome(thought);
          }
        }
        if (list.parentNode) list.parentNode.removeChild(list);
      }
    }

    function createThoughtShell(type) {
      var thoughtType =
        type === "text" || type === "li" || type === "checkbox" ? type : "li";
      var completable = thoughtType === "checkbox";
      var created = document.createElement("div");
      created.className =
        "thought-item" +
        (thoughtType === "text" ? " is-block" : "") +
        (completable ? " is-checklist" : "");
      created.setAttribute("data-thought-type", thoughtType);
      created.setAttribute("data-thought-id", newThoughtId());
      created.setAttribute("data-category-id", "uncategorized");
      created.setAttribute("data-completable", completable ? "true" : "false");
      created.setAttribute("data-completed", "false");
      created.innerHTML = emptyLiHtml("uncategorized");
      return created;
    }

    function fillThoughtSummary(created, node) {
      var summary = created.querySelector(".thought-summary");
      if (!summary) return created;
      if (node.nodeType === 3) {
        summary.textContent = node.textContent || "";
      } else if (node.nodeName === "BR") {
        summary.innerHTML = "<br>";
      } else {
        while (node.firstChild) summary.appendChild(node.firstChild);
      }
      if (isEmptyField(summary)) {
        summary.innerHTML = "<br>";
        summary.classList.add("is-placeholder");
      } else {
        summary.classList.remove("is-placeholder");
        summary.classList.remove("is-error-placeholder");
      }
      return created;
    }

    function thoughtFromNode(node, type) {
      if (!node) return null;
      if (node.nodeType === 1 && node.classList && node.classList.contains("thought-item")) {
        return node;
      }
      if (node.nodeType === 3 && !(node.textContent || "").trim()) return null;
      var created = createThoughtShell(type);
      fillThoughtSummary(created, node);
      return created;
    }

    function promoteStrayBlocks() {
      var root = content.querySelector(".mc-thoughts") || content;
      var node = root.firstChild;
      while (node) {
        var next = node.nextSibling;
        if (node.nodeType === 1 && node.classList && node.classList.contains("thought-item")) {
          var fields = node.querySelector(".thought-fields");
          if (fields) {
            var fieldChild = fields.firstChild;
            var insertAfter = node;
            while (fieldChild) {
              var fieldNext = fieldChild.nextSibling;
              var isKnown =
                fieldChild.classList &&
                (fieldChild.classList.contains("thought-summary") ||
                  fieldChild.classList.contains("thought-title"));
              if (isChromeNode(fieldChild)) {
                fieldChild = fieldNext;
                continue;
              }
              if (!isKnown && (fieldChild.nodeType !== 3 || (fieldChild.textContent || "").trim())) {
                var sibling = thoughtFromNode(
                  fieldChild,
                  node.getAttribute("data-thought-type") || "li"
                );
                if (sibling) {
                  if (fieldChild.parentNode) fieldChild.parentNode.removeChild(fieldChild);
                  insertAfter.parentNode.insertBefore(sibling, insertAfter.nextSibling);
                  ensureCategoryChrome(sibling);
                  insertAfter = sibling;
                }
              }
              fieldChild = fieldNext;
            }
          }
          node = next;
          continue;
        }
        if (isChromeNode(node)) {
          node = next;
          continue;
        }
        var prev = node.previousElementSibling;
        var type =
          prev && prev.classList && prev.classList.contains("thought-item")
            ? prev.getAttribute("data-thought-type")
            : "li";
        var thought = thoughtFromNode(node, type);
        if (thought) {
          root.insertBefore(thought, node);
          if (node.parentNode) node.parentNode.removeChild(node);
          ensureCategoryChrome(thought);
        } else if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        node = next;
      }
    }

    function emptyThoughtHtml() {
      return createThoughtShell("li").outerHTML;
    }

    function ensureThoughts() {
      unwrapLists();
      var root = content.querySelector(".mc-thoughts");
      if (!root) {
        root = document.createElement("div");
        root.className = "mc-thoughts";
        content.insertBefore(root, content.firstChild);
      }
      var child = content.firstChild;
      while (child) {
        var nextChild = child.nextSibling;
        if (child !== root) root.appendChild(child);
        child = nextChild;
      }
      promoteStrayBlocks();
      if (!root.querySelector(".thought-item")) {
        root.innerHTML = emptyThoughtHtml();
      }
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
        repairEmptyField(titles[t], mcPh("title", "Title"));
      }
      for (var s = 0; s < summaries.length; s++) {
        var summary = summaries[s];
        repairEmptyField(summary, summaryPlaceholder(closestThought(summary)));
      }
    }

    function getFieldsContainer(li) {
      return li.querySelector(".thought-fields") || li;
    }

    function normalizeUntitledLis() {
      if (window.__mcShowTitles) return;
      var lis = content.querySelectorAll(".thought-item");
      for (var i = 0; i < lis.length; i++) {
        var li = lis[i];
        ensureCategoryChrome(li);

        var title = li.querySelector(".thought-title");
        if (title && !(title.textContent || "").replace(/\\u00a0/g, " ").trim()) {
          if (title.parentNode) title.parentNode.removeChild(title);
        }

        var summary = li.querySelector(".thought-summary");
        if (summary) {
          if (!summary.classList.contains("is-error-placeholder")) {
            summary.setAttribute(
              "data-placeholder",
              mcPh("bullet", "Write Something...")
            );
          }
          continue;
        }

        var fields = getFieldsContainer(li);
        var wrap = document.createElement("div");
        wrap.className =
          "thought-summary" + (isEmptyField(fields) ? " is-placeholder" : "");
        wrap.setAttribute(
          "data-placeholder",
          mcPh("bullet", "Write Something...")
        );
        while (fields.firstChild) wrap.appendChild(fields.firstChild);
        if (!wrap.firstChild) wrap.innerHTML = "<br>";
        fields.appendChild(wrap);
      }
      repairAllPlaceholderFields();
    }

    function normalizeTitledLis() {
      if (!window.__mcShowTitles) return;
      var lis = content.querySelectorAll(".thought-item");
      for (var i = 0; i < lis.length; i++) {
        var li = lis[i];
        ensureCategoryChrome(li);

        if (li.querySelector(".thought-title")) {
          if (!li.querySelector(".thought-summary")) {
            var summary = document.createElement("div");
            summary.className = "thought-summary is-placeholder";
            summary.setAttribute("data-placeholder", mcPh("summary", "Summary"));
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
          var titleEl = document.createElement("div");
          titleEl.className = "thought-title is-placeholder";
          titleEl.setAttribute("data-placeholder", mcPh("title", "Title"));
          titleEl.innerHTML = "<br>";
          var summaryEl = document.createElement("div");
          summaryEl.className = "thought-summary is-placeholder";
          summaryEl.setAttribute("data-placeholder", mcPh("summary", "Summary"));
          summaryEl.innerHTML = "<br>";
          while (fields.firstChild) fields.removeChild(fields.firstChild);
          fields.appendChild(titleEl);
          fields.appendChild(summaryEl);
        } else if (existingSummary) {
          var movedTitle = document.createElement("div");
          movedTitle.className = "thought-title";
          movedTitle.setAttribute("data-placeholder", mcPh("title", "Title"));
          while (existingSummary.firstChild) {
            movedTitle.appendChild(existingSummary.firstChild);
          }
          existingSummary.className = "thought-summary is-placeholder";
          existingSummary.setAttribute(
            "data-placeholder",
            mcPh("summary", "Summary")
          );
          existingSummary.innerHTML = "<br>";
          fields.insertBefore(movedTitle, existingSummary);
        }
      }
      repairAllPlaceholderFields();
    }

    function stripThoughtSeparatorWhitespace(root) {
      if (!root) return;
      var node = root.firstChild;
      while (node) {
        var next = node.nextSibling;
        if (node.nodeType === 3 && !/\\S/.test(node.nodeValue || "")) {
          root.removeChild(node);
        }
        node = next;
      }
    }

    window.__mcStripThoughtSeparatorWhitespace = function () {
      stripThoughtSeparatorWhitespace(
        content.querySelector(".mc-thoughts") || content
      );
    };

    function normalizeLis() {
      unwrapLists();
      if (window.__mcShowTitles) {
        normalizeTitledLis();
      } else {
        normalizeUntitledLis();
      }
      stripThoughtSeparatorWhitespace(
        content.querySelector(".mc-thoughts") || content
      );
    }

    function notifyChange() {
      try {
        content.dispatchEvent(new Event("input", { bubbles: true }));
      } catch (e) {}
    }

    window.__mcApplyParagraphSplit = function (sourceId, pieces) {
      if (!sourceId || !pieces || !pieces.length) {
        notifyChange();
        return;
      }
      var source = content.querySelector(
        '.thought-item[data-thought-id="' +
          String(sourceId).replace(/"/g, "") +
          '"]'
      );
      if (!source) {
        notifyChange();
        return;
      }
      applyPieceToThought(source, pieces[0]);
      var insertBefore = source.nextSibling;
      for (var i = 1; i < pieces.length; i++) {
        var created = createThoughtShell("text");
        applyPieceToThought(created, pieces[i]);
        source.parentNode.insertBefore(created, insertBefore);
      }
      if (typeof window.__mcRefreshCategoryTimers === "function") {
        window.__mcRefreshCategoryTimers();
      }
      if (typeof window.__mcSyncChecklistLayouts === "function") {
        window.__mcSyncChecklistLayouts();
      }
      if (typeof window.__mcStripThoughtSeparatorWhitespace === "function") {
        window.__mcStripThoughtSeparatorWhitespace();
      }
      notifyChange();
    };

    function thoughtTypeOf(li) {
      var type = li && li.getAttribute("data-thought-type");
      if (type === "text" || type === "li" || type === "checkbox") return type;
      if (li && li.getAttribute("data-completable") === "true") return "checkbox";
      return "li";
    }

    var lastEnterAt = 0;
    function splitThoughtAtCaret(li, summary, type) {
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount || !summary) return false;
      var range = sel.getRangeAt(0);
      var node = range.startContainer;
      if (summary !== node && !(summary.contains && summary.contains(node))) {
        return false;
      }

      var before = document.createRange();
      before.selectNodeContents(summary);
      before.setEnd(range.startContainer, range.startOffset);
      var after = document.createRange();
      after.selectNodeContents(summary);
      after.setStart(range.startContainer, range.startOffset);

      var leftHolder = document.createElement("div");
      leftHolder.appendChild(before.cloneContents());
      var rightHolder = document.createElement("div");
      rightHolder.appendChild(after.cloneContents());
      var leftHtml = leftHolder.innerHTML;
      var rightHtml = rightHolder.innerHTML;

      if (!htmlHasText(rightHtml)) return false;

      if (!htmlHasText(leftHtml)) {
        var prev = li.previousElementSibling;
        if (isThought(prev)) {
          if (isInlineThought(li)) {
            promoteThoughtToBlock(li);
            placeCaretAtStartSoon(summary);
            notifyChange();
            return true;
          }
          return false;
        }
        var blank = createThoughtShell(type);
        li.parentNode.insertBefore(blank, li);
        ensureCategoryChrome(blank);
        if (typeof window.__mcSyncChecklistLayouts === "function") {
          window.__mcSyncChecklistLayouts();
        }
        var blankSummary = blank.querySelector(".thought-summary");
        if (blankSummary) placeCaretAtStartSoon(blankSummary);
        notifyChange();
        return true;
      }

      applySummaryHtml(summary, leftHtml);
      stripSplitChrome(summary, "end");

      var created = createThoughtShell(type);
      created.setAttribute("data-caret-split", "true");
      if (type === "text") {
        created.classList.add("is-block");
        created.classList.remove("is-inline");
        created.removeAttribute("data-inline");
      }
      var createdSummary = created.querySelector(".thought-summary");
      applySummaryHtml(createdSummary, rightHtml);
      stripSplitChrome(createdSummary, "start");

      if (li.nextSibling) {
        li.parentNode.insertBefore(created, li.nextSibling);
      } else {
        li.parentNode.appendChild(created);
      }
      ensureCategoryChrome(created);
      if (typeof window.__mcSyncChecklistLayouts === "function") {
        window.__mcSyncChecklistLayouts();
      }
      if (typeof window.__mcStripThoughtSeparatorWhitespace === "function") {
        window.__mcStripThoughtSeparatorWhitespace();
      }
      if (createdSummary) placeCaretAtStartSoon(createdSummary);
      notifyChange();
      return true;
    }

    function handleEnter(e, li, anchor) {
      e.preventDefault();
      e.stopPropagation();
      var now = Date.now();
      if (now - lastEnterAt < 80) return;
      lastEnterAt = now;

      var inTitle = closestClass(anchor, "thought-title");
      if (inTitle) {
        var titleSummary = li.querySelector(".thought-summary");
        if (titleSummary) placeCaretAtStartSoon(titleSummary);
        return;
      }

      var type = thoughtTypeOf(li);
      var summary = li.querySelector(".thought-summary") || li;
      if (!isCaretAtEndOf(summary)) {
        if (splitThoughtAtCaret(li, summary, type)) return;
        return;
      }

      var next = li.nextElementSibling;
      if (isThought(next) && isInlineThought(next)) {
        promoteThoughtToBlock(next);
        var nextSummary = next.querySelector(".thought-summary");
        if (nextSummary) placeCaretAtStartSoon(nextSummary);
        if (typeof window.__mcSyncChecklistLayouts === "function") {
          window.__mcSyncChecklistLayouts();
        }
        notifyChange();
        return;
      }

      var created = createThoughtShell(type);
      if (type === "text") {
        created.classList.add("is-block");
        created.classList.remove("is-inline");
        created.classList.remove("is-run-start");
        created.removeAttribute("data-inline");
      }
      if (li.nextSibling) {
        li.parentNode.insertBefore(created, li.nextSibling);
      } else {
        li.parentNode.appendChild(created);
      }
      if (typeof window.__mcSyncChecklistLayouts === "function") {
        window.__mcSyncChecklistLayouts();
      }

      requestClassifyBullet(li);

      var focusField = window.__mcShowTitles
        ? created.querySelector(".thought-title")
        : created.querySelector(".thought-summary");
      if (focusField) placeCaretAtStartSoon(focusField);
      notifyChange();
    }

    function isInlineThought(li) {
      return !!(
        li &&
        (li.classList.contains("is-inline") ||
          li.getAttribute("data-inline") === "true")
      );
    }

    function promoteThoughtToBlock(li) {
      if (!li) return;
      li.setAttribute("data-thought-type", "text");
      li.setAttribute("data-completable", "false");
      li.setAttribute("data-completed", "false");
      li.classList.add("is-block");
      li.classList.remove("is-inline");
      li.classList.remove("is-checklist");
      li.removeAttribute("data-inline");
      var following = li.nextElementSibling;
      if (isThought(following) && isInlineThought(following)) {
        li.classList.add("is-run-start");
      } else {
        li.classList.remove("is-run-start");
      }
      var previous = li.previousElementSibling;
      if (isThought(previous) && previous.classList.contains("is-run-start")) {
        var previousNext = previous.nextElementSibling;
        if (!(isThought(previousNext) && isInlineThought(previousNext))) {
          previous.classList.remove("is-run-start");
        }
      }
    }

    function placeCaretAtTextOffset(el, offset) {
      var sel = window.getSelection();
      if (!el || !sel) return;
      try {
        el.focus();
      } catch (err) {}
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      var remaining = Math.max(0, offset);
      var node;
      while ((node = walker.nextNode())) {
        var len = (node.nodeValue || "").length;
        if (remaining <= len) {
          var range = document.createRange();
          range.setStart(node, remaining);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          return;
        }
        remaining -= len;
      }
      placeCaretAtEnd(el);
    }

    function joinSummaryHtml(leftEl, rightEl) {
      var leftHtml = leftEl.innerHTML || "";
      var rightHtml = rightEl.innerHTML || "";
      var leftText = (leftEl.textContent || "")
        .replace(/\\u00a0/g, " ")
        .replace(/\\n/g, "");
      var rightText = (rightEl.textContent || "")
        .replace(/\\u00a0/g, " ")
        .replace(/\\n/g, "");
      if (leftText.length === 0) return rightHtml;
      if (rightText.length === 0) return leftHtml;
      return leftHtml + rightHtml;
    }

    function mergeCurrentIntoPrevious(li) {
      var prev = li.previousElementSibling;
      if (!isThought(prev)) return false;
      var prevSummary = prev.querySelector(".thought-summary");
      var summary = li.querySelector(".thought-summary");
      if (!prevSummary || !summary) return false;
      stripSplitChrome(prevSummary, "end");
      stripSplitChrome(summary, "start");
      var joinAt = (prevSummary.textContent || "").length;
      prevSummary.innerHTML = joinSummaryHtml(prevSummary, summary);
      prevSummary.classList.remove("is-placeholder");
      prevSummary.classList.remove("is-error-placeholder");
      prev.classList.remove("is-run-start");
      if (li.parentNode) li.parentNode.removeChild(li);
      if (typeof window.__mcSyncChecklistLayouts === "function") {
        window.__mcSyncChecklistLayouts();
      }
      placeCaretAtTextOffset(prevSummary, joinAt);
      setTimeout(function () {
        placeCaretAtTextOffset(prevSummary, joinAt);
      }, 0);
      notifyChange();
      return true;
    }

    function setThoughtAsParagraph(li, inline) {
      if (!li) return;
      li.setAttribute("data-thought-type", "text");
      li.setAttribute("data-completable", "false");
      li.setAttribute("data-completed", "false");
      li.classList.add("is-block");
      li.classList.remove("is-checklist");
      li.classList.remove("is-completed");
      if (inline) {
        li.classList.add("is-inline");
        li.setAttribute("data-inline", "true");
        var prevRun = li.previousElementSibling;
        if (isThought(prevRun) && thoughtTypeOf(prevRun) === "text") {
          prevRun.classList.add("is-run-start");
        }
      } else {
        li.classList.remove("is-inline");
        li.removeAttribute("data-inline");
        li.classList.remove("is-run-start");
        var next = li.nextElementSibling;
        if (isThought(next) && isInlineThought(next)) {
          next.classList.remove("is-inline");
          next.removeAttribute("data-inline");
          next.classList.add("is-block");
        }
      }
      if (typeof window.__mcSyncChecklistLayouts === "function") {
        window.__mcSyncChecklistLayouts();
      }
      if (window.ReactNativeWebView && li.parentNode) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "CARET_LIST_TYPE",
            data: {
              type: "text",
              index: Array.prototype.indexOf.call(li.parentNode.children, li),
            },
          })
        );
      }
    }

    function thoughtHasContent(li) {
      if (!li) return false;
      var title = li.querySelector(".thought-title");
      var summary = li.querySelector(".thought-summary");
      return !isEmptyField(title) || !isEmptyField(summary);
    }

    function handleLineStartBackspace(e, li, field) {
      if (!thoughtHasContent(li)) return false;
      var type = thoughtTypeOf(li);
      var prev = li.previousElementSibling;
      if (
        isThought(prev) &&
        (li.getAttribute("data-caret-split") === "true" || isInlineThought(li))
      ) {
        e.preventDefault();
        e.stopPropagation();
        mergeCurrentIntoPrevious(li);
        return true;
      }
      if (type === "li" || type === "checkbox") {
        e.preventDefault();
        e.stopPropagation();
        setThoughtAsParagraph(li, false);
        placeCaretAtStartSoon(field);
        notifyChange();
        return true;
      }
      if (type === "text" && !isInlineThought(li) && isThought(prev)) {
        e.preventDefault();
        e.stopPropagation();
        setThoughtAsParagraph(li, true);
        placeCaretAtStartSoon(field);
        notifyChange();
        return true;
      }
      return false;
    }

    function removeThought(li) {
      var parent = li.parentNode;
      var prev = li.previousElementSibling;
      var next = li.nextElementSibling;
      parent.removeChild(li);

      if (!parent.querySelector(".thought-item")) {
        parent.innerHTML = emptyThoughtHtml();
        repairAllPlaceholderFields();
        placeCaretAtStartSoon(
          parent.querySelector(".thought-title") ||
            parent.querySelector(".thought-summary")
        );
        notifyChange();
        return;
      }

      if (isThought(prev)) {
        placeCaretAtEndSoon(
          prev.querySelector(".thought-summary") ||
            prev.querySelector(".thought-title") ||
            prev
        );
      } else if (isThought(next)) {
        placeCaretAtStartSoon(
          next.querySelector(".thought-title") ||
            next.querySelector(".thought-summary") ||
            next
        );
      }
      notifyChange();
    }

    function handleBackspaceUntitled(e, li) {
      var summaryEl = li.querySelector(".thought-summary") || li;

      if (!(isEmptyField(summaryEl) || isCaretAtStartOf(summaryEl))) return;
      if (handleLineStartBackspace(e, li, summaryEl)) return;

      e.preventDefault();
      e.stopPropagation();
      if (isEmptyField(summaryEl)) {
        removeThought(li);
        return;
      }
      var prev = li.previousElementSibling;
      if (isThought(prev)) {
        placeCaretAtEndSoon(prev.querySelector(".thought-summary") || prev);
      }
    }

    function handleBackspace(e, li, anchor) {
      if (!window.__mcShowTitles && !li.querySelector(".thought-title")) {
        handleBackspaceUntitled(e, li);
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
          clearField(summary, mcPh("summary", "Summary"));
          placeCaretAtStartSoon(summary);
          notifyChange();
          return;
        }

        if (isEmptyField(summary) || isCaretAtStartOf(summary)) {
          e.preventDefault();
          e.stopPropagation();
          if (isEmptyField(summary)) {
            clearField(summary, mcPh("summary", "Summary"));
            if (isEmptyField(titleEl)) {
              removeThought(li);
              return;
            }
          }
          if (titleEl) placeCaretAtEndSoon(titleEl);
          return;
        }

        return;
      }

      if (title && (isEmptyField(title) || isCaretAtStartOf(title))) {
        if (handleLineStartBackspace(e, li, title)) return;
        e.preventDefault();
        e.stopPropagation();

        if (bothEmpty) {
          removeThought(li);
          return;
        }

        var prev = li.previousElementSibling;
        if (isThought(prev)) {
          placeCaretAtEndSoon(
            prev.querySelector(".thought-summary") ||
              prev.querySelector(".thought-title") ||
              prev
          );
          return;
        }

        repairEmptyField(title, mcPh("title", "Title"));
        repairEmptyField(summaryEl, mcPh("summary", "Summary"));
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

      var li = closestThought(e.target);
      if (!li) return;
      openCategoryPicker(li);
    }

    window.__mcExpandThoughtCategory = function () {};
    window.__mcCollapseThoughtCategory = function () {};
    window.__mcRefreshCategoryTimers = function () {
      var lis = content.querySelectorAll(".thought-item");
      for (var i = 0; i < lis.length; i++) {
        ensureCategoryChrome(lis[i]);
      }
      unwrapLists();
      repairAllPlaceholderFields();
    };

    content.addEventListener(
      "keydown",
      function (e) {
        var isEnter = e.key === "Enter" || e.keyCode === 13 || e.which === 13;
        var isBackspace = e.key === "Backspace" || e.keyCode === 8;
        if (!isEnter && !isBackspace) return;

        ensureThoughts();
        if (!content.querySelector(".thought-item")) {
          e.preventDefault();
          return;
        }

        var sel = window.getSelection();
        var anchor = sel && sel.anchorNode;
        var li = closestThought(anchor);

        if (!li) {
          e.preventDefault();
          ensureThoughts();
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

    content.addEventListener(
      "beforeinput",
      function (e) {
        if (e.inputType !== "insertParagraph") return;
        var sel = window.getSelection();
        var anchor = sel && sel.anchorNode;
        var li = closestThought(anchor);
        if (!li) return;
        handleEnter(e, li, anchor);
      },
      true
    );

    content.addEventListener("click", onCategoryChromePointer, true);
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
      ensureThoughts();
      normalizeLis();
      repairAllPlaceholderFields();
    });

    ensureThoughts();
    normalizeLis();
    repairAllPlaceholderFields();
  }

  true;
})();
`;

export function applyParagraphSplitScript(
  sourceId: string,
  pieces: Array<{
    id: string;
    text: string;
    title: string;
    categoryId: string;
    inline?: boolean;
  }>
): string {
  return `
(function () {
  if (typeof window.__mcApplyParagraphSplit === "function") {
    window.__mcApplyParagraphSplit(
      ${JSON.stringify(sourceId)},
      ${JSON.stringify(pieces)}
    );
    return true;
  }
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (content) {
    try {
      content.dispatchEvent(new Event("input", { bubbles: true }));
    } catch (e) {}
  }
  return true;
})();
`;
}

export function setShowTitlesScript(showTitles: boolean): string {
  return `window.__mcShowTitles = ${showTitles ? "true" : "false"}; true;`;
}

export function setEditingModeScript(editing: boolean): string {
  return `
(function () {
  window.__mcEditing = ${editing ? "true" : "false"};
  var root =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (document.documentElement) {
    document.documentElement.classList.toggle("mc-editing", !!window.__mcEditing);
  }
  if (root) root.classList.toggle("mc-editing", !!window.__mcEditing);
  if (typeof window.__mcSyncChecklistLayouts === "function") {
    window.__mcSyncChecklistLayouts();
  }
  true;
})();
`;
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
    void el.offsetWidth;
    el.setAttribute("data-placeholder", placeholder);
    el.classList.add("is-placeholder");
    el.classList.add("is-error-placeholder");
  }

  clearErrors();

  var lis = content.querySelectorAll(".thought-item");
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
        '<div class="mc-thoughts"><div class="thought-item" data-thought-type="li" data-category-id="uncategorized" data-completable="false" data-completed="false">' +
        '<div class="thought-fields">' +
        emptyFields +
        "</div></div></div>";
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
  var placeholders = window.__mcPlaceholders || {};
  var errored = content.querySelectorAll(".is-error-placeholder");
  for (var i = 0; i < errored.length; i++) {
    var el = errored[i];
    el.classList.remove("is-error-placeholder");
    if (el.classList.contains("thought-title")) {
      el.setAttribute("data-placeholder", placeholders.title || "Title");
    } else if (window.__mcShowTitles) {
      el.setAttribute("data-placeholder", placeholders.summary || "Summary");
    } else {
      el.setAttribute(
        "data-placeholder",
        placeholders.bullet || "Write Something..."
      );
    }
  }
  return true;
})();
true;
`;
}

const GRAPH_BODY_PAD = `
      .thought-body,
      .thought-item.has-graph .thought-body,
      .thought-item:has(> .thought-graph) .thought-body {
        padding-right: 0 !important;
      }
    `;

/** Toggle simplified chrome inside the editor WebView. */
export function setSimplifiedModeScript(
  simplified: boolean,
  markerColor: string,
  surfaceColor: string
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
      .thought-item .thought-stripe {
        opacity: 0 !important;
        pointer-events: none !important;
      }
      .thought-dot {
        top: 6px !important;
        width: 8px !important;
        height: 8px !important;
        margin-left: -4px !important;
        background-color: ${markerColor} !important;
      }
      .thought-item.is-checklist .thought-stripe,
      .thought-item.is-checklist .thought-dot {
        display: none !important;
      }
      .thought-item {
        --category-stack: 0px !important;
        padding-right: 0 !important;
      }
      .thought-body {
        padding-right: 0 !important;
      }
      .thought-item.is-checklist .thought-check {
        left: var(--mc-list-indent, 16px) !important;
        right: auto !important;
        top: calc(var(--check-nudge, 2px)) !important;
      }
      .thought-item .thought-check-box,
      .thought-item[data-category-id] .thought-check-box {
        border-color: ${markerColor} !important;
        background: ${surfaceColor} !important;
      }
      .thought-item.is-completed .thought-check-box,
      .thought-item[data-category-id].is-completed .thought-check-box {
        background-color: ${markerColor} !important;
        border-color: ${markerColor} !important;
      }
      .thought-item.is-completed .thought-check-box svg {
        color: ${surfaceColor} !important;
      }
      .thought-graph {
        display: none !important;
      }
    `
    : GRAPH_BODY_PAD;

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

  if (typeof window.__mcRefreshCategoryTimers === "function") {
    window.__mcRefreshCategoryTimers();
  }
  if (typeof window.__mcSyncChecklistLayouts === "function") {
    window.__mcSyncChecklistLayouts();
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

export const CATEGORY_COLLAPSE_SCRIPT = `
(function () {
  window.__mcExpandThoughtCategory = function () {};
  window.__mcCollapseThoughtCategory = function () {};
  true;
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
      if (node.classList && node.classList.contains("thought-graph")) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  function onGraphPointer(event) {
    var btn = closestGraph(event.target);
    if (!btn) return;
    event.preventDefault();
    event.stopPropagation();
    var thoughtId = btn.getAttribute("data-thought-id");
    if (!thoughtId || !window.ReactNativeWebView) return;
    var now = Date.now();
    if (window.__mcGraphAt && now - window.__mcGraphAt < 400) return;
    window.__mcGraphAt = now;
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: "OPEN_GRAPH", data: thoughtId })
    );
  }

  content.addEventListener("click", onGraphPointer, true);
  content.addEventListener("touchend", onGraphPointer, true);
  return true;
})();
`;

export function setThoughtTypeScript(type: "text" | "li" | "checkbox"): string {
  return `
(function () {
  if (typeof window.__mcSetThoughtType === "function") {
    window.__mcSetThoughtType(${JSON.stringify(type)});
  }
  true;
})();
`;
}

export function setSelectedThoughtScript(index: number): string {
  return `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;
  var lis = content.querySelectorAll(".thought-item");
  for (var i = 0; i < lis.length; i++) {
    lis[i].classList.toggle("is-selected", i === ${index});
  }
  true;
})();
`;
}

export function setMergeHighlightScript(indexes: number[]): string {
  const selected = JSON.stringify(
    indexes.filter((index) => Number.isFinite(index) && index >= 0)
  );
  return `
(function () {
  var selected = ${selected};
  var merging = selected.length > 0;
  window.__mcMerging = merging;
  window.__mcMergeIndexes = selected;
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (document.documentElement) {
    document.documentElement.classList.toggle("mc-merging", merging);
  }
  var style = document.getElementById("mc-merge-highlight");
  if (!style) {
    style = document.createElement("style");
    style.id = "mc-merge-highlight";
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = merging
    ? "html.mc-merging .thought-item.is-selected .thought-summary," +
      "html.mc-merging .thought-item.is-selected .thought-title," +
      "html.mc-merging .thought-item.is-merge-selected .thought-summary," +
      "html.mc-merging .thought-item.is-merge-selected .thought-title{" +
      "background-color:color-mix(in srgb, currentColor 22%, transparent);" +
      "border-radius:3px;}"
    : "";
  if (!content) return true;
  content.classList.toggle("mc-merging", merging);
  var lis = content.querySelectorAll(".thought-item");
  for (var i = 0; i < lis.length; i++) {
    var on = selected.indexOf(i) !== -1;
    lis[i].classList.toggle("is-merge-selected", on);
    if (merging) {
      lis[i].classList.toggle("is-selected", on);
    }
    var fields = lis[i].querySelectorAll(".thought-summary, .thought-title");
    for (var f = 0; f < fields.length; f++) {
      if (on) {
        fields[f].style.backgroundColor =
          "color-mix(in srgb, currentColor 28%, transparent)";
      } else {
        fields[f].style.removeProperty("background-color");
      }
    }
  }
  if (merging) {
    try {
      var sel = window.getSelection();
      if (sel && sel.removeAllRanges) sel.removeAllRanges();
    } catch (err) {}
  }
  true;
})();
`;
}

export const REQUEST_EDITOR_HTML_SCRIPT = `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  var html = content ? content.innerHTML : "";
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: "HTML_SYNC", data: html })
    );
  }
  true;
})();
`;

export function setCategoryOpacityScript(opacity: number): string {
  const value = Math.min(1, Math.max(0, Number(opacity) || 0));
  return `
(function () {
  var o = ${value};
  window.__mcCategoryOpacity = o;
  var scale = o / 0.6;
  var apply = function (el) {
    if (!el || !el.style) return;
    el.style.setProperty("--mc-cat-wash", 18 * scale + "%");
    el.style.setProperty("--mc-cat-wash-selected", 34 * scale + "%");
    el.style.setProperty("--mc-cat-wash-plain", 6 * scale + "%");
    el.style.setProperty("--mc-cat-wash-plain-selected", 16 * scale + "%");
  };
  apply(document.documentElement);
  apply(document.body);
  apply(
    document.querySelector(".pell-content") || document.getElementById("editor")
  );
  true;
})();
`;
}

export function setShowCategoryColorsScript(show: boolean): string {
  return `
(function () {
  var show = ${show ? "true" : "false"};
  window.__mcShowCategoryColors = show;
  if (document.documentElement) {
    document.documentElement.classList.toggle("mc-show-categories", show);
  }
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (content) content.classList.toggle("mc-show-categories", show);
  true;
})();
`;
}

export function focusThoughtScript(index: number, atEnd: boolean): string {
  return `
(function () {
  var index = ${Math.max(0, Math.floor(index))};
  var atEnd = ${atEnd ? "true" : "false"};
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;
  var lis = content.querySelectorAll(".thought-item");
  if (!lis.length) return true;

  function fieldOf(li) {
    if (!li) return null;
    return li.querySelector(".thought-summary") || li.querySelector(".thought-title");
  }

  function closestThought(node) {
    while (node && node !== document.body) {
      if (node.classList && node.classList.contains("thought-item")) return node;
      node = node.parentNode;
    }
    return null;
  }

  function placeCaretAtEnd(el) {
    var sel = window.getSelection();
    if (!el || !sel) return;
    var range = document.createRange();
    if (
      el.childNodes.length === 1 &&
      el.firstChild &&
      el.firstChild.nodeName === "BR"
    ) {
      range.setStart(el, 0);
      range.collapse(true);
    } else {
      range.selectNodeContents(el);
      range.collapse(false);
    }
    sel.removeAllRanges();
    sel.addRange(range);
  }

  var sel = window.getSelection();
  var current = closestThought(sel && sel.anchorNode);
  var currentField = fieldOf(current);
  var keepCaret =
    !atEnd &&
    currentField &&
    sel &&
    sel.rangeCount > 0 &&
    currentField.contains(sel.anchorNode);

  if (!keepCaret && !atEnd && window.__mcSavedRange && sel) {
    try {
      var saved = window.__mcSavedRange;
      var savedNode =
        saved.startContainer && saved.startContainer.nodeType === 3
          ? saved.startContainer.parentNode
          : saved.startContainer;
      if (savedNode && content.contains(savedNode)) {
        sel.removeAllRanges();
        sel.addRange(saved);
        current = closestThought(saved.startContainer);
        keepCaret = true;
      }
    } catch (err) {}
  }

  var li = lis[index] || lis[0];
  for (var i = 0; i < lis.length; i++) {
    lis[i].classList.toggle("is-selected", lis[i] === (keepCaret ? current : li));
  }

  if (!keepCaret) {
    var field = fieldOf(li);
    if (field) placeCaretAtEnd(field);
  }

  try {
    content.focus({ preventScroll: true });
  } catch (err) {
    try {
      content.focus();
    } catch (err2) {}
  }
  true;
})();
`;
}

export function reapplyActiveFormatsScript(formats: {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}): string {
  return `
(function () {
  var want = ${JSON.stringify(formats)};
  var saved = window.__mcSavedFormats || {};
  var sel = window.getSelection();
  if (!sel || !sel.isCollapsed) return true;
  var commands = ["bold", "italic", "underline"];
  for (var i = 0; i < commands.length; i++) {
    var command = commands[i];
    if (!want[command] && !saved[command]) continue;
    try {
      if (!document.queryCommandState(command)) {
        document.execCommand(command, false, null);
      }
    } catch (err) {}
  }
  true;
})();
`;
}

export function setThoughtTextEditableScript(editable: boolean): string {
  return `
(function () {
  var editable = ${editable ? "true" : "false"};
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (document.documentElement) {
    document.documentElement.classList.toggle("mc-details-lock", !editable);
  }
  if (!window.__mcDetailsLockInstalled) {
    window.__mcDetailsLockInstalled = true;
    document.addEventListener(
      "keydown",
      function (e) {
        if (!document.documentElement.classList.contains("mc-details-lock")) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
      },
      true
    );
    document.addEventListener(
      "beforeinput",
      function (e) {
        if (!document.documentElement.classList.contains("mc-details-lock")) {
          return;
        }
        e.preventDefault();
      },
      true
    );
    document.addEventListener(
      "selectstart",
      function (e) {
        if (!document.documentElement.classList.contains("mc-details-lock")) {
          return;
        }
        e.preventDefault();
      },
      true
    );
  }
  if (!content) return true;
  content.classList.toggle("mc-details-lock", !editable);
  content.setAttribute("contenteditable", editable ? "true" : "false");
  var fields = content.querySelectorAll(".thought-summary, .thought-title");
  for (var i = 0; i < fields.length; i++) {
    if (editable) {
      fields[i].removeAttribute("contenteditable");
    } else {
      fields[i].setAttribute("contenteditable", "false");
    }
  }
  if (!editable) {
    try {
      var sel = window.getSelection();
      if (sel && sel.removeAllRanges) sel.removeAllRanges();
      content.blur();
    } catch (err) {}
  }
  true;
})();
`;
}

export function setThoughtListTypeScript(completable: boolean): string {
  return setThoughtTypeScript(completable ? "checkbox" : "li");
}

export const SYNC_CHECKLIST_LAYOUT_SCRIPT = `
(function () {
  if (typeof window.__mcSyncChecklistLayouts === "function") {
    window.__mcSyncChecklistLayouts();
  }
  true;
})();
`;

/** Checkbox chrome, layout, selection, and completion toggles. */
export const CHECKLIST_SCRIPT = `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;

  function titlePlainText(el) {
    if (!el) return "";
    return (el.textContent || "")
      .replace(/\\u00a0/g, " ")
      .replace(/\\s+/g, " ")
      .trim();
  }

  window.__mcAnimateTitle = function (li) {
    if (!li) return;
    var title = li.querySelector(".thought-title");
    li.classList.toggle("has-entered-title", titlePlainText(title).length > 0);
  };
  if (typeof window.__mcExpandThoughtCategory !== "function") {
    window.__mcExpandThoughtCategory = function () {};
  }
  if (typeof window.__mcCollapseThoughtCategory !== "function") {
    window.__mcCollapseThoughtCategory = function () {};
  }

  if (document.documentElement) {
    document.documentElement.classList.toggle(
      "mc-editing",
      !!window.__mcEditing
    );
  }
  content.classList.toggle("mc-editing", !!window.__mcEditing);

  function closest(node, predicate) {
    while (node && node !== document.body) {
      if (predicate(node)) return node;
      node = node.parentNode;
    }
    return null;
  }

  function closestThought(node) {
    return closest(node, function (n) {
      return n.classList && n.classList.contains("thought-item");
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
    check.innerHTML =
      '<span class="thought-check-box">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.75" aria-hidden="true">' +
      '<path d="M20 6L9 17l-5-5"/></svg></span>';
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

  function ensureDot(li) {
    if (!li) return null;
    var rail = li.querySelector(".thought-rail");
    var dot = li.querySelector(".thought-dot");
    if (dot) return dot;
    if (!rail) return null;
    dot = document.createElement("div");
    dot.className = "thought-dot";
    rail.appendChild(dot);
    return dot;
  }

  function fieldLineHeight(el) {
    if (!el) return 23;
    var raw = window.getComputedStyle(el).lineHeight;
    var parsed = parseFloat(raw);
    if (parsed && !isNaN(parsed)) return parsed;
    return 23;
  }

  function thoughtTypeOf(li) {
    var type = li && li.getAttribute("data-thought-type");
    if (type === "text" || type === "li" || type === "checkbox") return type;
    if (isTrueAttr(li, "data-completable")) return "checkbox";
    return "li";
  }

  function applyThoughtType(li, type) {
    if (!li) return;
    if (type !== "text" && type !== "li" && type !== "checkbox") type = "li";
    var previousType = thoughtTypeOf(li);
    var completable = type === "checkbox";
    var becomingParagraph =
      type === "text" && (previousType === "li" || previousType === "checkbox");
    li.setAttribute("data-thought-type", type);
    li.setAttribute("data-completable", completable ? "true" : "false");
    if (!completable) {
      li.setAttribute("data-completed", "false");
    }
    li.classList.toggle("is-block", type === "text");
    li.classList.toggle("is-checklist", completable);
    if (type !== "text" || becomingParagraph) {
      li.classList.remove("is-inline");
      li.removeAttribute("data-inline");
    }
    if (becomingParagraph) {
      li.classList.remove("is-run-start");
      var next = li.nextElementSibling;
      if (
        next &&
        next.classList &&
        next.classList.contains("thought-item") &&
        (next.classList.contains("is-inline") ||
          next.getAttribute("data-inline") === "true")
      ) {
        next.classList.remove("is-inline");
        next.removeAttribute("data-inline");
        next.classList.add("is-block");
      }
    }
    if (!completable) li.classList.remove("is-completed");
  }

  function syncChecklistLayout(li) {
    if (!li) return;
    var check = ensureCheckbox(li);
    var type = thoughtTypeOf(li);
    applyThoughtType(li, type);
    var completable = type === "checkbox";
    var completed = completable && isTrueAttr(li, "data-completed");
    li.classList.toggle("is-completed", completed);
    if (check) {
      check.setAttribute("aria-checked", completed ? "true" : "false");
    }

    var title = li.querySelector(".thought-title");
    var summary = li.querySelector(".thought-summary");
    var graph = li.querySelector(".thought-graph");
    var hasText = titlePlainText(title).length > 0;
    li.classList.toggle("has-entered-title", hasText);
    li.classList.toggle("has-title", hasText);
    li.classList.toggle("has-graph", !!graph);

    var field = (hasText ? title : null) || summary || title;
    var lineH = fieldLineHeight(field);
    var fieldH = field ? field.offsetHeight : 0;
    li.classList.toggle("is-single-line", !hasText && fieldH <= lineH * 1.6);

    var target = summary || title;
    if (target) {
      var alignLineH = fieldLineHeight(target);
      var checkH = (check && check.offsetHeight) || 22;
      var nudge = Math.max(0, Math.round((alignLineH - checkH) / 2));
      var nextNudge = nudge + "px";
      if (li.style.getPropertyValue("--check-nudge") !== nextNudge) {
        li.style.setProperty("--check-nudge", nextNudge);
      }
    } else if (li.style.getPropertyValue("--check-nudge")) {
      li.style.removeProperty("--check-nudge");
    }

    ensureDot(li);

    if (!check) return;
    check.style.left = "";
    check.style.right = "";
    check.style.top = "";
  }

  function syncAll() {
    var root =
      document.querySelector(".pell-content") || document.getElementById("editor");
    if (!root) return;
    var lis = root.querySelectorAll(".thought-item");
    for (var i = 0; i < lis.length; i++) {
      syncChecklistLayout(lis[i]);
    }
  }

  function postCaretType(li) {
    if (!li) return;
    if (!window.__mcMerging) {
      var root =
        document.querySelector(".pell-content") || document.getElementById("editor");
      if (root) {
        var rows = root.querySelectorAll(".thought-item");
        for (var i = 0; i < rows.length; i++) {
          rows[i].classList.toggle("is-selected", rows[i] === li);
        }
      }
    }
    if (!window.ReactNativeWebView) return;
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "CARET_LIST_TYPE",
        data: {
          type: thoughtTypeOf(li),
          index: li.parentNode
            ? Array.prototype.indexOf.call(li.parentNode.children, li)
            : -1,
        },
      })
    );
  }

  function toggleCompleted(li) {
    if (!li || thoughtTypeOf(li) !== "checkbox") return;
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

  window.__mcSetThoughtType = function (type) {
    var sel = window.getSelection();
    var li = closestThought(sel && sel.anchorNode);
    if (!li) li = content.querySelector(".thought-item.is-selected") || content.querySelector(".thought-item");
    if (!li) return true;
    applyThoughtType(li, type);
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
          data: { index: index, type: thoughtTypeOf(li) },
        })
      );
    }
    return true;
  };
  window.__mcSetThoughtListType = function (completable) {
    return window.__mcSetThoughtType(completable ? "checkbox" : "li");
  };

  function editorRoot() {
    return document.querySelector(".pell-content") || document.getElementById("editor");
  }

  if (!window.__mcChecklistInstalled) {
    window.__mcChecklistInstalled = true;

    function isCategoryChrome(node) {
      return (
        closestClass(node, "thought-rail") ||
        closestClass(node, "thought-stripe") ||
        closestClass(node, "thought-category") ||
        closestClass(node, "thought-graph")
      );
    }

    function eventInEditor(e) {
      var root = editorRoot();
      return !!(root && e.target && root.contains(e.target));
    }

    function onChecklistPointer(e) {
      if (!eventInEditor(e)) return;
      if (isCategoryChrome(e.target)) return;
      var check = closestClass(e.target, "thought-check");
      if (!check) return;
      var li = closestThought(e.target);
      e.preventDefault();
      e.stopPropagation();
      if (li) toggleCompleted(li);
    }

    document.addEventListener("click", onChecklistPointer, true);
    document.addEventListener("touchend", onChecklistPointer, true);

    function closestGraph(node) {
      return closestClass(node, "thought-graph");
    }

    function onGraphPointer(event) {
      if (!eventInEditor(event)) return;
      var btn = closestGraph(event.target);
      if (!btn) return;
      event.preventDefault();
      event.stopPropagation();
      var thoughtId = btn.getAttribute("data-thought-id");
      if (!thoughtId || !window.ReactNativeWebView) return;
      var now = Date.now();
      if (window.__mcGraphAt && now - window.__mcGraphAt < 400) return;
      window.__mcGraphAt = now;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "OPEN_GRAPH", data: thoughtId })
      );
    }

    document.addEventListener("click", onGraphPointer, true);
    document.addEventListener("touchend", onGraphPointer, true);
    window.__mcGraphButtonInstalled = true;

    document.addEventListener("selectionchange", function () {
      if (!window.__mcEditing) return;
      var sel = window.getSelection();
      var root = editorRoot();
      if (sel && sel.rangeCount && root && root.contains(sel.anchorNode)) {
        try {
          window.__mcSavedRange = sel.getRangeAt(0).cloneRange();
          window.__mcSavedFormats = {
            bold: document.queryCommandState("bold"),
            italic: document.queryCommandState("italic"),
            underline: document.queryCommandState("underline"),
          };
        } catch (err) {}
      }
      var li = closestThought(sel && sel.anchorNode);
      if (li) postCaretType(li);
    });

    document.addEventListener("focusin", function (e) {
      if (!window.__mcEditing) return;
      if (!eventInEditor(e)) return;
      var sel = window.getSelection();
      var li = closestThought(sel && sel.anchorNode);
      if (li) postCaretType(li);
    });

    function textNodeContainsPoint(node, x, y, slop) {
      if (!node || node.nodeType !== 3 || !node.length) return false;
      var pad = slop || 2;
      var range = document.createRange();
      range.selectNodeContents(node);
      var rects = range.getClientRects();
      for (var i = 0; i < rects.length; i++) {
        var r = rects[i];
        if (
          x >= r.left - pad &&
          x <= r.right + pad &&
          y >= r.top - pad &&
          y <= r.bottom + pad
        ) {
          return true;
        }
      }
      return false;
    }

    function fieldTextContainsPoint(field, x, y) {
      if (!field) return false;
      if (field.classList && field.classList.contains("is-placeholder")) {
        var box = field.getBoundingClientRect();
        return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
      }
      var walker = document.createTreeWalker(field, NodeFilter.SHOW_TEXT, null);
      var node;
      while ((node = walker.nextNode())) {
        if (textNodeContainsPoint(node, x, y, 8)) return true;
      }
      var rects = field.getClientRects();
      for (var r = 0; r < rects.length; r++) {
        var rect = rects[r];
        if (
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom
        ) {
          return true;
        }
      }
      return false;
    }

    function thoughtAtPoint(x, y) {
      var root = editorRoot();
      if (!root) return null;
      var hit = document.elementFromPoint(x, y);
      var field =
        closestClass(hit, "thought-summary") ||
        closestClass(hit, "thought-title");
      if (field) return closestThought(field);
      var fromHit = closestThought(hit);
      if (fromHit) {
        var hitField =
          fromHit.querySelector(".thought-summary") ||
          fromHit.querySelector(".thought-title");
        if (fieldTextContainsPoint(hitField, x, y)) return fromHit;
      }
      var lis = root.querySelectorAll(".thought-item");
      for (var i = 0; i < lis.length; i++) {
        var nextField =
          lis[i].querySelector(".thought-summary") ||
          lis[i].querySelector(".thought-title");
        if (fieldTextContainsPoint(nextField, x, y)) return lis[i];
      }
      return null;
    }

    function selectThought(li) {
      if (!li || window.__mcSplitting) return;
      window.__mcSelectAt = Date.now();
      postCaretType(li);
    }

    document.addEventListener(
      "touchstart",
      function (e) {
        if (!eventInEditor(e)) {
          window.__mcPressThought = null;
          return;
        }
        if (closestClass(e.target, "thought-check")) {
          window.__mcPressThought = null;
          return;
        }
        var t = e.changedTouches && e.changedTouches[0];
        if (!t) return;
        window.__mcPressThought = {
          x: t.clientX,
          y: t.clientY,
          li: thoughtAtPoint(t.clientX, t.clientY),
        };
      },
      true
    );

    document.addEventListener(
      "touchend",
      function (e) {
        var press = window.__mcPressThought;
        window.__mcPressThought = null;
        if (!press) return;
        if (closestClass(e.target, "thought-check")) return;
        var t = e.changedTouches && e.changedTouches[0];
        if (
          t &&
          (Math.abs(t.clientX - press.x) > 18 ||
            Math.abs(t.clientY - press.y) > 18)
        ) {
          return;
        }
        selectThought(
          press.li ||
            thoughtAtPoint(t ? t.clientX : press.x, t ? t.clientY : press.y)
        );
      },
      true
    );

    document.addEventListener(
      "click",
      function (e) {
        if (!eventInEditor(e)) return;
        if (closestClass(e.target, "thought-check")) return;
        if (window.__mcSelectAt && Date.now() - window.__mcSelectAt < 450) {
          return;
        }
        selectThought(
          thoughtAtPoint(e.clientX, e.clientY) ||
            closestThought(
              closestClass(e.target, "thought-summary") ||
                closestClass(e.target, "thought-title")
            )
        );
      },
      true
    );
  }

  if (typeof ResizeObserver !== "undefined" && content) {
    if (window.__mcChecklistResizeObserver) {
      try {
        window.__mcChecklistResizeObserver.disconnect();
      } catch (err) {}
    }
    var observer = new ResizeObserver(function () {
      syncAll();
    });
    observer.observe(content);
    window.__mcChecklistResizeObserver = observer;
  }

  syncAll();
  return true;
})();
`;

export const THOUGHT_SPLIT_SCRIPT = `
(function () {
  if (window.__mcSplitInstalled) return true;
  window.__mcSplitInstalled = true;

  function editorRoot() {
    return document.querySelector(".pell-content") || document.getElementById("editor");
  }

  function closest(node, predicate) {
    while (node && node !== document.body) {
      if (predicate(node)) return node;
      node = node.parentNode;
    }
    return null;
  }

  function closestThought(node) {
    return closest(node, function (n) {
      return n.classList && n.classList.contains("thought-item");
    });
  }

  function closestClass(node, className) {
    return closest(node, function (n) {
      return n.classList && n.classList.contains(className);
    });
  }

  function fieldOf(thought) {
    if (!thought) return null;
    return (
      thought.querySelector(".thought-summary") ||
      thought.querySelector(".thought-title")
    );
  }

  function selectedThought() {
    var root = editorRoot();
    if (!root) return null;
    return (
      root.querySelector(".thought-item.is-selected") ||
      root.querySelector(".thought-item")
    );
  }

  var ARROW_H = 14;
  var ARROW_SVG =
    '<svg class="mc-arrow-left" viewBox="0 0 24 24" width="14" height="14">' +
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 19l-7-7l7-7m7 7H5"></path>' +
    "</svg>" +
    '<svg class="mc-arrow-right" viewBox="0 0 24 24" width="14" height="14">' +
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7l7 7l-7 7"></path>' +
    "</svg>";

  function ensureStyle() {
    var style = document.getElementById("mc-split-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "mc-split-style";
      document.head.appendChild(style);
    }
    style.textContent =
      "html.mc-splitting .pell-content{caret-color:transparent !important;}" +
      ".mc-split-caret{position:fixed;z-index:40;width:0;height:0;overflow:visible;pointer-events:none;}" +
      ".mc-split-line{position:absolute;left:0;top:" +
      ARROW_H +
      "px;bottom:" +
      ARROW_H +
      "px;width:2px;margin-left:-1px;background:currentColor;border-radius:1px;}" +
      ".mc-split-arrow{position:absolute;left:0;width:14px;height:14px;}" +
      ".mc-split-arrow svg{display:none;width:14px;height:14px;overflow:visible;}" +
      ".mc-split-arrow-top{top:4px;}" +
      ".mc-split-arrow-bottom{bottom:4px;}" +
      ".mc-split-caret[data-side=\\"left\\"] .mc-arrow-left{display:block;}" +
      ".mc-split-caret[data-side=\\"right\\"] .mc-arrow-right{display:block;}" +
      ".mc-split-caret[data-side=\\"left\\"] .mc-split-arrow{margin-left:-12px;}" +
      ".mc-split-caret[data-side=\\"right\\"] .mc-split-arrow{margin-left:-2px;}";
  }

  function caretEl() {
    ensureStyle();
    var el = document.getElementById("mc-split-caret");
    if (!el) {
      el = document.createElement("div");
      el.id = "mc-split-caret";
      el.className = "mc-split-caret";
      el.setAttribute("contenteditable", "false");
      document.body.appendChild(el);
    }
    el.innerHTML =
      '<span class="mc-split-arrow mc-split-arrow-top">' +
      ARROW_SVG +
      "</span>" +
      '<span class="mc-split-line"></span>' +
      '<span class="mc-split-arrow mc-split-arrow-bottom">' +
      ARROW_SVG +
      "</span>";
    return el;
  }

  function rangeFromPoint(x, y) {
    if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
    if (document.caretPositionFromPoint) {
      var pos = document.caretPositionFromPoint(x, y);
      if (!pos) return null;
      var ranged = document.createRange();
      ranged.setStart(pos.offsetNode, pos.offset);
      ranged.collapse(true);
      return ranged;
    }
    return null;
  }

  function rangeAtOffset(field, offset) {
    var walker = document.createTreeWalker(field, NodeFilter.SHOW_TEXT, null);
    var left = Math.max(0, offset);
    var node;
    while ((node = walker.nextNode())) {
      if (left <= node.length) {
        var range = document.createRange();
        range.setStart(node, left);
        range.collapse(true);
        return range;
      }
      left -= node.length;
    }
    var end = document.createRange();
    end.selectNodeContents(field);
    end.collapse(false);
    return end;
  }

  function fieldTextLength(field) {
    return (field.textContent || "").replace(/\\u00a0/g, " ").length;
  }

  function caretRect(range) {
    if (!range) return null;
    var rects = range.getClientRects();
    if (rects && rects.length) {
      var first = rects[0];
      return {
        left: first.left,
        top: first.top,
        height: first.height,
        bottom: first.bottom,
      };
    }
    if (range.startContainer.nodeType === 3 && range.startOffset > 0) {
      var prevProbe = range.cloneRange();
      prevProbe.setStart(range.startContainer, range.startOffset - 1);
      prevProbe.setEnd(range.startContainer, range.startOffset);
      var prev = prevProbe.getBoundingClientRect();
      if (prev && prev.height) {
        return {
          left: prev.right,
          top: prev.top,
          height: prev.height,
          bottom: prev.bottom,
        };
      }
    }
    if (
      range.startContainer.nodeType === 3 &&
      range.startOffset < range.startContainer.length
    ) {
      var nextProbe = range.cloneRange();
      nextProbe.setStart(range.startContainer, range.startOffset);
      nextProbe.setEnd(range.startContainer, range.startOffset + 1);
      var next = nextProbe.getBoundingClientRect();
      if (next && next.height) {
        return {
          left: next.left,
          top: next.top,
          height: next.height,
          bottom: next.bottom,
        };
      }
    }
    var rect = range.getBoundingClientRect();
    if (rect && (rect.width || rect.height)) {
      return {
        left: rect.left,
        top: rect.top,
        height: rect.height || 18,
        bottom: rect.bottom,
      };
    }
    return null;
  }

  function positionCaret() {
    var state = window.__mcSplit;
    var el = document.getElementById("mc-split-caret");
    if (!state || !state.range || !el) return;
    var rect = caretRect(state.range);
    if (!rect) return;
    var height = Math.max(16, rect.height || 16);
    el.style.left = Math.round(rect.left) + "px";
    el.style.top = Math.round(rect.top - ARROW_H) + "px";
    el.style.height = Math.round(height + ARROW_H * 2) + "px";
  }

  function rangeInField(range, field) {
    if (!range || !field) return false;
    var node = range.startContainer;
    return node === field || field.contains(node);
  }

  function closestRangeInField(field, x, y) {
    var walker = document.createTreeWalker(field, NodeFilter.SHOW_TEXT, null);
    var best = null;
    var bestScore = Infinity;
    var node;
    while ((node = walker.nextNode())) {
      var len = node.length;
      if (!len) continue;
      for (var i = 0; i < len; i++) {
        var probe = document.createRange();
        probe.setStart(node, i);
        probe.setEnd(node, i + 1);
        var r = probe.getBoundingClientRect();
        if (!r.height && !r.width) continue;
        var onLine = y >= r.top - 6 && y <= r.bottom + 6;
        var dx = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
        var dy = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
        var score = dx * dx + dy * dy * 8;
        if (onLine) score -= 10000;
        if (score < bestScore) {
          bestScore = score;
          best = {
            node: node,
            offset: x > (r.left + r.right) / 2 ? i + 1 : i,
          };
        }
      }
    }
    var range = document.createRange();
    if (!best) {
      range.selectNodeContents(field);
      range.collapse(false);
      return range;
    }
    range.setStart(best.node, Math.min(best.offset, best.node.length));
    range.collapse(true);
    return range;
  }

  function rangeFromPointInField(field, x, y) {
    var el = document.getElementById("mc-split-caret");
    if (el) el.style.visibility = "hidden";
    var range = rangeFromPoint(x, y);
    if (!rangeInField(range, field)) {
      var box = field.getBoundingClientRect();
      var cx = Math.min(Math.max(x, box.left + 1), box.right - 1);
      var cy = Math.min(Math.max(y, box.top + 1), box.bottom - 1);
      range = rangeFromPoint(cx, cy);
    }
    if (el) el.style.visibility = "";
    if (rangeInField(range, field)) {
      range = range.cloneRange();
      range.collapse(true);
      var rect = caretRect(range);
      if (rect) {
        var dx = x < rect.left ? rect.left - x : x > rect.left + 2 ? x - rect.left : 0;
        var dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
        if (dx * dx + dy * dy < 144) return range;
      }
    }
    return closestRangeInField(field, x, y);
  }

  function setSplitRange(range, field) {
    if (!range || !window.__mcSplit) return;
    window.__mcSplit.range = range.cloneRange();
    window.__mcSplit.field = field || window.__mcSplit.field;
    try {
      window.__mcSplit.range.collapse(true);
    } catch (err) {}
    positionCaret();
  }

  function placeAtPoint(x, y) {
    var state = window.__mcSplit;
    if (!state || !state.thought) return false;
    var el = document.getElementById("mc-split-caret");
    if (el) el.style.visibility = "hidden";
    var hit = document.elementFromPoint(x, y);
    if (el) el.style.visibility = "";
    var thought = closestThought(hit);
    var nextField = fieldOf(thought);
    if (
      thought &&
      thought !== state.thought &&
      nextField &&
      (hit === nextField || nextField.contains(hit))
    ) {
      state.thought = thought;
      state.field = nextField;
    }
    var field = fieldOf(state.thought);
    if (!field) return false;
    var range = rangeFromPointInField(field, x, y);
    if (!range) return false;
    setSplitRange(range, field);
    return true;
  }

  function htmlForRange(range) {
    var holder = document.createElement("div");
    holder.appendChild(range.cloneContents());
    return holder.innerHTML;
  }

  function splitHtml(field, range) {
    var before = document.createRange();
    before.selectNodeContents(field);
    before.setEnd(range.startContainer, range.startOffset);
    var after = document.createRange();
    after.selectNodeContents(field);
    after.setStart(range.startContainer, range.startOffset);
    return { left: htmlForRange(before), right: htmlForRange(after) };
  }

  function setSummaryHtml(thought, html) {
    var summary = thought.querySelector(".thought-summary") || fieldOf(thought);
    if (!summary) return;
    var text = (html || "")
      .replace(/<br\\s*\\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/\\u00a0/g, " ")
      .trim();
    if (!text) {
      summary.innerHTML = "<br>";
      summary.classList.add("is-placeholder");
      return;
    }
    summary.innerHTML = html || "<br>";
    summary.classList.remove("is-placeholder");
    summary.classList.remove("is-error-placeholder");
  }

  function clearTitle(thought) {
    var title = thought.querySelector(".thought-title");
    if (!title) return;
    title.innerHTML = "<br>";
    title.classList.add("is-placeholder");
    thought.classList.remove("has-entered-title");
    thought.classList.remove("has-title");
  }

  function stopSplit() {
    window.__mcSplitting = false;
    window.__mcSplit = null;
    if (document.documentElement) {
      document.documentElement.classList.remove("mc-splitting");
    }
    var root = editorRoot();
    if (root) root.classList.remove("mc-splitting");
    var el = document.getElementById("mc-split-caret");
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  window.__mcCancelThoughtSplit = function () {
    stopSplit();
    return true;
  };

  window.__mcStartThoughtSplit = function (side, color) {
    var thought = selectedThought();
    var field = fieldOf(thought);
    if (!thought || !field) return false;
    ensureStyle();
    window.__mcSplitting = true;
    if (document.documentElement) {
      document.documentElement.classList.add("mc-splitting");
    }
    var root = editorRoot();
    if (root) root.classList.add("mc-splitting");
    var el = caretEl();
    el.setAttribute("data-side", side === "left" ? "left" : "right");
    el.style.color = color || "#2563eb";
    var sel = window.getSelection();
    var range = null;
    if (sel && sel.rangeCount && field.contains(sel.anchorNode)) {
      range = sel.getRangeAt(0).cloneRange();
      range.collapse(true);
    } else {
      range = rangeAtOffset(field, Math.floor(fieldTextLength(field) / 2));
    }
    window.__mcSplit = {
      side: side === "left" ? "left" : "right",
      thought: thought,
      field: field,
      range: range,
    };
    positionCaret();
    return true;
  };

  window.__mcSetThoughtSplitSide = function (side) {
    if (!window.__mcSplit) return window.__mcStartThoughtSplit(side);
    window.__mcSplit.side = side === "left" ? "left" : "right";
    var el = caretEl();
    el.setAttribute("data-side", window.__mcSplit.side);
    positionCaret();
    return true;
  };

  window.__mcConfirmThoughtSplit = function (newThoughtId) {
    var state = window.__mcSplit;
    if (!state || !state.range || !state.thought || !state.field) return false;
    var thought = state.thought;
    if (!thought.parentNode) return false;
    var index = Array.prototype.indexOf.call(thought.parentNode.children, thought);
    if (index < 0) return false;
    var parts = splitHtml(state.field, state.range);
    var clone = thought.cloneNode(true);
    clone.classList.remove("is-selected");
    clone.setAttribute("data-thought-id", newThoughtId);
    clone.setAttribute("data-completed", "false");
    clone.classList.remove("is-completed");
    clone.setAttribute("data-category-id", "uncategorized");
    clearTitle(clone);
    var wasInline =
      thought.classList.contains("is-inline") ||
      thought.getAttribute("data-inline") === "true";
    function setParagraphStyle(el, inline) {
      if (inline) {
        el.classList.add("is-inline");
        el.setAttribute("data-inline", "true");
        return;
      }
      el.classList.remove("is-inline");
      el.removeAttribute("data-inline");
      el.classList.add("is-block");
    }
    var created = clone;
    if (state.side === "right") {
      setSummaryHtml(thought, parts.left);
      setSummaryHtml(clone, parts.right);
      if (thought.getAttribute("data-thought-type") === "text") {
        setParagraphStyle(thought, wasInline);
        setParagraphStyle(clone, true);
      }
      thought.parentNode.insertBefore(clone, thought.nextSibling);
    } else {
      setSummaryHtml(clone, parts.left);
      setSummaryHtml(thought, parts.right);
      if (thought.getAttribute("data-thought-type") === "text") {
        setParagraphStyle(clone, wasInline);
        setParagraphStyle(thought, true);
      }
      thought.parentNode.insertBefore(clone, thought);
    }
    if (typeof window.__mcSyncChecklistLayouts === "function") {
      window.__mcSyncChecklistLayouts();
    }
    if (typeof window.__mcStripThoughtSeparatorWhitespace === "function") {
      window.__mcStripThoughtSeparatorWhitespace();
    }
    stopSplit();
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "SPLIT_THOUGHT",
          data: {
            index: index,
            newSide: state.side,
            newThoughtId: newThoughtId,
            leftHtml: parts.left,
            rightHtml: parts.right,
          },
        })
      );
    }
    void created;
    return true;
  };

  document.addEventListener(
    "keydown",
    function (e) {
      if (!window.__mcSplitting) return;
      if (e.key === "Enter" || e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: "CONFIRM_SPLIT" })
          );
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        stopSplit();
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: "CANCEL_SPLIT" })
          );
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  document.addEventListener(
    "beforeinput",
    function (e) {
      if (!window.__mcSplitting) return;
      e.preventDefault();
    },
    true
  );

  function pointFromEvent(e) {
    var t = e.changedTouches && e.changedTouches[0];
    if (t) return { x: t.clientX, y: t.clientY, touch: true };
    if (typeof e.clientX === "number") {
      return { x: e.clientX, y: e.clientY, touch: false };
    }
    return null;
  }

  function onSplitPointerDown(e) {
    if (!window.__mcSplitting || !window.__mcSplit) return;
    var p = pointFromEvent(e);
    if (!p) return;
    if (!p.touch && window.__mcSplitIgnoreMouse) return;
    if (p.touch) window.__mcSplitIgnoreMouse = true;
    window.__mcSplitPress = { x: p.x, y: p.y, dragged: false, touch: p.touch };
    e.preventDefault();
    e.stopPropagation();
  }

  function onSplitPointerMove(e) {
    var press = window.__mcSplitPress;
    if (!press || !window.__mcSplitting) return;
    var p = pointFromEvent(e);
    if (!p) return;
    var dx = p.x - press.x;
    var dy = p.y - press.y;
    if (!press.dragged && dx * dx + dy * dy < 100) return;
    press.dragged = true;
    placeAtPoint(p.x, p.y);
    e.preventDefault();
    e.stopPropagation();
  }

  function onSplitPointerUp(e) {
    var press = window.__mcSplitPress;
    window.__mcSplitPress = null;
    if (!press || !window.__mcSplitting) return;
    var p = pointFromEvent(e) || { x: press.x, y: press.y };
    if (!press.dragged) placeAtPoint(p.x, p.y);
    if (press.touch) {
      setTimeout(function () {
        window.__mcSplitIgnoreMouse = false;
      }, 400);
    }
    e.preventDefault();
    e.stopPropagation();
  }

  document.addEventListener("touchstart", onSplitPointerDown, true);
  document.addEventListener("mousedown", onSplitPointerDown, true);
  document.addEventListener("touchmove", onSplitPointerMove, true);
  document.addEventListener("mousemove", onSplitPointerMove, true);
  document.addEventListener("touchend", onSplitPointerUp, true);
  document.addEventListener("mouseup", onSplitPointerUp, true);
  document.addEventListener(
    "scroll",
    function () {
      if (window.__mcSplitting) positionCaret();
    },
    true
  );
  window.addEventListener("resize", function () {
    if (window.__mcSplitting) positionCaret();
  });

  return true;
})();
`;

export function startThoughtSplitScript(
  side: "left" | "right",
  color: string
): string {
  return `
(function () {
  if (typeof window.__mcStartThoughtSplit === "function") {
    window.__mcStartThoughtSplit(${JSON.stringify(side)}, ${JSON.stringify(color)});
  }
  true;
})();
`;
}

export function setThoughtSplitSideScript(side: "left" | "right"): string {
  return `
(function () {
  if (typeof window.__mcSetThoughtSplitSide === "function") {
    window.__mcSetThoughtSplitSide(${JSON.stringify(side)});
  }
  true;
})();
`;
}

export function confirmThoughtSplitScript(newThoughtId: string): string {
  return `
(function () {
  if (typeof window.__mcConfirmThoughtSplit === "function") {
    window.__mcConfirmThoughtSplit(${JSON.stringify(newThoughtId)});
  }
  true;
})();
`;
}

export function cancelThoughtSplitScript(): string {
  return `
(function () {
  if (typeof window.__mcCancelThoughtSplit === "function") {
    window.__mcCancelThoughtSplit();
  }
  true;
})();
`;
}
