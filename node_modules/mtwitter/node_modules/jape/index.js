//Could probably replace some of the new variables being created with 
//writing over the old ones. Might make it slightly faster, but it's
//probably not a big deal.

module.exports = function(jsonIn) {
    var finString = '';
    for (var i in jsonIn) {
        var str = jsonIn[i];
        var str2 = encodeURIComponent(str.trim());
        var str6 = i.concat('=', str2, '&');
        finString = finString.concat(str6);
        finString = finString.replace("'", '%27');
    }
    var str4 = finString.replace("'", '%27');
    var lastChar = str4.substr(str4.length - 1 );
    if (lastChar == '&') {
        var str5 = finString.substr(0, str4.length-1 );
        return str5;

    } else {
        return str4
    }
}