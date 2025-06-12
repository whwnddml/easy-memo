#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * CHANGELOG.md를 자동으로 업데이트하는 스크립트
 * Git 커밋 메시지를 기반으로 변경 사항을 추가합니다.
 */

const CHANGELOG_PATH = path.join(__dirname, '../CHANGELOG.md');

// 현재 날짜를 YYYY-MM-DD 형식으로 반환
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Git에서 마지막 태그 이후의 커밋 메시지들을 가져오기
function getCommitsSinceLastTag() {
  try {
    // 마지막 태그 찾기
    let lastTag;
    try {
      lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    } catch (error) {
      // 태그가 없는 경우 첫 번째 커밋부터
      lastTag = execSync('git rev-list --max-parents=0 HEAD', { encoding: 'utf8' }).trim();
    }

    // 마지막 태그 이후의 커밋 메시지들 가져오기
    const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%s"`, { 
      encoding: 'utf8' 
    }).split('\n').filter(line => line.trim());

    return commits;
  } catch (error) {
    console.log('Git 히스토리를 읽는 중 오류가 발생했습니다:', error.message);
    return [];
  }
}

// 커밋 메시지를 분석하여 변경 유형별로 분류
function categorizeCommits(commits) {
  const categories = {
    added: [],
    changed: [],
    deprecated: [],
    removed: [],
    fixed: [],
    security: []
  };

  const typeMapping = {
    'feat': 'added',
    'add': 'added',
    'feature': 'added',
    'fix': 'fixed',
    'bugfix': 'fixed',
    'change': 'changed',
    'update': 'changed',
    'refactor': 'changed',
    'remove': 'removed',
    'delete': 'removed',
    'deprecate': 'deprecated',
    'security': 'security',
    'sec': 'security'
  };

  commits.forEach(commit => {
    const lowerCommit = commit.toLowerCase();
    let categorized = false;

    // 커밋 메시지 앞부분에서 타입 추출 시도
    for (const [keyword, category] of Object.entries(typeMapping)) {
      if (lowerCommit.startsWith(keyword) || lowerCommit.includes(`${keyword}(`)) {
        categories[category].push(commit);
        categorized = true;
        break;
      }
    }

    // 키워드로 분류되지 않은 경우 내용으로 추론
    if (!categorized) {
      if (lowerCommit.includes('add') || lowerCommit.includes('implement') || lowerCommit.includes('create')) {
        categories.added.push(commit);
      } else if (lowerCommit.includes('fix') || lowerCommit.includes('resolve') || lowerCommit.includes('bug')) {
        categories.fixed.push(commit);
      } else if (lowerCommit.includes('remove') || lowerCommit.includes('delete')) {
        categories.removed.push(commit);
      } else if (lowerCommit.includes('update') || lowerCommit.includes('change') || lowerCommit.includes('modify')) {
        categories.changed.push(commit);
      } else {
        // 기본값: changed로 분류
        categories.changed.push(commit);
      }
    }
  });

  return categories;
}

// 새로운 버전 번호 생성 (현재는 간단한 방식으로 PATCH 버전 증가)
function getNextVersion() {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    const version = lastTag.replace('v', '');
    const [major, minor, patch] = version.split('.').map(Number);
    
    // 간단히 PATCH 버전만 증가 (실제로는 변경 내용에 따라 결정해야 함)
    return `${major}.${minor}.${patch + 1}`;
  } catch (error) {
    // 첫 번째 버전
    return '1.0.0';
  }
}

// CHANGELOG.md 업데이트
function updateChangelog(categories, version) {
  if (!fs.existsSync(CHANGELOG_PATH)) {
    console.log('CHANGELOG.md 파일이 존재하지 않습니다.');
    return;
  }

  const changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  const lines = changelog.split('\n');

  // [Unreleased] 섹션 찾기
  const unreleasedIndex = lines.findIndex(line => line.includes('[Unreleased]'));
  
  if (unreleasedIndex === -1) {
    console.log('[Unreleased] 섹션을 찾을 수 없습니다.');
    return;
  }

  // 새로운 버전 섹션 생성
  const newSection = [`## [${version}] - ${getCurrentDate()}`, ''];
  
  // 각 카테고리별로 변경 사항 추가
  Object.entries(categories).forEach(([category, commits]) => {
    if (commits.length > 0) {
      const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
      newSection.push(`### ${categoryTitle}`);
      commits.forEach(commit => {
        newSection.push(`- ${commit}`);
      });
      newSection.push('');
    }
  });

  // CHANGELOG에 새 섹션 삽입
  lines.splice(unreleasedIndex + 2, 0, ...newSection);

  // 파일 저장
  fs.writeFileSync(CHANGELOG_PATH, lines.join('\n'));
  console.log(`CHANGELOG.md가 버전 ${version}으로 업데이트되었습니다.`);
}

// 메인 실행 함수
function main() {
  console.log('🔄 CHANGELOG 업데이트를 시작합니다...');

  const commits = getCommitsSinceLastTag();
  
  if (commits.length === 0) {
    console.log('📝 새로운 커밋이 없습니다.');
    return;
  }

  console.log(`📋 ${commits.length}개의 새로운 커밋을 발견했습니다:`);
  commits.forEach(commit => console.log(`  - ${commit}`));

  const categories = categorizeCommits(commits);
  const version = getNextVersion();

  updateChangelog(categories, version);

  // Git 태그 생성 (선택사항)
  const shouldTag = process.argv.includes('--tag');
  if (shouldTag) {
    try {
      execSync(`git tag v${version}`);
      console.log(`🏷️  Git 태그 v${version}이 생성되었습니다.`);
    } catch (error) {
      console.log('⚠️  Git 태그 생성 중 오류:', error.message);
    }
  }

  console.log('✅ CHANGELOG 업데이트가 완료되었습니다!');
}

// 직접 실행된 경우에만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = { main, updateChangelog, categorizeCommits }; 