import { costToHtml } from './renderManaSymbols.js';

const manaSymbolExpression = /^\{[^}\n]+}/;

export const manaSymbolExtension = {
    name: 'manaSymbol',
    level: 'inline',

    start(source) {
        return source.indexOf('{');
    },

    tokenizer(source) {
        const match = manaSymbolExpression.exec(source);
        if (!match) return false;
        return {
            type: 'manaSymbol',
            raw: match[0]
        };
    },

    renderer(token) {
        return `<span class="s">${costToHtml(token.raw)}</span>`;
    },
};
