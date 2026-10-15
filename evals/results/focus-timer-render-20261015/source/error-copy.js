import { COPY } from './copy.js';
export function translateError(code) {
  switch (code) {
    case 'READ_FAILED': return COPY.readError;
    case 'WRITE_FAILED': return COPY.writeError;
    case 'INVALID_CLOCK': return COPY.clockError;
    default: return COPY.transitionError;
  }
}
