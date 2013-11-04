'use strict';

describe('Directive: aslTxtImg', function() {
  var element,
      scope;

  var TEST_CONTENT = 'click to stop';

  beforeEach(function() {
    module('spellApp');
    inject(function($compile, $rootScope) {
      scope = $rootScope.$new();
      element = $compile(
          '<button asl-txt-img>' + TEST_CONTENT + '</button>')(scope);
      scope.$apply();
    });
  });

  it('should transfer text string to title', function() {
    expect(element.text().replace(/\s/g, '')).toBeFalsy();
    expect(element.attr('title')).toBe(TEST_CONTENT);
  });

  it('should add class to allow for background-image', function() {
    expect(element.hasClass('asl-txt-img')).toBe(true);
  });
});
