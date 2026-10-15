export const CATALOG = [
  {
    "id": "afternoon",
    "name": "오후의 방",
    "city": "강릉",
    "area": "경포",
    "type": "호텔",
    "photo": "assets/photos/room-neutral.jpg",
    "amenities": [
      "wifi",
      "parking"
    ],
    "rooms": [
      {
        "id": "afternoon-standard",
        "name": "스탠다드 더블",
        "capacity": 2,
        "bed": "더블 침대 1개",
        "closedDates": [
          "2026-11-12"
        ],
        "rates": [
          {
            "id": "afternoon-standard-basic",
            "name": "객실만",
            "nightly": 128000,
            "cleaningFee": 20000,
            "serviceBps": 500,
            "freeCancellation": false,
            "breakfast": false
          },
          {
            "id": "afternoon-standard-flex",
            "name": "무료 취소",
            "nightly": 148000,
            "cleaningFee": 20000,
            "serviceBps": 500,
            "freeCancellation": true,
            "breakfast": false
          }
        ]
      },
      {
        "id": "afternoon-family",
        "name": "패밀리 트윈",
        "capacity": 4,
        "bed": "더블 침대 2개",
        "closedDates": [],
        "rates": [
          {
            "id": "afternoon-family-flex",
            "name": "조식 포함 · 무료 취소",
            "nightly": 198000,
            "cleaningFee": 30000,
            "serviceBps": 500,
            "freeCancellation": true,
            "breakfast": true
          }
        ]
      }
    ]
  },
  {
    "id": "walk",
    "name": "스테이 산책",
    "city": "강릉",
    "area": "안목",
    "type": "펜션",
    "photo": "assets/photo-alternatives/room-spacious.jpg",
    "amenities": [
      "wifi",
      "parking",
      "kitchen"
    ],
    "rooms": [
      {
        "id": "walk-standard",
        "name": "스탠다드 더블",
        "capacity": 2,
        "bed": "더블 침대 1개",
        "closedDates": [
          "2026-11-12"
        ],
        "rates": [
          {
            "id": "walk-standard-basic",
            "name": "객실만",
            "nightly": 168000,
            "cleaningFee": 20000,
            "serviceBps": 500,
            "freeCancellation": false,
            "breakfast": false
          },
          {
            "id": "walk-standard-flex",
            "name": "무료 취소",
            "nightly": 188000,
            "cleaningFee": 20000,
            "serviceBps": 500,
            "freeCancellation": true,
            "breakfast": false
          }
        ]
      },
      {
        "id": "walk-family",
        "name": "패밀리 트윈",
        "capacity": 4,
        "bed": "더블 침대 2개",
        "closedDates": [],
        "rates": [
          {
            "id": "walk-family-flex",
            "name": "조식 포함 · 무료 취소",
            "nightly": 238000,
            "cleaningFee": 30000,
            "serviceBps": 500,
            "freeCancellation": true,
            "breakfast": true
          }
        ]
      }
    ]
  },
  {
    "id": "smallroom",
    "name": "교동의 작은 방",
    "city": "강릉",
    "area": "교동",
    "type": "호텔",
    "photo": "assets/photo-alternatives/room-light.jpg",
    "amenities": [
      "wifi"
    ],
    "rooms": [
      {
        "id": "smallroom-standard",
        "name": "스탠다드 더블",
        "capacity": 2,
        "bed": "더블 침대 1개",
        "closedDates": [
          "2026-11-12"
        ],
        "rates": [
          {
            "id": "smallroom-standard-basic",
            "name": "객실만",
            "nightly": 98000,
            "cleaningFee": 20000,
            "serviceBps": 500,
            "freeCancellation": false,
            "breakfast": false
          },
          {
            "id": "smallroom-standard-flex",
            "name": "무료 취소",
            "nightly": 118000,
            "cleaningFee": 20000,
            "serviceBps": 500,
            "freeCancellation": true,
            "breakfast": false
          }
        ]
      },
      {
        "id": "smallroom-family",
        "name": "패밀리 트윈",
        "capacity": 4,
        "bed": "더블 침대 2개",
        "closedDates": [],
        "rates": [
          {
            "id": "smallroom-family-flex",
            "name": "조식 포함 · 무료 취소",
            "nightly": 168000,
            "cleaningFee": 30000,
            "serviceBps": 500,
            "freeCancellation": true,
            "breakfast": true
          }
        ]
      }
    ]
  }
];
