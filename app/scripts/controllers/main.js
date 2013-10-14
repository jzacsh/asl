'use strict';

/**
 * First word to be finger spelled, as an example of the app on page load.
 *
 * @type {string}
 */
var EXAMPLE_FINGERSPELL = 'unicorn';



/**
 *
 * @param {!angular.$http} $http
 * @param {!angular.$location} $location
 * @param {!angular.$log} $log
 * @param {!angular.$scope} $scope
 * @param {!angular.$timeout} $timeout
 * @param {!angular.$window} $window
 * @constructor
 */
var Controller = function(
      $http, $location, $log, $scope, $timeout, $window) {

  /** @private {!angular.$http} */
  this.http_ = $http;

  /** @private {!angular.$log} */
  this.log_ = $log;

  /** @private {!angular.Scope} */
  this.scope_ = $scope;

  /** @type {!Object.<string,string>} */
  this.scope_.config = Controller.UiConfig;

  // Update our guess of "production", to hide/show any debug functionality.
  this.scope_.config.is_likely_prod = !$location.host().match(/^home/);

  /** @type {!angular.$timeout} */
  this.timeout_ = $timeout;

  /**
   * Promise to manage visual delay between signs being displayed.
   *
   * @private {?angular.Promise}
   */
  this.signDelay_ = null;

  /**
   * Sequential index of the particular sign in a set of signs that are
   * being displayed.
   *
   * For example: If "foo" is being finger-spelled, then "f" is index 0, "o" is
   * 1, and the last "o" is 2.
   *
   * @type {number}
   */
  this.signIndex_ = 0;

  /**
   * Free database of Words fetched from
   * http://www.giwersworld.org/computers/linux/common-words.phtml
   *
   * @private {!Array.<string>}
   */
  this.randomWords_ = [];

  // Load words to finger-spell.
  this.getRandomWordsToSpell_();

  // Start listening for keyboard shortcuts.
  $window.addEventListener('keyup', angular.bind(this, this.keyupHandler));

  // Kick off an example, to show what this app can do.
  this.fingerSpellWord(EXAMPLE_FINGERSPELL);

  return this.scope_.Ctrl = this;
};


/**
 * UI Configuration
 * @type {!Object.<string,string>}
 */
Controller.UiConfig = {
  /**
   * A rough guess as to whether this is production.
   * @type {boolean}
   */
  is_likely_prod: true,
  /**
   * Whether debugging contents should be visible.
   * @type {boolean}
   */
  debug_visible: false,

  /**
   * Seconds each letter should be spelled for.
   *
   * @type {number}
   */
  letter_delay: 0.5,

  /**
   * Word a finger-spell was requested for. 
   *
   * @type {string}
   */
  to_spell: '',

  /**
   * History of words spelled in the current session.
   *
   * Each word is represented by a key which is the spelled out word
   * itself, and a value value which is the number of times it was spelled
   * consecutively after first introduced.
   * @type {!Array.<!{word: string, spelled: number}>}
   */
  spelled_history: [],

  /**
   * Keep count of "respell"s of the current word.
   *
   * @type {number}
   */
  respell_count: 0
};


/**
 * Event handler for keyup events to handle hotkeys.
 *
 * @param {!Event} event
 */
Controller.prototype.keyupHandler = function(event) {
  if (Controller.isActionableNode_(event.target.nodeName)) {
    return;
  }

  switch(event.keyCode) {
    case 78:  // "n"
      this.spellPseudoRandomWord();
      break;

    case 82:  // "r"
      this.fingerSpellWord(this.getLastWord());
      break;

    default:
      return;
  }
};


/**
 * @param {string} nodeName
 * @return {boolean}
 * @private
 */
Controller.isActionableNode_ = function(nodeName) {
  return nodeName == 'INPUT' ||
         nodeName == 'TEXTAREA' ||
         nodeName == 'SELECT' ||
         nodeName == 'OPTIONS';
};


/**
 * Loads and caches list of commonly used English words.
 * @private
 */
Controller.prototype.getRandomWordsToSpell_ = function() {
  if (this.randomWords_.length) {
    return;
  }

  var success = angular.bind(this, function(response) {
    this.randomWords_ = response.data.words;
  });
  var error = function(error) {
    this.log_.error('failed to fetch words.json', error);
  };
  this.http_.get('/words.json').then(success, error);
};


/**
 * @return {boolean}
 *     Whether something is currently being signed.
 */
Controller.prototype.signInProgress = function() {
  return !!(this.scope_.config.active_sign &&
            this.scope_.config.active_sign.length);
};


/**
 * Toggles visibility of debugging contents (JSON, and angular inards).
 */
Controller.prototype.toggleDebug = function() {
  this.scope_.config.debug_visible = !this.scope_.config.debug_visible;
};


/**
 * @return {string}
 *     The most recently finger-spelled word.
 */
Controller.prototype.getLastWord = function() {
  var historyLength = this.scope_.config.spelled_history.length;
  return historyLength ?
         this.scope_.config.spelled_history[historyLength - 1].word :
         '';
};


/**
 * Records that {@code word} was finger-spelled.
 *
 * Also notes the number of times {@code word} has been spelled consecutively
 * before this instance.
 *
 * @param {string} word
 *     Word being finger-spelled.
 * @private
 */
Controller.prototype.recordFingerSpelling_ = function(word) {
  var lastWordIndex;
  var isRespell = this.getLastWord() == word;
  if (isRespell) {
    lastWordIndex = this.scope_.config.spelled_history.length - 1;
    this.scope_.config.spelled_history[lastWordIndex].spelled++;
  } else {
    var recording = {word: word, spelled: 1};
    lastWordIndex = this.scope_.config.spelled_history.push(recording) - 1;
  }

  this.scope_.config.respell_count = this.scope_.config.
      spelled_history[lastWordIndex].spelled - 1;
};


/**
 * Calls {@link #fingerSpellWord} on a pseudo random word from
 * {@link #UiConfig}'s {@code words}.
 */
Controller.prototype.spellPseudoRandomWord = function() {
  if (!this.randomWords_.length) {
    this.log_.warn('words db not loaded yet...');
  }
  var randomWord = Math.floor(Math.random() * this.randomWords_.length);
  this.fingerSpellWord(this.randomWords_[randomWord]);
};


/**
 * Visually spells the word, {@code toSpell} at a rate specified by
 * {@link #UiConfig}'s {@code letter_delay} seconds per letter.
 *
 * @param {string} toSpell
 *     A word to be finger-spelled visually on the page.
 */
Controller.prototype.fingerSpellWord = function(toSpell) {
  // Sanity check
  if (!toSpell || !toSpell.match(/^[a-z0-9]*$/i)) {
    return;
  }
  this.signIndex_ = 0;  // reset

  // Stop other finger-spelling sequences
  if (this.signDelay_) {
    this.timeout_.cancel(this.signDelay_);
  }

  // Keep track of finger-spellings
  this.recordFingerSpelling_(toSpell);

  this.delaySpell_(toSpell);  // kick off spelling
};


/**
 * @param {string|undefined} letter
 * @private
 */
Controller.prototype.fingerSpell_ = function(letter) {
  this.scope_.config.active_sign = String(letter || '').toLowerCase();
};


/**
 * @return {number}
 *     Milliseconds of delay intended for {@link angular.$timeout}.
 * @private
 */
Controller.prototype.getSpellDelay_ = function() {
  var isFirstLetter = !this.signIndex_;
  var secondsToSpell = isFirstLetter ?
      0 : parseFloat(this.scope_.config.letter_delay, 10);
  var milliseconds = secondsToSpell * 1000;
  return milliseconds;
};


/**
 * @return {!angular.Promise}
 * @param {string} toSpell
 *     The full word being spelled.
 * @private
 */
Controller.prototype.delaySpell_ = function(toSpell) {
  this.scope_.delay = this.timeout_(
      angular.bind(this, this.renderSpellRecursive_, toSpell),
      this.getSpellDelay_());
};


/**
 * Visually renders the current letter being finger-spelled and triggers a
 * delayed render for the next letter.
 *
 * @param {string} toSpell
 *     The full word being spelled.
 * @private
 */
Controller.prototype.renderSpellRecursive_ = function(toSpell) {
  var letterToSpell = toSpell[this.signIndex_++]

  this.fingerSpell_(letterToSpell);

  if (letterToSpell) {
    this.delaySpell_(toSpell); // recurse
  } else {
    this.timeout_.cancel(this.signDelay_);
  }
};


/** @type {!angular.Module} */
angular.
    module('spellApp').
    controller('MainCtrl', Controller);
