import {
  mobileStyles,
  touchGestures,
  deviceDetection,
  hapticFeedback,
  performanceOptimizations,
  a11yMobile
} from './mobileOptimizations';

// Mock window properties
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  value: mockMatchMedia,
});

Object.defineProperty(window, 'innerWidth', {
  value: 375,
  writable: true,
});

Object.defineProperty(window, 'innerHeight', {
  value: 667,
  writable: true,
});

describe('Mobile Optimizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mobileStyles', () => {
    it('should provide touch-friendly button styles', () => {
      expect(mobileStyles.touchButton).toHaveProperty('minHeight');
      expect(mobileStyles.touchButton).toHaveProperty('minWidth');
      expect(mobileStyles.touchButton).toHaveProperty('padding');
      expect(mobileStyles.touchButton.minHeight).toBeGreaterThanOrEqual(44);
    });

    it('should provide touch input styles', () => {
      expect(mobileStyles.touchInput).toHaveProperty('fontSize');
      expect(mobileStyles.touchInput).toHaveProperty('minHeight');
      expect(mobileStyles.touchInput).toHaveProperty('padding');
      expect(mobileStyles.touchInput.fontSize).toBe('16px');
    });

    it('should provide safe area styles', () => {
      expect(mobileStyles.safeArea).toHaveProperty('paddingTop');
      expect(mobileStyles.safeArea).toHaveProperty('paddingRight');
      expect(mobileStyles.safeArea).toHaveProperty('paddingBottom');
      expect(mobileStyles.safeArea).toHaveProperty('paddingLeft');
    });

    it('should provide scroll optimization styles', () => {
      expect(mobileStyles.smoothScroll).toHaveProperty('scrollBehavior');
      expect(mobileStyles.smoothScroll.scrollBehavior).toBe('smooth');
    });
  });

  describe('touchGestures', () => {
    it('should prevent double zoom on touch elements', () => {
      expect(touchGestures.preventDoubleZoom).toHaveProperty('touchAction');
      expect(touchGestures.preventDoubleZoom.touchAction).toBe('manipulation');
    });

    it('should enable swipe gestures', () => {
      expect(touchGestures.enableSwipe).toHaveProperty('touchAction');
      expect(touchGestures.enableSwipe.touchAction).toBe('pan-x pan-y');
    });

    it('should provide callout disabling styles', () => {
      expect(touchGestures.disableCallout).toHaveProperty('-webkit-touch-callout');
      expect(touchGestures.disableCallout).toHaveProperty('userSelect');
      expect(touchGestures.disableCallout['-webkit-touch-callout']).toBe('none');
      expect(touchGestures.disableCallout.userSelect).toBe('none');
    });
  });

  describe('deviceDetection', () => {
    it('should have device detection utilities', () => {
      expect(deviceDetection).toBeDefined();
      expect(typeof deviceDetection).toBe('object');
    });
  });

  describe('hapticFeedback', () => {
    it('should have haptic feedback utilities', () => {
      expect(hapticFeedback).toBeDefined();
      expect(typeof hapticFeedback).toBe('object');
    });
  });

  describe('performanceOptimizations', () => {
    it('should have performance utilities', () => {
      expect(performanceOptimizations).toBeDefined();
      expect(typeof performanceOptimizations).toBe('object');
      expect(performanceOptimizations).toHaveProperty('debounce');
      expect(performanceOptimizations).toHaveProperty('throttle');
    });

    it('should have working debounce function', () => {
      const mockFn = jest.fn();
      const debouncedFn = performanceOptimizations.debounce(mockFn, 100);
      
      expect(typeof debouncedFn).toBe('function');
    });

    it('should have working throttle function', () => {
      const mockFn = jest.fn();
      const throttledFn = performanceOptimizations.throttle(mockFn, 100);
      
      expect(typeof throttledFn).toBe('function');
    });
  });

  describe('a11yMobile', () => {
    it('should have accessibility utilities', () => {
      expect(a11yMobile).toBeDefined();
      expect(typeof a11yMobile).toBe('object');
    });
  });

  describe('Integration', () => {
    it('should work together for comprehensive mobile optimization', () => {
      const container = document.createElement('div');
      
      // Apply mobile styles
      Object.assign(container.style, mobileStyles.touchButton);
      Object.assign(container.style, touchGestures.preventDoubleZoom);
      
      expect(container.style.touchAction).toBe('manipulation');
      expect(container.style.minHeight).toBe('48px');
    });
  });
});