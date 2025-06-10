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
    let deviceModel = 'unknown'
    
    console.log('User Agent:', userAgent) // 디버깅용 로그

    if (userAgentLower.includes('iphone') || userAgentLower.includes('ipad')) {
      os = 'iOS'
      const match = userAgent.match(/OS\s([0-9_]*)/)
      if (match) osVersion = match[1].replace(/_/g, '.')
      
      // iOS 기기 모델명 추출
      if (userAgentLower.includes('iphone')) {
        deviceModel = 'iPhone'
      } else if (userAgentLower.includes('ipad')) {
        deviceModel = 'iPad'
      }
    } else if (userAgentLower.includes('android')) {
      os = 'Android'
      const match = userAgent.match(/Android\s([0-9.]*)/)
      if (match) osVersion = match[1]
      
      // Android 기기 모델명 추출
      const modelMatch = userAgent.match(/;\s([^;)]+)\sBuild/)
      if (modelMatch) {
        deviceModel = modelMatch[1].trim()
      }
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

    // 브라우저 감지
    let browser = 'unknown'
    let browserVersion = 'unknown'

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
      userAgent // 전체 User-Agent 문자열도 저장
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    await addMemo(content)
    setContent('')
  }

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
    </form>
  )
} 