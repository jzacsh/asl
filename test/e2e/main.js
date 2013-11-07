'use strict';

describe('ASL Practice', function() {
  beforeEach(function() {
    browser().navigateTo('/index.html');
  });

  describe('initial page load', function() {
    it('should show example-word was just spelled', function() {
      element('.container').query(function(el, done) {
        dump('el:'); //@TODO: remove me!!    
        dump(el.eq(0).parent().html()); //@TODO: remove me!!    
      });

      element('.active-word .word').query(function(wordJq, done) {
        dump('wordJq:'); //@TODO: remove me!!    
        dump(wordJq.eq(0).parent().html()); //@TODO: remove me!!    
        expect(wordJq.text()).toBe('unicorn');
        done();
      });
    });

    it('should show number of words spelled so far', function() {
      throw new Error('write me!'); //@TODO: remove me!!    
    });
  });
});
