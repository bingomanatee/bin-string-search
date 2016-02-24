import binStringSearch from '../../src/bin-string-search';
var fs = require('fs');
var words = fs.readFileSync(__dirname + '/../wordsEn.txt').toString().split(/[\n\r]+/);

describe('binStringSearch', () => {
	describe('StringDigestor', () => {
		let digestor;
		before(() => {
			digestor = new binStringSearch.StringDigestor();
		});

		it('should have the expected codes', () => {
			expect(digestor.codes.join(',')).to.equal('a,b,c,d,e,f,g,h,i,j,k,l,m,n,i,p,q,r,s,t,u,v,w,x,y,z,NUMERIC,SPACE,LEAD1,LEAD2,LEAD3+,NONALPHANUM');
		});

		describe('.strToNum', () => {
			it('has an a', funct.gitignoreion () {
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
			var index;

			before(function ()  {
				this.timeout(10000);
				index = digestor.index(words, {})
			});

			it('gives you a good dictionary', () => {
				console.log('dictionary: ', index.slice(0, 6));
			});
		});
	});
});
