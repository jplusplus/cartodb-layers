const Memoizable = require('../lib/memoizable')

describe('Memoizable class', function () {

  class MemoizableWithMethods extends Memoizable {
    foo () {
      return (new Date()).getTime()
    }
    bar () {
      return {}
    }
  }

  it('must trhow an error when instanciate Memoizable directly', function () {
    expect(() => {
      const m = new Memoizable()
    }).toThrow();
  });

  it('must have a `memoized` attribute', function () {
    const m = new MemoizableWithMethods()
    expect(m).toHaveProperty('memoized')
  });

  it('must have a `memoized` who list methods', function () {
    const m = new MemoizableWithMethods()
    expect(m.memoized).toHaveProperty('foo')
    expect(m.memoized).toHaveProperty('bar')
  });

  it('must have a `memoized` method who is callable', function () {
    const m = new MemoizableWithMethods()
    expect(m.memoized.foo).toBeInstanceOf(Function)
    expect(m.memoized.bar).toBeInstanceOf(Function)
  })

  it('must create a memoized function once', function () {
    const m = new MemoizableWithMethods()
    expect(m.memoized.foo).toBe(m.memoized.foo)
    expect(m.memoized.bar).toBe(m.memoized.bar)
    expect(m.memoized.foo).not.toBe(m.memoized.bar)
  })

  it('must memoized the result of the foo function', async function () {
    const m = new MemoizableWithMethods()
    const time = m.memoized.foo()
    // Await 100ms
    await new Promise(resolve => setTimeout(resolve, 100));
    // Result should be the same
    expect(m.memoized.foo()).toBe(time)
    expect(m.foo()).not.toBe(time)
  })

  it('must memoized the result of the bar function', function () {
    const m = new MemoizableWithMethods()
    expect(m.memoized.bar()).toBe(m.memoized.bar())
    expect(m.memoized.bar()).not.toBe(m.bar())
  })

  it('must memoized the result of the bar function from two different instances', function () {
    const a = new MemoizableWithMethods()
    const b = new MemoizableWithMethods()
    expect(a.memoized.bar()).toBe(a.memoized.bar())
    expect(a.memoized.bar()).not.toBe(b.memoized.bar())
  })

});
