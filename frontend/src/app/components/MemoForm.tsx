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
    const collectSystemInfo = () => {
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
      
      if (userAgentLower.includes('iphone') || userAgentLower.includes('ipad')) {
        os = 'iOS'
        const match = userAgent.match(/OS\s([0-9_]*)/)
        if (match) osVersion = match[1].replace(/_/g, '.')
        
        // iOS 기기 모델명 추출
        if (userAgentLower.includes('iphone')) {
          deviceModel = 'iPhone'
          // iPhone 모델 상세 정보 추출 시도
          const modelMatch = userAgent.match(/iPhone\s*(?:(?:\d+,\d+)|(?:[A-Za-z]+))/i)
          if (modelMatch) {
            deviceModel = modelMatch[0]
          }
        } else if (userAgentLower.includes('ipad')) {
          deviceModel = 'iPad'
          // iPad 모델 상세 정보 추출 시도
          const modelMatch = userAgent.match(/iPad\s*(?:(?:\d+,\d+)|(?:[A-Za-z]+))/i)
          if (modelMatch) {
            deviceModel = modelMatch[0]
          }
        }
      } else if (userAgentLower.includes('android')) {
        os = 'Android'
        // Android 버전 추출
        const versionMatch = userAgent.match(/Android\s([0-9.]+)/)
        if (versionMatch) osVersion = versionMatch[1]
        
        // Android 기기 모델명 추출 (Build/ 이전의 문자열)
        const modelMatch = userAgent.match(/;\s([^;)]+)\sBuild\//)
        if (modelMatch) {
          deviceModel = modelMatch[1].trim()
        }
      } else if (userAgentLower.includes('windows')) {
        os = 'Windows'
        const match = userAgent.match(/Windows\sNT\s([0-9.]+)/)
        if (match) {
          const version = match[1]
          osVersion = {
            '10.0': '11/10',  // Windows 11 또는 10
            '6.3': '8.1',
            '6.2': '8',
            '6.1': '7',
            '6.0': 'Vista',
            '5.2': 'Server 2003/XP x64',
            '5.1': 'XP',
            '5.0': '2000'
          }[version] || version
        }
        
        // Windows 아키텍처 감지
        if (userAgentLower.includes('wow64') || userAgentLower.includes('win64')) {
          deviceModel = 'x64'
        } else {
          deviceModel = 'x86'
        }
      } else if (userAgentLower.includes('macintosh') || userAgentLower.includes('mac os')) {
        os = 'macOS'
        const match = userAgent.match(/Mac OS X\s*([0-9_\.]+)/)
        if (match) {
          osVersion = match[1].replace(/_/g, '.')
          // macOS 버전 이름 매핑
          const majorVersion = parseInt(osVersion.split('.')[0])
          if (majorVersion >= 11) {
            osVersion += ' (Big Sur 이상)'
          } else if (majorVersion === 10) {
            const minorVersion = parseInt(osVersion.split('.')[1])
            const versionNames: { [key: number]: string } = {
              15: 'Catalina',
              14: 'Mojave',
              13: 'High Sierra',
              12: 'Sierra',
              11: 'El Capitan',
              10: 'Yosemite',
              9: 'Mavericks',
              8: 'Mountain Lion',
              7: 'Lion',
              6: 'Snow Leopard'
            }
            if (versionNames[minorVersion]) {
              osVersion += ` (${versionNames[minorVersion]})`
            }
          }
        }
        
        // Mac 아키텍처 감지
        if (userAgentLower.includes('arm64')) {
          deviceModel = 'Apple Silicon'
        } else if (userAgentLower.includes('intel')) {
          deviceModel = 'Intel'
        }
      } else if (userAgentLower.includes('linux')) {
        os = 'Linux'
        // Linux 배포판 감지 시도
        if (userAgentLower.includes('ubuntu')) {
          osVersion = 'Ubuntu'
        } else if (userAgentLower.includes('fedora')) {
          osVersion = 'Fedora'
        } else if (userAgentLower.includes('debian')) {
          osVersion = 'Debian'
        }
        
        // Linux 아키텍처 감지
        if (userAgentLower.includes('x86_64') || userAgentLower.includes('x64')) {
          deviceModel = 'x64'
        } else if (userAgentLower.includes('arm')) {
          deviceModel = 'ARM'
        } else {
          deviceModel = 'x86'
        }
      }

      // 브라우저 감지
      let browser = 'unknown'
      let browserVersion = 'unknown'

      if (userAgentLower.includes('crios')) {
        browser = 'Chrome iOS'
        const match = userAgent.match(/CriOS\/([0-9.]+)/)
        if (match) browserVersion = match[1]
      } else if (userAgentLower.includes('chrome')) {
        browser = 'Chrome'
        const match = userAgent.match(/Chrome\/([0-9.]+)/)
        if (match) browserVersion = match[1]
      } else if (userAgentLower.includes('safari')) {
        browser = 'Safari'
        const match = userAgent.match(/Version\/([0-9.]+)/)
        if (match) browserVersion = match[1]
      } else if (userAgentLower.includes('firefox')) {
        browser = 'Firefox'
        const match = userAgent.match(/Firefox\/([0-9.]+)/)
        if (match) browserVersion = match[1]
      } else if (userAgentLower.includes('edg/')) {
        browser = 'Edge'
        const match = userAgent.match(/Edg\/([0-9.]+)/)
        if (match) browserVersion = match[1]
      } else if (userAgentLower.includes('opr/')) {
        browser = 'Opera'
        const match = userAgent.match(/OPR\/([0-9.]+)/)
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
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    await addMemo(content)
    setContent('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (content.trim() && isOnline) {
        handleSubmit(e as any);
      }
    }
  };

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
      <div className="collection-info">
        <small>
          <div>앱 타입: {collectionInfo.appType}</div>
          <div>운영체제: {collectionInfo.os} {collectionInfo.osVersion} ({collectionInfo.deviceModel})</div>
          <div>브라우저: {collectionInfo.browser} {collectionInfo.browserVersion}</div>
          <div>User Agent: {collectionInfo.userAgent}</div>
        </small>
      </div>
    </form>
  )
} 