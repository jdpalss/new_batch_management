# Batch Automation System

웹 자동화를 위한 Playwright 기반의 통합 배치 관리 시스템

## 프로젝트 구조

```
.
├── README.md
├── batch-service       # 배치 실행 서비스
├── data               # 공유 데이터 디렉토리
├── web-service        # 웹 기반 관리 UI
├── package.json       # 루트 프로젝트 설정
└── tsconfig.json      # TypeScript 공통 설정
```

## 주요 컴포넌트

### 1. Web Service (web-service/)

웹 기반 관리 인터페이스를 제공하는 Next.js 애플리케이션

#### 주요 디렉토리
- `src/components/`: React 컴포넌트
  - `batch/`: 배치 관련 컴포넌트 (실행, 모니터링, 로그 등)
  - `datasets/`: 데이터셋 관리 컴포넌트
  - `templates/`: 템플릿 관리 컴포넌트
  - `common/`: 공통 UI 컴포넌트

- `src/pages/`: Next.js 페이지 및 API 라우트
  - `api/`: 백엔드 API 엔드포인트
  - `batch/`: 배치 관리 페이지
  - `datasets/`: 데이터셋 관리 페이지
  - `templates/`: 템플릿 관리 페이지

- `src/services/`: 비즈니스 로직 서비스
  - `batchService.ts`: 배치 실행 및 관리
  - `templateService.ts`: 템플릿 CRUD
  - `datasetService.ts`: 데이터셋 CRUD

#### 사용된 주요 패키지
- **Next.js**: React 기반 웹 프레임워크
- **React**: UI 라이브러리
- **@tanstack/react-query**: 서버 상태 관리
- **Formik + Yup**: 폼 관리 및 유효성 검증
- **reactstrap**: Bootstrap 기반 UI 컴포넌트
- **monaco-editor**: 코드 에디터 (Playwright 스크립트 작성용)
- **NeDB**: 파일 기반 데이터베이스

### 2. Batch Service (batch-service/)

Playwright 기반의 자동화 스크립트 실행 엔진

#### 주요 디렉토리
- `src/batch/`: 배치 실행 관련 코드
  - `BatchExecutor.ts`: Playwright 스크립트 실행 엔진
  - `BatchScheduler.ts`: 배치 스케줄링 관리

- `src/models/`: 데이터 모델
  - `batch.ts`: 배치 관련 데이터 모델

- `src/utils/`: 유틸리티 코드
  - `logger.ts`: 로깅 유틸리티

#### 사용된 주요 패키지
- **Playwright**: 웹 자동화 라이브러리
- **node-cron**: 스케줄링
- **NeDB-promises**: 비동기 NeDB 클라이언트
- **Winston**: 로깅

## 데이터베이스 구조 (NeDB)

프로젝트는 다음 데이터베이스 파일들을 사용합니다:

- `batches.db`: 배치 작업 정보
- `templates.db`: 템플릿 정의
- `datasets.db`: 데이터셋 정보
- `batch-results.db`: 배치 실행 결과
- `batch-logs.db`: 배치 실행 로그

## 개발 환경 설정

### 요구사항
- Node.js >= 18.0.0
- Yarn 패키지 매니저
- Chrome 브라우저 (Playwright 실행용)

### 설치 및 실행

1. 의존성 설치
```bash
yarn install
```

2. 웹 서비스 실행 (개발 모드)
```bash
yarn dev:web
```

3. 배치 서비스 실행 (개발 모드)
```bash
yarn dev:batch
```

### 프로덕션 빌드

1. 웹 서비스 빌드
```bash
yarn build:web
```

2. 배치 서비스 빌드
```bash
yarn build:batch
```

3. 프로덕션 실행
```bash
yarn start:web    # 웹 서비스 실행
yarn start:batch  # 배치 서비스 실행
```

## 기술 스택

### 프론트엔드
- Next.js 12+
- React 18+
- TypeScript 4.8+
- React Query
- Formik + Yup
- Reactstrap (Bootstrap 5)
- Monaco Editor
- Zustand (상태 관리)

### 백엔드
- Node.js
- TypeScript
- NeDB (JSON 기반 데이터베이스)
- Express (API 서버)
- Playwright (웹 자동화)
- node-cron (스케줄링)
- Winston (로깅)

## 주요 기능

### 템플릿 관리
- 동적 입력 필드 정의
- Playwright 스크립트 작성 및 테스트
- 필드 유효성 검사 규칙 설정

### 데이터셋 관리
- 템플릿 기반 데이터 입력
- 다양한 데이터 타입 지원 (텍스트, 숫자, 날짜, JSON, 파일 등)
- 데이터 유효성 검사

### 배치 관리
- 주기적/특정 시점 실행 설정
- 실행 모니터링 및 로그 확인
- 실행 결과 분석
- 수동 실행/중지 기능

### 모니터링
- 실시간 실행 상태 확인
- 상세 로그 조회
- 실행 통계 및 분석
- 오류 알림

## 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details