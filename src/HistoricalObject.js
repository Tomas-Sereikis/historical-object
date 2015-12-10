'use strict';

var isObject = require('lodash/lang/isObject');
var isArray = require('lodash/lang/isArray');
var isFunction = require('lodash/lang/isFunction');
var assert = require('assert');

module.exports = HistoricalObject;

/**
 * this will store history array
 * @type {WeakMap}
 */
var weakMap = new WeakMap();

/**
 * @param parent
 * @param inherited
 * @param object
 */
function defineProperties (parent, inherited, object) {
  console.log(Object.keys(object));
  Object.keys(object).forEach(function (key) {
    if (isObject(object[key])) {
      // make sure that we are creating right type of object
      var child = isArray(object[key]) ? [] : {};
      var value = object[key];
      object[key] = child;
      defineProperties(parent, child, value);
    }
    Object.defineProperty(inherited, key, {
      enumerable: true,
      get() {
        return object[key];
      },
      set(newValue) {
        var oldValue = object[key];
        // save revert callback to history object
        weakMap.get(parent).push([() => object[key] = oldValue]);
        object[key] = newValue;
      }
    });
  });
}

/**
 * @param {Object} object
 */
function HistoricalObject (object) {
  // make sure that constructor is a object
  assert.ok(this instanceof HistoricalObject, 'HistoricalObject must be called with new!');
  assert.ok(isObject(object), 'HistoricalObject constructor must be an Object!');
  // history state object
  weakMap.set(this, []);
  defineProperties(this, this, object);
}

HistoricalObject.prototype = {
  /**
   * revert object last change state
   */
  revert() {
    var previous = weakMap.get(this).pop();
    if (isArray(previous)) {
      previous.forEach(callback => callback());
    }
  }
};