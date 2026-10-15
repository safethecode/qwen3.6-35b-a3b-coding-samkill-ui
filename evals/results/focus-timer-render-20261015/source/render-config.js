import { setAttr, setBool, setText } from './render-dom.js';
import { COPY } from './copy.js';
export function renderConfig(view) {
  const durationInput = document.getElementById('duration-input');
  const durationError = document.getElementById('duration-error');
  const apply = document.getElementById('apply-duration');
if (view.fieldInvalid) {
  setText(durationError, COPY.invalidDuration);
} else {
  setText(durationError, '');
}
setBool(durationInput, 'aria-invalid', !!view.fieldInvalid);
const isReady = view.readReady && view.session;
const isPhaseReady = isReady && view.session.phase === 'ready';
const isPhaseCompleted = isReady && view.session.phase === 'completed';
const canApply = isReady && (isPhaseReady || isPhaseCompleted);
setBool(apply, 'disabled', !canApply);
}
