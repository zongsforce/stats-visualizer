/**
 * Detect iOS devices
 */
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Cross-platform clipboard utility that works on desktop and mobile devices
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern clipboard API first (works in secure contexts)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // iOS-specific handling due to its strict clipboard restrictions
    if (isIOS()) {
      return copyToClipboardIOS(text);
    }
    
    // Standard fallback for other browsers
    return copyToClipboardFallback(text);
    
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    
    // Last resort: show prompt for manual copying
    try {
      if (window.prompt) {
        const result = window.prompt('请复制此文本 / Please copy this text:', text);
        return result !== null;
      }
    } catch (promptErr) {
      console.error('All copy methods failed:', promptErr);
    }
    
    return false;
  }
}

/**
 * iOS-specific clipboard copy implementation
 */
function copyToClipboardIOS(text: string): boolean {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Critical iOS styling - element must be visible
  textArea.style.position = 'absolute';
  textArea.style.left = '-9999px';
  textArea.style.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';
  textArea.style.fontSize = '16px'; // Prevent zoom
  textArea.style.border = '0';
  textArea.style.padding = '0';
  textArea.style.margin = '0';
  textArea.style.background = 'transparent';
  textArea.setAttribute('readonly', '');
  
  document.body.appendChild(textArea);
  
  try {
    // Focus and select for iOS
    textArea.focus();
    textArea.setSelectionRange(0, text.length);
    
    // Trigger copy command immediately
    const successful = document.execCommand('copy');
    return successful;
    
  } finally {
    document.body.removeChild(textArea);
  }
}

/**
 * Standard fallback for other browsers
 */
function copyToClipboardFallback(text: string): boolean {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  textArea.setAttribute('readonly', '');
  textArea.style.opacity = '0';
  
  document.body.appendChild(textArea);
  
  try {
    textArea.focus();
    textArea.select();
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
}

/**
 * Check if clipboard functionality is available
 */
export function isClipboardSupported(): boolean {
  return !!(
    (navigator.clipboard && window.isSecureContext) ||
    document.queryCommandSupported?.('copy') ||
    window.prompt
  );
}