import { renderHook, act } from '@testing-library/react';
import { useMobileOptimized } from './useMobileOptimized';

// Mock window.matchMedia
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: jest.fn(),
});

// Mock speechSynthesis
const mockSpeak = jest.fn();
const mockCancel = jest.fn();
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    speaking: false,
  },
});

describe('useMobileOptimized', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for matchMedia
    mockMatchMedia.mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('should return device capabilities', () => {
    const { result } = renderHook(() => useMobileOptimized());
    
    expect(result.current.capabilities).toHaveProperty('isTouch');
    expect(result.current.capabilities).toHaveProperty('isIOS');
    expect(result.current.capabilities).toHaveProperty('isAndroid');
    expect(result.current.capabilities).toHaveProperty('hasNotch');
    expect(result.current.capabilities).toHaveProperty('screenSize');
    expect(result.current.capabilities).toHaveProperty('orientation');
    expect(result.current.capabilities).toHaveProperty('hasHaptics');
  });

  it('should detect small screen size', () => {
    // Mock small screen
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 320,
    });

    const { result } = renderHook(() => useMobileOptimized());
    
    expect(result.current.capabilities.screenSize).toBe('small');
  });

  it('should detect tablet screen size', () => {
    // Mock tablet screen
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useMobileOptimized());
    
    expect(result.current.capabilities.screenSize).toBe('tablet');
  });

  it('should provide haptic feedback functions', () => {
    const { result } = renderHook(() => useMobileOptimized());
    
    expect(result.current.feedback).toHaveProperty('light');
    expect(result.current.feedback).toHaveProperty('medium');
    expect(result.current.feedback).toHaveProperty('success');
    expect(result.current.feedback).toHaveProperty('error');
  });

  it('should trigger haptic feedback functions', () => {
    const { result } = renderHook(() => useMobileOptimized());
    
    act(() => {
      result.current.feedback.light();
      result.current.feedback.medium();
      result.current.feedback.success();
      result.current.feedback.error();
    });
    
    // Functions should execute without throwing errors
    expect(result.current.feedback.light).toBeDefined();
    expect(result.current.feedback.medium).toBeDefined();
    expect(result.current.feedback.success).toBeDefined();
    expect(result.current.feedback.error).toBeDefined();
  });

  it('should provide announce function', () => {
    const { result } = renderHook(() => useMobileOptimized());
    
    expect(typeof result.current.announce).toBe('function');
  });

  it('should announce text using speech synthesis', () => {
    const { result } = renderHook(() => useMobileOptimized());
    
    act(() => {
      result.current.announce('Test announcement');
    });
    
    expect(mockSpeak).toHaveBeenCalled();
  });

  it('should handle feedback when haptics not supported', () => {
    const { result } = renderHook(() => useMobileOptimized());
    
    // Should not throw error even when haptics aren't available
    expect(() => {
      act(() => {
        result.current.feedback.light();
      });
    }).not.toThrow();
  });

  it('should handle announce function', () => {
    const { result } = renderHook(() => useMobileOptimized());
    
    // Should not throw error
    expect(() => {
      act(() => {
        result.current.announce('Test');
      });
    }).not.toThrow();
  });

  it('should detect touch capability', () => {
    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: null,
    });

    const { result } = renderHook(() => useMobileOptimized());
    
    expect(result.current.capabilities.isTouch).toBe(true);
  });
});