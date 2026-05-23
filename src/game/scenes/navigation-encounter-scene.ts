import type { InputHandler, CharBuffer, GameContext, GameAction } from '../../shared/types';
import { writeText, wrapText } from '../../shared/buffer-utils';
import type { PlayerState } from '../player-state';
import { BaseScene } from './base-scene';
import { Starfield, hashStringToSeed } from './starfield';

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

const GAUGE_LEFT_START = 0;
const GAUGE_LEFT_END = 4;
const GAUGE_MID_START = 18;
const GAUGE_MID_END = 21;
const GAUGE_RIGHT_START = 35;
const GAUGE_RIGHT_END = 39;
const RADAR_START = 13;
const RADAR_END = 27;

const SPEAKER_BAR_CHARS = ['_', '-', '=', '|'];

function lcgRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export class NavigationEncounterScene extends BaseScene {
  private phase: Phase = 'incoming';
  private phaseAccum = 0;
  private charCount = 0;
  private encounterType: EncounterType;
  private starfield: Starfield;
  private wrappedText: string[] = [];
  private lastInputAction: GameAction | null = null;

  constructor(
    input: InputHandler,
    context: GameContext,
    player: PlayerState,
    encounterType: EncounterType,
    private readonly onBegin: () => void,
  ) {
    super(input, context, player, { navOptions: [] });
    this.encounterType = encounterType;

    const seed = hashStringToSeed(player.destinationId || '');
    this.starfield = new Starfield(seed);

    const fullText = ENCOUNTER_TEXT[encounterType];
    this.wrappedText = wrapText(fullText, 38);

    input.onAction((action) => {
      this.lastInputAction = action;
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
    });

    if (input.onTap) {
      input.onTap(() => {
        if (this.phase === 'typing') {
          this.charCount = this.getTotalCharCount();
          this.phase = 'complete';
        } else if (this.phase === 'complete') {
          this.onBegin();
        }
      });
    }
  }

  public override update(dt: number): void {
    super.update(dt);
    this.starfield.update(dt);
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

  protected override handleAction(action: GameAction): void {
    if (['TRAVEL', 'DOCK', 'CARGO', 'MENU', 'ESC', 'BACK'].includes(action)) {
      return;
    }
    super.handleAction(action);
  }

  protected override renderContent(buffer: CharBuffer, top: number, bottom: number): void {
    const bufW = buffer[0]?.length ?? 40;
    const bufH = buffer.length;

    this.renderShipBackground(buffer, top, bottom, bufW, bufH);
    this.renderSpeakerBar(buffer, bufW);

    if (this.phase === 'typing' || this.phase === 'complete') {
      this.renderDialogBox(buffer, top, bottom, bufW);
    }
  }

  private renderShipBackground(buffer: CharBuffer, top: number, bottom: number, w: number, h: number): void {
    this.renderGauges(buffer, w);
    const starfieldTop = 3;
    const starfieldBottom = bottom - 6;
    if (starfieldTop < starfieldBottom) {
      this.starfield.render(buffer, starfieldTop, starfieldBottom, 2, w - 3);
    }
  }

  private renderGauges(buffer: CharBuffer, w: number): void {
    const row = 1;
    const gaugeChar = '=';
    const gaugeCount = 10;

    const fuelPercent = Math.round((this.player.fuelL / this.player.fuelCapacityL) * 100);
    const fuelFill = Math.floor((fuelPercent / 100) * gaugeCount);
    const hullPercent = Math.round(this.player.hullIntegrity * 100);
    const hullFill = Math.floor((hullPercent / 100) * gaugeCount);
    const cargoPercent = Math.round((this.player.cargoWeightKg / this.player.cargoCapacity) * 100);
    const cargoFill = Math.floor((cargoPercent / 100) * gaugeCount);
    const shieldPercent = 100;
    const shieldFill = Math.floor((shieldPercent / 100) * gaugeCount);

    writeText(buffer, row, GAUGE_LEFT_START, 'FUEL', 'green', 'black');
    for (let i = 0; i < gaugeCount; i++) {
      const char = i < fuelFill ? gaugeChar : ' ';
      writeText(buffer, row, GAUGE_LEFT_START + 5 + i, char, fuelPercent > 20 ? 'green' : 'red', 'black');
    }

    writeText(buffer, row, GAUGE_MID_START, 'SHLD', 'cyan', 'black');
    for (let i = 0; i < gaugeCount; i++) {
      const char = i < shieldFill ? gaugeChar : ' ';
      writeText(buffer, row, GAUGE_MID_START + 5 + i, char, 'cyan', 'black');
    }

    writeText(buffer, row, GAUGE_RIGHT_START - 4, 'HULL', 'yellow', 'black');
    for (let i = 0; i < gaugeCount; i++) {
      const char = i < hullFill ? gaugeChar : ' ';
      const color = hullPercent >= 80 ? 'bright-green' : hullPercent >= 50 ? 'yellow' : 'red';
      writeText(buffer, row, GAUGE_RIGHT_START + i, char, color, 'black');
    }

    writeText(buffer, row, 2, 'CARGO', 'white', 'black');
    for (let i = 0; i < gaugeCount; i++) {
      const char = i < cargoFill ? gaugeChar : ' ';
      writeText(buffer, row, 8 + i, char, cargoPercent > 80 ? 'yellow' : 'white', 'black');
    }
  }

  private renderSpeakerBar(buffer: CharBuffer, w: number): void {
    const row = buffer.length - 2;
    const prefix = '<)) ';
    const hyphenStart = RADAR_START;
    const hyphenEnd = RADAR_END;

    writeText(buffer, row, hyphenStart, prefix, 'cyan', 'black');

    const offset = Math.floor(this.phaseAccum / SPEAKER_ANIMATION_INTERVAL);
    const charSequence = SPEAKER_BAR_CHARS;

    for (let col = hyphenStart + prefix.length; col < hyphenEnd && col < w; col++) {
      const idx = (col - (hyphenStart + prefix.length) + offset) % charSequence.length;
      const char = charSequence[idx];
      writeText(buffer, row, col, char, 'cyan', 'black');
    }
  }

  private renderDialogBox(buffer: CharBuffer, top: number, bottom: number, w: number): void {
    const boxTop = bottom - 6;
    const boxBottom = bottom;
    const boxHeight = boxBottom - boxTop;
    const boxWidth = w;
    const contentTop = boxTop + 1;
    const contentBottom = boxBottom - 1;

    for (let col = 0; col < boxWidth; col++) {
      writeText(buffer, boxTop, col, '+', 'white', 'black');
      writeText(buffer, boxBottom - 1, col, '+', 'white', 'black');
    }
    for (let row = boxTop + 1; row < boxBottom - 1; row++) {
      writeText(buffer, row, 0, '|', 'white', 'black');
      writeText(buffer, row, boxWidth - 1, '|', 'white', 'black');
    }

    writeText(buffer, boxTop, 2, ENCOUNTER_LABELS[this.encounterType], 'bright-yellow', 'black');

    const innerWidth = boxWidth - 2;
    const contentRows = contentBottom - contentTop;

    if (this.phase === 'typing' || this.phase === 'complete') {
      let displayCharCount = this.charCount;

      let lineIdx = 0;
      let totalCharsProcessed = 0;
      for (const line of this.wrappedText) {
        const displayRow = contentTop + lineIdx;
        if (displayRow >= contentBottom) break;

        const lineLength = line.length;
        const charsInThisLine = Math.min(lineLength, Math.max(0, displayCharCount - totalCharsProcessed));
        const displayLine = line.substring(0, charsInThisLine);

        writeText(buffer, displayRow, 2, displayLine, 'white', 'black');
        totalCharsProcessed += lineLength;
        lineIdx++;
      }
    }

    if (this.phase === 'complete') {
      const buttonText = '[ CONTINUE ]';
      const buttonRow = contentBottom - 1;
      const buttonCol = Math.floor((boxWidth - buttonText.length) / 2);
      writeText(buffer, buttonRow, buttonCol, buttonText, 'bright-green', 'black');
    }
  }

  private getTotalCharCount(): number {
    return this.wrappedText.reduce((sum, line) => sum + line.length, 0);
  }
}
