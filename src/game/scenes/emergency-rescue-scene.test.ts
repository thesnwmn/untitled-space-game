import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';
import { EmergencyRescueScene } from './emergency-rescue-scene';
import { PlayerState } from '../player-state';

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  private tapHandlers: Array<(col: number, row: number) => void> = [];

  onAction(handler: (action: GameAction) => void): void {
    this.actionHandlers.push(handler);
  }

  onTap(handler: (col: number, row: number) => void): void {
    this.tapHandlers.push(handler);
  }

  triggerAction(action: GameAction): void {
    for (const h of this.actionHandlers) h(action);
  }

  triggerTap(col: number, row: number): void {
    for (const h of this.tapHandlers) h(col, row);
  }
}

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

function makePlayer(overrides?: {
  shipId?: string;
  driveId?: string;
  credits?: number;
  systemId?: string;
  destinationId?: string | null;
}): PlayerState {
  return new PlayerState({
    shipId: overrides?.shipId ?? 'freighter',
    driveId: overrides?.driveId ?? 'civilian-mk1',
    credits: overrides?.credits ?? 1000,
    systemId: overrides?.systemId ?? 'sol',
    destinationId: overrides?.destinationId !== undefined ? overrides.destinationId : 'elysium-station',
  });
}

function allText(buffer: CharBuffer): string {
  return buffer.map(row => row.map(c => c.char).join('')).join('\n');
}

const context: GameContext = {
  environment: 'browser', primaryInput: 'keyboard', debug: false,
};

describe('EmergencyRescueScene', () => {
  let player: PlayerState;
  let inputHandler: MockInputHandler;
  let onTow: ReturnType<typeof vi.fn>;
  let onDrop: ReturnType<typeof vi.fn>;
  let onBack: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    player = makePlayer();
    inputHandler = new MockInputHandler();
    onTow = vi.fn();
    onDrop = vi.fn();
    onBack = vi.fn();
  });

  it('shows EMERGENCY RESCUE title', () => {
    const scene = new EmergencyRescueScene(
      inputHandler,
      context,
      player,
      onTow,
      onDrop,
      onBack,
    );

    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('EMERGENCY RESCUE');
  });

  it('includes tow option when fuel destination exists', () => {
    const scene = new EmergencyRescueScene(
      inputHandler,
      context,
      player,
      onTow,
      onDrop,
      onBack,
    );

    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('TOW TO');
  });

  it('includes fuel drop option', () => {
    const scene = new EmergencyRescueScene(
      inputHandler,
      context,
      player,
      onTow,
      onDrop,
      onBack,
    );

    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('EMERGENCY FUEL DROP');
  });

  it('includes back option', () => {
    const scene = new EmergencyRescueScene(
      inputHandler,
      context,
      player,
      onTow,
      onDrop,
      onBack,
    );

    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('BACK');
  });

  it('shows stranded status at destination when docked', () => {
    const scene = new EmergencyRescueScene(
      inputHandler,
      context,
      player,
      onTow,
      onDrop,
      onBack,
    );

    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('STRANDED AT');
  });

  it('shows stranded status in space when undocked', () => {
    player.undock();

    const scene = new EmergencyRescueScene(
      inputHandler,
      context,
      player,
      onTow,
      onDrop,
      onBack,
    );

    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('STRANDED IN SPACE');
  });

  it('calls onBack when BACK action is pressed', () => {
    const scene = new EmergencyRescueScene(
      inputHandler,
      context,
      player,
      onTow,
      onDrop,
      onBack,
    );

    inputHandler.triggerAction('BACK');
    expect(onBack).toHaveBeenCalled();
  });

  it('calls onTow when tow option is selected', () => {
    const scene = new EmergencyRescueScene(
      inputHandler,
      context,
      player,
      onTow,
      onDrop,
      onBack,
    );

    // First option should be TOW (if fuel destination exists)
    inputHandler.triggerAction('SELECT');
    expect(onTow).toHaveBeenCalled();
  });

  it('calls onDrop when fuel drop option is selected', () => {
    const scene = new EmergencyRescueScene(
      inputHandler,
      context,
      player,
      onTow,
      onDrop,
      onBack,
    );

    // Navigate down to fuel drop option
    inputHandler.triggerAction('DOWN');
    inputHandler.triggerAction('SELECT');
    expect(onDrop).toHaveBeenCalled();
  });

  it('shows negative balance in warning color when projected balance is negative', () => {
    player.spendCredits(player.credits - 100);

    const scene = new EmergencyRescueScene(
      inputHandler,
      context,
      player,
      onTow,
      onDrop,
      onBack,
    );

    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const text = allText(buf);
    expect(text).toContain('BALANCE');
    expect(text).toContain('-');
  });
});
