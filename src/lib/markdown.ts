import { icons as faSolid } from '@iconify-json/fa6-solid';
import { getIconData, iconToHTML, iconToSVG } from '@iconify/utils';
import { Marked } from 'marked';

const externalLinkIcon = (() => {
  const data = getIconData(faSolid, 'arrow-up-right-from-square');
  if (!data) throw new Error('fa6-solid:arrow-up-right-from-square not found');
  const { attributes, body } = iconToSVG(data);
  return iconToHTML(body, { ...attributes, class: 'inline align-baseline', 'aria-hidden': 'true' });
})();

const marked = new Marked({
  renderer: {
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<a class="underline" href="${href}" target="_blank">${text} ${externalLinkIcon}</a>`;
    },
  },
});

export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false });
}
