/**
 * Nex interpreter
 */
import assert from 'assert';
import Environment from './environment.mjs';

class Nex {
  /**
   * Creates an Nex instance with the global environment
   */
  constructor(global = new Environment()) {
    this.global = global;
  }

  /**
   * Evaluates an expression in the given environment.
   */
  eval(exp, env = this.global) {
    // ------------------------
    // Sefl evaluating expressions:
    if (isNumber(exp)) {
      return exp;
    }

    if (isString(exp)) {
      return exp.slice(1, -1);
    }

    // ------------------------
    // Math operations
    if (exp[0] === '+') {
      return this.eval(exp[1], env) + this.eval(exp[2], env);
    }

    if (exp[0] === '-') {
      return this.eval(exp[1], env) - this.eval(exp[2], env);
    }

    if (exp[0] === '*') {
      return this.eval(exp[1], env) * this.eval(exp[2], env);
    }

    if (exp[0] === '/') {
      return this.eval(exp[1], env) / this.eval(exp[2], env);
    }

    if (exp[0] === 'begin') {
      const blockEnv = new Environment({}, env);
      return this._evalBlock(exp, blockEnv);
    }

    // ------------------------
    // Variable declaration: (var foo 10)
    if (exp[0] === 'var') {
      const [_ass, name, value] = exp;
      return env.define(name, this.eval(value, env));
    }
    // Variable assignment
    if (exp[0] === 'set') {
      const [_, name, value] = exp;
      return env.assign(name, this.eval(value, env));
    }
    // ------------------------
    // Variable access: foo
    if (isVariableName(exp)) {
      return env.lookup(exp);
    }

    throw `Unimplemented: ${JSON.stringify(exp)}`;
  }

  _evalBlock(block, env) {
    let result;
    const [_tag, ...expresions] = block;
    expresions.forEach((exp) => {
      result = this.eval(exp, env);
    });

    return result;
  }
}

function isNumber(exp) {
  return typeof exp === 'number';
}

function isString(exp) {
  return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
}

function isVariableName(exp) {
  return typeof exp === 'string' && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(exp);
}

const nex = new Nex(new Environment({
  null: null,
  true: true,
  false: false,

  VERSION: '0.1',
}));

assert.strictEqual(nex.eval(1), 1);
assert.strictEqual(nex.eval('"hello"'), 'hello');

// Math
assert.strictEqual(nex.eval(['+', 1, 5]), 6);
assert.strictEqual(nex.eval(['+', ['+', 3, 2], 5]), 10);
assert.strictEqual(nex.eval(['+', ['*', 3, 2], 5]), 11);
assert.strictEqual(nex.eval(['-', ['*', 3, 2], 5]), 1);
assert.strictEqual(nex.eval(['/', ['*', 3, 2], 2]), 3);

// Variables:
assert.strictEqual(nex.eval(['var', 'x', 10]), 10);
assert.strictEqual(nex.eval('x'), 10);
assert.strictEqual(nex.eval(['var', 'y', 5]), 5);
assert.strictEqual(nex.eval('y'), 5);
assert.strictEqual(nex.eval('VERSION'), '0.1');

assert.strictEqual(nex.eval(['var', 'isUser', 'true']), true);
assert.strictEqual(nex.eval(['var', 'z', ['*', 2, 2]]), 4);
assert.strictEqual(nex.eval('z'), 4);

// blocks
assert.strictEqual(nex.eval(
  ['begin',
    ['var', 'x', 10],
    ['var', 'y', 20],
    ['+', ['*', 'x', 'y'], 30],
  ],
), 230);
assert.strictEqual(nex.eval(
  ['begin',
    ['var', 'x', 10],
    ['begin',
      ['var', 'x', 20],
      'x',
    ],
    'x',
  ],
), 10);
assert.strictEqual(nex.eval(
  ['begin',
    ['var', 'value', 10],
    ['var', 'result', ['begin',
      ['var', 'x', ['+', 'value', 10]],
      'x',
    ]],
    'result',
  ],
), 20);
assert.strictEqual(nex.eval(
  ['begin',
    ['var', 'data', 10],
    ['begin',
      ['set', 'data', 100],
    ],
    'data',
  ],
), 100);

console.log('All assertions passed!');
