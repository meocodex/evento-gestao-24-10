#!/usr/bin/env tsx

/**
 * Test Runner for CI/CD Pipeline
 * 
 * Executa todos os testes de validação e gera um relatório consolidado.
 * Pode ser executado localmente ou em pipelines de CI.
 */

import { testEventosFlow, type TestResult } from './eventosFlow.test';
import { testInputValidation } from './inputValidation.test';
import { testCrudResources } from './crudResources.test';

interface TestSuite {
  name: string;
  description: string;
  results: TestResult[];
  totalDuration: number;
  status: 'success' | 'error' | 'warning';
}

async function runAllTests(): Promise<TestSuite[]> {
  const suites: TestSuite[] = [];
  
  console.log('🧪 Iniciando execução de testes de validação...\n');
  
  try {
    // Suite 1: Fluxo de Eventos
    console.log('📋 Suite 1: Fluxo de Eventos');
    const eventosResults = await testEventosFlow();
    const eventosSuite: TestSuite = {
      name: 'Fluxo de Eventos',
      description: 'Testa criação, edição, alocação de materiais e exclusão de eventos',
      results: eventosResults,
      totalDuration: eventosResults.reduce((sum, r) => sum + r.duration, 0),
      status: eventosResults.some(r => r.status === 'error') ? 'error' : 
              eventosResults.some(r => r.status === 'warning') ? 'warning' : 'success'
    };
    suites.push(eventosSuite);
    printSuiteResults(eventosSuite);
    
    // Suite 2: Validação de Inputs
    console.log('\n📋 Suite 2: Validação de Inputs');
    const validationResults = await testInputValidation();
    const validationSuite: TestSuite = {
      name: 'Validação de Inputs',
      description: 'Testa schemas Zod para validação de formulários',
      results: validationResults,
      totalDuration: validationResults.reduce((sum, r) => sum + r.duration, 0),
      status: validationResults.some(r => r.status === 'error') ? 'error' : 
              validationResults.some(r => r.status === 'warning') ? 'warning' : 'success'
    };
    suites.push(validationSuite);
    printSuiteResults(validationSuite);
    
    // Suite 3: CRUD de Recursos
    console.log('\n📋 Suite 3: CRUD de Recursos');
    const crudResults = await testCrudResources();
    const crudSuite: TestSuite = {
      name: 'CRUD de Recursos',
      description: 'Testa operações de criação, leitura, atualização e exclusão',
      results: crudResults,
      totalDuration: crudResults.reduce((sum, r) => sum + r.duration, 0),
      status: crudResults.some(r => r.status === 'error') ? 'error' : 
              crudResults.some(r => r.status === 'warning') ? 'warning' : 'success'
    };
    suites.push(crudSuite);
    printSuiteResults(crudSuite);
    
  } catch (error) {
    console.error('\n❌ Erro fatal ao executar testes:', error);
    process.exit(1);
  }
  
  return suites;
}

function printSuiteResults(suite: TestSuite) {
  suite.results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️';
    console.log(`  ${icon} ${result.name} (${result.duration}ms)`);
    if (result.message && result.status !== 'success') {
      console.log(`     ${result.message}`);
    }
  });
  
  const success = suite.results.filter(r => r.status === 'success').length;
  const error = suite.results.filter(r => r.status === 'error').length;
  const warning = suite.results.filter(r => r.status === 'warning').length;
  
  console.log(`  📊 Resultados: ${success} passou, ${error} falhou, ${warning} avisos`);
  console.log(`  ⏱️  Tempo total: ${suite.totalDuration}ms`);
}

function printSummary(suites: TestSuite[]) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO GERAL DOS TESTES');
  console.log('='.repeat(60));
  
  const allResults = suites.flatMap(s => s.results);
  const totalSuccess = allResults.filter(r => r.status === 'success').length;
  const totalError = allResults.filter(r => r.status === 'error').length;
  const totalWarning = allResults.filter(r => r.status === 'warning').length;
  const totalDuration = suites.reduce((sum, s) => sum + s.totalDuration, 0);
  
  console.log(`\n✅ Sucessos: ${totalSuccess}`);
  console.log(`❌ Falhas: ${totalError}`);
  console.log(`⚠️  Avisos: ${totalWarning}`);
  console.log(`⏱️  Tempo total: ${totalDuration}ms`);
  
  console.log('\n📋 Por Suite:');
  suites.forEach(suite => {
    const icon = suite.status === 'success' ? '✅' : suite.status === 'error' ? '❌' : '⚠️';
    console.log(`  ${icon} ${suite.name}: ${suite.results.length} testes (${suite.totalDuration}ms)`);
  });
  
  const hasErrors = suites.some(s => s.status === 'error');
  
  if (hasErrors) {
    console.log('\n❌ TESTES FALHARAM - Verifique os erros acima');
    console.log('='.repeat(60) + '\n');
    process.exit(1);
  } else {
    console.log('\n✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('='.repeat(60) + '\n');
    process.exit(0);
  }
}

// Executar testes
const isCI = process.argv.includes('--ci') || process.env.CI === 'true';

if (isCI) {
  console.log('🚀 Modo CI detectado - executando testes...\n');
}

runAllTests()
  .then(suites => {
    printSummary(suites);
  })
  .catch(error => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
