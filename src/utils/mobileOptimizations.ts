/**
 * Mobile-first UX optimizations and utilities
 */

// Touch target sizes (following Material Design and Apple HIG)
export const TOUCH_TARGETS = {
  minimum: 44, // iOS minimum
  comfortable: 48, // Material Design recommended
  large: 56, // For primary actions
} as const;

// Thumb reach zones for mobile UI
export const THUMB_ZONES = {
  easy: 'bottom 40%', // Easy to reach with thumb
  medium: 'middle 30%', // Requires stretch
  hard: 'top 30%', // Hard to reach with thumb
} as const;

// Mobile breakpoints
export const MOBILE_BREAKPOINTS = {
  small: 320, // iPhone SE
  medium: 375, // iPhone standard
  large: 414, // iPhone Plus
  tablet: 768, // iPad portrait
} as const;

// Mobile-specific CSS utilities
export const mobileStyles = {
  // Touch-friendly button
  touchButton: {
    minHeight: TOUCH_TARGETS.comfortable,
    minWidth: TOUCH_TARGETS.comfortable,
    padding: '12px 16px',
    fontSize: '16px', // Prevents zoom on iOS
    borderRadius: '8px',
    cursor: 'pointer',
    '&:focus': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: '2px',
    },
  },
  
  // Primary action button
  primaryButton: {
    minHeight: TOUCH_TARGETS.large,
    minWidth: TOUCH_TARGETS.large,
    fontSize: '18px',
    fontWeight: 600,
    borderRadius: '12px',
  },
  
  // Input field optimizations
  touchInput: {
    minHeight: TOUCH_TARGETS.comfortable,
    fontSize: '16px', // Prevents zoom on iOS
    padding: '12px 16px',
    borderRadius: '8px',
    '-webkit-appearance': 'none', // Remove iOS styling
    '&:focus': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: '2px',
    },
  },
  
  // Safe area handling
  safeArea: {
    paddingTop: 'env(safe-area-inset-top)',
    paddingRight: 'env(safe-area-inset-right)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
  },
  
  // Scroll optimization
  smoothScroll: {
    '-webkit-overflow-scrolling': 'touch',
    scrollBehavior: 'smooth',
  },
  
  // Performance optimization
  willChange: {
    willChange: 'transform',
  },
} as const;

// Device detection utilities
export const deviceDetection = {
  isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
  isAndroid: () => /Android/.test(navigator.userAgent),
  isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  hasNotch: () => 
    window.CSS && 
    window.CSS.supports && 
    window.CSS.supports('padding-top: env(safe-area-inset-top)'),
};

// Haptic feedback for mobile
export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 10, 10]);
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 10, 50]);
    }
  },
};

// Touch gesture utilities
export const touchGestures = {
  // Prevent double-tap zoom on buttons
  preventDoubleZoom: {
    touchAction: 'manipulation',
  },
  
  // Enable swipe gestures
  enableSwipe: {
    touchAction: 'pan-x pan-y',
  },
  
  // Disable touch callout (iOS context menu)
  disableCallout: {
    '-webkit-touch-callout': 'none',
    '-webkit-user-select': 'none',
    userSelect: 'none',
  },
};

// Mobile performance optimizations
export const performanceOptimizations = {
  // Lazy loading utility
  createIntersectionObserver: (callback: IntersectionObserverCallback) => {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      return null;
    }
    
    return new IntersectionObserver(callback, {
      rootMargin: '50px 0px',
      threshold: 0.1,
    });
  },
  
  // Debounce utility for performance
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T => {
    let timeout: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    }) as T;
  },
  
  // Throttle utility for scroll events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean;
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    }) as T;
  },
};

// Mobile accessibility helpers
export const a11yMobile = {
  // Screen reader announcements
  announce: (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
  
  // Focus management for mobile
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    
    return () => element.removeEventListener('keydown', handleTabKey);
  },
};

// Mobile layout utilities
export const mobileLayout = {
  // Calculate thumb reach zone
  getThumbZone: (screenHeight: number) => ({
    easy: { bottom: 0, height: screenHeight * 0.4 },
    medium: { bottom: screenHeight * 0.4, height: screenHeight * 0.3 },
    hard: { bottom: screenHeight * 0.7, height: screenHeight * 0.3 },
  }),
  
  // Calculate safe content area
  getSafeArea: () => ({
    top: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0px',
    right: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)') || '0px',
    bottom: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0px',
    left: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)') || '0px',
  }),
};

export default {
  TOUCH_TARGETS,
  THUMB_ZONES,
  MOBILE_BREAKPOINTS,
  mobileStyles,
  deviceDetection,
  hapticFeedback,
  touchGestures,
  performanceOptimizations,
  a11yMobile,
  mobileLayout,
};