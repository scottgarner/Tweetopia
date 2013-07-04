Jape is a simple way to convert a JSON object to a single URI Encoded string. Such strings can be used in API requests when one wants to use a comfortable JSON object and get it converted to a URL friendly string. It changes ` ' ' ` (a space) to ` %20 ` and similar, and also supports multi-property objects by concatenating with ` & `.

    var jape = require('jape');
    var jsonObject = {
        text: 'hello, tworld. welcome to 1.1.',
        screen_name: 'theseancook'
    }
    jape(jsonObject); //returns 'text=hello%2C%20tworld.%20welcome%20to%201.1.&screen_name=theseancook'
