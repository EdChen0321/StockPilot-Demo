const destinations = new Map([
  ['shop', './interactive/store/'],
  ['operations', './interactive/operations/'],
  ['warehouse', './interactive/warehouse/#shipping'],
]);
const mode = new URLSearchParams(location.search).get('mode');
if (destinations.has(mode)) location.replace(destinations.get(mode));
