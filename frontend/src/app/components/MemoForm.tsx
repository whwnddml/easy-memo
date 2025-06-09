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
    userAgent: ''
  })
  const { addMemo, isOnline } = useMemoStore()

  useEffect(() => {
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
    
    if (userAgentLower.includes('android')) {
      os = 'Android'
      const match = userAgent.match(/Android\s([0-9.]*)/)
      if (match) osVersion = match[1]
    } else if (userAgentLower.includes('iphone') || userAgentLower.includes('ipad')) {
      os = 'iOS'
      const match = userAgent.match(/OS\s([0-9_]*)/)
      if (match) osVersion = match[1].replace(/_/g, '.')
    } else if (userAgentLower.includes('windows')) {
      os = 'Windows'
      const match = userAgent.match(/Windows\sNT\s([0-9.]*)/)
      if (match) {
        const version = match[1]
        osVersion = {
          '10.0': '10',
          '6.3': '8.1',
          '6.2': '8',
          '6.1': '7'
        }[version] || version
      }
    } else if (userAgentLower.includes('macintosh') || userAgentLower.includes('mac os')) {
      os = 'MacOS'
      const match = userAgent.match(/Mac OS X\s([0-9_]*)/)
      if (match) osVersion = match[1].replace(/_/g, '.')
    } else if (userAgentLower.includes('linux')) {
      os = 'Linux'
    }

    // 브라우저 및 버전 감지
    let browser = 'unknown'
    let browserVersion = 'unknown'

    if (userAgentLower.includes('chrome')) {
      browser = 'Chrome'
      const match = userAgent.match(/Chrome\/([0-9.]*)/)
      if (match) browserVersion = match[1]
    } else if (userAgentLower.includes('firefox')) {
      browser = 'Firefox'
      const match = userAgent.match(/Firefox\/([0-9.]*)/)
      if (match) browserVersion = match[1]
    } else if (userAgentLower.includes('safari')) {
      browser = 'Safari'
      const match = userAgent.match(/Version\/([0-9.]*)/)
      if (match) browserVersion = match[1]
    } else if (userAgentLower.includes('edge')) {
      browser = 'Edge'
      const match = userAgent.match(/Edge\/([0-9.]*)/)
      if (match) browserVersion = match[1]
    }

    setCollectionInfo({
      appType: isPWA ? 'PWA' : 'Web',
      os,
      osVersion,
      browser,
      browserVersion,
      userAgent
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    await addMemo(content)
    setContent('')
  }

  // 수집 정보 표시 (개발용)
  const showCollectionInfo = true // 나중에 false로 변경하여 쉽게 제거 가능

  return (
    <form onSubmit={handleSubmit} className="memo-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="메모를 입력하세요..."
        disabled={!isOnline}
      />
      <button type="submit" disabled={!content.trim() || !isOnline}>
        저장
      </button>
      {showCollectionInfo && (
        <div className="collection-info">
          <small>
            <div>앱 타입: {collectionInfo.appType}</div>
            <div>운영체제: {collectionInfo.os} {collectionInfo.osVersion}</div>
            <div>브라우저: {collectionInfo.browser} {collectionInfo.browserVersion}</div>
            <div>User Agent: {collectionInfo.userAgent}</div>
          </small>
        </div>
      )}
    </form>
  )
} 