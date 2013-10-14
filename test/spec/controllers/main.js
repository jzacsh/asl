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
    it('should finger-spell an example', function() {
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
});
