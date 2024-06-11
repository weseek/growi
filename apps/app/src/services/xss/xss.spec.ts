import { Xss } from './xss';

describe('XSSService', () => {

  describe('without config', () => {
    const xss = new Xss();

    test('should be sanitize script tag', () => {
      // Act
      const result = xss.process('<script>alert("XSS")</script>');

      // Assert
      expect(result).toBe('alert("XSS")');
    });

    test('should be sanitize nested script tag recursively', () => {
      // Act
      const result = xss.process('<scr<script>ipt>alert("XSS")</scr<script>ipt>');

      // Assert
      expect(result).toBe('alert("XSS")');
    });

    // for https://github.com/weseek/growi/issues/221
    test('should not be sanitize blockquote', () => {
      // Act
      const result = xss.process('> foo\n> bar');

      // Assert
      expect(result).toBe('> foo\n> bar');
    });

    // https://github.com/weseek/growi/pull/505
    test('should not be sanitize next closing-tag', () => {
      // Act
      const result = xss.process('<code /><span>text</span>');

      // Assert
      expect(result).toBe('text');
    });

  });

});
