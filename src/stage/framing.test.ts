import { describe, expect, it } from "vitest";
import { MOTOR, ROTOR_SHAFT_LENGTH, SHAFT_LENGTH } from "./geometry";
import {
  SHOTS,
  boreBounds,
  cameraFor,
  carBounds,
  motorBounds,
  rotorBounds,
  type ShotName,
} from "./framing";

const ASPECT = 1.5;
const FOV = 32;

/** Half the frame's extent, at a given distance, along each screen axis. */
const frameHalfExtent = (distance: number) => {
  const vFov = (FOV * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * ASPECT);
  return {
    halfWidth: distance * Math.tan(hFov / 2),
    halfHeight: distance * Math.tan(vFov / 2),
  };
};

const distance = (a: readonly number[], b: readonly number[]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe("motorBounds", () => {
  it("is the assembled machine when nothing is exploded", () => {
    const bounds = motorBounds(0);
    // The shaft protrudes past the housing even when fully assembled.
    expect(bounds.half[2]).toBeCloseTo(SHAFT_LENGTH / 2, 5);
    expect(bounds.centre[2]).toBeCloseTo(0, 5);
  });

  it("grows monotonically as the machine comes apart", () => {
    const lengths = [0, 0.25, 0.5, 0.75, 1].map((e) => motorBounds(e).half[2]);
    for (let i = 1; i < lengths.length; i += 1) {
      expect(lengths[i]).toBeGreaterThan(lengths[i - 1]);
    }
  });

  it("stays much longer than it is wide, which is why sphere-fitting is wrong", () => {
    const bounds = motorBounds(1);
    expect(bounds.half[2] / bounds.half[0]).toBeGreaterThan(3);
  });
});

describe("rotorBounds", () => {
  it("is the rotor's own radius, not the housing's", () => {
    const bounds = rotorBounds(0);
    expect(bounds.half[0]).toBeLessThan(MOTOR.rotorOuter + 0.1);
    expect(bounds.half[0]).toBeGreaterThanOrEqual(MOTOR.rotorOuter);
  });

  it("is set by the shaft drawn through it", () => {
    expect(rotorBounds(0, ROTOR_SHAFT_LENGTH).half[2]).toBeLessThan(rotorBounds(0).half[2]);
    expect(rotorBounds(0, ROTOR_SHAFT_LENGTH).half[2]).toBeCloseTo(ROTOR_SHAFT_LENGTH / 2, 5);
  });

  it("follows the magnets and shaft as they slide out", () => {
    const closed = rotorBounds(0, ROTOR_SHAFT_LENGTH);
    const open = rotorBounds(0.6, ROTOR_SHAFT_LENGTH);
    expect(open.half[2]).toBeGreaterThan(closed.half[2]);
    expect(open.centre[2]).toBeGreaterThan(closed.centre[2]);
  });
});

describe("boreBounds", () => {
  it("frames the bore and lets the outer ring reach the edge", () => {
    const bounds = boreBounds(ROTOR_SHAFT_LENGTH);
    expect(bounds.half[0]).toBeLessThan(MOTOR.statorOuter);
    expect(bounds.half[0]).toBeGreaterThan(MOTOR.statorBore);
    expect(bounds.half[2]).toBeGreaterThanOrEqual(MOTOR.stackLength / 2);
  });
});

describe("cameraFor", () => {
  const fits = (shot: ShotName, bounds: ReturnType<typeof motorBounds>) => {
    const { position, target } = cameraFor(shot, bounds, ASPECT, FOV);
    const d = distance(position, target);
    const { halfWidth, halfHeight } = frameHalfExtent(d);
    // Worst case the subject is turned corner-on, so compare against the
    // largest half-extent it can present.
    const worst = Math.hypot(bounds.half[0], bounds.half[1], bounds.half[2]);
    return { d, halfWidth, halfHeight, worst, bounds };
  };

  it("frames every shot without clipping the subject", () => {
    for (const shot of Object.keys(SHOTS) as ShotName[]) {
      const bounds = shot.startsWith("car") ? carBounds(0) : motorBounds(0.6);
      const { d, halfWidth, halfHeight } = fits(shot, bounds);
      const maxHalf = Math.max(...bounds.half);
      expect(d, `${shot} distance`).toBeGreaterThan(maxHalf);
      // The binding axis must still contain the subject's largest half-extent.
      expect(Math.max(halfWidth, halfHeight), `${shot} frame`).toBeGreaterThan(maxHalf);
    }
  });

  it("pulls back further as the machine comes apart", () => {
    const near = cameraFor("motor-exploded", motorBounds(0), ASPECT, FOV);
    const far = cameraFor("motor-exploded", motorBounds(1), ASPECT, FOV);
    expect(distance(far.position, far.target)).toBeGreaterThan(
      distance(near.position, near.target),
    );
  });

  it("pulls back on a narrower viewport rather than cropping", () => {
    const wide = cameraFor("motor-exploded", motorBounds(1), 1.8, FOV);
    const narrow = cameraFor("motor-exploded", motorBounds(1), 0.7, FOV);
    expect(distance(narrow.position, narrow.target)).toBeGreaterThan(
      distance(wide.position, wide.target),
    );
  });

  it("budgets each screen axis on its own", () => {
    // A long row is bound by width, so cutting the vertical budget alone
    // should not push the camera back — that is what shrank the phone frame.
    const bounds = motorBounds(1);
    const full = cameraFor("motor-exploded", bounds, 0.46, FOV, [1, 1]);
    const shortFrame = cameraFor("motor-exploded", bounds, 0.46, FOV, [1, 0.35]);
    const narrowFrame = cameraFor("motor-exploded", bounds, 0.46, FOV, [0.5, 1]);
    expect(distance(shortFrame.position, shortFrame.target)).toBeCloseTo(
      distance(full.position, full.target),
      5,
    );
    expect(distance(narrowFrame.position, narrowFrame.target)).toBeGreaterThan(
      distance(full.position, full.target),
    );
  });

  it("puts the camera on the shot's own side of the subject", () => {
    const bounds = motorBounds(1);
    const { position, target } = cameraFor("motor-exploded", bounds, ASPECT, FOV);
    // motor-exploded looks from -X, so the exploded row runs across the frame.
    expect(position[0]).toBeLessThan(target[0]);
    expect(position[1]).toBeGreaterThan(target[1]);
  });

  it("views the bore end-on for the rotating-field shot", () => {
    const bounds = boreBounds(ROTOR_SHAFT_LENGTH);
    const { position, target } = cameraFor("motor-face", bounds, ASPECT, FOV);
    const along = Math.abs(position[2] - target[2]);
    const across = Math.hypot(position[0] - target[0], position[1] - target[1]);
    expect(along).toBeGreaterThan(across * 2);
  });

  it("lets the isolated rotor fill at least half the frame height", () => {
    const bounds = rotorBounds(0.35, ROTOR_SHAFT_LENGTH);
    const { position, target } = cameraFor("rotor", bounds, ASPECT, FOV);
    const { halfHeight } = frameHalfExtent(distance(position, target));
    // The rotor disc always presents its full radius somewhere on screen, so
    // this is a floor: the page's own fit budget brings it to 60–70%.
    expect(MOTOR.rotorOuter / halfHeight).toBeGreaterThan(0.5);
  });

  it("turns the rotor shot toward its end face so the pockets read", () => {
    const { position, target } = cameraFor("rotor", rotorBounds(0), ASPECT, FOV);
    const along = Math.abs(position[2] - target[2]);
    const across = Math.hypot(position[0] - target[0], position[1] - target[1]);
    // Three-quarter: neither straight down the axis nor side-on.
    expect(along).toBeGreaterThan(across * 0.8);
    expect(along).toBeLessThan(across * 2);
  });
});
