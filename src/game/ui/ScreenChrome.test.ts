import { describe, it, expect } from 'vitest';
import { ScreenChrome } from './ScreenChrome';
import type { CharBuffer, Color, GameContext } from '../../shared/types';

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

function rowText(buffer: CharBuffer, row: number): string {
  return buffer[row].map(c => c.char).join('');
}

const baseContext: GameContext = {
  environment: 'browser',
  primaryInput: 'keyboard',
  debug: false,
  systemId: 'sol',
  destinationId: 'elysium-station',
  credits: 5000,
};

const defaultConfig = {
  showHeader: true,
  showFooter: true,
  navOptions: [{ id: 'undock', label: 'UNDOCK' }],
};

describe('ScreenChrome', () => {
  it('row 0 contains system name from context', () => {
    const chrome = new ScreenChrome(baseContext);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, defaultConfig);
    expect(rowText(buf, 0)).toContain('SOL');
  });

  it('row 0 right zone shows [M] MENU', () => {
    const chrome = new ScreenChrome(baseContext);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, defaultConfig);
    expect(rowText(buf, 0)).toContain('[M]');
    expect(rowText(buf, 0)).toContain('MENU');
  });

  it('row 0 fill cells between name and right zone are :', () => {
    const chrome = new ScreenChrome(baseContext);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, defaultConfig);
    // ":: SOL" = 6 chars; right zone " [M] MENU ::" = 12 chars; fill from col 6 to 27
    const prefixAndName = ':: SOL';
    const fillStart = prefixAndName.length;
    const fillEnd = 40 - 12; // 28
    for (let c = fillStart; c < fillEnd; c++) {
      expect(buf[0][c].char).toBe(':');
      expect(buf[0][c].fg).toBe('bright-black');
    }
  });

  it('row 1 contains destination name from context', () => {
    const chrome = new ScreenChrome(baseContext);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, defaultConfig);
    expect(rowText(buf, 1)).toContain('ELYSIUM STATION');
  });

  it('row 1 shows IN SPACE when context.destinationId is null', () => {
    const ctx: GameContext = { ...baseContext, destinationId: null };
    const chrome = new ScreenChrome(ctx);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, defaultConfig);
    expect(rowText(buf, 1)).toContain('IN SPACE');
  });

  it('row 1 right zone shows credits formatted with comma separator', () => {
    const ctx: GameContext = { ...baseContext, credits: 5000 };
    const chrome = new ScreenChrome(ctx);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, defaultConfig);
    expect(rowText(buf, 1)).toContain('5,000');
  });

  it('row 2 is all spaces when showHeader is true', () => {
    const chrome = new ScreenChrome(baseContext);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, defaultConfig);
    expect(rowText(buf, 2).trim()).toBe('');
  });

  it('footer row (h-1) shows numbered nav labels', () => {
    const chrome = new ScreenChrome(baseContext);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, { ...defaultConfig, navOptions: [{ id: 'undock', label: 'UNDOCK' }] });
    const text = rowText(buf, 29);
    expect(text).toContain('[1]');
    expect(text).toContain('UNDOCK');
  });

  it('footer row fills remainder with : chars after nav labels', () => {
    const chrome = new ScreenChrome(baseContext);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, { ...defaultConfig, navOptions: [{ id: 'undock', label: 'UNDOCK' }] });
    // ":: [1] UNDOCK" = 3+3+7 = 13 chars; rest should be ':'
    const row = 29;
    const lastNonColon = buf[row].map(c => c.char).lastIndexOf('[');
    // chars after the button should all be ':'
    const afterEnd = lastNonColon + '[1]'.length + ' UNDOCK'.length;
    for (let c = afterEnd; c < 40; c++) {
      expect(buf[row][c].char).toBe(':');
    }
  });

  it('footer row is entirely : when navOptions is empty', () => {
    const chrome = new ScreenChrome(baseContext);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, { ...defaultConfig, navOptions: [] });
    for (let c = 0; c < 40; c++) {
      expect(buf[29][c].char).toBe(':');
      expect(buf[29][c].fg).toBe('bright-black');
    }
  });

  it('no chrome rows written when showHeader is false', () => {
    const chrome = new ScreenChrome(baseContext);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, { showHeader: false, showFooter: false, navOptions: [] });
    // rows 0 and 1 should remain as spaces
    expect(rowText(buf, 0).trim()).toBe('');
    expect(rowText(buf, 1).trim()).toBe('');
  });

  it('no chrome written at h-1 when showFooter is false', () => {
    const chrome = new ScreenChrome(baseContext);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, { showHeader: false, showFooter: false, navOptions: [] });
    expect(rowText(buf, 29).trim()).toBe('');
  });

  it('hitTestNav returns nav id when column falls within that button', () => {
    const chrome = new ScreenChrome(baseContext);
    const buf = makeBuffer(40, 30);
    chrome.render(buf, { ...defaultConfig, navOptions: [{ id: 'undock', label: 'UNDOCK' }] });
    // ":: [1] UNDOCK" — button starts at col 3 ("[1]") length 3 + " UNDOCK" length 7 = endCol 13
    expect(chrome.hitTestNav(3, 29)).toBe('undock');
    expect(chrome.hitTestNav(12, 29)).toBe('undock');
  });

  it('hitTestNav returns null before render() and for non-footer rows', () => {
    const chrome = new ScreenChrome(baseContext);
    expect(chrome.hitTestNav(3, 29)).toBeNull();

    const buf = makeBuffer(40, 30);
    chrome.render(buf, defaultConfig);
    // row 0 is not the footer
    expect(chrome.hitTestNav(3, 0)).toBeNull();
    // col out of any button range
    expect(chrome.hitTestNav(39, 29)).toBeNull();
  });
});
