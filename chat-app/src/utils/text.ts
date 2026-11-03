export const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const isHtml = (content: string): boolean => {
  if (!content) return false;
  return /<[a-z][\s\S]*>/i.test(content);
};
