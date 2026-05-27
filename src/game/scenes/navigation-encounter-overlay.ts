import type { CharBuffer, GameAction } from '../../shared/types';
import { writeText, wrapText } from '../../shared/buffer-utils';
import { EncounterOverlay, type EncounterOverlayConfig, type OverlayRenderBounds } from './encounter-overlay';

type Phase = 'incoming' | 'typing' | 'complete';
type EncounterType = 'asteroid_belt' | 'space_debris' | 'space_storm';

const INCOMING_DURATION = 1200;
const CHAR_REVEAL_INTERVAL = 40;
const SPEAKER_ANIMATION_INTERVAL = 80;

const ENCOUNTER_LABELS: Record<EncounterType, string> = {
  asteroid_belt: 'ASTEROID BELT',
  space_debris: 'DEBRIS FIELD',
  space_storm: 'SPACE STORM',
};

const ENCOUNTER_TEXT: Record<EncounterType, string> = {
  asteroid_belt: 'DENSE ROCK FIELD DETECTED ON JUMP EXIT. BRACE FOR IMPACT.',
  space_debris: 'COLLISION ALERT — DEBRIS FIELD ON APPROACH. REDUCE SPEED.',
  space_storm: 'ELECTROMAGNETIC STORM DETECTED. HOLD STEADY.',
};

const SPEAKER_BAR_CHARS = ['_', '-', '=', '|'];

export interface NavigationEncounterOverlayConfig extends EncounterOverlayConfig {
  encounterType: EncounterType;
}

export class NavigationEncounterOverlay extends EncounterOverlay {
  private phase: Phase = 'incoming';
  private phaseAccum = 0;
  private charCount = 0;
  private encounterType: EncounterType;
  private wrappedText: string[] = [];
  private continueBounds: { row: number; colStart: number; colEnd: number } | null = null;

  constructor(config: NavigationEncounterOverlayConfig) {
    super(config);
    this.encounterType = config.encounterType;

    const fullText = ENCOUNTER_TEXT[this.encounterType];
    this.wrappedText = wrapText(fullText, 20);
  }

  override update(dt: number): void {
    this.phaseAccum += dt;

    if (this.phase === 'incoming') {
      if (this.phaseAccum >= INCOMING_DURATION) {
        this.phase = 'typing';
      }
    }

    if (this.phase === 'typing') {
      const typingElapsed = this.phaseAccum - INCOMING_DURATION;
      const nextCharCount = Math.floor(typingElapsed / CHAR_REVEAL_INTERVAL);
      this.charCount = Math.min(nextCharCount, this.getTotalCharCount());
      if (this.charCount >= this.getTotalCharCount()) {
        this.phase = 'complete';
      }
    }
  }

  override handleAction(action: GameAction): void {
    if (this.phase === 'incoming') {
      return;
    }
    if (action === 'SELECT' || action === 'NAV_1') {
      if (this.phase === 'typing') {
        this.charCount = this.getTotalCharCount();
        this.phase = 'complete';
      } else if (this.phase === 'complete') {
        this.onBegin();
      }
    }
  }

  override handleTap(col: number, row: number): void {
    if (this.phase === 'complete' && this.continueBounds) {
      const { row: btnRow, colStart, colEnd } = this.continueBounds;
      if (row === btnRow && col >= colStart && col <= colEnd) {
        this.onBegin();
      }
    } else if (this.phase === 'typing') {
      this.charCount = this.getTotalCharCount();
      this.phase = 'complete';
    }
  }

  override render(buffer: CharBuffer, bounds: OverlayRenderBounds): void {
    if (this.phase === 'incoming') {
      this.renderSpeakerBar(buffer, bounds);
    } else {
      this.renderDialogBox(buffer, bounds);
    }
  }

  private renderSpeakerBar(buffer: CharBuffer, bounds: OverlayRenderBounds): void {
    const speakerRow = bounds.bottomBot;
    const speakerStart = 13;
    const speakerEnd = 27;

    const prefix = '<)) ';
    writeText(buffer, speakerRow, speakerStart, prefix, 'cyan', 'bright-black');

    const offset = Math.floor(this.phaseAccum / SPEAKER_ANIMATION_INTERVAL);
    const charSequence = SPEAKER_BAR_CHARS;

    for (let col = speakerStart + prefix.length; col < speakerEnd && col < buffer[0].length; col++) {
      const idx = (col - (speakerStart + prefix.length) + offset) % charSequence.length;
      const char = charSequence[idx];
      writeText(buffer, speakerRow, col, char, 'cyan', 'bright-black');
    }
  }

  private renderDialogBox(buffer: CharBuffer, bounds: OverlayRenderBounds): void {
    const boxHeight = 7;
    const boxTop = bounds.viewportBot - 8;
    const boxBot = bounds.viewportBot - 1;
    const boxLeft = 2;
    const boxRight = bounds.width - 3;
    const boxWidth = boxRight - boxLeft;

    for (let col = boxLeft; col <= boxRight; col++) {
      writeText(buffer, boxTop, col, '+', 'white', 'black');
      writeText(buffer, boxBot, col, '+', 'white', 'black');
    }

    for (let row = boxTop + 1; row < boxBot; row++) {
      writeText(buffer, row, boxLeft, '|', 'white', 'black');
      writeText(buffer, row, boxRight, '|', 'white', 'black');
    }

    const label = ENCOUNTER_LABELS[this.encounterType];
    const labelCol = Math.floor((boxWidth - label.length) / 2) + boxLeft;
    writeText(buffer, boxTop + 1, labelCol, label, 'bright-yellow', 'black');

    let displayCharCount = this.charCount;
    let lineIdx = 0;
    let totalCharsProcessed = 0;

    const contentTop = boxTop + 2;
    const contentBottom = boxBot - 2;

    for (const line of this.wrappedText) {
      const displayRow = contentTop + lineIdx;
      if (displayRow >= contentBottom) break;

      const lineLength = line.length;
      const charsInThisLine = Math.min(lineLength, Math.max(0, displayCharCount - totalCharsProcessed));
      const displayLine = line.substring(0, charsInThisLine);

      const textCol = boxLeft + 2;
      writeText(buffer, displayRow, textCol, displayLine, 'white', 'black');
      totalCharsProcessed += lineLength;
      lineIdx++;
    }

    if (this.phase === 'complete') {
      const buttonText = '[ CONTINUE ]';
      const buttonRow = boxBot - 1;
      const buttonCol = Math.floor((boxWidth - buttonText.length) / 2) + boxLeft;

      const isKeyboard = this.context.primaryInput === 'keyboard';
      const buttonColor = isKeyboard ? 'bright-white' : 'bright-green';
      const buttonBg = isKeyboard ? 'green' : 'black';

      writeText(buffer, buttonRow, buttonCol, buttonText, buttonColor, buttonBg);

      this.continueBounds = {
        row: buttonRow,
        colStart: buttonCol,
        colEnd: buttonCol + buttonText.length - 1,
      };
    }

    this.renderSpeakerBar(buffer, bounds);
  }

  private getTotalCharCount(): number {
    return this.wrappedText.reduce((sum, line) => sum + line.length, 0);
  }
}
