import type { InputHandler, GameContext, CharBuffer, Color, Scene, GameAction } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { ScreenChrome, CONTENT_TOP, CONTENT_TOP_NO_HEADER, contentBottom } from '../ui/screen-chrome';
import type { NavOption, ChromeConfig } from '../ui/screen-chrome';
import type { PlayerState } from '../player-state';

export interface BaseSceneOptions {
  navOptions: ReadonlyArray<NavOption>;
  showHeader?: boolean;
  showFooter?: boolean;
  title?: string;
  summary?: string[];
  tabs?: string[];
  onMenu?: () => void;
}

export abstract class BaseScene implements Scene {
  protected readonly player: PlayerState;
  protected readonly chrome: ScreenChrome;
  protected activeTabIdx = 0;
  protected activated = false;
  private readonly opts: BaseSceneOptions;

  constructor(inputHandler: InputHandler, context: GameContext, player: PlayerState, options: BaseSceneOptions) {
    this.player = player;
    this.chrome = new ScreenChrome(context, player);
    this.opts = options;

    if (inputHandler.onCharInput) {
      inputHandler.onCharInput((char) => {
        if (this.activated) return;
        this.handleCharInput(char);
      });
    }

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (this.preHandleAction(action)) return;
      if (action === 'MENU' && options.onMenu) { options.onMenu(); return; }
      if (options.tabs) {
        if (action === 'LEFT') {
          const newIdx = Math.max(0, this.activeTabIdx - 1);
          if (newIdx !== this.activeTabIdx) { this.activeTabIdx = newIdx; this.onTabChange(newIdx); }
          return;
        }
        if (action === 'RIGHT') {
          const newIdx = Math.min(options.tabs.length - 1, this.activeTabIdx + 1);
          if (newIdx !== this.activeTabIdx) { this.activeTabIdx = newIdx; this.onTabChange(newIdx); }
          return;
        }
      }
      this.handleAction(action);
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((col, row) => {
        if (this.activated) return;
        if (this.preHandleTap(col, row)) return;
        const navId = this.chrome.hitTestNav(col, row);
        if (navId !== null) { this.handleNavTap(navId); return; }
        if (this.chrome.hitTestHeader(col, row) === 'menu' && options.onMenu) {
          options.onMenu(); return;
        }
        if (options.tabs && options.title !== undefined) {
          const base = (options.showHeader ?? true) ? CONTENT_TOP : CONTENT_TOP_NO_HEADER;
          const N = options.summary?.length ?? 0;
          const tabRow = base + 3 + N;
          if (row === tabRow) {
            let c = 3;
            for (let i = 0; i < options.tabs.length; i++) {
              const len = options.tabs[i].length + 2;
              if (col >= c && col < c + len) {
                if (i !== this.activeTabIdx) { this.activeTabIdx = i; this.onTabChange(i); }
                return;
              }
              c += len + 1;
            }
            return;
          }
        }
        this.handleTap(col, row);
      });
    }
  }

  protected preHandleAction(_action: GameAction): boolean { return false; }
  protected preHandleTap(_col: number, _row: number): boolean { return false; }
  protected handleAction(_action: GameAction): void {}
  protected handleTap(_col: number, _row: number): void {}
  protected handleNavTap(_navId: string): void {}
  protected handleCharInput(_char: string): void {}
  protected onTabChange(_newIdx: number): void {}

  protected buildChromeConfig(): ChromeConfig {
    return {
      showHeader: this.opts.showHeader ?? true,
      showFooter: this.opts.showFooter ?? true,
      navOptions: this.opts.navOptions,
    };
  }

  public suspend(): void { this.activated = true; }
  public resume(): void { this.activated = false; }
  public update(_dt: number): void {}

  protected abstract renderContent(buffer: CharBuffer, top: number, bottom: number): void;

  public render(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;
    const opts = this.opts;

    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++)
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };

    const config = this.buildChromeConfig();
    this.chrome.render(buffer, config);

    const showHeader = opts.showHeader ?? true;
    const showFooter = opts.showFooter ?? true;
    const base = showHeader ? CONTENT_TOP : CONTENT_TOP_NO_HEADER;
    const N = opts.summary?.length ?? 0;
    const bottom = contentBottom(h, showFooter);

    let top: number;
    if (opts.title !== undefined) {
      writeText(buffer, base,     2, opts.title,                    'bright-white', 'black');
      writeText(buffer, base + 1, 2, "'".repeat(opts.title.length), 'bright-black', 'black');

      for (let i = 0; i < N; i++) {
        writeText(buffer, base + 2 + i, 2, opts.summary![i], 'bright-black', 'black');
      }

      if (opts.tabs) {
        const tabRow = base + 3 + N;
        let tc = 2;
        if (tabRow < h) buffer[tabRow][tc] = { char: '|', fg: 'bright-black', bg: 'black' };
        tc++;
        for (let i = 0; i < opts.tabs.length; i++) {
          const isActive = i === this.activeTabIdx;
          const content = ` ${opts.tabs[i]} `;
          const fg: Color = isActive ? 'black' : 'white';
          const bg: Color = isActive ? 'green' : 'black';
          for (const ch of content) {
            if (tabRow < h && tc < w) buffer[tabRow][tc] = { char: ch, fg, bg };
            tc++;
          }
          if (tabRow < h && tc < w) buffer[tabRow][tc] = { char: '|', fg: 'bright-black', bg: 'black' };
          tc++;
        }
        top = base + 5 + N;
      } else {
        top = base + 3 + N;
      }
    } else {
      top = base;
    }

    this.renderContent(buffer, top, bottom);
  }
}
