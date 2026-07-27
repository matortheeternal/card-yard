// renderManaSymbols.js
import { ActivationCost } from 'mana-scribe';

function symbolToHtml(symbol) {
    const filename = symbol.toString().replaceAll('/', '');
    const style = `background-image: url('resources/symbols/${filename}.svg')`;

    return `<abbr class="card-symbol" style="${style}">${symbol.raw}</abbr>`;
}

export function costToHtml(source) {
    const cost = ActivationCost.parse(source);
    const symbols = cost.symbols.map(symbolToHtml).join('');

    return symbols + cost.remainingStr;
}
