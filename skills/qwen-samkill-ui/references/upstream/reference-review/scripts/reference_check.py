import argparse
import hashlib
import json
import math
from pathlib import Path
import sys


UNITS = {"ratio", "image-px", "CSS-px", "pt"}


def text(value):
    return isinstance(value, str) and bool(value.strip())


def number(value, label):
    if type(value) not in (int, float) or not math.isfinite(value) or value < 0:
        raise ValueError(f"{label} must be a finite nonnegative measurement")
    return value


def bound_bytes(root, binding, label):
    if not isinstance(binding, dict) or not text(binding.get("path")):
        raise ValueError(f"{label} needs a path and sha256")
    name = Path(binding["path"])
    path = (root / name).resolve()
    if name.is_absolute() or not path.is_relative_to(root):
        raise ValueError(f"{label} path must remain inside --root")
    data = path.read_bytes()
    if binding.get("sha256") != hashlib.sha256(data).hexdigest():
        raise ValueError(f"{label} changed; repeat the affected observation")
    return data


def bound_object(root, binding, label):
    obj = json.loads(bound_bytes(root, binding, label))
    if not isinstance(obj, dict) or type(obj.get("schema_version")) is not int or obj["schema_version"] != 1:
        raise ValueError(f"{label} needs schema_version 1")
    return obj


def records(items, label):
    if not isinstance(items, list) or not items:
        raise ValueError(f"{label} must contain the adopted reference anchors")
    indexed = {}
    for item in items:
        if not isinstance(item, dict) or not text(item.get("id")) or item["id"] in indexed:
            raise ValueError(f"{label} needs unique nonempty ids")
        indexed[item["id"]] = item
    return indexed


def measurement(obj, label):
    if not isinstance(obj, dict) or obj.get("unit") not in UNITS:
        raise ValueError(f"{label} needs ratio/image-px/CSS-px/pt units")
    number(obj.get("value"), label)
    return obj


def prepare_handoff(root, binding):
    handoff = bound_object(root, binding, "reference_handoff")
    for key, anchor in records(handoff.get("anchors"), "reference anchors").items():
        if not text(anchor.get("feature")) or not text(anchor.get("target")):
            raise ValueError(f"{key}: name the source feature and implementation target")
        bound_bytes(root, anchor.get("source"), f"{key} source")
        observed = measurement(anchor.get("observed"), f"{key} observation")
        if observed.get("basis") not in {"measured", "estimated"} or not text(observed.get("method")):
            raise ValueError(f"{key}: observations need measured/estimated basis and a method; chosen is not observation")
        if observed["basis"] == "estimated":
            number(observed.get("uncertainty"), f"{key} observation uncertainty")
        expected = measurement(anchor.get("expected"), f"{key} expected")
        number(expected.get("tolerance"), f"{key} tolerance")
        if observed["unit"] != expected["unit"]:
            raise ValueError(f"{key}: source and implementation units differ; observe a common ratio or verified coordinate system")
        if abs(observed["value"] - expected["value"]) > expected["tolerance"]:
            adaptation = anchor.get("adaptation")
            if not isinstance(adaptation, dict) or not all(text(adaptation.get(k)) for k in ("requirement", "reason")):
                raise ValueError(f"{key}: changed geometry needs a scoped requirement and adaptation reason")
    return handoff


def compare_reference(root, handoff_binding, comparison_binding, target_sha256):
    handoff = prepare_handoff(root, handoff_binding)
    comparison = bound_object(root, comparison_binding, "reference_comparison")
    if comparison.get("handoff_sha256") != handoff_binding["sha256"]:
        raise ValueError("Reference comparison belongs to a different handoff")
    if comparison.get("target_sha256") != target_sha256:
        raise ValueError("Reference comparison belongs to a different implementation; recapture affected results")
    anchors = records(handoff["anchors"], "reference anchors")
    results = records(comparison.get("results"), "reference comparison results")
    if anchors.keys() != results.keys():
        raise ValueError("Reference comparison must cover exactly the adopted anchor ids")
    failures = []
    for key, anchor in anchors.items():
        result = results[key]
        bound_bytes(root, result.get("capture"), f"{key} rendered capture")
        actual = measurement(result.get("actual"), f"{key} rendered measurement")
        if not text(actual.get("method")) or actual["unit"] != anchor["expected"]["unit"]:
            raise ValueError(f"{key}: rendered measurement needs its method and matching units")
        expected = anchor["expected"]
        delta = abs(actual["value"] - expected["value"])
        if delta > expected["tolerance"]:
            failures.append({"id": key, "expected": expected["value"], "actual": actual["value"],
                             "delta": delta, "tolerance": expected["tolerance"], "unit": actual["unit"]})
    visual = comparison.get("visual_review")
    if not isinstance(visual, dict) or not text(visual.get("reason")):
        raise ValueError("Reference comparison needs an actual overall visual finding")
    if visual.get("status") == "regressed":
        failures.append({"id": "overall-reference", "reason": visual["reason"]})
    elif visual.get("status") not in {"retained", "adapted-and-verified"}:
        raise ValueError("Reference visual comparison is unverified; numeric matches cannot approve appearance")
    return failures


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["prepare"])
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--handoff", required=True)
    args = parser.parse_args()
    try:
        root = args.root.resolve(strict=True)
        path = root / args.handoff
        binding = {"path": args.handoff, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
        prepare_handoff(root, binding)
        print(json.dumps({"status": "READY", "handoff_sha256": binding["sha256"],
                          "scope": "Measurement handoff only; not implementation or visual approval"}))
        return 0
    except (OSError, ValueError, TypeError) as exc:
        print(json.dumps({"status": "UNVERIFIED", "errors": [str(exc)]}))
        return 2


if __name__ == "__main__":
    sys.exit(main())
