/**
 * Vercel 배포용 환경 변수 값 생성 스크립트
 *
 * 사용법:
 * node generate-env-values.js
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

console.log('='.repeat(60));
console.log('Vercel 환경 변수 값 생성기');
console.log('='.repeat(60));
console.log('');

// 사용자에게 비밀번호 입력 받기 (기본값: admin1234)
const password = process.argv[2] || 'admin1234';

console.log('📝 생성 중...\n');

// 1. 관리자 계정 정보
console.log('1️⃣  ADMIN_USERNAME');
console.log('-'.repeat(60));
console.log('admin');
console.log('');

// 2. 비밀번호 해시 생성
bcrypt.hash(password, 10, function(err, hash) {
  if (err) {
    console.error('에러 발생:', err);
    return;
  }

  console.log('2️⃣  ADMIN_PASSWORD_HASH (비밀번호: ' + password + ')');
  console.log('-'.repeat(60));
  console.log(hash);
  console.log('');

  // 3. JWT Secret 생성
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  console.log('3️⃣  JWT_SECRET');
  console.log('-'.repeat(60));
  console.log(jwtSecret);
  console.log('');

  // 4. Blob Storage Token 안내
  console.log('4️⃣  BLOB_READ_WRITE_TOKEN');
  console.log('-'.repeat(60));
  console.log('✅ Vercel Blob Storage 연결 시 자동 생성됨');
  console.log('   (직접 입력하지 마세요)');
  console.log('');

  // 요약
  console.log('='.repeat(60));
  console.log('📋 Vercel 환경 변수 입력 요약');
  console.log('='.repeat(60));
  console.log('');
  console.log('다음 값들을 복사해서 Vercel 프로젝트 설정에 입력하세요:');
  console.log('');
  console.log('ADMIN_USERNAME');
  console.log('admin');
  console.log('');
  console.log('ADMIN_PASSWORD_HASH');
  console.log(hash);
  console.log('');
  console.log('JWT_SECRET');
  console.log(jwtSecret);
  console.log('');
  console.log('='.repeat(60));
  console.log('');
  console.log('💡 팁:');
  console.log('- 위 값들을 메모장에 복사해두세요');
  console.log('- Vercel 배포 시 Environment Variables 섹션에 입력하세요');
  console.log('- BLOB_READ_WRITE_TOKEN은 Storage 연결 시 자동 생성됩니다');
  console.log('');
  console.log('✅ 준비 완료! VERCEL_DEPLOYMENT.md 가이드를 따라 배포하세요');
  console.log('');
});

// 사용법 안내
if (process.argv.length > 2 && process.argv[2] === '--help') {
  console.log('사용법:');
  console.log('  node generate-env-values.js [비밀번호]');
  console.log('');
  console.log('예시:');
  console.log('  node generate-env-values.js              # 기본 비밀번호 사용 (admin1234)');
  console.log('  node generate-env-values.js mypassword   # 커스텀 비밀번호 사용');
  process.exit(0);
}
