const modes = [...document.querySelectorAll('[data-mode]')];
const requested = new URLSearchParams(location.search).get('mode');
const mode = modes.some((link) => link.dataset.mode === requested) ? requested : 'shop';

for (const link of modes) {
  if (link.dataset.mode === mode) link.setAttribute('aria-current', 'page');
}
for (const view of document.querySelectorAll('[data-view]')) {
  view.hidden = view.dataset.view !== mode;
}
