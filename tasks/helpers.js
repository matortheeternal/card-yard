import fs from 'fs';
import path from 'path';
import { Eta } from 'eta';

let eta;

export function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

export function writeFile(filePath, content) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
}

export function renderTemplate(templateName, data) {
    eta ||= new Eta({ views: PATHS.templates });
    return eta.render(templateName, data);
}
