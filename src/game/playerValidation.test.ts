import test from 'node:test';
import assert from 'node:assert/strict';
import {
  disambiguateDisplayNames,
  MAX_PLAYER_NAME_LENGTH,
  validateMatchRoster,
  validatePlayerName,
} from './playerValidation';

test('validatePlayerName trims leading/trailing whitespace and accepts valid names', () => {
  const res = validatePlayerName('  Rahim  ', 0);
  assert.equal(res.valid, true);
  assert.equal(res.trimmed, 'Rahim');
});

test('validatePlayerName rejects empty or whitespace-only names', () => {
  const emptyRes = validatePlayerName('   ', 0);
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.error?.includes('Player 1'));
});

test('validatePlayerName enforces max length of 18 characters', () => {
  const longName = 'A'.repeat(MAX_PLAYER_NAME_LENGTH + 1);
  const res = validatePlayerName(longName, 1);
  assert.equal(res.valid, false);
  assert.ok(res.error?.includes(`${MAX_PLAYER_NAME_LENGTH}`));
});

test('validatePlayerName rejects control characters', () => {
  const badRes = validatePlayerName('Karim\u0007', 0);
  assert.equal(badRes.valid, false);
  assert.ok(badRes.error?.includes('control characters'));
});

test('disambiguateDisplayNames appends suffixes to duplicate case-insensitive names', () => {
  const names = disambiguateDisplayNames(['Sakib', 'sakib', 'Tanvir']);
  assert.deepEqual(names, ['Sakib (1)', 'sakib (2)', 'Tanvir']);
});

test('validateMatchRoster rejects duplicate names across active human participants', () => {
  const duplicateRes = validateMatchRoster(
    [
      { id: 'p1', name: 'Nabil', skinId: 'matador_pinpoint', isBot: false },
      { id: 'p2', name: 'nabil', skinId: 'matador_alltime', isBot: false },
    ],
    2
  );
  assert.equal(duplicateRes.valid, false);
  assert.ok(duplicateRes.errors[0]?.includes('Duplicate'));
  assert.ok(duplicateRes.errors[1]?.includes('Duplicate'));

  const validRes = validateMatchRoster(
    [
      { id: 'p1', name: '  Nabil  ', skinId: 'matador_pinpoint', isBot: false },
      { id: 'p2', name: 'Farhan', skinId: 'matador_alltime', isBot: false },
    ],
    2
  );
  assert.equal(validRes.valid, true);
  assert.equal(validRes.normalizedPlayers[0].name, 'Nabil');
  assert.equal(validRes.normalizedPlayers[1].name, 'Farhan');
});
