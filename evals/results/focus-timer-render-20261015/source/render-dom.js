export function setAttr(el, attr, value) {
  if (el.getAttribute(attr) !== String(value)) {
    el.setAttribute(attr, value);
  }
}

export function setBool(el, prop, value) {if (prop.startsWith('aria-')) { setAttr(el, prop, Boolean(value)); return; } if (el[prop] !== !!value) { el[prop] = !!value; }}

export function setText(el, text) {
  if (el.textContent !== text) {
    el.textContent = text;
  }
}
