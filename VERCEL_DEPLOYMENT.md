# Vercel 배포 가이드

이쁜우렁이 웹사이트를 Vercel에 배포하는 방법입니다.

## ✅ 사전 준비 (완료됨)

- [x] 프로덕션 빌드 테스트 완료
- [x] TypeScript 타입 에러 수정 완료
- [x] .gitignore 설정 완료
- [x] 환경 변수 설정 완료

## 📋 배포 전 체크리스트

### 1. GitHub 저장소 준비

```bash
# 현재 디렉토리에서 실행
cd "C:\Users\Harumaroon\OneDrive - 대구대학교\바탕 화면\브랜드용\Brand\prettysnail"

# Git 상태 확인
git status

# 모든 변경사항 커밋
git add .
git commit -m "Prepare for Vercel deployment"

# GitHub에 푸시
git push origin master
```

### 2. Vercel 계정 준비

1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭

## 🚀 배포 단계

### Step 1: 프로젝트 Import

1. Vercel 대시보드에서 **"Add New..." → "Project"** 클릭
2. GitHub 저장소 연결 (처음이라면 권한 승인 필요)
3. `prettysnail` 저장소 선택 후 **"Import"** 클릭

### Step 2: 프로젝트 설정

**Framework Preset:** Next.js (자동 감지)

**Root Directory:** `./` (기본값 유지)

**Build Command:**
```
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```
npm install
```

### Step 3: 환경 변수 설정

Vercel 프로젝트 설정 화면에서 **"Environment Variables"** 섹션에 다음 변수들을 추가합니다:

#### 필수 환경 변수

```bash
# 관리자 계정
ADMIN_USERNAME=admin

# 관리자 비밀번호 해시 (아래 명령어로 생성)
ADMIN_PASSWORD_HASH=[생성한_해시값]

# JWT Secret (32자 이상 랜덤 문자열)
JWT_SECRET=[랜덤_문자열_생성]
```

#### BLOB_READ_WRITE_TOKEN

⚠️ **중요:** 이 변수는 Vercel Blob Storage를 연결한 후 자동으로 설정됩니다.

### Step 4: Vercel Blob Storage 연결

1. Vercel 대시보드에서 **"Storage"** 탭 클릭
2. **"Create Database" → "Blob"** 선택
3. 데이터베이스 이름 입력 (예: `prettysnail-images`)
4. **"Continue"** 클릭
5. 프로젝트 연결 시 `BLOB_READ_WRITE_TOKEN` 환경 변수가 자동으로 설정됨

### Step 5: 배포 실행

1. 모든 설정 완료 후 **"Deploy"** 클릭
2. 빌드 로그를 확인하며 대기 (약 2-3분 소요)
3. 배포 완료 후 제공되는 URL 확인

## 🔒 환경 변수 값 생성 방법

### 1. 관리자 비밀번호 해시 생성

```bash
# Node.js REPL 실행
node

# 다음 코드 입력 (원하는 비밀번호로 변경)
const bcrypt = require('bcryptjs');
bcrypt.hash('admin1234', 10).then(hash => console.log(hash));

# 출력된 해시값을 ADMIN_PASSWORD_HASH에 입력
```

또는 온라인 bcrypt 생성기 사용:
- https://bcrypt-generator.com/
- Rounds: 10 설정
- 비밀번호 입력 후 생성

### 2. JWT_SECRET 생성

```bash
# Node.js REPL에서 실행
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 온라인 생성기 사용
# https://randomkeygen.com/
```

## 📦 배포 후 확인사항

### 1. 기본 기능 테스트

- [ ] 홈페이지 로딩 확인
- [ ] 제품 페이지 이동
- [ ] 공지사항 페이지 확인
- [ ] 고객지원 페이지 확인

### 2. 관리자 기능 테스트

- [ ] `/admin/login` 접속
- [ ] 관리자 로그인 (설정한 비밀번호 사용)
- [ ] 제품 추가/수정/삭제
- [ ] 이미지 업로드 (Blob Storage 사용 확인)
- [ ] 프로모션 관리
- [ ] 공지사항 관리

### 3. 이미지 업로드 확인

관리자 페이지에서 이미지 업로드 시:
- 콘솔에 "개발 모드" 경고가 **없어야** 함
- 업로드된 이미지 URL이 `https://blob.vercel-storage.com/...` 형식이어야 함
- 이미지가 정상적으로 표시되어야 함

## 🔄 재배포 방법

코드 변경 후 재배포:

```bash
# 변경사항 커밋
git add .
git commit -m "Update: [변경 내용]"

# GitHub에 푸시 (자동으로 Vercel이 재배포)
git push origin master
```

Vercel은 GitHub의 master 브랜치에 푸시될 때마다 자동으로 빌드하고 배포합니다.

## 🌐 커스텀 도메인 설정 (선택사항)

1. Vercel 프로젝트 설정 → **"Domains"** 탭
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 제공업체에서 설정
4. DNS 전파 대기 (최대 48시간, 보통 몇 분 내 완료)

## ⚠️ 주의사항

### localStorage 데이터

- 개발 환경에서 localStorage에 저장된 제품/프로모션 데이터는 배포 환경에 자동으로 이전되지 않습니다
- 배포 후 관리자 페이지에서 다시 추가해야 합니다
- 또는 `src/data/*.ts` 파일의 초기 데이터가 사용됩니다

### 환경 변수 변경

환경 변수를 변경한 경우:
1. Vercel 대시보드 → Settings → Environment Variables
2. 변수 수정
3. **"Redeploy"** 클릭 (변경사항 적용을 위해 재배포 필요)

### 빌드 에러 발생 시

Vercel 빌드 로그를 확인하고:
- TypeScript 에러: `npm run build`로 로컬에서 먼저 확인
- 환경 변수 에러: 모든 필수 변수가 설정되었는지 확인
- 의존성 에러: `package.json` 확인

## 📊 모니터링

Vercel 대시보드에서 확인 가능:
- 배포 상태 및 로그
- 실시간 방문자 통계
- 성능 메트릭
- 에러 로그

## 🆘 문제 해결

### "Invalid environment variables" 에러

- 모든 필수 환경 변수가 설정되었는지 확인
- 환경 변수 값에 특수문자가 있다면 따옴표로 감싸기

### 이미지 업로드 실패

- Blob Storage가 프로젝트에 연결되었는지 확인
- `BLOB_READ_WRITE_TOKEN` 환경 변수 확인

### 관리자 로그인 실패

- `ADMIN_PASSWORD_HASH`가 올바르게 설정되었는지 확인
- bcrypt 해시 생성이 올바른지 확인

## 📚 추가 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel Blob Storage 문서](https://vercel.com/docs/storage/vercel-blob)

---

배포 성공을 기원합니다! 🎉
