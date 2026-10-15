import { setBool, setText } from './render-dom.js';
import { renderExclusiveMessage } from './runtime-dom.js';
import { errorMessage } from './error-message.js';
export function renderErrors(view) {
  renderExclusiveMessage([
    { key: 'main', region: document.getElementById('main-error-region'), content: document.getElementById('main-error') },
    { key: 'config', region: document.getElementById('config-error-region'), content: document.getElementById('config-error') }
  ], view.configOpen ? 'config' : 'main', errorMessage(view), { setBool, setText });
}
