/* ══════════════════════════════════════════════════════════════════════
   MindMotion website — interactions
   Calm, intentional motion. Everything degrades gracefully and respects
   prefers-reduced-motion. No dependencies.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────── Language switch (DE default, remembered) ─────────────── */
  (function () {
    var KEY = 'mm-lang';
    var buttons = document.querySelectorAll('[data-set-lang]');
    if (!buttons.length) return;

    function apply(lang) {
      if (lang !== 'de' && lang !== 'en') lang = 'de';
      document.documentElement.lang = lang;
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-set-lang') === lang;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      try { localStorage.setItem(KEY, lang); } catch (e) {}
    }

    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    if (!stored) {
      stored = (navigator.language || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
    }
    apply(stored);
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-set-lang')); });
    });
  })();

  /* ─────────────── Header shadow on scroll ─────────────── */
  (function () {
    var header = document.getElementById('site-header');
    if (!header) return;
    function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  /* ─────────────── Scroll progress bar ─────────────── */
  (function () {
    var bar = document.querySelector('.scroll-progress');
    if (!bar || reduceMotion) return;
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? h.scrollTop / max : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  /* ─────────────── Scroll reveal (IntersectionObserver) ─────────────── */
  (function () {
    var items = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ─────────────── Animated number counters ─────────────── */
  (function () {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      nums.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
      return;
    }
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dur = 1400, start = null;
      var dec = (el.getAttribute('data-count').indexOf('.') > -1) ? 1 : 0;
      function frame(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        var val = target * eased;
        el.textContent = dec ? val.toFixed(1) : Math.round(val).toString();
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = el.getAttribute('data-count');
      }
      requestAnimationFrame(frame);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ─────────────── Parallax on scroll (subtle, breathing) ─────────────── */
  (function () {
    var els = document.querySelectorAll('[data-parallax]');
    if (!els.length || reduceMotion) return;
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.08;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var offset = (center - vh / 2) * -speed;
        el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  /* ─────────────── Hero phone subtle mouse tilt ─────────────── */
  (function () {
    var stage = document.querySelector('.hero-phone');
    if (!stage || reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;
    var phone = stage.querySelector('.phone');
    if (!phone) return;
    var raf = null, tx = 0, ty = 0;
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      tx = px * 8; ty = py * -8;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    stage.addEventListener('mouseleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); });
    function apply() {
      raf = null;
      phone.style.transform = 'perspective(900px) rotateY(' + tx.toFixed(2) + 'deg) rotateX(' + ty.toFixed(2) + 'deg) rotate(2deg)';
    }
  })();

  /* ─────────────── Footer year ─────────────── */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
