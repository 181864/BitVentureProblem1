"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var server = http.createServer(function (req, res) {
    if (req.method !== 'POST') {
        validateRequest(req, res);
        return;
    }
    var body = '';
    req.on('data', function (chunk) {
        body += chunk.toString();
    });
    req.on('end', function () {
        try {
            var data = JSON.parse(body);
            var result = evaluate(data);
            generateResponse(res, 200, 'application/json', JSON.stringify({ result: result }));
        }
        catch (error) {
            generateResponse(res, 400, 'text/plain', error.message + " " + error.stack);
        }
    });
});
server.listen(8080, function () {
    var address = server.address();
    console.log('opened server on', address.port);
});
function generateResponse(response, statusCode, header, body) {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', header);
    response.end(body);
}
function validateRequest(request, response) {
    response.statusCode = 405;
    response.setHeader('Allow', 'POST');
    response.end('Method not allowed');
}
function evaluate(request) {
    var methods = {
        add: add,
        mode: mode,
        mean: mean,
        range: range,
        stddev: stddev
    };
    var method = methods[request.method];
    if (!method) {
        throw new Error('Invalid method');
    }
    return method(request.inputs);
}
function add(inputs) {
    return inputs.reduce(function (sum, input) { return sum + input; }, 0);
}
function mode(inputs) {
    var frequency = {};
    var maxFreq = 0;
    var modes = [];
    for (var _i = 0, inputs_1 = inputs; _i < inputs_1.length; _i++) {
        var input = inputs_1[_i];
        frequency[input] = (frequency[input] || 0) + 1;
        if (frequency[input] > maxFreq) {
            maxFreq = frequency[input];
        }
    }
    for (var k in frequency) {
        if (frequency[k] === maxFreq) {
            modes.push(Number(k));
        }
    }
    return modes.length === 1 ? modes[0] : 0;
}
function mean(inputs) {
    var sum = inputs.reduce(function (sum, input) { return sum + input; }, 0);
    return Math.round(sum / inputs.length);
}
function range(inputs) {
    var min = Math.min.apply(Math, inputs);
    var max = Math.max.apply(Math, inputs);
    return max - min;
}
function stddev(inputs) {
    var meanValue = mean(inputs);
    var sum = inputs.reduce(function (sum, input) { return sum + Math.pow(input - meanValue, 2); }, 0);
    return Math.round(Math.sqrt(sum / inputs.length));
}
