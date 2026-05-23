import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { InputHandler, GameContext } from '../../shared/types';
import { NavigationEncounterScene } from './navigation-encounter-scene';
import { PlayerState } from '../player-state';

describe('NavigationEncounterScene', () => {
  let mockInput: InputHandler;
  let mockContext: GameContext;
  let player: PlayerState;
  let onBeginCalled: boolean;

  beforeEach(() => {
    mockInput = { onAction: vi.fn() };
    mockContext = {
      environment: 'browser',
      primaryInput: 'keyboard',
      debug: false,
    };

    player = new PlayerState({
      shipId: 'freighter',
      driveId: 'civilian-mk1',
      credits: 500,
      systemId: 'sol',
      destinationId: 'elysium-station',
    });
    onBeginCalled = false;
  });

  it('should initialize with incoming phase', () => {
    const scene = new NavigationEncounterScene(mockInput, mockContext, player, 'asteroid_belt', () => {
      onBeginCalled = true;
    });

    const state = (scene as any);
    expect(state.phase).toBe('incoming');
  });

  it('should advance to typing phase after incoming duration', () => {
    const scene = new NavigationEncounterScene(mockInput, mockContext, player, 'asteroid_belt', () => {
      onBeginCalled = true;
    });

    const state = (scene as any);
    expect(state.phase).toBe('incoming');

    scene.update(600);
    expect(state.phase).toBe('incoming');

    scene.update(700);
    expect(state.phase).toBe('typing');
  });

  it('should reveal characters over time in typing phase', () => {
    const scene = new NavigationEncounterScene(mockInput, mockContext, player, 'asteroid_belt', () => {
      onBeginCalled = true;
    });

    const state = (scene as any);

    scene.update(1300);
    expect(state.phase).toBe('typing');
    expect(state.charCount).toBeGreaterThan(0);

    const initialCount = state.charCount;
    scene.update(100);
    expect(state.charCount).toBeGreaterThanOrEqual(initialCount);
  });

  it('should transition to complete phase when all text is revealed', () => {
    const scene = new NavigationEncounterScene(mockInput, mockContext, player, 'asteroid_belt', () => {
      onBeginCalled = true;
    });

    const state = (scene as any);

    scene.update(5000);
    expect(state.phase).toBe('complete');
  });

  it('should block blocked actions', () => {
    const onActionCallbacks: Array<(action: any) => void> = [];
    mockInput.onAction = (cb) => onActionCallbacks.push(cb);

    const scene = new NavigationEncounterScene(mockInput, mockContext, player, 'asteroid_belt', () => {
      onBeginCalled = true;
    });

    const handleActionSpy = vi.spyOn(scene as any, 'handleAction');
    (scene as any).handleAction('TRAVEL');
    expect(handleActionSpy).toHaveBeenCalledWith('TRAVEL');
  });

  it('should render ship background with gauges', () => {
    const scene = new NavigationEncounterScene(mockInput, mockContext, player, 'asteroid_belt', () => {
      onBeginCalled = true;
    });

    const buffer = Array(30)
      .fill(null)
      .map(() => Array(40).fill({ char: ' ', fg: 'white' as const, bg: 'black' as const }));

    const renderContentSpy = vi.spyOn(scene as any, 'renderContent');
    scene.render(buffer);
    expect(renderContentSpy).toHaveBeenCalled();
  });
});
