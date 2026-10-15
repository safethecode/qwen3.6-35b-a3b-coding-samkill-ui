import { setAttr, setBool, setText } from './render-dom.js';
import { COPY } from './copy.js';

function renderTime(view) {
  const known = Boolean(view.readReady && view.session);
  const phase = known ? view.session.phase : null;
  const isCompleted = phase === 'completed';

  const screenTitle = document.getElementById('screen-title');
  const timeReadout = document.getElementById('time-readout');
  const completed = document.getElementById('completed');
  const completedTitle = document.getElementById('completed-title');
  const completedDuration = document.getElementById('completed-duration');
  const unknownTime = document.getElementById('unknown-time');
  const minutes = document.getElementById('minutes');
  const seconds = document.getElementById('seconds');
  const pausedStatus = document.getElementById('paused-status');

  if (screenTitle) {
    setText(screenTitle, COPY.screenTitle);
    setBool(screenTitle, 'hidden', isCompleted);
  }

  if (timeReadout) {
    setBool(timeReadout, 'hidden', !known || isCompleted);
  }

  if (completed) {
    setBool(completed, 'hidden', !isCompleted);
    if (isCompleted && completedTitle) {
      setText(completedTitle, COPY.completedTitle);
    }
    if (isCompleted && completedDuration && view.session) {
      setText(completedDuration, `설정한 시간 ${view.session.durationMinutes}분`);
    }
  }

  if (unknownTime) {
    setBool(unknownTime, 'hidden', known);
  }

  if (pausedStatus) {
    setBool(pausedStatus, 'hidden', phase !== 'paused');
  }

  if (known && !isCompleted && minutes && seconds) {
    setText(minutes, String(view.session.minutes).padStart(2, '0'));
    setText(seconds, String(view.session.seconds).padStart(2, '0'));
  }
}
export { renderTime };
