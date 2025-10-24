/**
 * Load Testing com K6
 * 
 * Instalação:
 * brew install k6 (macOS)
 * ou baixe de: https://k6.io/docs/getting-started/installation/
 * 
 * Executar:
 * k6 run tests/load/eventos.test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas customizadas
const errorRate = new Rate('errors');

// Configurações do teste
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp-up: 0 → 10 usuários
    { duration: '1m', target: 50 },   // Ramp-up: 10 → 50 usuários
    { duration: '3m', target: 50 },   // Stay: 50 usuários por 3 min
    { duration: '1m', target: 100 },  // Spike: 50 → 100 usuários
    { duration: '1m', target: 100 },  // Stay: 100 usuários
    { duration: '30s', target: 0 },   // Ramp-down: 100 → 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% das requests < 1s
    http_req_failed: ['rate<0.1'],     // Taxa de erro < 10%
    errors: ['rate<0.1'],               // Taxa de erro customizada < 10%
  },
};

// Base URL (ajuste conforme seu ambiente)
const BASE_URL = __ENV.BASE_URL || 'https://your-app.lovableproject.com';

// Simular login e obter token (ajuste conforme sua autenticação)
export function setup() {
  // Se você tiver autenticação, faça login aqui e retorne o token
  // const loginRes = http.post(`${BASE_URL}/auth/login`, {
  //   email: 'test@example.com',
  //   password: 'password123'
  // });
  // return { token: loginRes.json('access_token') };
  
  return {};
}

export default function (data) {
  // Headers (adicione Authorization se necessário)
  const params = {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${data.token}`,
    },
  };

  // Teste 1: Listar eventos (página 1)
  let res = http.get(`${BASE_URL}/api/eventos?page=1&pageSize=20`, params);
  check(res, {
    'eventos list status 200': (r) => r.status === 200,
    'eventos list response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Teste 2: Buscar eventos (full-text search)
  res = http.get(`${BASE_URL}/api/eventos?search=festa`, params);
  check(res, {
    'eventos search status 200': (r) => r.status === 200,
    'eventos search response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);

  // Teste 3: Dashboard stats
  res = http.get(`${BASE_URL}/api/dashboard/stats`, params);
  check(res, {
    'dashboard stats status 200': (r) => r.status === 200,
    'dashboard stats response time < 2000ms': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(2);

  // Teste 4: Listar clientes
  res = http.get(`${BASE_URL}/api/clientes?page=1&pageSize=20`, params);
  check(res, {
    'clientes list status 200': (r) => r.status === 200,
    'clientes list response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Teste 5: Listar demandas
  res = http.get(`${BASE_URL}/api/demandas?page=1&pageSize=20`, params);
  check(res, {
    'demandas list status 200': (r) => r.status === 200,
    'demandas list response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);
}

// Relatório pós-teste
export function teardown(data) {
  console.log('===== LOAD TEST COMPLETED =====');
  console.log('Check K6 output for detailed metrics');
}
