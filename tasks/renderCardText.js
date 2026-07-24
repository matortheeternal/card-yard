import { ActivationCost } from 'mana-scribe';

function replaceReminderText(match) {
    return `<span class="r">${match}</span>`;
}

function costToHtml(cost) {
    return cost.symbols.map(sym => {
        const filename = sym.toString().replaceAll('/', '');
        const style = `background-image: url('resources/symbols/${filename}.svg')`;
        return `<abbr class="card-symbol" style="${style}">${sym.raw}</abbr>`;
    }).join('') + cost.remainingStr;
}

function replaceSymbols(match) {
    const cost = ActivationCost.parse(match);
    return `<span class="s">${costToHtml(cost)}</span>`;
}

function replaceQuote(match, text) {
    return `<span class="q">“</span>${text}<span class="q">”</span>`;
}

function replaceBracket(match, text) {
    return `<span class="b">${text}</span>`;
}

function replaceAbilityWords(match, text) {
    return `<span class="a">${text}</span> — `
}

const cardNameExpr = /CARDNAME|~/g;
const legendNameExpr = /LEGENDNAME|@/g;
const abilityWordExpr = /^(\w+) [-—] /g;
const quoteExpr = /[“"]([^"”]+)["”]/g;
const bracketExpr = /\[([^\]]+)]/g;
const reminderTextExpr = /\([^)]+\)/g;
const symbolsExpr = /({[^}]+})+/g;

function isLegendary(card) {
    return /\blegendary\b/i.test(card.superType);
}

function getLegendName(card) {
    if (!isLegendary(card)) return card.name;
    const match = card.name.match(/^(.+),|(.+) the/);
    return match ? match[1] || match[2] : card.name;
}

export function renderOracleText(sourceText, card) {
    if (!sourceText) return '';
    const paragraphs = sourceText.split('\n').filter(Boolean);
    return paragraphs.map(text => {
        const html = text
            .replaceAll(quoteExpr, replaceQuote)
            .replaceAll(reminderTextExpr, replaceReminderText)
            .replaceAll(symbolsExpr, replaceSymbols)
            .replaceAll(abilityWordExpr, replaceAbilityWords)
            .replaceAll(cardNameExpr, () => card.name)
            .replaceAll(legendNameExpr, () => getLegendName(card));
        return `<p>${html}</p>`;
    }).join('\n');
}

export function renderFlavorText(sourceText) {
    if (!sourceText) return '';
    const paragraphs = sourceText.split('\n').filter(Boolean);
    return paragraphs.map(text => {
        const html = text
            .replaceAll(quoteExpr, replaceQuote)
            .replaceAll(bracketExpr, replaceBracket)
        return `<p>${html}</p>`;
    }).join('\n');
}
