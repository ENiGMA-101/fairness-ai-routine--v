import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCameraView,
  resolveResponsiveLayoutMode,
  screenToWorld,
  worldToScreen,
} from './layout';
import { getTableConfig, resolveTableDimensions } from './tableConfig';

const REQUIRED_VIEWPORTS = [
  { name: '320x568 (Small Mobile)', w: 320, h: 568 },
  { name: '390x844 (iPhone 14)', w: 390, h: 844 },
  { name: '430x932 (Large Mobile)', w: 430, h: 932 },
  { name: '768x1024 (Tablet Portrait)', w: 768, h: 1024 },
  { name: '1024x768 (Tablet Landscape)', w: 1024, h: 768 },
  { name: '1280x720 (Compact Desktop)', w: 1280, h: 720 },
  { name: '1366x768 (Laptop)', w: 1366, h: 768 },
  { name: '1440x900 (Standard Desktop)', w: 1440, h: 900 },
  { name: '1920x1080 (Full HD Desktop)', w: 1920, h: 1080 },
];

test('resolveResponsiveLayoutMode selects desktop-sidebar, tablet-compact, and mobile-compact appropriately', () => {
  assert.equal(resolveResponsiveLayoutMode(320, 568), 'mobile-compact');
  assert.equal(resolveResponsiveLayoutMode(390, 844), 'mobile-compact');
  assert.equal(resolveResponsiveLayoutMode(430, 932), 'mobile-compact');
  assert.equal(resolveResponsiveLayoutMode(768, 1024), 'tablet-compact');
  assert.equal(resolveResponsiveLayoutMode(1024, 768), 'tablet-compact');
  assert.equal(resolveResponsiveLayoutMode(1280, 720), 'desktop-sidebar');
  assert.equal(resolveResponsiveLayoutMode(1366, 768), 'desktop-sidebar');
  assert.equal(resolveResponsiveLayoutMode(1440, 900), 'desktop-sidebar');
  assert.equal(resolveResponsiveLayoutMode(1920, 1080), 'desktop-sidebar');
});

test('computeCameraView fits all 4 corners of School Bench and Square Table across all 9 required viewports without HUD overlap or aspect distortion', () => {
  const schoolBench = resolveTableDimensions(getTableConfig('school_bench'));
  const squareTable = resolveTableDimensions(getTableConfig('square_table'));

  for (const vp of REQUIRED_VIEWPORTS) {
    for (const [label, table] of [
      ['School Bench', schoolBench],
      ['Square Table', squareTable],
    ] as const) {
      for (const phase of ['placing', 'aim'] as const) {
        const cam = computeCameraView({
          viewportWidth: vp.w,
          viewportHeight: vp.h,
          deskWidth: table.width,
          deskHeight: table.height,
          isPlaying: true,
          phase,
        });

        assert.ok(cam.scale > 0, `${vp.name} (${label}, ${phase}): scale must be positive`);

        // Verify all 4 corners fit inside the unoccluded area (no clipping or HUD collision)
        assert.ok(
          cam.tableScreenRect.left >= cam.reserved.left - 0.01,
          `${vp.name} (${label}, ${phase}): left corner ${cam.tableScreenRect.left} overlaps reserved left ${cam.reserved.left}`
        );
        assert.ok(
          cam.tableScreenRect.top >= cam.reserved.top - 0.01,
          `${vp.name} (${label}, ${phase}): top corner ${cam.tableScreenRect.top} overlaps reserved top ${cam.reserved.top}`
        );
        assert.ok(
          cam.tableScreenRect.right <= vp.w - cam.reserved.right + 0.01,
          `${vp.name} (${label}, ${phase}): right corner ${cam.tableScreenRect.right} exceeds ${vp.w - cam.reserved.right}`
        );
        assert.ok(
          cam.tableScreenRect.bottom <= vp.h - cam.reserved.bottom + 0.01,
          `${vp.name} (${label}, ${phase}): bottom corner ${cam.tableScreenRect.bottom} exceeds ${vp.h - cam.reserved.bottom}`
        );

        // Verify exact aspect ratio preservation (never stretches rectangle into square or vice versa)
        const expectedAspect = table.width / table.height;
        const actualAspect = cam.tableScreenRect.width / cam.tableScreenRect.height;
        assert.ok(
          Math.abs(actualAspect - expectedAspect) < 1e-6,
          `${vp.name} (${label}): aspect ratio ${actualAspect} must equal ${expectedAspect}`
        );
      }
    }
  }
});

test('screenToWorld and worldToScreen remain round-trip accurate across resize and orientation changes', () => {
  const canvasRect = { left: 0, top: 0 };
  for (const vp of REQUIRED_VIEWPORTS) {
    const cam = computeCameraView({
      viewportWidth: vp.w,
      viewportHeight: vp.h,
      deskWidth: 1200,
      deskHeight: 650,
      isPlaying: true,
      phase: 'aim',
    });

    const samplePoints = [
      { x: 0, y: 0 },
      { x: 600, y: 325 },
      { x: 1200, y: 650 },
      { x: 264, y: 412 },
    ];

    for (const pt of samplePoints) {
      const scr = worldToScreen(pt.x, pt.y, canvasRect, cam);
      const back = screenToWorld(scr.x, scr.y, canvasRect, cam);
      assert.ok(Math.abs(back.x - pt.x) < 1e-5, `Expected x=${pt.x}, got ${back.x}`);
      assert.ok(Math.abs(back.y - pt.y) < 1e-5, `Expected y=${pt.y}, got ${back.y}`);
    }
  }
});
