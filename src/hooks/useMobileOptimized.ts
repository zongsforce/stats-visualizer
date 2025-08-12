import { useState, useEffect, useCallback } from 'react';
import { deviceDetection, hapticFeedback, a11yMobile, performanceOptimizations } from '../utils/mobileOptimizations';

export interface MobileCapabilities {
  isTouch: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  hasNotch: boolean;
  screenSize: 'small' | 'medium' | 'large' | 'tablet';
  orientation: 'portrait' | 'landscape';
  hasHaptics: boolean;
}

export interface MobileOptimizations {
  capabilities: MobileCapabilities;
  feedback: {
    light: () => void;
    medium: () => void;
    success: () => void;
    error: () => void;
  };
  announce: (message: string) => void;
  debounce: typeof performanceOptimizations.debounce;
  throttle: typeof performanceOptimizations.throttle;
  preventZoom: () => void;
  enableZoom: () => void;
}

export function useMobileOptimized(): MobileOptimizations {
  const [capabilities, setCapabilities] = useState<MobileCapabilities>({
    isTouch: false,
    isIOS: false,
    isAndroid: false,
    hasNotch: false,
    screenSize: 'medium',
    orientation: 'portrait',
    hasHaptics: false,
  });

  // Detect device capabilities
  useEffect(() => {
    const updateCapabilities = () => {
      const width = window.innerWidth;
      let screenSize: MobileCapabilities['screenSize'] = 'medium';
      
      if (width <= 320) screenSize = 'small';
      else if (width <= 414) screenSize = 'medium';
      else if (width <= 768) screenSize = 'large';
      else screenSize = 'tablet';

      setCapabilities({
        isTouch: deviceDetection.isTouchDevice(),
        isIOS: deviceDetection.isIOS(),
        isAndroid: deviceDetection.isAndroid(),
        hasNotch: deviceDetection.hasNotch(),
        screenSize,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        hasHaptics: 'vibrate' in navigator,
      });
    };

    updateCapabilities();

    const handleResize = performanceOptimizations.throttle(updateCapabilities, 150);
    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated
      setTimeout(updateCapabilities, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Viewport zoom control for iOS
  const preventZoom = useCallback(() => {
    if (capabilities.isIOS) {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
    }
  }, [capabilities.isIOS]);

  const enableZoom = useCallback(() => {
    if (capabilities.isIOS) {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
        );
      }
    }
  }, [capabilities.isIOS]);

  // Enhanced haptic feedback
  const feedback = {
    light: () => {
      if (capabilities.hasHaptics) {
        hapticFeedback.light();
      }
    },
    medium: () => {
      if (capabilities.hasHaptics) {
        hapticFeedback.medium();
      }
    },
    success: () => {
      if (capabilities.hasHaptics) {
        hapticFeedback.success();
      }
    },
    error: () => {
      if (capabilities.hasHaptics) {
        hapticFeedback.error();
      }
    },
  };

  return {
    capabilities,
    feedback,
    announce: a11yMobile.announce,
    debounce: performanceOptimizations.debounce,
    throttle: performanceOptimizations.throttle,
    preventZoom,
    enableZoom,
  };
}

// Hook for mobile-specific touch handling
export function useTouchHandling() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const getSwipeDirection = useCallback(() => {
    if (!touchStart || !touchEnd) return null;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      return null;
    }
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'left' : 'right';
    } else {
      return deltaY > 0 ? 'up' : 'down';
    }
  }, [touchStart, touchEnd]);

  return {
    handleTouchStart,
    handleTouchMove,
    getSwipeDirection,
    touchStart,
    touchEnd,
  };
}

// Hook for mobile performance optimization
export function useMobilePerformance() {
  const [isVisible, setIsVisible] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(true);

  // Page visibility API for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Intersection observer for lazy loading
  const observeElement = useCallback((element: HTMLElement, callback: (isIntersecting: boolean) => void) => {
    const observer = performanceOptimizations.createIntersectionObserver((entries) => {
      entries.forEach((entry) => {
        callback(entry.isIntersecting);
        setIsIntersecting(entry.isIntersecting);
      });
    });

    if (observer) {
      observer.observe(element);
      return () => observer.unobserve(element);
    }
    
    return () => {};
  }, []);

  return {
    isVisible,
    isIntersecting,
    observeElement,
  };
}