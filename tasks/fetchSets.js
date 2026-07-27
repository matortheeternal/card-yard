import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

function loadMarkdownPages(folderPath) {
    const pages = [];
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const name = path.parse(file).name;
        const filePath = path.join(folderPath, file);
        const source = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(source);
        pages.push({ name, content, ...data });
    }
    return pages;
}

function loadSet(folderPath, setJsonPath) {
    console.log(`  Loading set from ${folderPath}`);
    const data = JSON.parse(fs.readFileSync(setJsonPath, 'utf-8'));
    data.pages = loadMarkdownPages(folderPath);
    data.imageExportPath = [data.baseUrl, data.imageExportPath].join('/');
    return data;
}

export async function fetchSets() {
    const results = [];
    const setsDir = 'sets';

    if (!fs.existsSync(setsDir)) return results;

    const folders = fs.readdirSync(setsDir).filter(file => {
        return fs.statSync(path.join(setsDir, file)).isDirectory();
    });

    for (const folder of folders) {
        const folderPath = path.join(setsDir, folder);
        const setJsonPath = path.join(folderPath, 'set.json');
        if (!fs.existsSync(setJsonPath)) continue;
        results.push(loadSet(folderPath, setJsonPath));
    }

    return results;
}
