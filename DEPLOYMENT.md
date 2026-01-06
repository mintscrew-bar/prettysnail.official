# Vercel 배포 가이드

이쁜우렁이 웹사이트를 Vercel에 배포하는 방법입니다.

## 1. Vercel 계정 생성 및 프로젝트 연결

1. [Vercel](https://vercel.com)에 접속하여 GitHub 계정으로 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택 및 Import
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)

## 2. Vercel Blob Storage 설정

이미지 업로드 기능을 위해 Vercel Blob Storage를 활성화합니다.

### 방법 1: Vercel Dashboard에서 설정

1. Vercel 프로젝트 대시보드 접속
2. **Storage** 탭 클릭
3. **Create Database** → **Blob** 선택
4. Database 이름 입력 (예: `prettysnail-images`)
5. **Create** 클릭

환경 변수 `BLOB_READ_WRITE_TOKEN`이 자동으로 설정됩니다.

### 방법 2: Vercel CLI로 설정

```bash
# Vercel CLI 설치 (한 번만 실행)
npm i -g vercel

# Vercel에 로그인
vercel login

# 프로젝트 연결
vercel link

# Blob Storage 생성
vercel blob create prettysnail-images
```

## 3. 환경 변수 확인

Vercel 대시보드에서 **Settings** → **Environment Variables**로 이동하여 다음 변수가 설정되어 있는지 확인:

- `BLOB_READ_WRITE_TOKEN`: Blob Storage 토큰 (자동 생성됨)

## 4. 배포

### 자동 배포 (권장)

GitHub에 push하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 수동 배포

```bash
vercel --prod
```

## 5. 배포 후 확인 사항

### 이미지 업로드 테스트

1. 배포된 사이트 접속
2. `/admin/login`으로 이동
3. 로그인 (admin / admin1234)
4. 제품 추가 시 이미지 업로드 테스트
5. 업로드된 이미지가 Vercel Blob에 저장되는지 확인

### Blob Storage 용량 확인

- **무료 플랜**: 1GB 저장 공간
- 용량 초과 시 유료 플랜으로 업그레이드 필요

Vercel 대시보드의 **Storage** → **Blob** 탭에서 사용량 확인 가능

## 로컬 개발 환경

로컬 개발 시에는 Vercel Blob Storage 없이도 작동합니다:

- 이미지 업로드 시 **base64 데이터 URL**로 변환되어 localStorage에 저장
- 콘솔에 "개발 모드" 경고 메시지 표시
- Vercel에 배포하면 자동으로 Blob Storage 사용

## 문제 해결

### 이미지 업로드 실패

**증상**: "업로드 중 오류가 발생했습니다" 메시지

**해결 방법**:
1. Vercel 대시보드에서 `BLOB_READ_WRITE_TOKEN` 환경 변수 확인
2. Blob Storage가 생성되어 있는지 확인
3. 파일 크기가 10MB 이하인지 확인

### 이미지가 표시되지 않음

**증상**: 업로드는 성공했지만 이미지가 표시되지 않음

**해결 방법**:
1. 브라우저 콘솔에서 이미지 URL 확인
2. Blob Storage URL이 정상적인지 확인 (`https://blob.vercel-storage.com/...`)
3. CORS 에러가 있는지 확인

## 참고 링크

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [@vercel/blob Package](https://www.npmjs.com/package/@vercel/blob)
