import { copyToClipboard } from './clipboard';

// Mock clipboard API
const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
});

// Mock execCommand as fallback
Object.defineProperty(document, 'execCommand', {
  value: jest.fn(),
  writable: true,
});

describe('Clipboard Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('copyToClipboard', () => {
    it('should copy text using modern clipboard API', async () => {
      mockWriteText.mockResolvedValue(undefined);
      
      const result = await copyToClipboard('test text');
      
      expect(mockWriteText).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
    });

    it('should return false when clipboard API fails', async () => {
      mockWriteText.mockRejectedValue(new Error('Failed'));
      
      const result = await copyToClipboard('test text');
      
      expect(result).toBe(false);
    });

    it('should handle empty text', async () => {
      mockWriteText.mockResolvedValue(undefined);
      
      const result = await copyToClipboard('');
      
      expect(mockWriteText).toHaveBeenCalledWith('');
      expect(result).toBe(true);
    });

    it('should use fallback when clipboard API is not available', async () => {
      // Mock clipboard as undefined
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });

      // Mock document methods for fallback
      const mockCreateElement = jest.fn(() => ({
        value: '',
        select: jest.fn(),
        setSelectionRange: jest.fn(),
        style: { position: '', left: '' },
      }));
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const mockExecCommand = jest.fn().mockReturnValue(true);

      Object.defineProperty(document, 'createElement', {
        value: mockCreateElement,
      });
      Object.defineProperty(document.body, 'appendChild', {
        value: mockAppendChild,
      });
      Object.defineProperty(document.body, 'removeChild', {
        value: mockRemoveChild,
      });
      Object.defineProperty(document, 'execCommand', {
        value: mockExecCommand,
      });

      const result = await copyToClipboard('fallback text');

      expect(mockExecCommand).toHaveBeenCalledWith('copy');
      expect(result).toBe(true);

      // Restore clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
      });
    });
  });
});