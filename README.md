# Batch Automation System

웹 자동화를 위한 Playwright 기반의 통합 배치 관리 시스템입니다.

## 프로젝트 구조

```
batch-automation/
├── README.md
├── package.json                # 워크스페이스 루트 설정
├── yarn.lock
├── tsconfig.json              # TypeScript 공통 설정
│
├── web-service/               # 웹 관리 인터페이스 (Next.js)
│   ├── src/
│   │   ├── components/       # React 컴포넌트
│   │   │   ├── batch/       # 배치 관련 컴포넌트
│   │   │   │   ├── BatchForm.tsx
│   │   │   │   ├── BatchHistory.tsx
│   │   │   │   ├── BatchDetails.tsx
│   │   │   │   └── ...
│   │   │   ├── common/      # 공통 컴포넌트
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   └── ...
│   │   │   ├── datasets/    # 데이터셋 관련 컴포넌트
│   │   │   │   ├── DatasetForm.tsx
│   │   │   │   ├── DatasetList.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/      # 레이아웃 컴포넌트
│   │   │   │   ├── Layout.tsx
│   │   │   │   └── Navigation.tsx
│   │   │   └── templates/   # 템플릿 관련 컴포넌트
│   │   │       ├── TemplateForm.tsx
│   │   │       ├── ScriptEditor.tsx
│   │   │       └── ...
│   │   │
│   │   ├── constants/       # 상수 정의
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/          # 커스텀 훅
│   │   │   ├── useToasts.ts
│   │   │   ├── useModal.ts
│   │   │   ├── useQuery.ts
│   │   │   └── useMutation.ts
│   │   │
│   │   ├── pages/          # Next.js 페이지
│   │   │   ├── api/        # API 라우트
│   │   │   ├── batch/      # 배치 관련 페이지
│   │   │   ├── datasets/   # 데이터셋 관련 페이지
│   │   │   └── templates/  # 템플릿 관련 페이지
│   │   │
│   │   ├── services/       # API 서비스
│   │   │   └── api.ts
│   │   │
│   │   ├── store/          # 상태 관리
│   │   │   └── toast.ts
│   │   │
│   │   ├── types/          # TypeScript 타입
│   │   │   ├── batch.ts
│   │   │   ├── dataset.ts
│   │   │   └── template.ts
│   │   │
│   │   └── utils/          # 유틸리티 함수
│   │       ├── field.ts
│   │       ├── date.ts
│   │       └── validation.ts
│   │
│   ├── public/             # 정적 파일
│   └── package.json        # 웹 서비스 의존성
│
├── batch-service/          # 배치 실행 서비스
│   ├── src/
│   │   ├── batch/         # 배치 실행 관련
│   │   │   ├── BatchExecutor.ts
│   │   │   └── BatchScheduler.ts
│   │   │
│   │   ├── models/        # 데이터 모델
│   │   │   └── batch.ts
│   │   │
│   │   ├── services/      # 서비스 레이어
│   │   │   └── datasetService.ts
│   │   │
│   │   ├── utils/         # 유틸리티
│   │   │   └── logger.ts
│   │   │
│   │   └── index.ts       # 서비스 진입점
│   │
│   └── package.json       # 배치 서비스 의존성
│
└── data/                  # NeDB 데이터베이스 파일
    ├── batches.db
    ├── datasets.db
    └── templates.db
```

## 주요 기능

### 1. 템플릿 관리
- 동적 입력 필드 생성 및 관리
  - text, number, email 기본 입력
  - json editor
  - radio, checkbox, combo (드래그 앤 드롭 옵션 관리)
  - file upload (base64)
  - date, datetime
  - monaco editor (코드 편집)
- Playwright 스크립트 템플릿
  - 기본/폼/로그인 등 템플릿 제공
  - 실시간 문법 검증
  - 자동 완성 지원

### 2. 데이터셋 관리
- 템플릿 기반 데이터 입력
- 실시간 유효성 검사
- 파일 업로드 (Base64)
- 버전 관리

### 3. 배치 작업 관리
- 유연한 스케줄링
  - Cron 표현식 기반 주기 실행
  - 특정 일시 실행
  - 랜덤 딜레이 옵션
- 실시간 모니터링
- 실행 이력 관리
- 오류 추적

## 기술 스택

### Frontend
- Next.js 14
- TypeScript
- TanStack Query (데이터 관리)
- Monaco Editor (코드 에디터)
- React Beautiful DnD (드래그 앤 드롭)
- Reactstrap (UI 컴포넌트)
- Formik + Yup (폼 검증)
- Zustand (상태 관리)

### Backend
- Node.js
- Playwright (웹 자동화)
- NeDB (데이터베이스)
- node-cron (스케줄링)

## 설치 및 실행

1. 저장소 클론 및 의존성 설치:
```bash
git clone <repository-url>
cd batch-automation
yarn install
```

2. 환경 변수 설정:

web-service/.env.local:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_PATH=../data
```

batch-service/.env:
```
PORT=3001
DATABASE_PATH=../data
```

3. 개발 서버 실행:
```bash
# 웹 서비스
yarn dev:web    # http://localhost:3000

# 배치 서비스
yarn dev:batch  # http://localhost:3001
```

## API 가이드

### Templates
- `GET /api/templates` - 템플릿 목록 조회
- `POST /api/templates` - 템플릿 생성
- `GET /api/templates/:id` - 템플릿 상세 조회
- `PUT /api/templates/:id` - 템플릿 수정
- `DELETE /api/templates/:id` - 템플릿 삭제

### Datasets
- `GET /api/datasets` - 데이터셋 목록 조회
- `POST /api/datasets` - 데이터셋 생성
- `GET /api/datasets/:id` - 데이터셋 상세 조회
- `PUT /api/datasets/:id` - 데이터셋 수정
- `DELETE /api/datasets/:id` - 데이터셋 삭제

### Batches
- `GET /api/batches` - 배치 목록 조회
- `POST /api/batches` - 배치 생성
- `GET /api/batches/:id` - 배치 상세 조회
- `PUT /api/batches/:id` - 배치 수정
- `DELETE /api/batches/:id` - 배치 삭제
- `POST /api/batches/:id/execute` - 배치 실행
- `POST /api/batches/:id/stop` - 배치 중지
- `GET /api/batches/:id/history` - 실행 이력 조회
- `GET /api/batches/:id/stats` - 실행 통계 조회

## 제한 사항

1. 파일 업로드
   - 최대 크기: 5MB
   - Base64 인코딩 필수

2. 배치 실행
   - 동시 실행: 최대 5개
   - 실행 시간: 최대 5분
   - 메모리: 최대 1GB

3. 데이터베이스
   - NeDB 기반 (단일 프로세스)
   - 확장성 제한 있음