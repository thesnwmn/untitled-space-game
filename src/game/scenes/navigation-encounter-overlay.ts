import type { CharBuffer, GameAction } from '../../shared/types';
import { writeText, wrapText } from '../../shared/buffer-utils';
import { EncounterOverlay, type EncounterOverlayConfig } from './encounter-overlay';

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

  override handleTap(_col: number, _row: number): void {
    if (this.phase === 'typing') {
      this.charCount = this.getTotalCharCount();
      this.phase = 'complete';
    } else if (this.phase === 'complete') {
      this.onBegin();
    }
  }

  override render(buffer: CharBuffer, top: number, bottom: number, left: number, right: number): void {
    if (this.phase === 'incoming') {
      this.renderSpeakerBar(buffer, top, bottom, left, right);
    } else {
      this.renderMessagePanel(buffer, top, bottom, left, right);
      this.renderSpeakerBar(buffer, top, bottom, left, right);
    }
  }

  private renderSpeakerBar(buffer: CharBuffer, top: number, bottom: number, left: number, right: number): void {
    const speakerRow = bottom - 1;
    const speakerStart = left + 2;

    const prefix = '<)) ';
    writeText(buffer, speakerRow, speakerStart, prefix, 'cyan', 'black');

    const offset = Math.floor(this.phaseAccum / SPEAKER_ANIMATION_INTERVAL);
    const charSequence = SPEAKER_BAR_CHARS;
    const speakerEnd = Math.min(speakerStart + 12, right);

    for (let col = speakerStart + prefix.length; col < speakerEnd; col++) {
      const idx = (col - (speakerStart + prefix.length) + offset) % charSequence.length;
      const char = charSequence[idx];
      writeText(buffer, speakerRow, col, char, 'cyan', 'black');
    }
  }

  private renderMessagePanel(buffer: CharBuffer, top: number, bottom: number, left: number, right: number): void {
    const panelTop = top + 1;
    const panelBottom = bottom - 2;
    const panelWidth = right - left;

    const label = ENCOUNTER_LABELS[this.encounterType];
    const labelCol = Math.floor((panelWidth - label.length) / 2) + left;
    writeText(buffer, panelTop, labelCol, label, 'bright-yellow', 'black');

    let displayCharCount = this.charCount;
    let lineIdx = 0;
    let totalCharsProcessed = 0;

    for (const line of this.wrappedText) {
      const displayRow = panelTop + 2 + lineIdx;
      if (displayRow >= panelBottom) break;

      const lineLength = line.length;
      const charsInThisLine = Math.min(lineLength, Math.max(0, displayCharCount - totalCharsProcessed));
      const displayLine = line.substring(0, charsInThisLine);

      const textCol = left + 1;
      writeText(buffer, displayRow, textCol, displayLine, 'white', 'black');
      totalCharsProcessed += lineLength;
      lineIdx++;
    }

    if (this.phase === 'complete') {
      const buttonText = '[ CONTINUE ]';
      const buttonRow = panelBottom - 1;
      const buttonCol = Math.floor((panelWidth - buttonText.length) / 2) + left;
      writeText(buffer, buttonRow, buttonCol, buttonText, 'bright-green', 'black');
    }
  }

  private getTotalCharCount(): number {
    return this.wrappedText.reduce((sum, line) => sum + line.length, 0);
  }
}
