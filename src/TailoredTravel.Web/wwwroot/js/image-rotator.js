(function () {
    "use strict";

    var INTERVAL = 6000;

    function initRotator(root) {
        var dataNode = root.querySelector("[data-rotator-slides]");
        if (!dataNode) return;

        var slides;
        try {
            slides = JSON.parse(dataNode.textContent);
        } catch (e) {
            return;
        }
        if (!slides || !slides.length) return;

        var stageImg = root.querySelector("[data-role='stage']");
        var labelEl = root.querySelector("[data-role='label']");
        var currentEl = root.querySelector("[data-role='current']");
        var totalEl = root.querySelector("[data-role='total']");
        var thumbButtons = Array.prototype.slice.call(root.querySelectorAll("[data-role='thumb']"));
        if (!stageImg) return;

        // The queue is a list of slide indexes. Position 0 is the active stage image.
        // Positions 1..N are what would appear in the strip (if rendered).
        // Strip cells render queue[1], queue[2], ...
        // 1-image case: strip shows queue[0] (the stage image) as a degraded fallback.
        var queue = slides.map(function (_, i) { return i; });
        var stripIsDegraded = slides.length === 1 && thumbButtons.length === 1;
        var kbAlt = false;
        var timer = null;
        var paused = false;

        if (totalEl) totalEl.textContent = String(slides.length);

        // Preload all thumb URLs so instant src swaps don't flash a loading state.
        slides.forEach(function (s) {
            var preload = new Image();
            preload.src = s.thumb;
        });

        function paintStage() {
            var slide = slides[queue[0]];
            // Crossfade by re-triggering the keyframe animation: drop is-active to fade out,
            // swap src on the next frame, then re-add to fade back in.
            stageImg.classList.remove("is-active", "kb-alt");
            // Force reflow so the animation restarts cleanly.
            void stageImg.offsetWidth;
            stageImg.src = slide.src;
            stageImg.srcset = slide.srcset;
            stageImg.alt = slide.alt;
            kbAlt = !kbAlt;
            if (kbAlt) stageImg.classList.add("kb-alt");
            stageImg.classList.add("is-active");

            if (labelEl) labelEl.textContent = slide.label || "";
            if (currentEl) currentEl.textContent = String(queue[0] + 1);
        }

        function paintThumbs(mode) {
            // mode:
            //  "initial" - first paint, set sources without fade
            //  "shift"   - single-step rotation: top thumbs swap instantly (preloaded URLs
            //              mean no flash), bottom thumb crossfades to the new tail.
            //  "full"    - click-to-promote / multi-step jump: every thumb crossfades.
            mode = mode || "full";

            var targets = thumbButtons.map(function (_, i) {
                return stripIsDegraded ? queue[0] : queue[i + 1];
            });

            thumbButtons.forEach(function (btn, i) {
                var slideIndex = targets[i];
                if (typeof slideIndex !== "number") return;

                // Skip thumbs that already show the right slide (rare but possible).
                if (parseInt(btn.dataset.slideIndex, 10) === slideIndex) return;

                var isLast = i === thumbButtons.length - 1;
                var transition;
                if (mode === "initial") {
                    transition = "instant";
                } else if (mode === "shift") {
                    // Top thumbs do a fast crossfade (200ms) so they read as "sliding into
                    // place"; the bottom does a normal crossfade (600ms) and lands as the
                    // new arrival.
                    transition = isLast ? "fade" : "fade-fast";
                } else {
                    transition = "fade";
                }

                setThumb(btn, slides[slideIndex], transition);
                btn.dataset.slideIndex = String(slideIndex);
            });

            resetProgress();
            startProgress();
        }

        function setThumb(btn, slide, transition) {
            // Each thumb has two stacked img layers. One is "front" (visible at opacity 1),
            // the other sits behind at opacity 0. To crossfade, we set the back layer's src,
            // wait for it to load, then move the is-front class to it. The CSS opacity
            // transition does the actual crossfade.
            var layers = btn.querySelectorAll("[data-role='thumb-img']");
            btn.setAttribute("aria-label", "Show " + (slide.label || slide.alt || "image"));
            // Need at least two layers for the crossfade. If markup is stale and only one
            // is present, bail rather than throw.
            if (layers.length < 2) return;

            var front = btn.querySelector("[data-role='thumb-img'].is-front");
            var back = front
                ? (front === layers[0] ? layers[1] : layers[0])
                : layers[0]; // first paint: nothing is is-front yet

            if (transition === "instant") {
                // First paint: put the same image on both layers and mark one as front.
                // No fade. Subsequent crossfades will then write to the back and flip.
                layers.forEach(function (l) {
                    l.src = slide.thumb;
                    l.alt = slide.alt;
                });
                if (!front) layers[0].classList.add("is-front");
                return;
            }

            // Crossfade: load new src into the back layer, then move is-front to it.
            // For "fade-fast", set is-fast on both layers so the transition runs at the
            // shorter duration. The class stays on; subsequent fades just inherit.
            var fast = transition === "fade-fast";
            layers.forEach(function (l) {
                l.classList.toggle("is-fast", fast);
            });

            function flip() {
                if (front) front.classList.remove("is-front");
                back.classList.add("is-front");
            }

            back.alt = slide.alt;
            back.src = slide.thumb;
            if (back.complete && back.naturalWidth > 0) {
                flip();
            } else {
                back.addEventListener("load", function onLoad() {
                    back.removeEventListener("load", onLoad);
                    flip();
                });
            }
        }

        function resetProgress() {
            thumbButtons.forEach(function (btn) {
                var bar = btn.querySelector(".tt-rotator-thumb-progress");
                if (!bar) return;
                bar.style.transition = "none";
                bar.style.width = "0";
            });
        }

        function startProgress() {
            // Progress bar on the next-up thumb (queue[1] = first thumb in the strip).
            // Only meaningful when there are at least 2 images and the strip isn't degraded.
            if (paused || stripIsDegraded || thumbButtons.length === 0) return;
            var bar = thumbButtons[0] ? thumbButtons[0].querySelector(".tt-rotator-thumb-progress") : null;
            if (!bar) return;
            // Force reflow so the transition picks up from 0.
            void bar.offsetWidth;
            bar.style.transition = "width " + INTERVAL + "ms linear";
            bar.style.width = "100%";
        }

        function pauseProgress() {
            var bar = thumbButtons[0] ? thumbButtons[0].querySelector(".tt-rotator-thumb-progress") : null;
            if (!bar) return;
            var w = getComputedStyle(bar).width;
            bar.style.transition = "none";
            bar.style.width = w;
        }

        function shiftQueue() {
            // Queue-shift: the active image moves to the back; everything else moves up one.
            // queue[1] becomes the new stage, the old stage joins the end of the queue.
            queue.push(queue.shift());
            paintStage();
            paintThumbs("shift");
        }

        function promoteThumb(thumbIndex) {
            // Clicking thumb at strip position thumbIndex (0-based) means the slide at
            // queue[thumbIndex + 1] should become the stage. Rotate the queue accordingly.
            var rotateBy = thumbIndex + 1;
            for (var i = 0; i < rotateBy; i++) {
                queue.push(queue.shift());
            }
            paintStage();
            // Single-step click (top thumb) behaves like auto-rotate. Multi-step still
            // does a full crossfade for now — to be revisited.
            paintThumbs(thumbIndex === 0 ? "shift" : "full");
        }

        function tick() {
            shiftQueue();
        }

        function start() {
            stop();
            if (paused) return;
            if (slides.length < 2) return; // nothing to rotate
            timer = setInterval(tick, INTERVAL);
        }

        function stop() {
            if (timer) { clearInterval(timer); timer = null; }
        }

        function restart() { stop(); start(); }

        thumbButtons.forEach(function (btn, i) {
            btn.setAttribute("role", "tab");
            btn.addEventListener("click", function () {
                if (stripIsDegraded) return;
                promoteThumb(i);
                restart();
            });
        });

        root.addEventListener("mouseenter", function () {
            paused = true;
            stop();
            pauseProgress();
        });

        root.addEventListener("mouseleave", function () {
            paused = false;
            startProgress();
            start();
        });

        root.addEventListener("keydown", function (e) {
            if (e.key === "ArrowRight") { shiftQueue(); restart(); e.preventDefault(); }
            if (e.key === "ArrowLeft") {
                // Shift the other way: pull the last queue entry to the front.
                // Backwards shift changes the strip's contents in a way that doesn't map
                // to "bottom thumb is the new one", so use a full crossfade.
                queue.unshift(queue.pop());
                paintStage();
                paintThumbs("full");
                restart();
                e.preventDefault();
            }
        });

        // Initial paint. The Razor partial pre-rendered the first slide in the stage,
        // but thumbs are empty until JS runs. Skip the fade animation on first paint.
        paintStage();
        paintThumbs("initial");
        start();
    }

    function init() {
        document.querySelectorAll("[data-rotator]").forEach(initRotator);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
