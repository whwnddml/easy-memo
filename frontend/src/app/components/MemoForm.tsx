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
    
    if (userAgentLower.includes('android')) {
      os = 'Android'
      const match = userAgent.match(/Android\s([0-9.]*)/)
      if (match) osVersion = match[1]
      
      // Android 기기 모델명 추출 (개선된 버전)
      const modelMatches = [
        // Samsung
        /SM-[A-Z0-9]+/,
        // Google Pixel
        /Pixel\s[0-9]+/,
        // OnePlus
        /ONEPLUS\s[A-Z0-9]+/,
        // Xiaomi
        /MI\s[A-Z0-9]+/,
        // Huawei
        /HUAWEI\s[A-Z0-9]+/,
        // OPPO
        /OPPO\s[A-Z0-9]+/,
        // Vivo
        /VIVO\s[A-Z0-9]+/,
        // 일반적인 Android 기기
        /;\s([^;)]+)\sBuild/,
        // 추가 패턴
        /;\s([^;)]+)\sMIUI/,
        /;\s([^;)]+)\sKernel/,
        /;\s([^;)]+)\sSDK/,
        /;\s([^;)]+)\sAndroid/,
        /;\s([^;)]+)\sLinux/
      ]

      for (const pattern of modelMatches) {
        const modelMatch = userAgent.match(pattern)
        if (modelMatch) {
          // 첫 번째 그룹이 있는 경우 해당 그룹 사용, 없으면 전체 매치 사용
          deviceModel = (modelMatch[1] || modelMatch[0]).trim()
          // 불필요한 정보 제거
          deviceModel = deviceModel
            .replace(/\sBuild.*$/, '')
            .replace(/\sMIUI.*$/, '')
            .replace(/\sKernel.*$/, '')
            .replace(/\sSDK.*$/, '')
            .replace(/\sAndroid.*$/, '')
            .replace(/\sLinux.*$/, '')
            .trim()
          break
        }
      }

      // 모델명이 여전히 unknown이면 전체 User-Agent에서 추출 시도
      if (deviceModel === 'unknown') {
        const fullModelMatch = userAgent.match(/;\s([^;)]+)\sBuild/)
        if (fullModelMatch) {
          deviceModel = fullModelMatch[1].trim()
        }
      }
    } else if (userAgentLower.includes('iphone') || userAgentLower.includes('ipad')) {
      os = 'iOS'
      const match = userAgent.match(/OS\s([0-9_]*)/)
      if (match) osVersion = match[1].replace(/_/g, '.')
      
      // iOS 기기 모델명 추출
      if (userAgentLower.includes('iphone')) {
        deviceModel = 'iPhone'
        const modelMatch = userAgent.match(/iPhone\s*(\d+)/i)
        if (modelMatch) {
          deviceModel += ` ${modelMatch[1]}`
        }
      } else if (userAgentLower.includes('ipad')) {
        deviceModel = 'iPad'
        const modelMatch = userAgent.match(/iPad\s*(\d+)/i)
        if (modelMatch) {
          deviceModel += ` ${modelMatch[1]}`
        }
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

    // 브라우저 및 버전 감지 (개선된 버전)
    let browser = 'unknown'
    let browserVersion = 'unknown'

    // iOS Chrome 감지
    if (userAgentLower.includes('crios')) {
      browser = 'Chrome'
      const match = userAgent.match(/CriOS\/([0-9.]*)/)
      if (match) browserVersion = match[1]
    }
    // Android Chrome 감지
    else if (userAgentLower.includes('chrome') && !userAgentLower.includes('edg')) {
      browser = 'Chrome'
      const match = userAgent.match(/Chrome\/([0-9.]*)/)
      if (match) browserVersion = match[1]
    }
    // Edge 감지
    else if (userAgentLower.includes('edg')) {
      browser = 'Edge'
      const match = userAgent.match(/Edg\/([0-9.]*)/)
      if (match) browserVersion = match[1]
    }
    // Firefox 감지
    else if (userAgentLower.includes('firefox')) {
      browser = 'Firefox'
      const match = userAgent.match(/Firefox\/([0-9.]*)/)
      if (match) browserVersion = match[1]
    }
    // Safari 감지 (iOS의 기본 브라우저)
    else if (userAgentLower.includes('safari') && !userAgentLower.includes('chrome')) {
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
            <div>디바이스: {collectionInfo.deviceModel}</div>
            <div>브라우저: {collectionInfo.browser} {collectionInfo.browserVersion}</div>
            <div>User Agent: {collectionInfo.userAgent}</div>
          </small>
        </div>
      )}
    </form>
  )
} 