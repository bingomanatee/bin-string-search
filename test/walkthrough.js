const binStringSearch = require('../dist/bin-string-search');
const StringDigestor = binStringSearch.default.StringDigestor;

console.log('binStringSearch: ', binStringSearch);

var util = require('util');

var fs = require('fs');
var _ = require('lodash');
const digestor = new StringDigestor();

const words = fs.readFileSync('aFewWords.txt').toString().split(/[\n\r]+/g);
const searchPhrase = 'donkey kong';
var index = digestor.index(words, {phrase: true});
console.log('maxes', _.map(index, 'maxIndex'))
console.log('index of donkey:', digestor.strToNum('donkey'));
console.log('index of kong:', digestor.strToNum('kong'));
console.log('index of kongress:', digestor.strToNum('kongress'));
var stn = digestor.phraseToNums(searchPhrase);

console.log('strToNums of "' + searchPhrase + '"', stn);
console.log('index of words: ', util.inspect(index));

var hits = digestor.findPhrase(searchPhrase, index);

console.log('hits: ', hits);