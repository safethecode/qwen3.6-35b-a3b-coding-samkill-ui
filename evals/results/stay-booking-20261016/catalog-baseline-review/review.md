# Independent baseline design review

This review belongs to frozen e53cfa2 before-source and the 14-job historical evidence. It is not an executed design gate, a Qwen success claim, or product completion. New e338aa1 price results and future nav repairs do not change these classifications.

## Binding and source-movement incident

Public source moved during read-only review. Six files ceased matching all 14 baseline reports. Parent confirmed price-only publication and redirected review to the pre-change frozen copy. Findings remain old revision; no classifications promoted after e338aa1 or its separate 15 jobs.

Changed files: DESIGN.md, design/typography.json, design/component-plan.json, design/layout-contract.json, room-layout-contract.json, rooms.css. Recomputed frozen before-source hashes against baseline state/report sourceHashes; mismatch list empty.

Source: runs/room-composition-20261016/before-source; evidence: runs/portable-associated-feedback-20261016. Exact source/harness/catalog/report hashes are retained in coverage.json. Harness hashes are historical report claims, not a claim about today’s harness.

## Material findings

1. ORC-F11/G19: selected 예약 요청 label is pink while clipboard icon stays black in request-renders/list-390-normal.png. styles.css:287–295 applies selection color to text but external SVG img does not inherit it. Fix and recapture all three tabs; inspect favorite selection separately.
2. RUI-04/21: request editing and custom calendar remain unfinished (DESIGN.md:5); creation/list/detail/cancellation evidence does not cover them.
3. RUI-03: no full active-rule gate contract/report connects applicability, original check kinds, exceptions and actual judgments. This private review does not substitute for executing that gate.
4. RUI-16/17/18: partial room/checkout structure is supported by direct comparison, but populated request states cannot inherit visual parity from empty-history references. Discovery and the full composition still need direct review.
5. Static parse is not lint; coordinate checks are not hierarchy/density review. Conversely, LAYOUT_STATES_PENDING must be reconciled against other reports that actually cover those states rather than treated as permanent global failures.

## Complete 75-rule map

Original checks are preserved: spec, code, visual, interaction. scoped-supported means only the stated scope has positive evidence; it is never whole-product pass.

| Rule | Original checks | Classification | Scope / finding | Evidence | Next checks |
|---|---|---|---|---|---|
| ORC-F01 | code, visual | not-applicable | 사이드바 없는 단일 모바일 구조 | runs/room-composition-20261016/before-source/index.html | 범위에 사이드바가 추가될 때 재검토 |
| ORC-F02 | code, visual | scoped-supported | 예약 총액·저장 행동에 콘텐츠 accent 사용 | runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 변경된 accent 소비처 재검증 |
| ORC-F03 | code, visual | not-applicable | 읽는 콘텐츠의 어두운 표면 없음; backdrop은 제외 | runs/room-composition-20261016/before-source/styles.css | 어두운 콘텐츠 표면 추가 시 검사 |
| ORC-F04 | code, visual | scoped-supported | 본 객실·예약·내역에 중복 주 CTA 없음 | runs/portable-associated-feedback-20261016/booking-render/form-full-390.png; runs/portable-associated-feedback-20261016/request-renders/detail-390-normal.png | 미열람 상태 CTA 비교 |
| ORC-F05 | code, visual | not-applicable | 사진 중심 소수 숙소/객실 선택; 다열 데이터 작업 아님 | runs/room-composition-20261016/before-source/index.html | 데이터 비교 범위 확장 시 재검토 |
| ORC-F06 | code, visual | scoped-supported | 취소 error색, 저장/총액 action색 | runs/portable-associated-feedback-20261016/request-renders/cancel-296-text-200.png; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 다른 선택/오류 소비처 검사 |
| ORC-F07 | code, visual | scoped-supported | 본 제목16/18/22px 역할 분리 | runs/portable-associated-feedback-20261016/booking-render/form-full-390.png; runs/portable-associated-feedback-20261016/room-positive/rooms-390.png | 변경 역할 렌더 재검증 |
| ORC-F08 | code, visual, interaction | not-verified | 모바일 반복 찜 행동; touch 예외의 범위 미정 | runs/room-composition-20261016/before-source/index.html; runs/portable-associated-feedback-20261016/discovery/report.json | touch 예외 및 전체 반복 행동 판독 |
| ORC-F09 | code, visual | not-applicable | 병렬 칼럼 없음 | runs/room-composition-20261016/before-source/index.html | 다열 구조 추가 시 검사 |
| ORC-F10 | code, visual | scoped-supported | actual/wrapped 아이콘 중심 검사 | runs/portable-associated-feedback-20261016/related-feedback/report.json; runs/portable-associated-feedback-20261016/room-title-controls/report.json | 미검사 아이콘 소비처로 확장 |
| ORC-F11 | code, visual | fail | 선택된 예약 요청 탭 글자 분홍, clipboard 아이콘 검정 | runs/room-composition-20261016/before-source/styles.css; runs/portable-associated-feedback-20261016/request-renders/list-390-normal.png | styles.css:287–295 외부SVG 선택색 수정; 세 탭·찜 선택 재캡처 |
| ORC-F12 | code, visual | not-verified | 날짜 부모 inset 등 국소 근거만 있고 전체 spacing audit 없음 | runs/portable-associated-feedback-20261016/related-feedback/report.json; runs/room-composition-20261016/before-source/styles.css | 역할별 사방 padding/gap/margin 전수 대조 |
| ORC-F13 | code, visual, interaction | not-verified | pointer/disabled CSS 있으나 전체 실제 cursor 검사는 없음 | runs/room-composition-20261016/before-source/styles.css | 전체 인터랙티브 요소 cursor/disabled 실행 |
| ORC-F14 | code, visual | scoped-supported | 주요 main/nav/section/article/dialog/form/label 의미 구조 | runs/room-composition-20261016/before-source/index.html; runs/portable-associated-feedback-20261016/static/report.json | 새 화면 의미 구조 재검토 |
| ORC-F16 | code, visual, interaction | not-verified | 좁은 화면·확대·취소 전이 근거; 전체 실제 스크롤 집계 필요 | runs/portable-associated-feedback-20261016/workflows/report.json; runs/portable-associated-feedback-20261016/request-renders/report.json | 상태별 실제 scroll/고정영역/복구 증거 연결 |
| ORC-F15 | code, visual | scoped-supported | 본 태그·상태에 무의미한 다색 반복 없음 | runs/portable-associated-feedback-20261016/request-renders/list-390-normal.png; runs/portable-associated-feedback-20261016/room-positive/rooms-390.png | 추가 상태 색상 검토 |
| ORC-G01 | code, visual | scoped-supported | 읽은 CSS·본 화면에 장식 gradient 없음 | runs/room-composition-20261016/before-source/styles.css; runs/room-composition-20261016/before-source/rooms.css; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 변경 CSS/화면 재검토 |
| ORC-G02 | code, visual | scoped-supported | 장식 그림자 없음; focus/radio inset은 기능 표시 | runs/room-composition-20261016/before-source/styles.css; runs/room-composition-20261016/before-source/rooms.css; runs/portable-associated-feedback-20261016/room-positive/rooms-390.png | 기능 ring 예외 범위 보존 |
| ORC-G03 | code, visual | not-verified | dialog16/filter12 등 원문 한계 초과 반경 | runs/room-composition-20261016/before-source/styles.css | 모바일 기능 surface 예외 명시 및 판독 |
| ORC-G04 | code, visual | scoped-supported | neutral/action/error 의미색 역할 중심 | runs/room-composition-20261016/before-source/styles.css; runs/portable-associated-feedback-20261016/request-renders/detail-390-normal.png | 추가 소비처 색수 확인 |
| ORC-G05 | code, visual, interaction | not-verified | CSS 확인은 실제 hover 실행이 아님 | runs/room-composition-20261016/before-source/styles.css | hover/focus 변화 실행 및 비교 |
| ORC-G06 | code, visual | not-verified | 폰트 loading/failure/mixedtext 검증; 크기 종류/역할 판독 별도 | runs/portable-associated-feedback-20261016/font-states/report.json; runs/room-composition-20261016/before-source/DESIGN.md | 각 화면 크기 종류·의도 역할 감사 |
| ORC-G07 | code, visual | not-verified | 전체 spacing audit 미완료 | runs/room-composition-20261016/before-source/styles.css; runs/portable-associated-feedback-20261016/related-feedback/report.json | 역할별 간격 전수 감사 |
| ORC-G08 | code, visual | not-verified | 객실/예약 일부 비교; discovery/긴 목록 밀도 미판독 | runs/portable-associated-feedback-20261016/room-positive/rooms-390.png; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 같은 폭 원본/전체 소비 화면 밀도 비교 |
| ORC-G09 | code, visual | scoped-supported | 본 화면에 임의 장식/KPI/히어로 없음 | runs/portable-associated-feedback-20261016/booking-render/form-full-390.png; runs/portable-associated-feedback-20261016/request-renders/detail-390-normal.png | 미열람 화면 장식 검토 |
| ORC-G10 | code, visual | scoped-supported | 본 객실·예약·내역 표면/서체 분위기 연속 | runs/portable-associated-feedback-20261016/room-positive/rooms-390.png; runs/portable-associated-feedback-20261016/request-renders/detail-390-normal.png | 나머지 sheet/error 톤 비교 |
| ORC-G11 | code, visual | not-verified | font/stress 근거는 있으나 전체 표면·오류 대비 미완료 | runs/portable-associated-feedback-20261016/font-states/report.json; runs/portable-associated-feedback-20261016/request-renders/report.json | 상태별 대비 직접 판독 |
| ORC-G12 | code, visual | scoped-supported | 본 화면 중복 주 CTA 없음 | runs/portable-associated-feedback-20261016/booking-render/form-full-390.png; runs/portable-associated-feedback-20261016/request-renders/detail-390-normal.png | 미열람 상태 비교 |
| ORC-G13 | code, visual | not-applicable | 사진 중심 모바일 선택이며 데이터 table 작업 아님 | runs/room-composition-20261016/before-source/index.html | 범위 확장 때 검사 |
| ORC-G14 | code, visual | scoped-supported | 취소 error색·저장/총액 action색 | runs/portable-associated-feedback-20261016/request-renders/cancel-296-text-200.png; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 다른 상태 의미색 검사 |
| ORC-G15 | code, visual | scoped-supported | 본 제목 역할 비율 유지 | runs/portable-associated-feedback-20261016/room-positive/rooms-390.png; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 새 가격/제목 위계 별도 확인 |
| ORC-G16 | code, visual, interaction | not-verified | 모바일 반복 찜 touch 예외 검토 필요 | runs/room-composition-20261016/before-source/index.html; runs/portable-associated-feedback-20261016/discovery/report.json | 반복 행동 전체 소비처·예외 기록 |
| ORC-G17 | code, visual | not-applicable | 병렬 칼럼 없음 | runs/room-composition-20261016/before-source/index.html | 다열 추가 시 재검토 |
| ORC-G18 | code, visual | scoped-supported | actual/wrapped 중심 정렬 근거 | runs/portable-associated-feedback-20261016/related-feedback/report.json; runs/portable-associated-feedback-20261016/room-title-controls/report.json | 추가 아이콘 상태 검사 |
| ORC-G19 | code, visual | fail | 선택 탭 글자/아이콘 색 불일치 | runs/room-composition-20261016/before-source/styles.css; runs/portable-associated-feedback-20261016/request-renders/list-390-normal.png | 선택 SVG 색 수정 및 실제 상태 재검증 |
| ORC-G20 | code, visual | not-verified | 국소 간격 근거만 있고 전체 감사 없음 | runs/portable-associated-feedback-20261016/related-feedback/report.json; runs/room-composition-20261016/before-source/styles.css | 역할별 간격 전수 대조 |
| ORC-G21 | code, visual, interaction | not-verified | cursor CSS와 실제 모든 사용처 검사는 별개 | runs/room-composition-20261016/before-source/styles.css | pointer/disabled 실행 검사 |
| ORC-G22 | code, visual | scoped-supported | 본 상태/태그 색상 절제 | runs/portable-associated-feedback-20261016/request-renders/list-390-normal.png; runs/portable-associated-feedback-20261016/room-positive/rooms-390.png | 새 태그 검토 |
| ORC-G23 | code, visual, interaction | not-verified | 전체 상태의 스크롤 근거 집계 필요 | runs/portable-associated-feedback-20261016/workflows/report.json; runs/portable-associated-feedback-20261016/request-renders/report.json | 필요 스크롤/프레임 원인 스크롤 분리 |
| ORC-G24 | code, visual | scoped-supported | 주요 의미 구조 확인 | runs/room-composition-20261016/before-source/index.html; runs/portable-associated-feedback-20261016/static/report.json | 새 소비 화면 의미 구조 검토 |
| ORC-A01 | code, visual | scoped-supported | 이미지/입력/버튼/sheet/pill 역할별 반경 | runs/room-composition-20261016/before-source/styles.css; runs/room-composition-20261016/before-source/rooms.css; runs/portable-associated-feedback-20261016/room-positive/rooms-390.png | 변경된 반경 역할 재검토 |
| ORC-A02 | code, visual | scoped-supported | 흰 기본 화면+quiet 기능 표면 그룹 | runs/portable-associated-feedback-20261016/booking-render/form-full-390.png; runs/portable-associated-feedback-20261016/request-renders/detail-390-normal.png | 기본 흰 배경과 기능 표면 범위 보존 |
| ORC-A03 | code, visual | scoped-supported | 장식 shadow 없음; focus/radio 기능 ring 보존 필요 | runs/room-composition-20261016/before-source/styles.css; runs/room-composition-20261016/before-source/rooms.css | 기능 ring을 장식으로 삭제하지 말고 예외 명시 |
| ORC-A04 | code, visual | scoped-supported | default blue500 없음 | runs/room-composition-20261016/before-source/styles.css; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 신규 색 선택 검토 |
| ORC-A05 | code, visual | not-applicable | 장식 대칭 칼럼/히어로 없음 | runs/room-composition-20261016/before-source/index.html | 그런 구조 추가 시 재검토 |
| ORC-A06 | code, visual | not-verified | 한국어 실제내용·확대 근거; 원본 밀도 판독 불완전 | runs/portable-associated-feedback-20261016/request-renders/report.json; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 각 주요 화면 원본 밀도 직접 비교 |
| ORC-A07 | code, visual | not-verified | back/chevron icon-only native 대응; visible-label 예외 필요 | runs/room-composition-20261016/before-source/index.html; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 목적·범위 명시 예외; accessible name과 실제 동작 유지 |
| ORC-A08 | code, visual | not-verified | licensed generic 사진·fictional catalog 명시; 실제인벤토리 아님 | runs/room-composition-20261016/before-source/DESIGN.md; runs/portable-associated-feedback-20261016/room-positive/rooms-390.png | fictional 범위 예외 명시; 실제 객실 재현 주장 금지 |
| ORC-A09 | code, visual | not-applicable | 장식 카드그리드 아닌 모바일 숙소/객실 목록 | runs/room-composition-20261016/before-source/index.html; runs/portable-associated-feedback-20261016/room-positive/rooms-390.png | 그리드 확장 시 목적 재검토 |
| ORC-A10 | code, visual, interaction | scoped-supported | empty/error/loading/retry 실제 보고서 근거 | runs/portable-associated-feedback-20261016/discovery/report.json; runs/portable-associated-feedback-20261016/rooms/report.json; runs/portable-associated-feedback-20261016/workflows/report.json; runs/portable-associated-feedback-20261016/font-states/report.json; runs/portable-associated-feedback-20261016/request-renders/report.json | 서버 예약 상태로 확대 금지; 새 상태 별도 검사 |
| RUI-01 | spec | scoped-supported | chosen와 원본 CSS/font/DPR unknown 분리; 사후inventory 구별 | runs/room-composition-20261016/before-source/DESIGN.md; runs/room-composition-20261016/before-source/STYLE-CONTRACT.md | 새 값 provenance 보존 |
| RUI-02 | code | not-verified | 의미색/간격 token 사용; 직접값 전수 역할 대조 미완료 | runs/room-composition-20261016/before-source/styles.css; runs/room-composition-20261016/before-source/rooms.css; runs/room-composition-20261016/before-source/STYLE-CONTRACT.md | token 정의→참조→소비처 및 직접값 예외 감사 |
| RUI-03 | spec | fail | 75규칙 적용·원래checks·예외·판정 통합 계약/보고서 미완료 | runs/room-composition-20261016/before-source/DESIGN.md | 전체 게이트 입력 작성 후 실제 근거로 검증; 본 리뷰를 실행 게이트로 오인 금지 |
| RUI-04 | spec, interaction | fail | 요청 수정·달력 등 문서상 핵심 미완료; 생성/취소만 scoped 근거 | runs/room-composition-20261016/before-source/DESIGN.md; runs/portable-associated-feedback-20261016/workflows/report.json | 남은 핵심 과제 구현 및 실제 전이 검증 |
| RUI-05 | spec, visual | not-verified | 각색 의도 있으나 전체 조합 품질 비교 미완료 | runs/room-composition-20261016/before-source/DESIGN.md; runs/room-composition-20261016/before-source/UI-DECISIONS.md | B/Q별 원본 장점과 조합 결과 직접 비교 |
| RUI-06 | code | not-verified | static parse/comments가 실제 lint/anti-slop 완료를 뜻하지 않음 | runs/portable-associated-feedback-20261016/static/report.json | 원래 anti-slop 기준과 실제 lint 결과 연결 |
| RUI-07 | spec, visual | scoped-supported | 본 예약·객실·내역 정보→선택/검토→행동 순서 | runs/room-composition-20261016/before-source/DESIGN.md; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png; runs/portable-associated-feedback-20261016/request-renders/detail-390-normal.png | 미판독 화면 주요 요소 목적 연결 |
| RUI-08 | spec, code, visual | scoped-supported | 임의 로고/슬로건 없음 | runs/room-composition-20261016/before-source/DESIGN.md; runs/room-composition-20261016/before-source/index.html; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 새 branding 추가 시 요구 근거 확인 |
| RUI-09 | code, visual | scoped-supported | 본 역할14px 이상 및 font/stress 근거 | runs/room-composition-20261016/before-source/styles.css; runs/portable-associated-feedback-20261016/font-states/report.json; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 변경 역할/새 source 재검증 |
| RUI-10 | spec, visual | scoped-supported | quiet filter와 save/cancel 행동 표면 구별 | runs/room-composition-20261016/before-source/DESIGN.md; runs/portable-associated-feedback-20261016/room-positive/rooms-390.png; runs/portable-associated-feedback-20261016/request-renders/cancel-296-text-200.png | 미열람 선택 제어 비교 |
| RUI-11 | spec, visual | not-verified | 추가 문구 필요성 화면별 판독 남음 | runs/room-composition-20261016/before-source/DESIGN.md; runs/portable-associated-feedback-20261016/room-positive/rooms-390.png; runs/portable-associated-feedback-20261016/request-renders/detail-390-normal.png | 가격/수수료/기간 보존하며 실제 불필요 문구만 판독 |
| RUI-12 | code, visual | not-verified | 의미/정렬 일부 확인; 공식원본 provenance와 전체 색 검사 연결 필요 | runs/room-composition-20261016/before-source/index.html; runs/portable-associated-feedback-20261016/related-feedback/report.json | SVG 공식출처/hash 및 소비처 의미/선택색 감사 |
| RUI-13 | code, visual, interaction | not-verified | 필수 목록 스크롤과 프레임 유발 스크롤 구별 필요 | runs/portable-associated-feedback-20261016/workflows/report.json; runs/portable-associated-feedback-20261016/request-renders/report.json | 실제 모든 dialog/목록 scroll 상태 연결 |
| RUI-14 | code, visual | not-verified | focus/input 경계 유효; fullwidth quiet 간격은 화면별 판독 필요 | runs/room-composition-20261016/before-source/styles.css; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png; runs/portable-associated-feedback-20261016/request-renders/detail-390-normal.png | 과제 surface 경계와 금지 divider 구별하여 예외/판정 기록 |
| RUI-15 | spec, visual, interaction | not-applicable | 채팅/목록-대화 경쟁 없음 | runs/room-composition-20261016/before-source/DESIGN.md; runs/room-composition-20261016/before-source/index.html | 채팅 범위 추가 시 검사 |
| RUI-16 | spec, visual | not-verified | 객실 사진→사실→가격과 예약identity→dates→guest→price 부분 대응 | runs/room-composition-20261016/before-source/DESIGN.md; runs/portable-associated-feedback-20261016/room-positive/rooms-390.png; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 전체 B/Q별 원본/구현 대응 완성 |
| RUI-17 | spec, visual | not-verified | 선택값/의도 차이만으로 위계·밀도 퇴보 해제 불가 | runs/room-composition-20261016/before-source/STYLE-CONTRACT.md; runs/portable-associated-feedback-20261016/room-positive/rooms-390.png | 새 가격 수정 별도 직접 비교; 전체 조합 재판독 |
| RUI-18 | spec, visual | not-verified | 조사 분기 존재; 전체 R→D/Q→현재렌더 연결 미완료 | runs/room-composition-20261016/before-source/DESIGN.md; runs/room-composition-20261016/before-source/UI-DECISIONS.md | discovery/rooms/checkout/requests별 증거 대응 |
| RUI-19 | spec, code, visual, interaction | scoped-supported | 세 탭 내비게이션·작은 선택표면·전이 근거; 색 결함 별도 유지 | runs/room-composition-20261016/before-source/index.html; runs/room-composition-20261016/before-source/DESIGN.md; runs/portable-associated-feedback-20261016/discovery/report.json; runs/portable-associated-feedback-20261016/request-renders/list-390-normal.png | 미검사 tab 상태/확대 확인; F11/G19 수정 |
| RUI-20 | code, visual | scoped-supported | 폼 compact16/600은 직접 본 native 구조 대응 | runs/room-composition-20261016/before-source/booking.css; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 크기만으로 본문 오판 금지; 변경 제목 재판독 |
| RUI-21 | code, visual, interaction | fail | custom calendar 미구현; native picker 내부/기기 동작은 미검증 | runs/room-composition-20261016/before-source/index.html; runs/room-composition-20261016/before-source/DESIGN.md; runs/portable-associated-feedback-20261016/discovery/report.json | 제품 picker 구현/스타일/keyboard/선택/취소 실제 검사 |
| RUI-22 | code, visual | scoped-supported | dates parent12/children0, headerleading,textarea wrapper 검증 소비처 | runs/portable-associated-feedback-20261016/related-feedback/report.json; runs/portable-associated-feedback-20261016/headers/report.json; runs/portable-associated-feedback-20261016/guest-consumer/report.json; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png | 미검사 소비처 여백 audit; 전역승격 금지 |
| RUI-23 | spec, code, visual | not-verified | 본 화면 톤 연속성 있으나 모든 sheet/error/selected 대조 남음 | runs/room-composition-20261016/before-source/DESIGN.md; runs/room-composition-20261016/before-source/styles.css; runs/portable-associated-feedback-20261016/request-renders/detail-390-normal.png | 전체 소비처·문서값 대조 |
| RUI-24 | spec, visual | scoped-supported | 본 내역/상세/취소 날짜와 숙박수는 다른 정보 역할 | runs/room-composition-20261016/before-source/DESIGN.md; runs/portable-associated-feedback-20261016/request-renders/detail-390-normal.png; runs/portable-associated-feedback-20261016/request-renders/cancel-296-text-200.png | 새 문구 의미 중복 재검토; 자동 삭제 금지 |
| RUI-25 | spec, visual | scoped-supported | 본 예약/상세 identity·guest·price·action 소속 구별 | runs/room-composition-20261016/before-source/DESIGN.md; runs/portable-associated-feedback-20261016/booking-render/form-full-390.png; runs/portable-associated-feedback-20261016/request-renders/detail-390-normal.png | 미열람 상태 섹션 소속 판독 |

## Eight guides

| Guide | Classification | Applied scope / remaining issue | Next checks |
|---|---|---|---|
| samkill-ui | not-verified | 분기별 흔적은 있으나 이름/문서 존재를 실행 완료로 환산할 수 없음 | 필수 하위 기준→결과→증거 연결 |
| uibowl-research | scoped-supported | 실제 공급 이미지·출처 재사용 가능. 새 room-selection은 같은 공급 픽셀이며 독립 표본 성능 아님 | 새 검색과 재사용 구별 및 각 분기 출처 연결 |
| reference-decompose | not-verified | 원본/각색/unknown 구별 적절. 사후 DOM inventory는 최초 재현 입력 증거 아님 | 독립 컴포넌트 표본 및 고정 입력→출력 연결 |
| reference-to-ui | not-verified | 수정 가능한 앱·기능 표면·역할 typography 존재 | 전체 token audit·picker·핵심 화면 조합 비교 |
| design-md | not-verified | 루트 기준이 제약/미완료 명시. UI-DECISIONS 등 오래된 미완료 문구 존재 | 생성/취소 구현과 오래된 문서 조정 |
| ux-copy | not-verified | 본 문구는 요청 저장/취소와 예약 확정을 구별하고 복구 행동 제공 | 전체 상태별 문구 원칙 판독 |
| onboarding-flow | scoped-supported | 가입/동의 NA; 복구·뒤로·재진입은 적용되고 workflows/guest-route 근거 있음 | 실제 구현된 복구 범위만 인정; 새로운 전이 별도 검사 |
| reference-review | not-verified | 원본/렌더 직접 판독 및 scoped 행동 근거 있음 | 전체75 gate·예외·최종 비교·과거 실패 연결 |

## Review limits and next order

- No files outside private review directory changed by this persistence task. No inference or browser jobs run.
- This is not an executed gate-contract/report and cannot authorize product completion.
- Screenshots reviewed directly are distinct from report-only evidence. No unexecuted interaction is claimed as newly executed by reviewer.
- Existing evaluation reports describe Chromium/localStorage and injected failures, not supplier reservations, real devices, screen-reader execution or Unicode-wide coverage.
- New price source and pending nav repair not approved by this historical review.

Priority: correct selected-nav color; independently verify the new price change; complete remaining core tasks; resolve required unknown checks and formal exceptions in the full gate. Counts are not quality proof.

Directly inspected image hashes and all per-rule evidence hashes are in coverage.json.
