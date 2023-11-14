import * as http from 'http';
import { AddressInfo } from 'net';

type MathRequest = {
  method: string;
  inputs: number[];
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') {
    validateRequest(req, res);
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data: MathRequest = JSON.parse(body);
      const result = evaluate(data);
      generateResponse(res, 200, 'application/json', JSON.stringify({ result }));
    } catch (error) {
      generateResponse(res, 400, 'text/plain', error.message + " " + error.stack)
    }
  });
});

server.listen(8080, () => {
  const address = server.address() as AddressInfo;
  console.log('opened server on', address.port);
});

function generateResponse(response: http.ServerResponse, statusCode: number, header: string, body: string) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', header);
  response.end(body);
}

function validateRequest(request: http.IncomingMessage, response: http.ServerResponse) {
  response.statusCode = 405;
  response.setHeader('Allow', 'POST');
  response.end('Method not allowed');
}

function evaluate(request: MathRequest): number {
  const methods = {
    add: add,
    mode: mode,
    mean: mean,
    range: range,
    stddev: stddev
  };

  const method = methods[request.method];
  if (!method) {
    throw new Error('Invalid method');
  }

  return method(request.inputs);
}

function add(inputs: number[]): number {
  return inputs.reduce((sum, input) => sum + input, 0);
}

function mode(inputs: number[]): number {
  const frequency: {[key: number]: number} = {};
  let maxFreq = 0;
  let modes: number[] = [];

  for (const input of inputs) {
    frequency[input] = (frequency[input] || 0) + 1;

    if (frequency[input] > maxFreq) {
      maxFreq = frequency[input];
    }
  }

  for (const k in frequency) {
    if (frequency[k] === maxFreq) {
      modes.push(Number(k));
    }
  }

  return modes.length === 1 ? modes[0] : 0;
}

function mean(inputs: number[]): number {
  const sum = inputs.reduce((sum, input) => sum + input, 0);
  return Math.round(sum / inputs.length);
}

function range(inputs: number[]): number {
  const min = Math.min(...inputs);
  const max = Math.max(...inputs);
  return max - min;
}

function stddev(inputs: number[]): number {
  const meanValue = mean(inputs);
  const sum = inputs.reduce((sum, input) => sum + Math.pow(input - meanValue, 2), 0);
  return Math.round(Math.sqrt(sum / inputs.length));
}