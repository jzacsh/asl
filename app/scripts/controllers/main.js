'use strict';

/**
 * Word to be finger spelled.
 *
 * @type {string}
 */
var DEFAULT_TO_SPELL = 'unicorn';


/**
 * Seconds each letter should be spelled for.
 *
 * @type {number}
 */
var DEFAULT_LETTER_DELAY = 1;


/**
 * @see {@link DEFAULT_LETTER_DELAY}
 * @type {number}
 */
var FIRST_LETTER_SPEED = 0.75;


/**
 *
 * @param {!angular.$http} http
 * @param {{words: !Array.<string>}} config
 */
var loadWords = function(http, config) {
  if (config.words.length) {
    return;
  }

  var success = function(response) {
    config.words = response.data.words;
  };
  var error = function(error) {
    console.error('failed to fetch words.json', error);
  };
  http.get('/words.json').then(success, error);
};


angular.module('spellApp')
  .controller('MainCtrl', function ($http, $scope, $timeout) {
    $scope.config = {
      letter_delay: DEFAULT_LETTER_DELAY,
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
       * Free database of Words fetched from
       * http://www.giwersworld.org/computers/linux/common-words.phtml
       *
       * @type{!Array.<string>}
       */
      words: []
    };

    loadWords($http, $scope.config);

    /**
     * @type {!angular.Promise}
     */
    $scope.delay;

    /**
     * @return {string}
     *     The most recently finger-spelled word.
     */
    $scope.getLastWord = function() {
      var historyLength = $scope.config.spelled_history.length;
      return historyLength ?
             $scope.config.spelled_history[historyLength - 1].word :
             '';
    };

    /**
     * Records that {@code word} was finger-spelled.
     *
     * @param {string} word
     *     Word being finger-spelled.
     * @return {number}
     *     Number of times {@code word} has been spelled consecutively before
     *     this instance.
     */
    var recordFingerSpelling = function(word) {
      var lastWordIndex;
      var isRespell = $scope.getLastWord() == word;
      if (isRespell) {
        lastWordIndex = $scope.config.spelled_history.length - 1;
        $scope.config.spelled_history[lastWordIndex].spelled++;
      } else {
        var recording = {word: word, spelled: 1};
        lastWordIndex = $scope.config.spelled_history.push(recording) - 1;
      }

      return $scope.config.spelled_history[lastWordIndex].spelled;
    };


    /**
     * Calls {@link $scope.fingerSpellWord} on a pseudo random word from
     * {@link $scope.config.words}.
     */
    $scope.spellPseudoRandomWord = function() {
      if (!$scope.config.words.length) {
        console.warning('words db not loaded yet...');
      }
      var randomWord = Math.floor(Math.random() * $scope.config.words.length);
      $scope.fingerSpellWord($scope.config.words[randomWord]);
    };

    /**
     * Updates AngularJS UI models to visuall spell the word, {@code toSpell}
     * at {@code $scope.config.letter_delay} seconds per letter.
     *
     * @param {string} toSpell
     *     A word to be finger spelled visually on the page.
     */
    $scope.fingerSpellWord = function(toSpell) {
      /**
       * @type {number}
       */
      var index = 0;
      if (!toSpell.match(/^[a-z]*$/i)) {
        return;
      }
      // Save for later "previous" features.
      $scope.respell_count = recordFingerSpelling(toSpell) - 1;

      if ($scope.delay) {
        $timeout.cancel($scope.delay);
      }

      /**
       * @param {string|undefined} letter
       */
      var fingerSpell = function(letter) {
        $scope.config.active_sign = String(letter || '').toLowerCase();
      };

      /**
       * @param {number} idx
       *     The numeric index of the letter being spelled within a given word.
       * @return {number}
       *     The milliseconds of delay intended for {@link angular.$timeout}.
       */
      var getSpellDelay = function(idx) {
        var isFirstLetter = !index;
        var secondsToSpell = isFirstLetter ?
            0 : parseInt($scope.config.letter_delay, 10);
        var milliseconds = secondsToSpell * 1000;
        return milliseconds;
      };

      /**
       * @return {!angular.Promise}
       */
      var delaySpell = function() {
        $scope.delay = $timeout(function() {
          var letterToSpell = toSpell[index++]

          fingerSpell(letterToSpell);

          if (letterToSpell) {
            delaySpell(); // recurse
          } else {
            $timeout.cancel($scope.delay);
          }
        }, getSpellDelay(index));
      };

      delaySpell(); // kick off spelling
    };

    // kick off example
    $scope.fingerSpellWord(DEFAULT_TO_SPELL);
  });
