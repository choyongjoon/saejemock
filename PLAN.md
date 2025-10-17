# 영화 제목 번역 제안 사이트 (saejemock)

## 구현 완료 현황

### ✅ 홈
route: `/`

**페이지 내용**
- ✅ 조회수 순으로 영화 보여주기
- ✅ 투표수 순으로 영화 보여주기 (총 투표수 기준)
- ✅ 신규 추가 영화 보여주기 (최근 등록순)

### ✅ 영화
route: `/movie/{movieShortId}`

**영화 정보**
- ✅ 한국어 제목
- ✅ 영화 원제 (영문 제목)
- ✅ 조회수 자동 증가
- ✅ 관련 정보 (개봉년도, 감독, 장르 등)

**제목 제안**
- ✅ 많이 투표받은 순으로 제목 제안 표시
- ✅ 투표하기 기능 (로그인 필요)
  - ✅ 중복 투표 방지
  - ✅ 실시간 투표수 업데이트
- ✅ 새 영화 제목 제안 추가하기 (로그인 필요)
  - ✅ 인라인 폼 UI
  - ✅ 제목 입력 (필수)
  - ✅ 설명 입력 (선택)

### ✅ 영화 검색
route: `/movie/search`

**페이지 내용**
- ✅ KOBIS API 검색 (영화진흥위원회 공식 데이터)
  - ✅ 한글/영문 제목 검색 지원
  - ✅ 검색 결과 표시 (제목, 감독, 개봉년도, 장르, 국적)
- ✅ 영화 추가 혹은 기존 영화 페이지로 이동
  - ✅ 중복 영화 체크 (KOBIS 코드 기준)
  - ✅ ShortId 자동 생성
  - ✅ 추가 후 영화 페이지로 리다이렉트

### ✅ 인증

**구현 완료**
- ✅ Clerk 인증 통합
- ✅ 로그인 필요 기능:
  - ✅ 영화 추가
  - ✅ 제목 제안 추가
  - ✅ 투표하기
- ✅ 자동 사용자 동기화 (Clerk ↔ Convex)
- ✅ 사용자 정보 저장 (clerkId, email, name)

**지원하는 로그인 (Clerk 제공)**
- ✅ 구글
- ✅ X (Twitter)

## Database Schema

### 완료된 테이블
- ✅ `movies` - 영화 정보, 조회수, KOBIS 코드
- ✅ `titleSuggestions` - 제목 제안, 투표수
- ✅ `users` - 사용자 정보 (Clerk 동기화)
- ✅ `votes` - 투표 기록, 중복 방지

## 기술 스택

### Frontend
- ✅ TanStack Start (React 19)
- ✅ TanStack Router (타입 안전 라우팅)
- ✅ Tailwind CSS (스타일링)
- ✅ Lucide React (아이콘)
- ✅ Clerk React (인증)

### Backend
- ✅ Convex (실시간 데이터베이스)
  - ✅ Queries (데이터 조회)
  - ✅ Mutations (데이터 변경)
  - ✅ Actions (외부 API 호출)
- ✅ KOBIS Open API (영화 정보)

### 개발 도구
- ✅ TypeScript (타입 안전성)
- ✅ Biome (린터/포매터)
- ✅ Ultracite (접근성, 코드 품질)

## 다음 단계 (TODO)

### 우선순위 높음
- ✅ 검색 기능
  - ✅ 영화 제목 검색 (KOBIS + DB 통합)
  - ✅ 검색 결과 병합 표시
- [ ] 사용자 프로필 페이지
  - [ ] 내가 제안한 제목 목록
  - [ ] 내가 투표한 제목 목록
  - [ ] 내가 작성한 댓글 목록

### 우선순위 보통
- [ ] 알림 기능
  - [ ] 내 제안에 투표가 달렸을 때
- ✅ 페이지네이션
  - ✅ 홈페이지 영화 목록
- ✅ 반응형 개선
  - ✅ 모바일 UI 최적화
  - ✅ 테블릿 레이아웃 개선

### 우선순위 낮음
- ✅ 구글 애드센스 통합
- ✅ SEO 최적화
  - ✅ 메타 태그 추가
  - [ ] Open Graph 태그
  - [ ] 사이트맵 생성
- [ ] PWA 지원
  - [ ] 오프라인 모드
  - [ ] 푸시 알림
- [ ] 관리자 기능
  - [ ] 부적절한 제목 제안 신고
  - [ ] 신고된 콘텐츠 관리
  - [ ] 사용자 차단

## API 키 설정

### 필수 환경 변수 (.env.local)
```bash
# Convex
CONVEX_DEPLOYMENT=your-convex-deployment-url
VITE_CONVEX_URL=your-convex-url

# Clerk (인증)
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key

# KOBIS (영화진흥위원회)
KOBIS_API_KEY=430156241533f1d058c603178cc3ca0e
```

## 배포

### 현재 상태
- ✅ 로컬 개발 환경 완료
- ✅ 프로덕션 배포

### 배포 체크리스트
- ✅ Convex 프로덕션 환경 설정
- ✅ Clerk 프로덕션 OAuth 설정
  - ✅ 구글 OAuth 설정
  - ✅ X (Twitter) OAuth 설정
- ✅ 환경 변수 설정
- ✅ 도메인 연결
- ✅ SSL 인증서 설정
