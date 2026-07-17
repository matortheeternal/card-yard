const JSDELIVR_BASE_URL = 'https://cdn.jsdelivr.net/gh';
const GH_BASE_URL = 'https://raw.githubusercontent.com';
const SET_JSON_PATH = 'dist/web/set.json';

const PROVIDERS = {
    github: (user, repo, branch) => {
        return [
            GH_BASE_URL,
            user,
            branch ? `${repo}@${branch}` : repo,
            'refs/heads/master',
        ].join('/');
    },
    jsdelivr: (user, repo, branch) => {
        return [
            JSDELIVR_BASE_URL,
            user,
            branch ? `${repo}@${branch}` : repo
        ].join('/');
    }
};

function resolveSetUrl(str, provider = 'jsdelivr') {
    if (str.startsWith('https://')) return str;

    const atIndex = str.indexOf('@');
    const branch = atIndex !== -1 ? str.slice(atIndex + 1) : null;
    const base   = atIndex !== -1 ? str.slice(0, atIndex) : str;

    const parts = base.split('/');

    const getUrl = PROVIDERS[provider];
    if (getUrl)
        return getUrl(parts[0], parts[1], branch);

    throw new Error(`Invalid set string: '${str}'`);
}

export async function fetchSetJson(url) {
    const res = await fetch(url);
    if (res.status === 404) {
        console.warn(`  ⚠ set.json not found at ${url} — skipping`);
        return null;
    }
    if (!res.ok)
        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    return res.json();
}

export async function fetchSets(config) {
    const results = [];
    for (const str of config.sets) {
        let url;
        try {
            url = resolveSetUrl(str, 'github');
        } catch (err) {
            console.warn(`  ⚠ Skipping '${str}': ${err.message}`);
            continue;
        }
        const setJsonUrl = [url, SET_JSON_PATH].join('/');
        console.log(`  Fetching ${setJsonUrl}`);
        const data = await fetchSetJson(setJsonUrl);
        const dataUrl = resolveSetUrl(str);
        data.imageExportPath = [dataUrl, data.imageExportPath].join('/');
        if (data) results.push(data);
    }
    return results;
}
