import { parseStayDate } from './dates.js';

export function formatStayDate(value) {
  if (typeof value !== 'string' || value.length !== 10) return '';
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (year < 2000 || year > 2099) return '';
  if (month < 1 || month > 12) return '';
  if (day < 1 || day > 31) return '';
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return '';
  }
  return `${year}.${month}.${day}`;
}

export function installTripLayout() {
  const groupSelector = '.booking-dates';
  const dateSelector = '.booking-date';
  const labelSelector = '.booking-date-label';
  const valueSelector = 'strong';
  const nightsSelector = '.booking-nights';
  const group = document.querySelector(groupSelector);
  if (!group) return () => {};

  const dates = group.querySelectorAll(dateSelector);
  const labels = group.querySelectorAll(labelSelector);
  const values = group.querySelectorAll(valueSelector);
  const nights = group.querySelector(nightsSelector);

  if (values.length < 2 || labels.length < 2) return () => {};

  const v1 = values[0];
  const v2 = values[1];
  const l1 = labels[0];
  const l2 = labels[1];

  const styleCache = new Map();

  function getStyle(el) {
    if (styleCache.has(el)) return styleCache.get(el);
    const s = window.getComputedStyle(el);
    const props = [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontStretch',
      'fontVariantNumeric', 'letterSpacing', 'wordSpacing',
      'paddingLeft', 'paddingRight'
    ];
    const data = props.map(p => s[p]);
    styleCache.set(el, data);
    return data;
  }

  function measureText(text, styleData) {
    const span = document.createElement('span');
    span.style.fontFamily = styleData[0];
    span.style.fontSize = styleData[1];
    span.style.fontWeight = styleData[2];
    span.style.fontStyle = styleData[3];
    span.style.fontStretch = styleData[4];
    span.style.fontVariantNumeric = styleData[5];
    span.style.letterSpacing = styleData[6];
    span.style.wordSpacing = styleData[7];
    span.style.whiteSpace = 'nowrap';
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.top = '-9999px';
    span.textContent = text;
    document.body.appendChild(span);
    const w = span.getBoundingClientRect().width;
    document.body.removeChild(span);
    return w;
  }

  function getIntrinsicWidth(el, textOverride) {
    const s = getComputedStyle(el);
    const pl = parseFloat(s.paddingLeft);
    const pr = parseFloat(s.paddingRight);
    const styleData = getStyle(el);
    const text = textOverride || el.textContent;
    const tw = measureText(text, styleData);
    return tw + pl + pr;
  }

  let rafId = null;
  let disposed = false;

  function checkLayout() {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (disposed) return;
      styleCache.clear();
      const rect = group.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0 || group.offsetParent === null) return;

      const w1Val = getIntrinsicWidth(v1);
      const w1Lbl = getIntrinsicWidth(l1);
      const max1 = Math.max(w1Val, w1Lbl);

      const w2Val = getIntrinsicWidth(v2);
      const w2Lbl = getIntrinsicWidth(l2);
      const max2 = Math.max(w2Val, w2Lbl);

      const nightsWidth = nights ? getIntrinsicWidth(nights) : 0;

      const paddingOf = el => { const s=getComputedStyle(el); return parseFloat(s.paddingLeft)+parseFloat(s.paddingRight); };
      const pad1=paddingOf(dates[0]),pad2=paddingOf(dates[1]);
      const computedGap=parseFloat(getComputedStyle(group).columnGap),gap=Number.isFinite(computedGap)?computedGap:0;
      const required=Math.max(max1 + pad1, max2 + pad2) * 2 + nightsWidth + gap * 2;
      const available=group.clientWidth-paddingOf(group);

      if (required > available + 0.5) {
        group.setAttribute('data-trip-stacked', 'true');
      } else {
        group.removeAttribute('data-trip-stacked');
      }
    });
  }

  const observer = new ResizeObserver((entries) => {
    checkLayout();
  });

  observer.observe(group);
  observer.observe(v1);
  observer.observe(v2);
  observer.observe(l1);
  observer.observe(l2);
  if (nights) observer.observe(nights);

  function onFontReady(){if(!disposed)checkLayout();}
  if(document.fonts){document.fonts.addEventListener('loadingdone', onFontReady)
    document.fonts.ready.then(onFontReady).catch(()=>{});}
  onFontReady();
  return()=>{disposed=true;if(rafId)cancelAnimationFrame(rafId);observer.disconnect();if(document.fonts){document.fonts.removeEventListener('loadingdone', onFontReady)}};
}