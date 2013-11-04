'use strict';

angular.module('spellApp')
  .directive('aslTxtImg', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var hoverText = element.text();
        element.attr('title', hoverText);
        element.text('');
        element.append('<span>&nbsp;</span>');
        element.addClass('asl-txt-img');
      }
    };
  });
