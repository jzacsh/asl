# ASL Offline Practice

## Why Another ASL App?
I wanted a tool to use:
+ **offline** _(eg: in a subway)_
+ on my **phone** _(ie "mobile first")_
+ _and_ on my **desktop**

This started with finger-spelling only, but is in the process of evolving to do more.

## What Is It?
Flashcard style webapp to help me learn American Sign Language (ASL), for fun.
I'm currently a beginner.

## Feature Complete?
Currently only handles finger-spelling, but working on ability to any new sign.

### TODOs In Order of Priority
Specifically, I'm slowly working on the following:
+ ~~Enable touch-friendy buttons to change fingerspell speed~~
+ Switch fingerspelling to use [wiktionary raw](http://en.wiktionary.org/wiki/Appendix:1000_basic_English_words?action=raw&format=json) APIs for words
+ Fill in e2e test to cover current fingerspelling only functionality
+ Storing settings per-device _(eg: speed, or even progress/history)_
+ Update config to either: preferrable jshintrc, or jscompiler instead
+ Storing new signs _(ie maybe "new signs" feature should only be for
  personal progress)_
+ Input of new signs _(via webcam-to-autoGIF functionality)_
+ handle finger-spelling for numbers 10 and up
