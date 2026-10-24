import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sanitizeWorry, spawnInterval, sample, mixColor, isDay, pickQuote } from '../src/logic.js';

const cfg = JSON.parse(readFileSync(new URL('../config/gameplay.json', import.meta.url)));
const quotes = JSON.parse(readFileSync(new URL('../config/quotes.json', import.meta.url))).quotes;
const labelsEn = JSON.parse(readFileSync(new URL('../config/labels.en.json', import.meta.url)));
const labelsEs = JSON.parse(readFileSync(new URL('../config/labels.json', import.meta.url)));

test('sanitize: blank, unsafe, symbols-only rejected', () => {
  assert.equal(sanitizeWorry('   ').error, 'blank');
  assert.equal(sanitizeWorry('<img onerror=x>').error, 'chars');
  assert.equal(sanitizeWorry('!!!???').error, 'text');
  assert.equal(sanitizeWorry('\u200b\u0007').error, 'blank');
});
test('sanitize: trims, collapses, truncates', () => {
  assert.equal(sanitizeWorry('  el   trabajo ').value, 'el trabajo');
  assert.equal(sanitizeWorry('a'.repeat(100), 28).value.length, 28);
  assert.equal(sanitizeWorry('ñandú, 3 días').ok, true);
});
test('spawn table covers 0..120 and speeds up', () => {
  assert.ok(spawnInterval(cfg.spawn, 0) > spawnInterval(cfg.spawn, 119));
  assert.equal(spawnInterval(cfg.spawn, 500), cfg.spawn.at(-1).interval);
});
test('day/night split is exactly half', () => {
  assert.ok(isDay(59.99, 120)); assert.ok(!isDay(60, 120));
});
test('sample + mixColor', () => {
  assert.equal(sample([[0, 0], [1, 10]], 0.5), 5);
  assert.equal(mixColor(0x000000, 0xffffff, 0.5), 0x808080);
});
test('quotes: >=12 complete entries, pickQuote works', () => {
  assert.ok(quotes.length >= 12);
  for (const q of quotes) for (const k of ['original', 'en', 'es', 'author', 'authorEn', 'source', 'sourceEn']) assert.ok(q[k], k);
  assert.equal(pickQuote(quotes, () => 0), quotes[0]);
});
test('English and Spanish label catalogs have matching keys and complete translations', () => {
  assert.deepEqual(Object.keys(labelsEn).sort(), Object.keys(labelsEs).sort());
  for (const labels of [labelsEn, labelsEs]) {
    for (const key of Object.keys(labels)) assert.ok(labels[key], key);
    assert.equal(labels.instr.length, 6);
    assert.equal(labels.suggestions.length, 7);
    assert.equal(labels.defaultWorries.length, 5);
  }
});
test('config sanity', () => {
  assert.equal(cfg.duration, 120); assert.equal(cfg.petals.start, 12);
});
