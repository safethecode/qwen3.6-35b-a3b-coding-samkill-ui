# Shared navigation paint inspection

**UNVERIFIED overall.** The reusable monochromePaint layout rule catches actual wrong SVG pixels rather than trusting CSS color. This phase changes shared inspection and its skill/API documentation, not the rendered product. The earlier [actual local Qwen navigation correction](../navigation-state-paint/README.md) supplies the changed UI.

| Same shared helper and input matrix | Captures | Icon FAIL | Text FAIL | Unknown |
| --- | ---: | ---: | ---: | ---: |
| Before official inline SVG correction | 36 | 108 | 0 | 36 |
| Current corrected source | 36 | 0 | 0 | 36 |
| Injected black label counterfactual, 296px | 9 | 0 | 18 | 9 |

All four widths (296/320/390/1440), three routes and normal/200%/spacing modes are captured in [before](reports/before.json) and [after](reports/after.json). Three icons and three labels are inspected per capture. Current scoped results are 108 icon PASS and 72 plain-white label PASS; 36 selected labels have their own rgba(181,29,81,0.06) surface and stay unknown. The [counterfactual](reports/label-fault.json) fails all 18 eligible white-surface labels; its nine tinted labels remain unknown. This must not be compared as the same coverage as the older case-specific 27-label fault result.

Real browser fixtures reproduced and closed false passes from sibling image underlays, yellow text strokes retaining black cores, oversized SVG portions outside the viewport and WAAPI paint animations hidden from CSS declarations. Correct light foregrounds below the measurement threshold remain unknown, not falsely suppressed. The helper probes the same clip with its owner temporarily transparent and restores exact inline styles. These guards do not certify geometry, contrast, complete unobscured shapes or reference parity.

Fresh verification: **195 unit tests and 17 relevant browser/integration tests pass**. The [logs](tests/full-unit.log), [browser logs](tests/integration.log), development failures and retained helper versions are published. Earlier red logs use their development fixtures, not the final test file; original private bytes and redaction hashes are retained. The installed skill's 52 managed files match; only two references were backed up and updated. A host comment-check invocation error and its corrected zero-comment verification are disclosed in [the receipt](installed-skill.json).

The original [executed checker](executed-check.mjs) preserves exact input bytes for these reports; its relative imports refer to its original private location. [The portable checker](check-product.mjs) adapts only import paths. From the repository root, with dependencies installed and CHROME_PATH configured, create the runs parent then run:

    New-Item -ItemType Directory -Force runs | Out-Null
    node evals/results/stay-booking-20261016/shared-navigation-paint/check-product.mjs evals/results/stay-booking-20261016/request-consumers/source runs/shared-paint-replay

Use a new output directory each time. Exit 1 is expected for the current scoped unknowns; it is not a full pass. An optional final label-fault argument injects the known counterfactual. Exact source/harness, contract and driver hashes are in the reports. The portable replay is recorded separately after executing its published bytes.

No new native reference pixels, signed URLs or personal paths are published. No new inference or reference-quality claim follows. Request editing/custom calendar, full active-catalog integration and repeated complex reference-quality comparisons remain unfinished. The [current source](../request-consumers/source/index.html) and preceding source-bound evidence remain separate from this measurement improvement.
