import fs from 'fs';
import path from 'path';
import { Eta } from 'eta';
import beautify from 'js-beautify';

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
    const html = eta.render(templateName, data);
    return beautify.html(html, {
        indent_size: 4,
        indent_inner_html: false,
        wrap_attributes: 'force-aligned',
        wrap_attributes_min_attrs: 3
    });
}
