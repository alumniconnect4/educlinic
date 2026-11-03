const tags = 'a, b, c';
const arr = tags
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);
