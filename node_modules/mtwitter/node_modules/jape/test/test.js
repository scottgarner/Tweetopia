var mocha = require('mocha');
var expect = require('expect.js');
var jape = require('../index');

var one = { 
    status : "Maybe he'll finally find his keys. #peterfalk" 
}
var two = {
    text: 'hello, tworld. welcome to 1.1.',
    screen_name: 'theseancook'
}
var three = {
    slug: 'team',
    owner_screen_name: 'twitter',
    screen_name:'kurrik'
}

describe('jape', function() {
    it('should convert single property JSON to a serialized, percentage-swapped string', function() {
        expect(jape(one)).to.eql('status=Maybe%20he%27ll%20finally%20find%20his%20keys.%20%23peterfalk');
    });
    it('should convert two property JSON to a serialized, percentage-swapped string', function() {
        expect(jape(two)).to.eql('text=hello%2C%20tworld.%20welcome%20to%201.1.&screen_name=theseancook');
    });
    it('should convert multi property JSON to a serialized, percentage-swapped string', function() {
        expect(jape(three)).to.eql('slug=team&owner_screen_name=twitter&screen_name=kurrik');
    });
});