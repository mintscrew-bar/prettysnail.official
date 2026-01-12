# 환경 변수 설정 가이드

Vercel 배포 시 설정해야 할 환경 변수 목록과 값 생성 방법입니다.

## 📝 필수 환경 변수 (3개)

### 1. ADMIN_USERNAME
**설명:** 관리자 계정 아이디

**값:**
```
admin
```

**설정 방법:**
- Vercel 환경 변수에 그대로 입력
- 원하는 아이디로 변경 가능

---

### 2. ADMIN_PASSWORD_HASH
**설명:** 관리자 비밀번호 해시값 (bcrypt)

**값 생성 방법 (3가지 중 선택):**

#### 방법 1: Node.js 사용 (추천)
```bash
# 터미널에서 프로젝트 폴더로 이동
cd "C:\Users\Harumaroon\OneDrive - 대구대학교\바탕 화면\브랜드용\Brand\prettysnail"

# Node.js REPL 실행
node

# 다음 코드 복사해서 붙여넣기 (비밀번호를 원하는 것으로 변경)
const bcrypt = require('bcryptjs');
bcrypt.hash('admin1234', 10).then(hash => console.log(hash));
```

출력 예시:
```
$2a$10$KqT5vZ8xYz9F.nX2hGgJ2eDzKjYwB1rP3qL5m6N7o8P9q0R1s2T3u
```

이 해시값을 복사해서 Vercel 환경 변수에 입력합니다.

#### 방법 2: 온라인 생성기 사용
1. https://bcrypt-generator.com/ 접속
2. **String to Encrypt** 란에 원하는 비밀번호 입력 (예: `admin1234`)
3. **Cost** 는 `10` 선택
4. **Generate Hash** 클릭
5. 생성된 해시값 복사

예시 해시:
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

#### 방법 3: 코드 파일 만들어서 실행
`generate-hash.js` 파일 생성:
```javascript
const bcrypt = require('bcryptjs');

const password = 'admin1234'; // 여기에 원하는 비밀번호 입력
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('에러:', err);
    return;
  }
  console.log('비밀번호:', password);
  console.log('해시값:', hash);
});
```

실행:
```bash
node generate-hash.js
```

**⚠️ 중요:**
- 해시값은 매번 다르게 생성됩니다 (정상입니다)
- 해시값 전체를 복사하세요 (`$2a$10$...` 전체)
- 해시값에는 따옴표를 붙이지 마세요

---

### 3. JWT_SECRET
**설명:** JWT 토큰 서명용 비밀 키 (32자 이상)

**값 생성 방법 (3가지 중 선택):**

#### 방법 1: Node.js 사용 (추천)
```bash
# 터미널에서 실행
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

출력 예시:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8
```

이 값을 복사해서 Vercel 환경 변수에 입력합니다.

#### 방법 2: 온라인 생성기 사용
1. https://randomkeygen.com/ 접속
2. **CodeIgniter Encryption Keys** 섹션에서 아무 키나 복사
3. 또는 https://www.uuidgenerator.net/ 에서 UUID 2개 연결

예시:
```
8f3e2a1b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z
```

#### 방법 3: 직접 생성
최소 32자 이상의 랜덤 문자열:
```
mySecretJWTKeyForPrettySnail2024VerySecure123456789
```

**⚠️ 중요:**
- 최소 32자 이상
- 영문, 숫자 혼합 권장
- 다른 사람이 추측할 수 없는 값

---

## 🤖 자동 생성되는 환경 변수 (1개)

### 4. BLOB_READ_WRITE_TOKEN
**설명:** Vercel Blob Storage 인증 토큰

**값:**
- ✅ Vercel이 자동으로 생성 및 설정
- ❌ 직접 만들거나 입력할 필요 없음

**생성 방법:**
1. Vercel 프로젝트 페이지에서 **Storage** 탭 클릭
2. **Create Database** → **Blob** 선택
3. 데이터베이스 이름 입력 (예: `prettysnail-images`)
4. **Create & Continue** 클릭
5. 프로젝트 연결 시 자동으로 환경 변수 추가됨

---

## 📋 환경 변수 입력 체크리스트

Vercel 프로젝트 설정 → Environment Variables 에서:

```
☐ ADMIN_USERNAME = admin
☐ ADMIN_PASSWORD_HASH = [생성한 bcrypt 해시값]
☐ JWT_SECRET = [생성한 랜덤 문자열]
☐ BLOB_READ_WRITE_TOKEN = [Blob Storage 연결 시 자동 생성]
```

---

## 🎯 빠른 설정 (추천 방법)

가장 빠르게 환경 변수를 만드는 방법:

### 1단계: 터미널 열기
```bash
cd "C:\Users\Harumaroon\OneDrive - 대구대학교\바탕 화면\브랜드용\Brand\prettysnail"
node
```

### 2단계: 비밀번호 해시 생성
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('admin1234', 10).then(hash => console.log('ADMIN_PASSWORD_HASH:', hash));
```

복사해서 메모장에 저장

### 3단계: JWT Secret 생성
Node.js REPL에서 계속:
```javascript
console.log('JWT_SECRET:', require('crypto').randomBytes(32).toString('hex'));
```

복사해서 메모장에 저장

### 4단계: Vercel에 입력
메모장에 저장한 값들을 Vercel 환경 변수에 입력

---

## 🔍 환경 변수 입력 예시

Vercel 대시보드에서 이렇게 입력하세요:

| Name | Value | Environment |
|------|-------|-------------|
| ADMIN_USERNAME | `admin` | Production, Preview, Development |
| ADMIN_PASSWORD_HASH | `$2a$10$KqT5vZ8xYz...` | Production, Preview, Development |
| JWT_SECRET | `a1b2c3d4e5f6g7h8...` | Production, Preview, Development |

**Environment 설정:**
- ✅ Production (필수)
- ✅ Preview (선택)
- ✅ Development (선택)

세 개 모두 체크하는 것을 권장합니다.

---

## ❌ 흔한 실수

### 1. 비밀번호를 직접 입력
```
❌ ADMIN_PASSWORD_HASH = admin1234
✅ ADMIN_PASSWORD_HASH = $2a$10$KqT5vZ8xYz9F...
```

### 2. 해시값에 따옴표 포함
```
❌ ADMIN_PASSWORD_HASH = "$2a$10$KqT5vZ8xYz..."
✅ ADMIN_PASSWORD_HASH = $2a$10$KqT5vZ8xYz...
```

### 3. JWT_SECRET이 너무 짧음
```
❌ JWT_SECRET = secret123
✅ JWT_SECRET = a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...
```

### 4. BLOB_READ_WRITE_TOKEN을 직접 생성
```
❌ 직접 입력하려고 시도
✅ Blob Storage 연결하면 자동 생성됨
```

---

## 🧪 환경 변수 테스트

배포 후 테스트:

1. **관리자 로그인 테스트**
   - https://[배포된-도메인]/admin/login
   - 설정한 아이디/비밀번호로 로그인
   - ✅ 성공하면 환경 변수 정상

2. **이미지 업로드 테스트**
   - 관리자 페이지에서 제품 추가
   - 이미지 업로드
   - ✅ 이미지 URL이 `blob.vercel-storage.com`이면 정상

---

## 📞 문제 해결

### "Invalid credentials" 에러
- `ADMIN_PASSWORD_HASH`가 올바른 bcrypt 해시인지 확인
- bcrypt 해시는 `$2a$10$` 또는 `$2b$10$`으로 시작해야 함

### "JWT secret not configured" 에러
- `JWT_SECRET` 환경 변수가 설정되었는지 확인
- 최소 32자 이상인지 확인

### 이미지 업로드 실패
- Blob Storage가 프로젝트에 연결되었는지 확인
- `BLOB_READ_WRITE_TOKEN`이 자동으로 설정되었는지 확인

---

## 📝 참고사항

- 환경 변수는 대소문자를 구분합니다
- 값에 공백이 있으면 안 됩니다
- 배포 후 환경 변수를 변경하면 재배포가 필요합니다
- 민감한 정보이므로 GitHub에 커밋하지 마세요 (.gitignore에 포함됨)

---

준비가 끝나면 Vercel 배포를 진행하세요! 🚀
