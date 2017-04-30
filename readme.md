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
No. See [list of issues](../../issues) for plans and bug fixes.

## Disclaimer & License
See [LICENSE](LICENSE). Note: this is **not** a Google product. This is just a fun, personal
weekend project I whipped up when I got frustrated trying to learn to finger-spell.

## Development

1. just once:

```$
$ npm install
$ node_modules/bower/bin/ower install
```

2. build `./dist/` html output:
```$
$ node_modules/grunt-cli/bin/grunt build
````

3. view via some server (not your browser's `file://`)
```$
$ node_modules/grunt-cli/bin/grunt serve

# or do it yourself:

$ ( cd dist; python3 -m http.server; )
```
