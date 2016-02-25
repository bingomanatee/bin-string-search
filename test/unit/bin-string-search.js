import binStringSearch from '../../src/bin-string-search';
var fs = require('fs');
var _ = require('lodash');

const _words = (index, count) => _.uniq(index.map((item) => item.word)).slice(0, count);

describe('binStringSearch', () => {
    describe('StringDigestor', () => {
        let digestor;
        before(() => {
            digestor = new binStringSearch.StringDigestor();
        });

        it('should have the expected codes', () => {
            expect(digestor.codes.join(',')).to.equal('a,b,c,d,e,f,g,h,i,j,k,l,m,n,i,p,q,r,s,t,u,v,w,x,y,z,NUMERIC,SPACE,PUNCTUATION,NONALPHANUM');
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

        describe('.index', () => {
            it('should index strings', () => {
                expect(digestor.index(['a', 'bce', 'bible'], {})).to.deep.equal([
                    {word: 'a', index: 1, item: 'a'},
                    {word: 'bce', index: 22, item: 'bce'},
                    {
                        "index": 18706,
                        "item": "bible",
                        "word": "bible"
                    }]);
            })
        });

        describe('.find', () => {
            var dictIndex;

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
                ]
                var bobs = digestor.find('bob', bobWords);
                // console.log('bob words:', bobs);
                expect(bobs).to.deep.equal([{word: 'bob', index: 2, item: 'bob'}]
                );
            });

            it('finds the bobs in the dictionary', () => {
                var time = new Date().getTime();
                let bobs = digestor.find('bob', dictIndex);
                var endTime = new Date().getTime();
                // console.log('dictionary: ', dictIndex.slice(0, 6));
                // console.log('word with bob in it', JSON.stringify(bobs));
                const indexTime = endTime - time;
                console.log('time:', indexTime);

                time = new Date().getTime();
                var bobs2 = digestor.findWithoutIndex('bob', dictIndex);
                endTime = new Date();
                const noIndexTime = endTime - time;
                // console.log('word with bob in it (no index)', bobs2);
                console.log('time(without indexed searh):', noIndexTime);

                expect(bobs).to.deep.equal(bobs2);
                expect(indexTime).to.be.below(noIndexTime);
            });
        });

        describe('.find Large File', () => {
            var warAndPeaceIndex;

            before(function () {
                this.timeout(10000);
                var words = fs.readFileSync(__dirname + '/../warAndPeace.txt').toString().split(/[\W]+/);

                warAndPeaceIndex = digestor.index(words, {})
            });

            it('finds the bobs in the dictionary', () => {
                var time = new Date().getTime();
                let heWords = digestor.find('he', warAndPeaceIndex);
                var endTime = new Date().getTime();
                // console.log('war and peace: ', warAndPeaceIndex.slice(0, 6));
                // console.log('word with he in it', _words(heWords, 10));
                const indexTime = endTime - time;
                // console.log('time:', indexTime);

                time = new Date().getTime();
                var heWordsNoIndex = digestor.findWithoutIndex('he', warAndPeaceIndex);
                endTime = new Date();
                const noIndexTime = endTime - time;
                // console.log('word with he in it (no index)', _words(heWordsNoIndex, 10));
                // console.log('time:', noIndexTime);

                expect(heWords).to.deep.equal(heWordsNoIndex);
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
                    // console.log('indexed War and Peace in ', t / 1000, 'seconds');
                    done();
                });
            });

            it('finds the ' + term + ' in ' + file, () => {
                var time = new Date().getTime();
                let matchedSentences = digestor.find(term, index);
                var endTime = new Date().getTime();
                // console.log('War and Peace index: ', index.slice(0, 6));
                // console.log('sentences with ' + term + ' in it', _words(matchedSentences, 10));
                const indexTime = endTime - time;
                // console.log('time:', indexTime);

                time = new Date().getTime();
                var matchedSentencesNoIndex = digestor.findWithoutIndex(term, index);
                endTime = new Date();
                const noIndexTime = endTime - time;
                // console.log('sentences with ' + term + ' in it ', _words(matchedSentencesNoIndex, 10));
                // console.log('time:', noIndexTime);

                expect(matchedSentences).to.deep.equal(matchedSentencesNoIndex);
                expect(indexTime).to.be.below(noIndexTime);
            })
            ;
        });

        describe('.phraseToNums', () => {
            it('should give you an index of unique patterns', () => {
                expect(digestor.phraseToNums('a long time')).to.deep.equal([1, 10304, 545040]);
            });
        });

        describe('.index (phrases)', () => {
            const phrases = [
                'this is a sentence',
                'this has a "lot" of words',
                'A lot of things are good, but a lot of "things" are bad too',
                'lot a things are good'
            ];
            const term = 'a lot';
            let index = [];
            before(() => {
                index = digestor.index(phrases, {phrase: true});
            });

            it('should index ' + term, () => {
                expect(index).to.deep.equal(
                  [{
                      "item": "this has a \"lot\" of words",
                      "word": " this has a lot of words ",
                      "order": 1,
                      "index": [32, 262273, 526336, 803200, 4587528],
                      "maxIndex": 4587528
                  }, {
                      "item": "A lot of things are good, but a lot of \"things\" are bad too",
                      "word": " a lot of things are good but a lot of things are bad too ",
                      "order": 2,
                      "index": [11, 32, 72, 131089, 524288, 526336, 811456, 1572866],
                      "maxIndex": 1572866
                  }, {
                      "item": "lot a things are good",
                      "word": " lot a things are good ",
                      "order": 3,
                      "index": [72, 131089, 526336, 811456],
                      "maxIndex": 811456
                  }, {
                      "item": "this is a sentence",
                      "word": " this is a sentence ",
                      "order": 0,
                      "index": [278784, 794644, 803200],
                      "maxIndex": 803200
                  }]
                );
            });

            it('should find ' + term, () => {
                let hits = digestor.findPhrase(term, index);
                expect(hits).to.deep.equal(
                  [
                      {
                          item: 'this has a "lot" of words',
                          word: ' this has a lot of words ',
                          index: [1, 32, 262273, 526336, 803200, 4587528]
                      },
                      {
                          item: 'A lot of things are good, but a lot of "things" are bad too',
                          word: ' a lot of things are good but a lot of things are bad too ',
                          index: [1, 11, 32, 72, 131089, 524288, 526336, 811456, 1572866]
                      }
                  ]
                );
            });
        });

        describe('.find Large File -- phrases', () => {
            var index;
            const term = 'a young man';
            const file = __dirname + '/../greatExpectations.txt';

            before(function (done) {
                this.timeout(10000000);
                var s = new Date().getTime();
                index = [];
                var stream = fs.createReadStream(file);

                stream.on('data', (data) => {
                    let sentences = data.toString().split(/[\.,]/g);
                    let partIndex = digestor.index(sentences, {phrase: false});
                    index = index.concat(partIndex);
                    // console.log('indexed part of War and Peace', index.slice(0, 4));
                });

                stream.on('end', () => {
                    var t = new Date().getTime() - s;
                    // console.log('indexed War and Peace in ', t / 1000, 'seconds');
                    done();
                });
            });

            it('finds the ' + term + ' in ' + file, function () {
                this.timeout(10000000);
                var time = new Date().getTime();
                let matchedSentences = digestor.find(term, index);
                var endTime = new Date().getTime();
                console.log('sentences with ' + term + ' in it', _words(matchedSentences, 10));
                const indexTime = endTime - time;
                console.log('time:', indexTime / 1000, 'seconds');

                time = new Date().getTime();
                var matchedSentencesNoIndex = digestor.findWithoutIndex(term, index);
                endTime = new Date();
                const noIndexTime = endTime - time;
                console.log('sentences with ' + term + ' in it (no index) ', _words(matchedSentencesNoIndex, 10));
                console.log('time:', noIndexTime / 1000, 'seconds');

                expect(matchedSentences).to.deep.equal(matchedSentencesNoIndex);
                expect(indexTime).to.be.below(noIndexTime);
            });
        });
    });
});
