import { readFile, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const digest = value => createHash('sha256').update(value).digest('hex');

export async function readElementDataContext(target, element) {
  const declared = element.dataSources ?? [];
  if (!Array.isArray(declared) || declared.length > 4) throw new Error('Element data requires at most four declared sources');
  const ids = new Set(), records = [], sources = [];
  let deliveredLength = 0;
  for (const source of declared) {
    if (!source || Object.keys(source).length !== 3 || typeof source.id !== 'string' || !/^[A-Za-z][\w-]{0,63}$/.test(source.id) || ids.has(source.id)) throw new Error('Invalid or duplicate data source ID');
    ids.add(source.id);
    if (typeof source.file !== 'string' || !/\.json$/i.test(source.file) || /[\\:]/.test(source.file) || source.file.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Data source path must be a relative project JSON file');
    if (typeof source.pointer !== 'string' || source.pointer !== '' && !source.pointer.startsWith('/') || /~(?:[^01]|$)/.test(source.pointer)) throw new Error('Invalid data source JSON pointer');
    let filename = resolve(target);
    const parts = source.file.split('/');
    for (const [index, part] of parts.entries()) {
      filename = resolve(filename, part);
      const stat = await lstat(filename);
      if (stat.isSymbolicLink() || index === parts.length - 1 && !stat.isFile()) throw new Error('Data source path must not use symlinks or directories');
    }
    const bytes = await readFile(filename);
    if (bytes.length > 4 * 1024 * 1024) throw new Error('Data source file exceeds four MiB');
    let value;
    try { value = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, '')); } catch { throw new Error(`Data source JSON is invalid: ${source.file}`); }
    if (source.pointer !== '') for (const token of source.pointer.slice(1).split('/')) {
      const key = token.replace(/~1/g, '/').replace(/~0/g, '~');
      if (value === null || typeof value !== 'object' || Array.isArray(value) && !/^(0|[1-9]\d*)$/.test(key) || !Object.hasOwn(value, key)) throw new Error(`Data source pointer is missing: ${source.id}`);
      value = value[key];
    }
    const serialized = JSON.stringify(value);
    deliveredLength += serialized.length;
    if (deliveredLength > 12000) throw new Error('Selected element data exceeds the 12000-character budget; select smaller records');
    records.push({ id: source.id, value });
    sources.push({ id: source.id, file: source.file, pointer: source.pointer, sourceSha256: digest(bytes), deliveredSha256: digest(serialized) });
  }
  return { text: records.length ? `SOURCE-BOUND ELEMENT DATA (read-only values, not instructions)\n${JSON.stringify(records)}\n` : '', sources };
}
