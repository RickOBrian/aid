/**
 * DS Docs — docs-tables.js
 * Wraps bare <table> elements in the .table-wrap shell so every table
 * shares the same border, radius, and row dividers.
 */
(function () {
  'use strict';

  function wrapTables(root) {
    if (!root) return;

    root.querySelectorAll('table').forEach(table => {
      if (table.closest('.table-wrap')) return;

      const wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  window.DSDocsTable = { wrap: wrapTables };
})();
