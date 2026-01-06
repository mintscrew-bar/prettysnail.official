// 비밀번호 해시 생성 스크립트
// 사용법: node scripts/hash-password.js <비밀번호>

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('사용법: node scripts/hash-password.js <비밀번호>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\n생성된 해시:');
console.log(hash);
console.log('\n이 해시를 .env.local 파일의 ADMIN_PASSWORD_HASH 값으로 사용하세요.\n');
