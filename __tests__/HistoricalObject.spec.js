/*global jest, describe, it, expect*/
'use strict';

jest.autoMockOff();

var isArray = require('lodash/lang/isArray');
var HistoricalObject = require('../src/HistoricalObject');

describe('HistoricalObject', function () {
  it('should revert first level value', function () {
    var historicalObject = new HistoricalObject({a: 1});
    expect(historicalObject.a).toBe(1);
    historicalObject.a = 2;
    expect(historicalObject.a).toBe(2);
    historicalObject.revert();
    expect(historicalObject.a).toBe(1);
  });

  it('should not remove keys', function () {
    var historicalObject = new HistoricalObject({a: 1, b: 2});
    expect(Object.keys(historicalObject)).toEqual(['a', 'b']);
  });

  it('should revert one value and leave others as is', function () {
    var historicalObject = new HistoricalObject({a: 1, b: 2});
    expect(historicalObject.a).toBe(1);
    expect(historicalObject.b).toBe(2);
    historicalObject.a = 2;
    expect(historicalObject.a).toBe(2);
    expect(historicalObject.b).toBe(2);
    historicalObject.a = 3;
    expect(historicalObject.a).toBe(3);
    expect(historicalObject.b).toBe(2);
    historicalObject.revert();
    expect(historicalObject.a).toBe(2);
    expect(historicalObject.b).toBe(2);
    historicalObject.revert();
    expect(historicalObject.a).toBe(1);
    expect(historicalObject.b).toBe(2);
    historicalObject.revert();
    expect(historicalObject.a).toBe(1);
    expect(historicalObject.b).toBe(2);
  });

  it('should revert from deep level object', function () {
    var historicalObject = new HistoricalObject({a: {a: 1, b: 2}});
    expect(historicalObject.a.a).toBe(1);
    expect(historicalObject.a.b).toBe(2);
    historicalObject.a.a = 2;
    expect(historicalObject.a.a).toBe(2);
    expect(historicalObject.a.b).toBe(2);
    historicalObject.revert();
    expect(historicalObject.a.a).toBe(1);
    expect(historicalObject.a.b).toBe(2);
  });

  it('should not remove deep level keys', function () {
    var historicalObject = new HistoricalObject({a: {a: 1, b: 2}});
    expect(Object.keys(historicalObject.a)).toEqual(['a', 'b']);
  });

  it('should revert array value change', function () {
    var historicalObject = new HistoricalObject({a: [1, 2]});
    expect(isArray(historicalObject.a)).toBeTruthy();
    expect(historicalObject.a.length).toBe(2);
    expect(historicalObject.a).toEqual([1, 2]);
    historicalObject.a[0] = 2;
    expect(historicalObject.a.length).toBe(2);
    expect(historicalObject.a).toEqual([2, 2]);
    historicalObject.revert();
    expect(historicalObject.a.length).toBe(2);
    expect(historicalObject.a).toEqual([1, 2]);
  });

  it('should revert changes from transaction', function () {
    var historicalObject = new HistoricalObject({a: {a: 1, b: 2}});
    expect(historicalObject.a.a).toBe(1);
    expect(historicalObject.a.b).toBe(2);
    historicalObject.transaction();
    historicalObject.a.a = 2;
    historicalObject.a.b = 1;
    expect(historicalObject.a.a).toBe(2);
    expect(historicalObject.a.b).toBe(1);
    historicalObject.commit();
    expect(historicalObject.a.a).toBe(2);
    expect(historicalObject.a.b).toBe(1);
    historicalObject.revert();
    expect(historicalObject.a.a).toBe(1);
    expect(historicalObject.a.b).toBe(2);
  });
});