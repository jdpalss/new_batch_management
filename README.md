# Batch Automation System

자동화된 웹 작업을 위한 통합 배치 관리 시스템

## 시스템 아키텍처

### 전체 아키텍처
```
[Web Service] <-> [Shared Module] <-> [Batch Service]
      ↓                  ↓                 ↓
    [UI Layer]    [Database Layer]    [Execution Layer]
      ↓                  ↓                 ↓
[React/Next.js]      [LokiJS]        [Playwright]
```

### 계층 구조
1. **프레젠테이션 계층** (Web Service)
   - UI 컴포넌트
   - 상태 관리
   - 라우팅

2. **공유 계층** (Shared Module)
   - 데이터 액세스
   - 공통 인터페이스
   - 유틸리티

3. **실행 계층** (Batch Service)
   - 스크립트 실행
   - 스케줄링
   - 로깅

## 소스 코드 상세 분석

### Shared Module

#### Database Layer (`shared/src/database/`)
- **Adapter.ts**
  - 역할: 데이터베이스 작업의 추상화 계층 제공
  - 주요 기능:
    - 데이터베이스 연결 관리
    - 트랜잭션 지원
    - 컬렉션 접근

- **LokiAdapter.ts**
  - 역할: LokiJS 특화 구현체
  - 주요 기능:
    - 인메모리 데이터 저장
    - 영속성 관리
    - 인덱싱
    - 쿼리 최적화

- **Repository.ts**
  - 역할: 제네릭 CRUD 작업 추상화
  - 주요 기능:
    - 기본 CRUD 연산
    - 쿼리 빌더
    - 트랜잭션 관리

#### Interfaces (`shared/src/interfaces/`)
- **IBatch.ts**
  ```typescript
  interface IBatch {
    id: string;
    title: string;
    description?: string;
    templateId: string;
    datasetId: string;
    schedule: IBatchSchedule;
    status: BatchStatus;
    lastExecution?: IBatchExecution;
    createdAt: Date;
    updatedAt: Date;
  }
  ```

- **ITemplate.ts**
  ```typescript
  interface ITemplate {
    id: string;
    name: string;
    fields: ITemplateField[];
    script: string;
    createdAt: Date;
    updatedAt: Date;
  }
  ```

### Web Service

#### Components (`web-service/src/components/`)

##### Batch Components
- **BatchList/**
  - `BatchList.tsx`: 배치 작업 목록 표시 및 관리
  - `BatchItem.tsx`: 개별 배치 항목 표시
  - `BatchFilters.tsx`: 필터링 컴포넌트

- **BatchForm/**
  - `BatchForm.tsx`: 배치 작업 생성/수정 폼
  - `ScheduleForm.tsx`: 스케줄 설정 폼
  - `ValidationSchema.ts`: Yup 검증 스키마

- **BatchDetails/**
  - `BatchDetails.tsx`: 배치 상세 정보
  - `ExecutionHistory.tsx`: 실행 이력
  - `BatchLogs.tsx`: 실행 로그

##### Template Components
- **TemplateForm/**
  - `TemplateForm.tsx`: 템플릿 생성/수정
  - `FieldEditor.tsx`: 필드 정의 에디터
  - `ScriptEditor.tsx`: Playwright 스크립트 에디터

#### Services (`web-service/src/services/`)

##### API Services
- **batchApi.ts**
  ```typescript
  class BatchApi {
    async create(data: CreateBatchDto): Promise<IBatch>;
    async execute(id: string): Promise<void>;
    async getStatus(id: string): Promise<BatchStatus>;
  }
  ```

- **templateApi.ts**
  ```typescript
  class TemplateApi {
    async create(data: CreateTemplateDto): Promise<ITemplate>;
    async validate(script: string): Promise<ValidationResult>;
  }
  ```

##### Business Services
- **BatchService.ts**
  ```typescript
  class BatchService {
    async createBatch(data: CreateBatchDto): Promise<IBatch>;
    async executeBatch(id: string): Promise<void>;
    async scheduleBatch(id: string, schedule: IBatchSchedule): Promise<void>;
  }
  ```

### Batch Service

#### Execution Engine (`batch-service/src/batch/`)

##### executor/
- **BatchExecutor.ts**
  ```typescript
  class BatchExecutor {
    async execute(batch: IBatch): Promise<ExecutionResult>;
    async validateScript(script: string): Promise<ValidationResult>;
  }
  ```

- **ScriptExecutor.ts**
  ```typescript
  class ScriptExecutor {
    async executeScript(
      script: string, 
      context: ExecutionContext
    ): Promise<void>;
  }
  ```

##### scheduler/
- **BatchScheduler.ts**
  ```typescript
  class BatchScheduler {
    async schedule(batch: IBatch): Promise<void>;
    async unschedule(batchId: string): Promise<void>;
  }
  ```

## 사용된 라이브러리 상세 분석

### Core Libraries

#### LokiJS
- **용도**: 인메모리 데이터베이스
- **주요 기능**:
  - 트랜잭션 지원
  - 인덱싱
  - 동시성 제어
  - 데이터 영속성

#### Playwright
- **용도**: 웹 자동화
- **주요 기능**:
  - 크로스 브라우저 지원
  - 자동 대기
  - 네트워크 인터셉션
  - 스크린샷 및 비디오 캡처

### Frontend Libraries

#### React Query
- **용도**: 서버 상태 관리
- **주요 기능**:
  - 캐싱
  - 자동 재시도
  - 낙관적 업데이트
  - 실시간 동기화

#### Monaco Editor
- **용도**: 코드 에디터
- **주요 기능**:
  - 문법 강조
  - 자동 완성
  - 코드 포매팅
  - 테마 지원

### Backend Libraries

#### node-cron
- **용도**: 배치 스케줄링
- **주요 기능**:
  - 크론 표현식 지원
  - 시간대 설정
  - 작업 관리

## 시스템 제약 사항

### 성능 제약
- 파일 업로드: 최대 5MB
- 동시 실행 배치: 최대 5개
- 배치 실행 시간: 최대 5분
- 메모리 사용량: 작업당 최대 512MB

### 보안 제약
- CORS 설정
- API 인증
- 리소스 접근 제어

## 개발 환경 설정

### 요구사항
- Node.js >= 18.0.0
- Yarn 패키지 매니저
- Chrome 브라우저 (Playwright 실행용)

### 설치 및 실행
```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev:web     # 웹 서비스
yarn dev:batch   # 배치 서비스

# 프로덕션 빌드
yarn build:web
yarn build:batch

# 프로덕션 실행
yarn start:web
yarn start:batch
```

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.