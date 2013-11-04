'use strict';

describe('Controller: MainCtrl', function() {
  var Ctrl,
      controller,
      httpBackend,
      scope;

  var TEST_RANDOM_WORDS = ['foo', 'bar'];

  beforeEach(module('spellApp'));
  beforeEach(inject(function($controller, $httpBackend, $rootScope) {
    controller = $controller;
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
  }));

  beforeEach(function() {
    httpBackend.
      expectGET('/words.json').
      respond({words: TEST_RANDOM_WORDS});
    Ctrl = controller('MainCtrl', {
      $scope: scope
    });
  });

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('initial page load', function() {
    it('should fingerspell an example', function() {
      expect(Ctrl.getLastWord()).toBe(Controller.EXAMPLE_FINGERSPELL);
      httpBackend.flush();
    });

    it('should allow for random-word spelling', function() {
      expect(Ctrl.getLastWord()).toBe(Controller.EXAMPLE_FINGERSPELL);
      Ctrl.spellPseudoRandomWord();

      // No new word spelled
      expect(Ctrl.getLastWord()).toBe(Controller.EXAMPLE_FINGERSPELL);

      httpBackend.flush();
      Ctrl.spellPseudoRandomWord();
      var justSpelled = Ctrl.getLastWord();
      expect(justSpelled).not.toBe(Controller.EXAMPLE_FINGERSPELL);
      expect(TEST_RANDOM_WORDS).toContain(justSpelled);
    });
  });

  describe('manage fingerspelling speed', function() {
    // Not a concern in this suite
    beforeEach(function() { httpBackend.flush(); });

    it('should have initial speed', function() {
      expect(scope.config.letter_delay).toBeGreaterThan(0);
      expect(scope.config.letter_delay).
          toBeLessThan(Controller.UiConfig.letter_delay_max);
    });

    it('should increase speed', function() {
      scope.config.letter_delay = 1;
      expect(Ctrl.increaseLetterDelayPossible()).toBe(true);

      Ctrl.increaseLetterDelay();
      expect(scope.config.letter_delay).
          toBe(1 + Controller.UiConfig.letter_delay_step);

      scope.config.letter_delay = Controller.UiConfig.letter_delay_max;
      expect(Ctrl.increaseLetterDelayPossible()).toBe(false);
    });

    it('should decrease speed', function() {
      scope.config.letter_delay = 1;
      expect(Ctrl.decreaseLetterDelayPossible()).toBe(true);

      Ctrl.decreaseLetterDelay();
      expect(scope.config.letter_delay).
          toBe(1 - Controller.UiConfig.letter_delay_step);

      for (var i = 0; i < 20 && Ctrl.decreaseLetterDelayPossible(); ++i) {
        Ctrl.decreaseLetterDelay();
      }
      expect(Ctrl.decreaseLetterDelayPossible()).toBe(false);
    });
  });
});
