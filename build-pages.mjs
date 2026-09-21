import fs from 'node:fs';
import path from 'node:path';
const source = 'work/site/dist';
const dest = '_site';
fs.mkdirSync(dest, { recursive: true });
for (const name of ['knowledge.js', 'agent.js', 'v2.css']) {
  fs.copyFileSync(path.join(source, name), path.join(dest, name));
}
let html = fs.readFileSync(path.join(source, 'index.html'), 'utf8');
html = html.replace('href="/"', 'href="./"')
  .replace('<option value="model">豆包理解 + 规则校验</option>', '<option value="model" disabled>豆包模式需独立服务端 · 此站未接入</option>');
fs.writeFileSync(path.join(dest, 'index.html'), html);
let ui = fs.readFileSync(path.join(source, 'ui.js'), 'utf8');
const statusStart = ui.indexOf("fetch('/api/status')");
const statusEnd = ui.indexOf('\nif(document.modelContext', statusStart);
if (statusStart < 0 || statusEnd < 0) throw Error('Unable to locate model status initialization');
ui = ui.slice(0, statusStart) + "$('mode').value='rules';$('mode').disabled=true;$('connection').textContent='GitHub Pages · 规则演示';$('model-state').textContent='此入口运行本地规则，不调用豆包。模型版需独立服务端；请勿在网页中填写 API 密钥。';" + ui.slice(statusEnd);
fs.writeFileSync(path.join(dest, 'ui.js'), ui);
fs.writeFileSync(path.join(dest, '.nojekyll'), '');
console.log('Built GitHub Pages static rule demo in _site. No server credentials included.');
