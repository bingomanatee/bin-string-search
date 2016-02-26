import binStringSearch from '../../src/bin-string-search';
var fs = require('fs');
var _ = require('lodash');

const _words = (index, count) => _.uniq(index.map((item) => item.word)).slice(0, count);

describe('binStringSearch', () => {
	describe('StringDigestor', () => {
		let digestor;
		before(() => {
			digestor = new binStringSearch.StringDigestor(null, 3);
		});

		describe('.strToNum', () => {
			it('has an a', () => {
				expect(digestor.strToNum('a')).to.equal(1);
			});

			it('doesn\'t do any weirdness on two as', () => {
				expect(digestor.strToNum('aa')).to.equal(1);
			});

			it('finds bce', function () {
				expect(digestor.strToNum('bce')).to.equal(22);
			});
		});

		describe('.find', () => {
			var dictIndex;
			const term = 'bob';

			before(function () {
				this.timeout(10000);
				var words = fs.readFileSync(__dirname + '/../wordsEn.txt').toString().split(/[\n\r]+/);
				dictIndex = digestor.index(words, {})
			});

			it('finds a bob', () => {
				let bobWords = [
					{
						word: 'bob',
						index: digestor.strToNum('bob'),
						item: 'bob'
					},
					{
						word: 'rob',
						index: digestor.strToNum('rob'),
						item: 'rob'
					}
				];
				var bobs = digestor.find('bob', bobWords);
				// console.log('bob words:', bobs);
				expect(bobs).to.deep.equal([{word: 'bob', index: 2, item: 'bob'}]
				);
			});

			it('finds the bobs in the dictionary', () => {
				var time = new Date().getTime();
				let bobs = digestor.find(term, dictIndex);
				var endTime = new Date().getTime();
				// console.log('dictionary: ', dictIndex.slice(0, 6));
				// console.log('word with bob in it', JSON.stringify(bobs));
				const indexTime = endTime - time;
				console.log('time to find ' + term + ' in the dictionary:', indexTime);

				time = new Date().getTime();
				var bobs2 = digestor.findWithoutIndex('bob', dictIndex);
				endTime = new Date();
				const noIndexTime = endTime - time;
				// console.log('word with bob in it (no index)', bobs2);
				console.log('time to find ' + term + ' in the dictionary (without indexed searh):', noIndexTime);

				expect(bobs).to.deep.equal(bobs2);
				expect(indexTime).to.be.below(noIndexTime);
			});
		});

		describe('.find Large File', () => {
			var warAndPeaceIndex;
			var term = 'he';
			let indexTime;
			let heWordsNoIndex, heWords;
			let noIndexTime;

			before(function () {
				this.timeout(10000);
				var words = fs.readFileSync(__dirname + '/../warAndPeace.txt').toString().split(/[\W]+/);
				warAndPeaceIndex = digestor.index(words, {})
			});

			beforeEach(function () {
				var time = new Date().getTime();
				heWords = digestor.find(term, warAndPeaceIndex);
				var endTime = new Date().getTime();
				// console.log('war and peace: ', warAndPeaceIndex.slice(0, 6));
				// console.log('word with he in it', _words(heWords, 10));
				indexTime = endTime - time;
				// console.log('time:', indexTime);
			});

			beforeEach(function () {
				let time = new Date().getTime();
				heWordsNoIndex = digestor.findWithoutIndex(term, warAndPeaceIndex);
				let endTime = new Date();
				noIndexTime = endTime - time;
			});

			it('finds the ' + term + ' in the dictionary', () => {

				// console.log('word with he in it (no index)', _words(heWordsNoIndex, 10));
				// console.log('time:', noIndexTime);

				expect(_.map(heWords, 'item')).to.deep.equal(_.map(heWordsNoIndex, 'item'));
				expect(indexTime).to.be.below(noIndexTime);
			});
		});

		describe('.find Large File -- words', () => {
			var index;
			const term = 'the first';
			const file = __dirname + '/../warAndPeace.txt';

			before(function (done) {
				this.timeout(10000000);
				var s = new Date().getTime();
				index = [];
				var stream = fs.createReadStream(file);

				stream.on('data', (data) => {
					let sentences = data.toString().split(/[\.,]/g);
					let partIndex = digestor.index(sentences);
					index = index.concat(partIndex);
					// console.log('indexed part of War and Peace', index.slice(0, 4));
				});

				stream.on('end', () => {
					var t = new Date().getTime() - s;
					index = _.sortBy(index, 'index').reverse();
					done();
				});
			});

			it('finds the ' + term + ' in ' + file, () => {
				var time = new Date().getTime();
				let matchedSentences = digestor.find(term, index);
				var endTime = new Date().getTime();
				// console.log('War and Peace index: ', index.slice(0, 6));
				//	console.log('sentences with ' + term + ' in ' + file + ' with string find ', _words(matchedSentences));
				const indexTime = endTime - time;
				//console.log('time to search ' + file + ':', indexTime);

				time = new Date().getTime();
				var matchedSentencesNoIndex = digestor.findWithoutIndex(term, index);
				endTime = new Date();
				const noIndexTime = endTime - time;
				//	console.log('sentences with ' + term + ' in ' + file + ' without indexing ', _words(matchedSentencesNoIndex));
				//console.log('time to search ' + file + 'without indexing:', noIndexTime);

				expect(matchedSentences).to.deep.equal(matchedSentencesNoIndex);
				expect(indexTime).to.be.below(noIndexTime);
			})
			;
		});

		describe('.find Large File -- phrases', () => {
			let stringIndex;
			const term = 'the first';
			const file = __dirname + '/../greatExpectations.txt';

			before(function (done) {
				this.timeout(10000000);
				var s = new Date().getTime();
				stringIndex = [];
				var stream = fs.createReadStream(file);

				stream.on('data', (data) => {
					let sentences = data.toString().toLowerCase().split(/[\.,]/g).map(sentence => sentence.replace(/[\W]+/g, ' '));
					stringIndex = stringIndex.concat(digestor.index(sentences));
				});

				stream.on('end', () => {
					var t = new Date().getTime() - s;
					// console.log('indexed ' + file + ' for strings in ', t / 1000, 'seconds');
					stringIndex = _.sortBy(stringIndex, 'index').reverse();
					done();
				});
			});

			let matchedSentencesUsingStringSearch;
			let stringIndexTime = 0;

			before(function () {
				// search 2: using string match algorithm

				let time = new Date().getTime();
				matchedSentencesUsingStringSearch = digestor.find(term, stringIndex);
				let endTime = new Date().getTime();
				// console.log('sentences in ' + file + 'with ' + term + ' in it', _words(matchedSentences, 10));
				stringIndexTime = endTime - time;
				console.log('time to search ' + file + ' for ' + term + ' using string search:', stringIndexTime / 1000, 'seconds');
			});

			let noIndexTime;
			let matchedSentencesNoIndex;

			before(function () {
				// search 3: using brute force search
				const time = new Date().getTime();
				matchedSentencesNoIndex = digestor.findWithoutIndex(term, stringIndex);
				const endTime = new Date();
				noIndexTime = endTime - time;
				// console.log('sentences with ' + term + ' in it (no index) ', _words(matchedSentencesNoIndex, 10));
				console.log('time to search ' + file + ' for ' + term + 'without indexing:', noIndexTime / 1000, 'seconds');
			});

			it('should have string index in descending index order ', function () {
				var last = null;

				for (let item in stringIndex) {
					var v = item.index;
					if (last && last !== v) {
						expect(v).to.be.below(last);
					}
					last = v;
				}
			});

			it('hits from finding ' + term + ' in ' + file + ' using string search should equal unindexed search hits', function () {
				expect(_.map(matchedSentencesUsingStringSearch, 'item')).to.deep.equal(_.map(matchedSentencesNoIndex, 'item'));
			});

			it('should be faster searching with strings than with no index', function () {
				expect(stringIndexTime).to.be.below(noIndexTime);
			});
		});
	});
});
