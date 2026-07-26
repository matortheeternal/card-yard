import Sifter from 'sigil-sifter';
import Magic from '@sigil-sifter/magic';
import CardMagicianMagic from '@sigil-sifter/magic-cm';

async function performRandomRedirect() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const randomParam = query || '*';

    try {
        const response = await fetch('search-index.json');
        if (!response.ok) throw new Error('Failed to load search index');
        const data = await response.json();
        let cards = data.cards;

        cards = cards.filter(card => {
            const typeLine = card.front.superType || '';
            return !/\b(token|emblem)\b/i.test(typeLine);
        });

        if (query) {
            const sifter = new Sifter();
            Magic(sifter);
            CardMagicianMagic(sifter);
            cards = sifter.filter(cards, query);
        }

        if (cards.length === 0) {
            alert('No cards found matching your query.');
            window.location.href = './';
            return;
        }

        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        const setCode = randomCard.setCode || 'unknown';
        const rngComponent = encodeURIComponent(randomParam);

        window.location.href = (
            `sets/${setCode}/${randomCard.slug}?random=${rngComponent}`
        );
    } catch (err) {
        console.error('Error during random card selection:', err);
        alert('An error occurred. Please try again.');
        window.location.href = './';
    }
}

performRandomRedirect();
