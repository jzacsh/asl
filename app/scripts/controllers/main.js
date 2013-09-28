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
      to_spell: DEFAULT_TO_SPELL,
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

      if ($scope.delay) {
        $timeout.cancel($scope.delay);
      }

      /**
       * @param {string|undefined} letter
       */
      var fingerSpell = function(letter) {
        $scope.config.active_sign = letter || '';
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
        }, parseInt($scope.config.letter_delay, 10) * 1000);
      };
      delaySpell(); // kick off spelling
    };

    // kick off example
    $scope.fingerSpellWord($scope.config.to_spell);
  });
