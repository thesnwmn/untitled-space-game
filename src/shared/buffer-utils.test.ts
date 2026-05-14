import { describe, it, expect } from 'vitest';
import { wrapText } from './buffer-utils';

describe('wrapText', () => {
  it('returns [] for an empty string', () => {
    expect(wrapText('', 36)).toEqual([]);
  });

  it('returns the word alone for a single short word', () => {
    expect(wrapText('hello', 36)).toEqual(['hello']);
  });

  it('returns a single word even if it exceeds maxWidth', () => {
    const longWord = 'supercalifragilisticexpialidocious';
    expect(wrapText(longWord, 5)).toEqual([longWord]);
  });

  it('wraps a multi-word string at word boundaries within maxWidth', () => {
    const result = wrapText('The war ended six years ago.', 20);
    for (const line of result) {
      expect(line.length).toBeLessThanOrEqual(20);
    }
    expect(result.join(' ')).toBe('The war ended six years ago.');
  });

  it('keeps words on one line when they exactly fill maxWidth', () => {
    const text = '123456789 123456789';
    expect(wrapText(text, 19)).toEqual(['123456789 123456789']);
  });
});
