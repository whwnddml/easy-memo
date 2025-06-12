export const isIOSPWA = () => {
  if (typeof window === 'undefined') return false;
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = (window.matchMedia('(display-mode: standalone)').matches) || 
                      (window.navigator as any).standalone || 
                      document.referrer.includes('ios-app://');
  
  return isIOS && isStandalone;
};

export const isSafari = () => {
  if (typeof window === 'undefined') return false;
  
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome');
}; 