import { interleave } from '../scripts/simulator/interleave.js';

function createCommons(color, count) {
    let cards = [];
    for (let i = 1; i <= count; i++)
        cards.push(`C${color}${i.toString().padStart(2, '0')}`);
    return cards;
}

let cards = {
    colorless: createCommons('C', 15),
    colored: [
        createCommons('W', 10),
        createCommons('U', 10),
        createCommons('B', 10),
        createCommons('R', 10),
        createCommons('G', 10)
    ],
    twoColored: [
        createCommons('BR', 5),
        createCommons('BG', 5),
        createCommons('RW', 5),
        createCommons('GR', 5),
        createCommons('GW', 5),
        createCommons('GU', 5),
        createCommons('UW', 5),
        createCommons('BW', 5),
        createCommons('BU', 5),
        createCommons('RU', 5),
    ]
};

function interleaveArrays(arrays) {
    return arrays.reduce((results, c) => {
        return interleave(results, c);
    }, []);
}

const results = interleaveArrays([
    cards.colorless,
    interleaveArrays(cards.colored),
    interleaveArrays(cards.twoColored)
]);

console.log(JSON.stringify(results, null, 2));
