var _ = require('lodash');

const phrasiphy = (pString) => _.compact(pString.toLowerCase().split(/[\W]+/g)).join(' ');

class StringDigestor {
	constructor (config, minWordInPhrase) {
		this.codes = 'abcdefghijklmnipqrstuvwxyz'.split('').concat(config || DEFAULT_CONFIG).slice(0, 32);
		this.minWordInPhrase = minWordInPhrase || 2;
	}

	set codes (code) {
		this._code = code;
		this.tests = code.map((code) => tests[code]);
	}

	get codes () {
		return this._code;
	}

	find (pString, index) {
		const key = this.strToNum(pString);
		const string = pString.toLowerCase();
		let matches = [];
		for (let i = 0; i < index.length; ++i) {
			if ((key & index[i].index) === key) {
				if (index[i].word.indexOf(string) !== -1) {
					matches.push(index[i]);
				}
			}
			if (index[i].index < key) {
				break;
			}
		}
		return _.sortBy(matches, (i) => i.order);
	}

	findWithoutIndex (pString, index) {
		const string = pString.toLowerCase();

		return _.sortBy(index.filter((item) => {
			if (item.word.indexOf(string) != -1) {
				return true;
			}
			return false;
		}, []), 'order');
	}

	strToNum (pText) {
		let text = pText.toLowerCase();
		var flags = [];
		for (let i = 0; i < this.codes.length; ++i) {
			flags[i] = 0;
		}
		for (let t of text) {
			for (let i = 0; i < this.tests.length; ++i) {
				if (!flags[i]) {
					flags[i] = this.tests[i](t, text, pText);
				}
			}
		}
		var int = 0;
		for (let i = 0; i < this.codes.length; ++i) {
			if (flags[i]) {
				var newInt = int | (1 << i);
				if (newInt < 0) {
					console.log('went negative at index ', i);
				} else {
					int = newInt;
				}
			}
		}
		//	console.log('string: ', pText);
		//	console.log('flags: ', flags.map((v) => v ? 1 : 0).join(''));
		//	console.log('int: ', int);

		return int;
	}

	index (data, pParams) {
		let params = pParams || {};
		let phraseIndex = params.phrase;
		let dataToString = params.dataToString || _.identity;
		var out = _(data).reduce((goodItems, item, i) => {
			let word = dataToString(item);
			if (_.trim(word).length) {
				let index;

				if (phraseIndex) {
					word = ` ${phrasiphy(word)} `;
					index = this.phraseToNums(word);
				} else {
					index = this.strToNum(word);
				}

				let summary = {
					word: word, order: i,
					index: index,
					item: item
				};

				if (phraseIndex) {
					summary.maxIndex = _.max(index);
					summary.minIndex = _.min(index);
					summary.index = index.reduce((m, w) => m[w] = true, {});
				}

				goodItems.push(summary);
			}
			return goodItems;
		}, []);
		return _(out).sortBy(phraseIndex ? 'maxIndex' : 'index').reverse().value();
	}
}

StringDigestor.NONALPHANUM = 'NONALPHANUM';
StringDigestor.NUMERIC = 'NUMERIC';
StringDigestor.BRACES = 'BRACES';
StringDigestor.PUNCTUATION = 'PUNCTUATION';
StringDigestor.SPACE = 'SPACE';
StringDigestor.LEAD1 = 'LEAD1';
StringDigestor.LEAD2 = 'LEAD2';
StringDigestor.LEAD3 = 'LEAD3+';
StringDigestor.CAPS = 'CAPS';

const tests = {
	a: (t) => t.toLowerCase() === 'a',
	b: (t) => t.toLowerCase() === 'b',
	c: (t) => t.toLowerCase() === 'c',
	d: (t) => t.toLowerCase() === 'd',
	e: (t) => t.toLowerCase() === 'e',
	f: (t) => t.toLowerCase() === 'f',
	g: (t) => t.toLowerCase() === 'g',
	h: (t) => t.toLowerCase() === 'h',
	i: (t) => t.toLowerCase() === 'i',
	j: (t) => t.toLowerCase() === 'j',
	k: (t) => t.toLowerCase() === 'k',
	l: (t) => t.toLowerCase() === 'l',
	m: (t) => t.toLowerCase() === 'm',
	n: (t) => t.toLowerCase() === 'n',
	o: (t) => t.toLowerCase() === 'o',
	p: (t) => t.toLowerCase() === 'p',
	q: (t) => t.toLowerCase() === 'q',
	r: (t) => t.toLowerCase() === 'r',
	s: (t) => t.toLowerCase() === 's',
	t: (t) => t.toLowerCase() === 't',
	u: (t) => t.toLowerCase() === 'u',
	v: (t) => t.toLowerCase() === 'v',
	w: (t) => t.toLowerCase() === 'w',
	x: (t) => t.toLowerCase() === 'x',
	y: (t) => t.toLowerCase() === 'y',
	z: (t) => t.toLowerCase() === 'z',
	SPACE: (t) => t === ' '
};

var bre = /\{\}\[\]\(\)/
tests[StringDigestor.BRACES] = (t) => bre.test(t);

const nare = /\W/;
const lead1re = /^1/;
const lead1re2 = /[\D]+1/;
const lead2re = /^1/;
const lead2re2 = /[\D]+1/;
const lead3re = /^[34567890]/;
const lead3re2 = /[\D]+[34567890]/;
const nre = /\d/;
const pre = /[~!@#$%^&*()_+-=`\{\}\[\]:";'<>,./?\`\\\/]/;

tests[StringDigestor.CAPS] = (t) => t.toLowerCase() != t;
tests[StringDigestor.LEAD1] = (t, s) => lead1re.test(s) || lead1re2.test(s);
tests[StringDigestor.LEAD2] = (t, s) => lead2re.test(s) || lead2re2.test(s);
tests[StringDigestor.LEAD3] = (t, s) => lead3re.test(s) || lead3re2.test(s);
tests[StringDigestor.NONALPHANUM] = (t) => nare.test(t);
tests[StringDigestor.NUMERIC] = (t) => nre.test(t);
tests[StringDigestor.PUNCTUATION] = (t) => pre.test(t);
tests[StringDigestor.CAPS] = (t, w, o) => o != w;

var DEFAULT_CONFIG = [
	StringDigestor.NUMERIC,
	StringDigestor.SPACE,
	StringDigestor.PUNCTUATION,
	StringDigestor.NONALPHANUM
];

module.exports = StringDigestor;
