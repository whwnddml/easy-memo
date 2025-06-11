'use client'

import { useState, useEffect } from 'react'
import { useMemoStore } from '../store/memoStore'

export default function MemoForm() {
  const [content, setContent] = useState('')
  const [collectionInfo, setCollectionInfo] = useState({
    appType: '',
    os: '',
    osVersion: '',
    browser: '',
    browserVersion: '',
    deviceModel: '',
    userAgent: ''
  })
  const { addMemo, isOnline, isHydrated } = useMemoStore()

  useEffect(() => {
    if (!isHydrated) return;

    const collectSystemInfo = () => {
      if (typeof window === 'undefined') return;

      // 앱 타입 감지
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                   (window.navigator as any).standalone || 
                   document.referrer.includes('android-app://')

      // User-Agent 파싱
      const userAgent = navigator.userAgent
      const userAgentLower = userAgent.toLowerCase()
      
      // 운영체제 및 버전 감지
      let os = 'unknown'
      let osVersion = 'unknown'
      let deviceModel = 'unknown'
      let browser = 'unknown'
      let browserVersion = 'unknown'

      if (userAgentLower.includes('windows')) {
        os = 'Windows'
        const match = userAgent.match(/Windows NT ([0-9.]*)/)
        if (match) osVersion = match[1]
      } else if (userAgentLower.includes('mac os x')) {
        os = 'macOS'
        const match = userAgent.match(/Mac OS X ([0-9_.]*)/)
        if (match) osVersion = match[1].replace(/_/g, '.')
      } else if (userAgentLower.includes('android')) {
        os = 'Android'
        const match = userAgent.match(/Android ([0-9.]*)/)
        if (match) osVersion = match[1]
        const deviceMatch = userAgent.match(/\(Linux.*?; Android.*?; (.*?) Build/)
        if (deviceMatch) deviceModel = deviceMatch[1]
      } else if (userAgentLower.includes('iphone') || userAgentLower.includes('ipad')) {
        os = userAgentLower.includes('iphone') ? 'iPhone' : 'iPad'
        const match = userAgent.match(/OS ([0-9_]*)/)
        if (match) osVersion = match[1].replace(/_/g, '.')
        const deviceMatch = userAgent.match(/\((.*?); CPU.*?OS/)
        if (deviceMatch) deviceModel = deviceMatch[1]
      } else if (userAgentLower.includes('linux')) {
        os = 'Linux'
      }

      if (userAgentLower.includes('crios')) {
        browser = 'Chrome iOS'
        const match = userAgent.match(/CriOS\/([0-9.]*)/)
        if (match) browserVersion = match[1]
      } else if (userAgentLower.includes('chrome')) {
        browser = 'Chrome'
        const match = userAgent.match(/Chrome\/([0-9.]*)/)
        if (match) browserVersion = match[1]
      } else if (userAgentLower.includes('safari')) {
        browser = 'Safari'
        const match = userAgent.match(/Version\/([0-9.]*)/)
        if (match) browserVersion = match[1]
      }

      setCollectionInfo({
        appType: isPWA ? 'PWA' : 'Web',
        os,
        osVersion,
        browser,
        browserVersion,
        deviceModel,
        userAgent
      })
    }

    collectSystemInfo()
  }, [isHydrated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !isHydrated) return

    await addMemo(content)
    setContent('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (content.trim() && isOnline && isHydrated) {
        handleSubmit(e as any);
      }
    }
  };

  if (!isHydrated) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="memo-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메모를 입력하세요..."
      />
      <button type="submit" disabled={!content.trim()}>
        저장
      </button>
      {!isOnline && (
        <div style={{ color: 'orange', fontSize: '0.95em', marginTop: 6 }}>
          오프라인 상태입니다. 메모는 임시 저장되며, 인터넷 연결 시 자동 동기화됩니다.
        </div>
      )}
    </form>
  )
} 