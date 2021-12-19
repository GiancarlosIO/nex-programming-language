/* eslint-disable import/prefer-default-export */
/* eslint-disable no-undef */
import assert from 'assert';
import nexParser from './parser/nexParser.mjs';

export function test(nex, code, expected) {
  const exp = nexParser.parse(code);
  assert.strictEqual(nex.eval(exp), expected);
}
