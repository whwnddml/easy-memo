#!/bin/bash

# Git hooks 설정 스크립트
# .githooks 디렉토리의 훅들을 Git hooks 디렉토리에 복사하고 실행 권한을 부여합니다.

echo "🔧 Git hooks 설정을 시작합니다..."

# Git hooks 디렉토리 경로
HOOKS_DIR=".git/hooks"
SOURCE_HOOKS_DIR=".githooks"

# .git/hooks 디렉토리가 존재하는지 확인
if [ ! -d "$HOOKS_DIR" ]; then
    echo "❌ Git repository가 아니거나 .git/hooks 디렉토리를 찾을 수 없습니다."
    exit 1
fi

# .githooks 디렉토리가 존재하는지 확인
if [ ! -d "$SOURCE_HOOKS_DIR" ]; then
    echo "❌ .githooks 디렉토리를 찾을 수 없습니다."
    exit 1
fi

# .githooks의 모든 파일을 .git/hooks로 복사
for hook in "$SOURCE_HOOKS_DIR"/*; do
    if [ -f "$hook" ]; then
        hook_name=$(basename "$hook")
        target_path="$HOOKS_DIR/$hook_name"
        
        echo "📋 $hook_name 훅을 설정 중..."
        cp "$hook" "$target_path"
        chmod +x "$target_path"
        echo "✅ $hook_name 훅이 설정되었습니다."
    fi
done

echo ""
echo "🎉 Git hooks 설정이 완료되었습니다!"
echo ""
echo "설정된 훅들:"
ls -la "$HOOKS_DIR" | grep -E "^-.*x.*" | awk '{print "  - " $NF}'
echo ""
echo "💡 이제 git push를 실행하면 자동으로 CHANGELOG.md가 업데이트됩니다." 