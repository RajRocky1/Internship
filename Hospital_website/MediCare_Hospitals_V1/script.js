/* MediCare Hospital (demo): behavior. Line 1 flags JS before first paint so reveal elements hide only when JS runs. */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* 1. Mobile navigation */
    var toggle = $('#nav-toggle'), nav = $('#primary-navigation');
    if (toggle && nav) {
        var setNav = function (open, returnFocus) {
            nav.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close main menu' : 'Open main menu');
            if (!open && returnFocus) toggle.focus();
        };
        var isOpen = function () { return toggle.getAttribute('aria-expanded') === 'true'; };
        toggle.addEventListener('click', function () { setNav(!isOpen(), false); });
        nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false, false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) setNav(false, true); });
        document.addEventListener('click', function (e) {
            if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setNav(false, false);
        });
    }

    /* 2. Scroll reveal: one shared observer, toggles on enter AND exit so it replays */
    var revealEls = $$('.reveal'), observer = null;
    var startReveal = function () {
        if (observer || !('IntersectionObserver' in window)) {
            if (!('IntersectionObserver' in window)) revealEls.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }
        observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) { en.target.classList.toggle('is-visible', en.isIntersecting); });
        }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
        revealEls.forEach(function (el) { observer.observe(el); });
    };
    var stopReveal = function () {
        if (observer) { observer.disconnect(); observer = null; }
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    };
    var applyMotion = function () { if (reduceMq.matches) stopReveal(); else startReveal(); };
    applyMotion();
    if (reduceMq.addEventListener) reduceMq.addEventListener('change', applyMotion);

    /* 3. Back to top */
    var backBtn = $('.back-to-top');
    var scrollToTop = function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduceMq.matches ? 'auto' : 'smooth' });
        var top = $('#top'); if (top) top.focus({ preventScroll: true });
    };
    $$('a[href="#top"]').forEach(function (a) { a.addEventListener('click', scrollToTop); });
    if (backBtn) {
        var onScroll = function () { backBtn.classList.toggle('show', window.scrollY > 500); };
        window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }

    /* 4. Footer year */
    var yr = $('#current-year'); if (yr) yr.textContent = new Date().getFullYear();

    /* 5. Department -> doctor filtering, date min */
    var form = $('#appointment-form'), dept = $('#department'), doc = $('#doctor'), date = $('#date');
    var doctors = {
        cardiology: ['Dr. Meera Anand (demo)'], orthopedics: ['Dr. Arjun Mehta (demo)'], neurology: ['Dr. Rohan Kapoor (demo)'],
        pediatrics: ['Dr. Elena Park (demo)'], general: ['Dr. Sara Thomas (demo)']
    };
    var fillDoctors = function (d, pick) {
        if (!doc) return;
        doc.innerHTML = '';
        var add = function (v, t) { var o = document.createElement('option'); o.value = v; o.textContent = t; doc.appendChild(o); };
        if (!d) { add('', 'Select a department first'); return; }
        add('', 'Select a doctor');
        add('any', 'Any available doctor');
        (doctors[d] || []).forEach(function (n) { add(n, n); });
        if (pick) { for (var i = 0; i < doc.options.length; i++) if (doc.options[i].value.indexOf(pick) === 0) doc.selectedIndex = i; }
    };
    var updateSummary = function () {
        var box = $('#request-summary');
        if (!box || !dept || !doc) return;
        if (!dept.value) { box.textContent = ''; return; }
        var deptName = dept.options[dept.selectedIndex].textContent;
        var picked = doc.value;
        var tail = !picked ? '. Please choose a doctor.' : (picked === 'any' ? ' with any available doctor' : ' with ' + picked);
        box.textContent = "You're requesting: " + deptName + tail;
    };
    if (dept) dept.addEventListener('change', function () { fillDoctors(dept.value); updateSummary(); });
    if (doc) doc.addEventListener('change', updateSummary);
    if (date) {
        var t = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
        date.min = t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate());
    }
    $$('.book-doctor').forEach(function (b) {
        b.addEventListener('click', function () {
            if (!dept || !doc) return;
            dept.value = b.dataset.department; fillDoctors(dept.value, b.dataset.doctor); updateSummary();
            var target = $('#appointment'); if (target) target.scrollIntoView({ behavior: reduceMq.matches ? 'auto' : 'smooth' });
            window.setTimeout(function () { var f = $('#fullname'); if (f) f.focus({ preventScroll: true }); }, reduceMq.matches ? 0 : 500);
        });
    });

    /* 5b. Highlight the nav link of the section being viewed */
    var navLinks = $$('#primary-navigation a[href^="#"]:not(.btn)');
    var spySections = $$('main section[id]');
    if (navLinks.length && spySections.length) {
        var setActive = function (id) {
            navLinks.forEach(function (a) {
                var on = a.getAttribute('href') === '#' + id;
                a.classList.toggle('active', on);
                if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
            });
        };
        var updateSpy = function () {
            var line = window.innerHeight * 0.35, current = spySections[0];
            spySections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) current = s; });
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = spySections[spySections.length - 1];
            setActive(current.id);
        };
        var spyTick = false;
        var requestSpy = function () {
            if (spyTick) return; spyTick = true;
            window.requestAnimationFrame(function () { spyTick = false; updateSpy(); });
        };
        window.addEventListener('scroll', requestSpy, { passive: true });
        window.addEventListener('resize', requestSpy);
        updateSpy();
    }
    /* 5c. Hero illustration: the heartbeat line follows the cursor (page-load animation is unchanged) */
    var heroVisual = $('.hero-visual'), ecgLine = $('.ecg');
    if (heroVisual && ecgLine && ecgLine.getTotalLength && !reduceMq.matches) {
        var heroSvg = heroVisual.querySelector('svg');
        var ecgTotal = ecgLine.getTotalLength();
        var ecgLengthAt = function (x) { /* path length at which the line reaches horizontal position x */
            var lo = 0, hi = ecgTotal;
            for (var i = 0; i < 24; i++) {
                var mid = (lo + hi) / 2;
                if (ecgLine.getPointAtLength(mid).x < x) lo = mid; else hi = mid;
            }
            return hi;
        };
        var followCursor = function (e) {
            var r = heroSvg.getBoundingClientRect();
            var x = ((e.clientX - r.left) / r.width) * 480; /* 480 = viewBox width */
            x = Math.max(20, Math.min(480, x));
            ecgLine.style.strokeDashoffset = String(1 - ecgLengthAt(x) / ecgTotal);
        };
        heroVisual.addEventListener('pointerenter', function (e) {
            ecgLine.style.animation = 'none';
            ecgLine.style.transition = 'stroke-dashoffset .12s linear';
            followCursor(e);
        });
        heroVisual.addEventListener('pointermove', followCursor);
        heroVisual.addEventListener('pointerleave', function () {
            ecgLine.style.transition = 'stroke-dashoffset .7s ease';
            ecgLine.style.strokeDashoffset = '0';
        });
    }

    /* 5d. Department cards: click to jump to the form with that department selected */
    $$('.dept-link').forEach(function (b) {
        b.addEventListener('click', function () {
            if (!dept || !doc) return;
            dept.value = b.dataset.department;
            dept.dispatchEvent(new Event('change', { bubbles: true })); /* filters the doctor list */
            var target = $('#appointment'); if (target) target.scrollIntoView({ behavior: reduceMq.matches ? 'auto' : 'smooth' });
            window.setTimeout(function () { var f = $('#fullname'); if (f) f.focus({ preventScroll: true }); }, reduceMq.matches ? 0 : 500);
        });
    });
    /* 6. Validation + demo-only submit (no network, no storage) */
    if (!form) return;
    var status = $('.form-status', form);
    var setError = function (f, msg) {
        var el = $('#error-' + f.id); if (el) el.textContent = msg ? 'Error: ' + msg : '';
        if (msg) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid');
        return !msg;
    };
    var validate = function (f) {
        var v = f.value.trim();
        if (f.type === 'checkbox') return setError(f, f.checked ? '' : 'Please confirm you understand this is a demonstration.');
        if (f.required && !v) return setError(f, f.tagName === 'SELECT' ? 'Please choose an option.' : 'This field is required.');
        if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setError(f, 'Enter a valid email address, like name@example.com.');
        if (f.type === 'tel' && v && !/^\+?[0-9()\-\s]{7,18}$/.test(v)) return setError(f, 'Enter a valid phone number using digits, spaces, + or -.');
        if (f.type === 'date' && v && f.min && v < f.min) return setError(f, 'Choose today or a future date.');
        return setError(f, '');
    };
    var fields = $$('input:not([type=hidden]), select, textarea', form);
    form.addEventListener('focusout', function (e) { if (fields.indexOf(e.target) > -1) validate(e.target); });
    form.addEventListener('change', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') validate(e.target); });

    var clearStatus = function () {
        if (!status) return;
        status.classList.remove('is-error', 'is-success');
        status.textContent = '';
    };
    var showSuccess = function () {
        if (!status) return;
        status.textContent = '';
        status.classList.remove('is-error');
        status.classList.add('is-success');
        var panel = document.createElement('div'); panel.className = 'success-panel';
        var h = document.createElement('h3'); h.textContent = 'Demo request received'; h.tabIndex = -1;
        var p = document.createElement('p'); p.textContent = 'Demo only: no appointment was booked and nothing was sent or stored.';
        var again = document.createElement('button'); again.type = 'button'; again.className = 'btn btn-outline'; again.textContent = 'Start over';
        again.addEventListener('click', function () {
            clearStatus(); form.reset(); fillDoctors(''); updateSummary();
            fields.forEach(function (f) { setError(f, ''); });
            var first = $('#fullname'); if (first) first.focus();
        });
        panel.appendChild(h); panel.appendChild(p); panel.appendChild(again);
        status.appendChild(panel);
        h.focus();
    };
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var firstBad = null;
        fields.forEach(function (f) { if (!validate(f) && !firstBad) firstBad = f; });
        if (firstBad) {
            clearStatus();
            if (status) { status.classList.add('is-error'); status.textContent = 'The form has errors. Fix the highlighted fields and submit again.'; }
            firstBad.focus();
            return;
        }
        showSuccess();
        form.reset(); fillDoctors(''); updateSummary();
    });
});