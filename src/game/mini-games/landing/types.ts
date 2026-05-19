export interface TerrainColumn {
  surfaceRow: number;
  isPad: boolean;
}

export type TerrainStyle = 'planet' | 'asteroid';

export interface LandingPhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface LandingPhysicsConfig {
  gravity: number;
  airResistance: number;
  thrustForce: number;
  maxVerticalSpeed?: number;
}

export interface LandingThrustInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}
