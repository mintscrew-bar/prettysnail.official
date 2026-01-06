# 관리자 인증 시스템 설정 가이드

이 문서는 서버 측 인증 시스템의 초기 설정 방법을 안내합니다.

## 🔐 보안 기능

- **서버 측 인증**: JWT 토큰 기반 인증 (httpOnly 쿠키)
- **비밀번호 해싱**: bcrypt를 사용한 안전한 비밀번호 저장
- **로그인 시도 제한**: 5회 실패 시 15분 차단 (브루트포스 공격 방지)
- **세션 타임아웃**: 30분 비활동 시 자동 로그아웃
- **미들웨어 보호**: 관리자 페이지 자동 보호

## 📋 초기 설정

### 1. 환경 변수 설정

`.env.local` 파일이 이미 생성되어 있습니다. 기본 설정은 다음과 같습니다:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$Gbsix.ICyndM5tCIKKsl7u5V8lvYyL.ez7rBiflevLT51vaAUTyLe
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2026
```

**기본 로그인 정보:**
- 아이디: `admin`
- 비밀번호: `admin1234`

### 2. 비밀번호 변경 (권장)

보안을 위해 초기 비밀번호를 변경하세요:

**방법 1: 관리자 페이지에서 변경**
1. `/admin/login`에서 로그인
2. 설정 메뉴(`/admin/settings`)로 이동
3. 비밀번호 변경 폼 작성
4. 변경된 비밀번호는 `data/auth.json` 파일에 저장됩니다

**방법 2: 환경 변수 직접 변경**
```bash
# 새 비밀번호의 해시 생성
node scripts/hash-password.js 새비밀번호

# 생성된 해시를 .env.local의 ADMIN_PASSWORD_HASH에 복사
```

### 3. JWT Secret 변경 (운영 환경 필수)

`.env.local` 파일의 `JWT_SECRET`을 안전한 랜덤 문자열로 변경하세요:

```bash
# 랜덤 문자열 생성 (예시)
openssl rand -base64 32
```

## 🚀 Vercel 배포

### 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

1. **Settings** > **Environment Variables**로 이동
2. 다음 변수들을 추가:
   - `ADMIN_USERNAME`: admin
   - `ADMIN_PASSWORD_HASH`: (생성한 해시값)
   - `JWT_SECRET`: (안전한 랜덤 문자열)
   - `BLOB_READ_WRITE_TOKEN`: (Vercel에서 자동 설정)

### 비밀번호 변경 시 주의사항

- 비밀번호를 관리자 페이지에서 변경하면 `data/auth.json` 파일에 저장됩니다
- 이 파일은 서버의 파일시스템에 저장되므로 Vercel과 같은 서버리스 환경에서는 재배포 시 초기화될 수 있습니다
- **운영 환경**: Vercel 환경 변수를 수동으로 업데이트하거나 데이터베이스 사용을 권장합니다

## 🔒 보안 권장사항

### 개발 환경
- `.env.local` 파일을 절대 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
- `data/auth.json` 파일도 Git에 커밋하지 마세요

### 운영 환경
1. 강력한 비밀번호 사용 (최소 12자, 대소문자/숫자/특수문자 조합)
2. JWT_SECRET을 32자 이상의 랜덤 문자열로 설정
3. HTTPS 사용 (Vercel은 자동으로 HTTPS 제공)
4. 정기적으로 비밀번호 변경
5. 관리자 계정은 최소한의 인원만 사용

### 다중 관리자 지원 (향후 확장)

현재는 단일 관리자만 지원합니다. 여러 관리자가 필요한 경우:
1. 데이터베이스 사용 (PostgreSQL, MongoDB 등)
2. NextAuth.js 또는 Auth.js 도입
3. 역할 기반 접근 제어(RBAC) 구현

## 📝 API 엔드포인트

- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/change-password` - 비밀번호 변경

## 🛠️ 문제 해결

### 로그인이 안 돼요
1. 비밀번호를 확인하세요 (기본: `admin1234`)
2. 5회 실패 시 15분간 차단됩니다
3. 브라우저 쿠키를 확인하세요

### 비밀번호를 잊어버렸어요
1. `.env.local` 파일의 `ADMIN_PASSWORD_HASH`를 기본값으로 되돌리세요
2. `data/auth.json` 파일을 삭제하세요
3. 서버를 재시작하세요

### Vercel 배포 후 로그인이 안 돼요
1. Vercel 환경 변수가 올바르게 설정되었는지 확인
2. 배포 로그에서 오류 확인
3. 쿠키가 차단되지 않았는지 확인 (sameSite 설정)

## 📚 추가 리소스

- [bcrypt 문서](https://github.com/kelektiv/node.bcrypt.js)
- [jose (JWT) 문서](https://github.com/panva/jose)
- [Next.js 미들웨어](https://nextjs.org/docs/app/building-your-application/routing/middleware)
