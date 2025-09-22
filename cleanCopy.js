// ==UserScript==
// @name         Clean Copy — Remove Invisible & Junk Symbols
// @namespace    https://github.com/Jenich91
// @version      1.0
// @description  Позволяет копировать текст с сайтов без скрытых символов и невидимых меток, при этом emoji и обычный текст остаются целыми
// @author       Jenich91
// @license      MIT
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- Функция очистки текста ---
    function cleanText(str) {
        if (!str) return "";

        return str
            // Убираем реально мусорные невидимые символы
            .replace(/[\u200B\u200C\uFEFF\u00AD]/g, "")
            // Убираем не-печатаемые ASCII кроме \n \r \t
            .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F]/g, "")
            // Сжимаем повторные пробелы
            .replace(/\s{2,}/g, " ")
            .trim();
    }

    // --- Снятие ограничений с элементов ---
    function unlock(node = document) {
        try {
            if (node.nodeType === 1) {
                node.style.userSelect = "auto";
                node.oncopy = null;
                node.oncut = null;
                node.onselectstart = null;
                node.oncontextmenu = null;
            }
        } catch (e) {}
    }

    document.addEventListener("DOMContentLoaded", () => {
        unlock(document.body);
        unlock(document);
    });

    // --- Глушим обработчики сайта ---
    ["cut","selectstart","contextmenu","beforecopy"].forEach(event => {
        document.addEventListener(event, e => e.stopPropagation(), true);
    });

    // --- Перехватываем copy и чистим буфер ---
    document.addEventListener("copy", e => {
        e.stopPropagation();

        const selection = window.getSelection().toString();
        const cleaned = cleanText(selection);

        if (cleaned) {
            e.preventDefault();
            e.clipboardData.setData("text/plain", cleaned);
        }
    }, true);

    // --- Следим за динамически добавляемыми элементами ---
    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType === 1) unlock(node);
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
