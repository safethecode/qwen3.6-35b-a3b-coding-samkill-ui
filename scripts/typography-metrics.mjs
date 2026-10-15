export function validateTypographyMetrics(roles) {
  if (!Array.isArray(roles)) throw new Error('Typography metrics require a role array');
  for (const role of roles) for (const key of ['fontSizePx', 'fontWeight', 'lineHeightRatio']) {
    if (!Object.hasOwn(role, key)) continue;
    const value = role[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || key === 'fontWeight' && value > 1000) throw new Error(`Invalid typography metric ${key} for ${role.selector}`);
  }
}

export function typographyMetricIssues(role, metrics, textScale = 1, lineHeightRatioOverride) {
  return metrics.flatMap(item => ['fontSizePx', 'fontWeight', 'lineHeightRatio'].flatMap(metric => {
    if (!Object.hasOwn(role, metric)) return [];
    const expected = metric === 'lineHeightRatio' && lineHeightRatioOverride !== undefined ? lineHeightRatioOverride : role[metric] * (metric === 'fontSizePx' ? textScale : 1), actual = item[metric], tolerance = metric === 'lineHeightRatio' ? .02 : .5;
    return actual !== null && Math.abs(actual - expected) <= tolerance ? [] : [{ ...item, status: 'FAIL', selector: role.selector, metric, actual, expected, problem: 'Rendered typography role does not match its declared metric' }];
  }));
}
