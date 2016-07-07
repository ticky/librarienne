# Librarienne for Textual

A clean, minimalist style for the [Textual IRC client](http://www.codeux.com/textual/), written with modern web standards and techniques.

## Features

* Sticky topic bar
* Nickname truncation (with expansion on hover)
* Compressed chat layout when your chat window is small
* Actions beginning with punctuation are treated as a full sentence, including the nickname
* Automatic hyphenation of words in messages

## Compatibility

Librarienne is currently compatible with Textual versions 5.2 and the upcoming version 6.0. It also includes support for the experimental nickname colour hashing system introduced in later versions.

## Building

Building Librarienne requires that Node.js (with npm) and Ruby be installed.

1. `gem install sass`
2. `npm install`
3. `npm run build`

After these three steps are run, the two Librarienne themes will be located in the "build" directory. To install, copy or move these directories into Textual's "Styles" directory.

## History

Librarienne began as an experiment in seeing what could be done in a chat style when WebKit got flexbox support. It grew to encompass Open Graph previews, make use of sticky positioning, and influence Textual's authors to include a preference store API for themes (...for better or worse).
