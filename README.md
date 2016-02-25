# bin-string-search

Search for strings in a collection in up to half the time by using a reductive index that creates a single integer that
represents the set of characters in the search terms. 

single word searches can take 1/5 to 3/4 the time of an unindexed string search.

## How does it work?

Most searches compare sequences of strings. This algorithm reduces a string no matter how long to a 32 bit integer that
represents the inclusion or exclusion of its character set.

The first 26 bits map to the alphabet. the remaining bits represent spaces, digits and the more exotic characters (punctuation etc.)

The search term is likewise reduced to a single integer; only when the target is determined to have all the requisite characters and exotics
does a full search conclude. 

[![Travis build status](http://img.shields.io/travis/bingomanatee/bin-string-search.svg?style=flat)](https://travis-ci.org/bingomanatee/bin-string-search)
[![Code Climate](https://codeclimate.com/github/bingomanatee/bin-string-search/badges/gpa.svg)](https://codeclimate.com/github/bingomanatee/bin-string-search)
[![Test Coverage](https://codeclimate.com/github/bingomanatee/bin-string-search/badges/coverage.svg)](https://codeclimate.com/github/bingomanatee/bin-string-search)
[![Dependency Status](https://david-dm.org/bingomanatee/bin-string-search.svg)](https://david-dm.org/bingomanatee/bin-string-search)
[![devDependency Status](https://david-dm.org/bingomanatee/bin-string-search/dev-status.svg)](https://david-dm.org/bingomanatee/bin-string-search#info=devDependencies)
