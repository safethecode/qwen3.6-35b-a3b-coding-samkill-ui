# 분해 인계와 원본 비교의 실행 검사

레퍼런스 기반 UI에서 RUI-16/17이 적용되면 아래 자료를 실제 게이트 입력에 연결한다. [전체 분해 JSON과 raw](../../reference-decompose/references/decomposition-json.md)를 관찰 원본으로 유지하고 수치 인계는 그 관찰ID를 참조한다. 모든 표현을 숫자나 고정 분류로 억지 변환하지 않는다. 분해/해석/core_review는 schema_version1, 수치 handoff/comparison은2다. catalog/contract/report의 버전1과 구별한다. 예전 수치 전용v1 기록은 보존하며 새 검사에서는 전체 인계 미충족으로 UNVERIFIED다.

## 구현 전에

원본의 화면 목적·상태와 현재 만들 화면이 맞는지 먼저 확인한다. 원본을 사용자/스킬 제약으로 먼저 걸러서 관찰하지 않는다. 큰 색 면적·사진·입력 패널·열 비율·제목 위계처럼 화면을 식별하게 하는 특징을 기록한 다음, 실제 사용자 요구와 충돌하는 **해당 역할**의 변경을 따로 결정한다. 배경 제약이 모든 내부 표현의 삭제 근거가 되거나, ‘장식’이라는 이름만으로 핵심 특징을 제외하면 인계 미완료다.

핵심 치수·비율·간격은 직접 확인한 값 또는 범위와 근거를 남긴다. 라이브 DOM/디자인 파일을 읽을 수 있는데도 확인하지 않고 CSS unknown으로 처리한 뒤 chosen 값으로 대체하지 않는다. 이미지밖에 없다면 image-px나 비율로 관찰하고, CSS-px와 같다고 취급하지 않는다. 정확한 원본 폰트/CSS의 미확인은 보이는 열 폭과 간격까지 생략하는 근거가 아니다.

`design/reference-handoff.json`은 다음 형식이다. 아래464/8은 yoch 진단을 설명하기 위한 예이며 다른 제품의 기본값이 아니다. SHA와 경로는 실제 프로젝트 파일로 채운다.

```json
{
  "schema_version": 2,
  "decomposition": {"path": "design/reference-decomposition.json", "sha256": "<실제 SHA-256>"},
  "interpretation": {"path": "design/reference-interpretation.json", "sha256": "<실제 SHA-256>"},
  "anchors": [{
    "id": "Q3-column-width",
    "observation_id": "O-column-width",
    "feature": "공개 폼의 좁은 본문 열",
    "source": {"path": "design/evidence/reference.png", "sha256": "<실제 SHA-256>"},
    "observed": {"value": 464, "unit": "CSS-px", "basis": "measured", "method": "라이브 본문 DOM getBoundingClientRect().width"},
    "target": ".public-form",
    "expected": {"value": 464, "unit": "CSS-px", "tolerance": 8}
  }]
}
```

- `observed.basis`는 measured/estimated다. estimated에는 같은 단위의 `uncertainty`와 추정 방법을 기록한다. chosen은 관찰이 아니다. ‘좁은 열’, ‘넉넉한 공백’만으로 수치를 대신할 수 없다.
- 단위는 ratio/image-px/CSS-px/pt 중 실제 근거에 맞춘다. 관찰과 구현 기대는 같은 좌표계로 비교해야 한다. 환산 근거가 없으면 양쪽의 동일한 비율을 관찰한다. 사진 잉크 크기를 CSS font-size로 이름만 바꾸지 않는다.
- `expected.tolerance`는 비교 전에 정하는 해당 항목의 허용 차이다. 임계값을 사후에 넓혀 결과를 통과시키지 않는다. 관찰과 기대의 차이가 허용 차이를 넘으면 `adaptation: {"requirement": "실제 요구의 출처·해당 범위", "reason": "바꿀 관계와 이유"}`가 필요하다. 이유 기록만으로 바뀐 결과의 품질이 승인되지는 않는다.
- `source`는 실제 원본 또는 측정 근거 파일이다. source의 경로·해시와 method가 실제 관찰을 뒷받침하는지는 직접 판독한다. 관찰 후에 만든 결과를 원본 근거로 바꾸지 않는다.
- decomposition/interpretation은 원본 파일과 받은 쪽의 해석 파일을 묶는다. 각 anchor의 observation_id는 분해 속성ID여야 하며 관찰값·단위·상태와 원본 artifact가 일치해야 한다. 전체 분해와 따로 다른 수치를 적어 통과시키지 않는다. [합성 예제 handoff](../../reference-decompose/references/json-example/handoff.json)는 이 연결을 실제 실행할 수 있다.

계약의 `reference_handoff`에 위 JSON의 `{path, sha256}`을 넣고 구현 전에 실행한다. targets가 아직 없어도 이 단계는 실행할 수 있다.

```sh
python3 <reference-review>/scripts/design_gate.py prepare --root . --contract design/gate-contract.json
```

READY는 **분해·해석·수치 인계의 자료 준비**다. 이해·이미지 판독·구현 품질 PASS가 아니다. UNVERIFIED면 부족한 관찰/해석·단위를 보완한 뒤 해당 구현으로 넘긴다. 읽기 전용/명세 전용은 범위 안에서 분석·인계 상태만 전달한다. 검색만·문구만·기존 계약의 국소 수정에 새 전체 분석을 강제하지 않는다.

## 구현 후

보고서의 `reference_comparison`에 비교 JSON의 `{path, sha256}`을 넣는다. 비교 자료는 다음을 갖는다.

```json
{
  "schema_version": 2,
  "handoff_sha256": "<사용한 인계 JSON의 실제 SHA-256>",
  "target_sha256": "<fingerprint 명령의 현재 target_sha256>",
  "core_review": {"path": "design/core-review.json", "sha256": "<실제 SHA-256>"},
  "consumption": [{"ref": "O-column-width", "status": "applied", "target": ".public-form", "interpretation": "현재 렌더의 열 폭을 원본 조건과 비교함"}],
  "results": [{
    "id": "Q3-column-width",
    "capture": {"path": "design/evidence/current.png", "sha256": "<실제 SHA-256>"},
    "actual": {"value": 640, "unit": "CSS-px", "method": "현재 렌더 본문 DOM getBoundingClientRect().width"}
  }],
  "visual_review": {"status": "regressed", "reason": "원본의 열 비중과 읽기 밀도가 사라짐"}
}
```

각 인계 ID를 빠짐없이 비교하고 실제 렌더의 값·단위·측정 방법과 캡처를 연결한다. 원본과 결과는 같은 표시 조건에서 직접 읽고 큰 비중·표면·사진/그림·타이포그래피까지 대조한다. 숫자가 같아도 핵심 시각 특징을 지웠으면 `visual_review.status`는 regressed다. 미실행은 unverified이며, retained/adapted-and-verified에는 실제 판독 이유가 있어야 한다. 구현을 자신이 작성했다는 사실이나 변경 이유를 시각 증거로 쓰지 않는다.

위 consumption은 한 항목만 보인 예다. 실제로는 interpretation의 모든 ref에 status(`applied/unsupported/unverified`)·target·interpretation을 기록하고 핵심 required는 applied여야 한다. 원문과 확장을 빠뜨리거나 핵심 미해결을 남기면 UNVERIFIED다. 적용 기록은 코드/렌더의 실제 근거와 함께 사람이 판독한다.

`core-review.json`은 schema_version1, decomposition_sha256, interpretation_sha256, 첫 핵심 화면의 `source_snapshot: {path,sha256}`과 `capture: {path,sha256}`, status(`retained/adapted-and-verified/regressed/unverified`)·reason을 갖는다. source_snapshot은 그때 사용한 소스 묶음/파일의 보존본이며 현재 소스가 바뀌어도 덮어쓰지 않는다. 입력/증거가 다른 비교는 재사용할 수 없다. 첫 핵심 화면이 regressed면 FAIL, 비교가 없거나 unverified면 UNVERIFIED다. 실제 비교 후 교정·재검증한 버전을 연결하고 이전 실패를 보존한다. 파일의 존재·해시로 작성 시점이나 실제 판독의 진실성을 자동 증명하지 않는다.

일반 check에서 RUI-16/17이 적용되면 이 자료가 빠진 pass도 UNVERIFIED다. 수치가 미리 정한 허용 차이를 넘으면 보고서에 pass라고 적었더라도 해당 규칙을 FAIL로 판정한다. 원본·인계·캡처·구현 해시가 바뀌면 이전 비교를 재사용할 수 없다. 이미 확인한 실패는 미확인과 따로 보존한다.

이 검사는 숫자·단위·범위·자료 연결을 검사한다. 측정자가 실제 DOM을 읽었는지, 영역을 정확히 잡았는지, 모든 핵심 특징을 골랐는지와 시각 판독의 진실성까지 자동 증명하지 않는다. 실제 원본/결과 대조가 필수이며, 회귀 검사 성공을 새 디자인의 품질 승인으로 확대하지 않는다.
