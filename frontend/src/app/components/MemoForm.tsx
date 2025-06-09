'use client'

import { useState, useEffect } from 'react'
import { useMemoStore } from '../store/memoStore'

export default function MemoForm() {
  const [content, setContent] = useState('')
  const [collectionInfo, setCollectionInfo] = useState({
    appType: '',
    os: '',
    userAgent: ''
  })
  const { addMemo, isOnline } = useMemoStore()

  useEffect(() => {
    // 앱 타입 감지
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                 (window.navigator as any).standalone || 
                 document.referrer.includes('android-app://')

    // 운영체제 감지
    const userAgent = navigator.userAgent.toLowerCase()
    let os = 'unknown'
    
    if (userAgent.includes('android')) {
      os = 'Android'
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      os = 'iOS'
    } else if (userAgent.includes('windows')) {
      os = 'Windows'
    } else if (userAgent.includes('macintosh') || userAgent.includes('mac os')) {
      os = 'MacOS'
    } else if (userAgent.includes('linux')) {
      os = 'Linux'
    }

    setCollectionInfo({
      appType: isPWA ? 'PWA' : 'Web',
      os: os,
      userAgent: navigator.userAgent
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
            <div>운영체제: {collectionInfo.os}</div>
            <div>User Agent: {collectionInfo.userAgent}</div>
          </small>
        </div>
      )}
    </form>
  )
} 