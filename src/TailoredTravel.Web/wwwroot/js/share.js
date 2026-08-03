(function () {
    'use strict';

    var canShare = typeof navigator.share === 'function';
    var canCopy = !!(navigator.clipboard && navigator.clipboard.writeText);

    document.querySelectorAll('[data-share-button]').forEach(function (button) {
        if (!canShare && !canCopy) {
            button.hidden = true;
            return;
        }

        button.addEventListener('click', function () {
            var payload = {
                title: document.title,
                url: window.location.href
            };

            var description = document.querySelector('meta[name="description"]');
            if (description && description.content) {
                payload.text = description.content;
            }

            if (canShare) {
                navigator.share(payload).catch(function (err) {
                    if (err && err.name !== 'AbortError') {
                        console.error('Share failed:', err);
                    }
                });
                return;
            }

            navigator.clipboard.writeText(payload.url).then(function () {
                showCopied(button);
            }).catch(function (err) {
                console.error('Copy failed:', err);
            });
        });
    });

    function showCopied(button) {
        var label = button.querySelector('[data-share-label]');
        if (!label) return;

        var original = label.textContent;
        label.textContent = 'Link copied!';
        button.setAttribute('aria-live', 'polite');

        setTimeout(function () {
            label.textContent = original;
        }, 2000);
    }
})();
