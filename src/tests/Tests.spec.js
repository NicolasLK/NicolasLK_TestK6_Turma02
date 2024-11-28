import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getPostsDuration = new Trend('get_contacts', true);
export const RateContentOK = new Rate('content_OK');

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<5700'], // 95%
    http_req_failed: ['rate<0.12'] // 12%
  },
  stages: [
    { duration: '15s', target: 10 },
    { duration: '20s', target: 30 },
    { duration: '20s', target: 50 },
    // 1m
    { duration: '30s', target: 70 },
    { duration: '30s', target: 110 },
    // 2m
    { duration: '40s', target: 140 },
    { duration: '40s', target: 210 },
    { duration: '25s', target: 260 },
    { duration: '40s', target: 300 }
    // 4m20s
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://jsonplaceholder.typicode.com/posts';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getPostsDuration.add(res.timings.duration);

  RateContentOK.add(res.status === OK);

  check(res, {
    'get posts - status 200': () => res.status === OK
  });
}
