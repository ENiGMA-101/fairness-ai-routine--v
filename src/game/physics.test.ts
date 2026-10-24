import test from 'node:test';
import assert from 'node:assert/strict';
import Matter from 'matter-js';
import {
  clamp,
  angDiff,
  launchSpeed,
  powerFromTargetSpeed,
  contactPoint,
  segOf,
  segClosest,
  applyLaunch,
  stepBodyDynamics,
  isOffDesk,
  getPenFootprintOverhangRatio,
  resolveCustomStrike,
  simulateTrajectory,
} from './physics';
import {
  BASE_DENSITY,
  BASE_RESTITUTION,
  MAX_ANGULAR_SPEED,
  MAX_SPEED,
  PEN_LENGTH,
  PEN_WIDTH,
  SUB_DT,
} from './constants';

const { Bodies, Body } = Matter;

test('clamp restricts numbers within min and max', () => {
  assert.equal(clamp(15, 0, 10), 10);
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(5, 0, 10), 5);
});

test('angDiff calculates shortest angular delta correctly', () => {
  assert.ok(Math.abs(angDiff(0, Math.PI / 2) - Math.PI / 2) < 1e-6);
  assert.ok(Math.abs(angDiff(Math.PI, -Math.PI)) < 1e-6);
  assert.ok(Math.abs(angDiff(0, 3 * Math.PI / 2) - (-Math.PI / 2)) < 1e-6);
});

test('launchSpeed scales with power and side multiplier', () => {
  const speedTop = launchSpeed(0.5, 0);
  const speedMid = launchSpeed(0.5, 1);
  const speedBot = launchSpeed(0.5, 2);

  assert.ok(speedBot > speedTop, 'Bottom slam should have greater speed than top strike');
  assert.ok(speedTop > speedMid, 'Top strike should have greater speed than middle push');
  assert.ok(speedMid > 0, 'Speed must be positive');
});

test('launchSpeed scales monotonically across 10%, 25%, 50%, 75%, and 100% power and respects MAX_SPEED', () => {
  const levels = [0.1, 0.25, 0.5, 0.75, 1.0];
  for (const sideIdx of [0, 1, 2] as const) {
    let prev = 0;
    for (const p of levels) {
      const spd = launchSpeed(p, sideIdx);
      assert.ok(spd > prev, `Speed at power ${p} (${spd}) should exceed ${prev}`);
      assert.ok(spd <= MAX_SPEED, `Speed (${spd}) must never exceed MAX_SPEED (${MAX_SPEED})`);
      prev = spd;
    }
  }
});

test('powerFromTargetSpeed inverts launchSpeed accurately for AI planning', () => {
  for (const sideIdx of [0, 1, 2] as const) {
    const targetPwr = 0.62;
    const spd = launchSpeed(targetPwr, sideIdx);
    const recoveredPwr = powerFromTargetSpeed(spd, sideIdx);
    assert.ok(
      Math.abs(recoveredPwr - targetPwr) < 0.02,
      `Expected ~${targetPwr}, got ${recoveredPwr}`
    );
  }
});

test('contactPoint aligns with attack side offsets', () => {
  const centerPos = { x: 500, y: 300 };
  const angle = 0; // facing right (+x)

  const cpTop = contactPoint(centerPos, angle, 0); // offset +0.40 * 170 = +68
  const cpMid = contactPoint(centerPos, angle, 1); // offset 0
  const cpBot = contactPoint(centerPos, angle, 2); // offset -0.40 * 170 = -68

  assert.equal(cpMid.x, 500);
  assert.equal(cpMid.y, 300);
  assert.ok(Math.abs(cpTop.x - (500 + 0.4 * PEN_LENGTH)) < 1e-4);
  assert.ok(Math.abs(cpBot.x - (500 - 0.4 * PEN_LENGTH)) < 1e-4);
});

test('segment distance calculations identify close pens', () => {
  const p1 = { x: 100, y: 100 };
  const q1 = { x: 200, y: 100 };
  const p2 = { x: 150, y: 105 };
  const q2 = { x: 150, y: 200 };

  const [dist] = segClosest(p1, q1, p2, q2);
  assert.ok(dist <= 5.01, `Distance should be approx 5, got ${dist}`);
});

test('applyLaunch and stepBodyDynamics differentiate attack sides and enforce velocity caps', () => {
  const makePen = () =>
    Bodies.rectangle(400, 325, PEN_LENGTH, PEN_WIDTH, {
      angle: Math.PI / 2,
      frictionAir: 0.036,
      restitution: BASE_RESTITUTION,
      density: BASE_DENSITY,
    });

  // Middle Push (1): zero spin
  const midPen = makePen();
  applyLaunch(midPen, 0, 0.75, 1);
  assert.equal(midPen.angularVelocity, 0, 'Middle push should produce zero rotational spin');

  // Top Strike (0): produces controlled spin within MAX_ANGULAR_SPEED
  const topPen = makePen();
  applyLaunch(topPen, 0, 0.75, 0);
  assert.ok(Math.abs(topPen.angularVelocity) > 0.02, 'Top strike should produce rotational spin');
  assert.ok(
    Math.abs(topPen.angularVelocity) <= MAX_ANGULAR_SPEED,
    'Angular velocity must not exceed MAX_ANGULAR_SPEED'
  );

  // Over-speed body gets clamped by stepBodyDynamics
  Body.setVelocity(topPen, { x: 50, y: 50 });
  Body.setAngularVelocity(topPen, 2.5);
  stepBodyDynamics(topPen);
  const clampedSpd = Math.hypot(topPen.velocity.x, topPen.velocity.y);
  assert.ok(clampedSpd <= MAX_SPEED + 1e-5, `Clamped speed ${clampedSpd} must be <= ${MAX_SPEED}`);
  assert.ok(Math.abs(topPen.angularVelocity) <= MAX_ANGULAR_SPEED + 1e-5);
});

test('resolveCustomStrike transfers bounded momentum without railgun spikes', () => {
  const att = Bodies.rectangle(500, 325, PEN_LENGTH, PEN_WIDTH, {
    angle: Math.PI / 2,
    density: BASE_DENSITY * 1.1,
  });
  const def = Bodies.rectangle(520, 325, PEN_LENGTH, PEN_WIDTH, {
    angle: -Math.PI / 2,
    density: BASE_DENSITY,
  });

  Body.setVelocity(att, { x: 16, y: 0 });
  Body.setVelocity(def, { x: 0, y: 0 });

  const impact = resolveCustomStrike(
    att,
    def,
    {
      collision: {
        normal: { x: 1, y: 0 },
        depth: 1.2,
        supports: [{ x: 510, y: 325 }],
      },
    },
    0.86
  );

  assert.ok(impact > 0);
  const defSpd = Math.hypot(def.velocity.x, def.velocity.y);
  assert.ok(defSpd > 8 && defSpd <= MAX_SPEED, `Defender speed ${defSpd} should be realistic and bounded`);
  assert.ok(Math.abs(def.angularVelocity) <= MAX_ANGULAR_SPEED);
});

test('isOffDesk and getPenFootprintOverhangRatio accurately evaluate center and footprint overhang rules', () => {
  const deskW = 1200;
  const deskH = 650;

  // 1. Safely inside the desk
  const insidePen = Bodies.rectangle(600, 325, PEN_LENGTH, PEN_WIDTH, { angle: 0 });
  assert.equal(getPenFootprintOverhangRatio(insidePen.position, 0, deskW, deskH), 0);
  assert.equal(isOffDesk(insidePen, deskW, deskH, 'strict'), false);
  assert.equal(isOffDesk(insidePen, deskW, deskH, 'center'), false);

  // 2. Slight edge teetering (~18% of pen length overhanging right edge at x = 1200 - 55 = 1145)
  // Pen extends from 1145 - 85 = 1060 to 1145 + 85 = 1230 (30px outside out of 170px -> ~18%)
  const teeterPen = Bodies.rectangle(1145, 325, PEN_LENGTH, PEN_WIDTH, { angle: 0 });
  const teeterRatio = getPenFootprintOverhangRatio(teeterPen.position, 0, deskW, deskH);
  assert.ok(teeterRatio > 0.08 && teeterRatio < 0.30, `Teeter ratio was ${teeterRatio}`);
  assert.equal(
    isOffDesk(teeterPen, deskW, deskH, 'strict'),
    false,
    'Slight tip overhang (<32%) should teeter safely without premature strict knockout'
  );
  assert.equal(isOffDesk(teeterPen, deskW, deskH, 'center'), false);

  // 3. Heavy footprint overhang (~41% overhanging right edge at x = 1185: 70px outside out of 170px)
  const heavyOverhangPen = Bodies.rectangle(1185, 325, PEN_LENGTH, PEN_WIDTH, { angle: 0 });
  assert.equal(
    isOffDesk(heavyOverhangPen, deskW, deskH, 'strict'),
    true,
    'Overhang >= 32% should eliminate under strict footprint rule'
  );
  assert.equal(
    isOffDesk(heavyOverhangPen, deskW, deskH, 'center'),
    false,
    'Center is still inside (1185 < 1200) so center rule keeps it alive'
  );

  // 4. Center of mass outside desk boundary (x = 1202)
  const outsideCenterPen = Bodies.rectangle(1202, 325, PEN_LENGTH, PEN_WIDTH, { angle: 0 });
  assert.equal(isOffDesk(outsideCenterPen, deskW, deskH, 'center'), true);
  assert.equal(isOffDesk(outsideCenterPen, deskW, deskH, 'strict'), true);
});

test('simulateTrajectory matches live Matter.js physics slide distance', () => {
  const deskW = 1200;
  const deskH = 650;
  const frictionAir = 0.036;
  const startPos = { x: 264, y: 325, angle: Math.PI / 2 };

  const sim = simulateTrajectory(startPos, 0, 0.5, 1, [], deskW, deskH, frictionAir, 'center');
  assert.ok(sim.path.length > 10);
  const simEnd = sim.path[sim.path.length - 1];

  // Compare against a live Matter engine run
  const engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
  const liveBody = Bodies.rectangle(startPos.x, startPos.y, PEN_LENGTH, PEN_WIDTH, {
    chamfer: { radius: 7 },
    frictionAir,
    friction: 0.12,
    frictionStatic: 0.2,
    restitution: BASE_RESTITUTION,
    density: BASE_DENSITY * 1.1,
    angle: startPos.angle,
  });
  (liveBody as any).deltaTime = SUB_DT;
  Matter.Composite.add(engine.world, liveBody);
  applyLaunch(liveBody, 0, 0.5, 1);

  for (let step = 0; step < 500; step++) {
    for (let sub = 0; sub < 2; sub++) {
      Matter.Engine.update(engine, SUB_DT);
      stepBodyDynamics(liveBody);
    }
    if (liveBody.speed < 0.04 && Math.abs(liveBody.angularVelocity) < 0.002) break;
  }

  assert.ok(
    Math.abs(liveBody.position.x - simEnd.x) < 1.0,
    `Trajectory preview end X (${simEnd.x}) should match live physics X (${liveBody.position.x})`
  );
  assert.ok(
    Math.abs(liveBody.position.y - simEnd.y) < 1.0,
    `Trajectory preview end Y (${simEnd.y}) should match live physics Y (${liveBody.position.y})`
  );
});
