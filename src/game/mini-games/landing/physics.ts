import type { LandingPhysicsState, LandingPhysicsConfig, LandingThrustInput } from './types';

export function updatePhysics(
  state: LandingPhysicsState,
  thrust: LandingThrustInput,
  config: LandingPhysicsConfig,
  viewportWidth: number,
  spriteWidth: number,
  dt: number,
): LandingPhysicsState {
  let { x, y, vx, vy } = state;

  vx *= config.airResistance ** dt;
  vy += config.gravity * dt;

  if (thrust.up) vy -= config.thrustForce * dt;
  if (thrust.down) vy += config.thrustForce * dt;
  if (thrust.left) vx -= config.thrustForce * dt;
  if (thrust.right) vx += config.thrustForce * dt;

  const maxVx = config.thrustForce * 3;
  vx = Math.max(-maxVx, Math.min(maxVx, vx));

  const maxVy = config.maxVerticalSpeed ?? Infinity;
  vy = Math.max(-maxVy, Math.min(maxVy, vy));

  x += vx * dt;
  y += vy * dt;

  x = Math.max(0, Math.min(viewportWidth - spriteWidth, x));

  return { x, y, vx, vy };
}
