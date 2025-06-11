const fs = require('fs');
const path = require('path');

// 날짜+빌드번호 예시: 2024.06.11-001
function getVersionString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  // 빌드번호는 당일 빌드 횟수로, 간단히 타임스탬프(시분초)로 대체
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}-${hh}${min}${ss}`;
}

const version = getVersionString();
const content = `// 자동 생성 파일 (빌드시)
export const APP_VERSION = '${version}';
`;

const targetPath = path.join(__dirname, '../src/app/version.ts');
fs.writeFileSync(targetPath, content);
console.log(`version.ts generated: ${version}`); 