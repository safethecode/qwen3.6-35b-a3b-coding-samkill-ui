import { COPY } from './copy.js';
import { translateError } from './error-copy.js';
export function errorMessage(view) {
if (view.configOpen && view.readReady && view.session && (view.session.phase === 'running' || view.session.phase === 'paused')) {
    return COPY.unavailableConfig;
}
if (view.error) {
    return translateError(view.error);
}
return '';
}
