'use strict';

var isObject = require('lodash/lang/isObject');
var isArray = require('lodash/lang/isArray');
var isFunction = require('lodash/lang/isFunction');
var assert = require('assert');

module.exports = HistoricalObject;

var historyWeakMap = new WeakMap();
var transactionsWeakMap = new WeakMap();

/**
 * @param parent
 * @param inherited
 * @param object
 */
function defineProperties (parent, inherited, object) {
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
        var transaction = transactionsWeakMap.get(parent);
        if (isArray(transaction)) {
          transaction.push(() => object[key] = oldValue);
        } else {
          historyWeakMap.get(parent).push([() => object[key] = oldValue]);
        }
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
  historyWeakMap.set(this, []);
  defineProperties(this, this, object);
}

HistoricalObject.prototype = {
  /**
   * revert object last change state
   */
  revert() {
    if (isArray(transactionsWeakMap.get(this))) {
      throw new Error('Can not revert while in transaction mode!');
    }
    var previous = historyWeakMap.get(this).pop();
    if (isArray(previous)) {
      previous.forEach(callback => callback());
    }
  },

  /**
   * start changes transaction
   */
  transaction() {
    if (!isArray(transactionsWeakMap.get(this))) {
      transactionsWeakMap.set(this, []);
    }
  },

  /**
   * commit transaction changes
   */
  commit() {
    var changes = transactionsWeakMap.get(this);
    if (isArray(changes)) {
      historyWeakMap.get(this).push(changes);
      transactionsWeakMap.delete(this);
    }
  }
};