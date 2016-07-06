# Librarienne for Textual

A style for the [Textual IRC client](http://www.codeux.com/textual/).

## Features

* Sticky topic bar
* Nickname truncation (with expansion on hover)
* Compressed chat layout when your chat window is small
* Actions beginning with punctuation are treated as a full sentence, including the nickname
* Automatic hyphenation of words in messages
* Inline Open Graph previews (optionally)

## Building

Building Librarienne requires that Node.js (with npm) and Ruby be installed.

1. `gem install sass`
2. `npm install`
3. `npm run build`

After these three steps are run, the two Librarienne themes will be located in the "build" directory. To install, copy or move these directories into Textual's "Styles" directory.
