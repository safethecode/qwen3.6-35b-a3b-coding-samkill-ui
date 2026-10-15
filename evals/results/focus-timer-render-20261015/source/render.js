import { renderTime } from './render-time.js';
import { renderActions } from './render-actions.js';
import { renderConfig } from './render-config.js';
import { renderErrors } from './render-errors.js';
export function renderTimer(view) {
  renderTime(view);
  renderActions(view);
  renderConfig(view);
  renderErrors(view);
}
