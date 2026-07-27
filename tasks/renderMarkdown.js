import { marked } from 'marked';
import { manaSymbolExtension } from './manaSymbolExtension.js';
import { renderTemplate } from './helpers.js';

marked.use({ extensions: [manaSymbolExtension] });

export async function renderMarkdownTemplate(page, data) {
    const htmlContent = await marked.parse(page.content);
    return renderTemplate('page', {
        ...data,
        page: {
            ...page,
            html: htmlContent
        }
    });
}
