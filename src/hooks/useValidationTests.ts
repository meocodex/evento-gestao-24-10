import { useState } from 'react';
import { testEventosFlow, type TestResult } from '@/tests/validation/eventosFlow.test';
import { testInputValidation } from '@/tests/validation/inputValidation.test';
import { testCrudResources } from '@/tests/validation/crudResources.test';

export interface TestSuite {
  name: string;
  description: string;
  results: TestResult[];
  totalDuration: number;
  status: 'idle' | 'running' | 'completed' | 'error';
}

export function useValidationTests() {
  const [isRunning, setIsRunning] = useState(false);
  const [suites, setSuites] = useState<TestSuite[]>([
    {
      name: 'Fluxo de Eventos',
      description: 'Testa criação, edição, alocação de materiais e exclusão de eventos',
      results: [],
      totalDuration: 0,
      status: 'idle'
    },
    {
      name: 'Validação de Inputs',
      description: 'Testa schemas Zod para validação de formulários',
      results: [],
      totalDuration: 0,
      status: 'idle'
    },
    {
      name: 'CRUD de Recursos',
      description: 'Testa operações de criação, leitura, atualização e exclusão',
      results: [],
      totalDuration: 0,
      status: 'idle'
    }
  ]);

  const runTests = async () => {
    setIsRunning(true);
    const updatedSuites = [...suites];

    try {
      // Suite 1: Fluxo de Eventos
      updatedSuites[0].status = 'running';
      setSuites([...updatedSuites]);

      const eventosResults = await testEventosFlow();
      updatedSuites[0].results = eventosResults;
      updatedSuites[0].totalDuration = eventosResults.reduce((sum, r) => sum + r.duration, 0);
      updatedSuites[0].status = eventosResults.some(r => r.status === 'error') ? 'error' : 'completed';
      setSuites([...updatedSuites]);

      // Suite 2: Validação de Inputs
      updatedSuites[1].status = 'running';
      setSuites([...updatedSuites]);

      const validationResults = await testInputValidation();
      updatedSuites[1].results = validationResults;
      updatedSuites[1].totalDuration = validationResults.reduce((sum, r) => sum + r.duration, 0);
      updatedSuites[1].status = validationResults.some(r => r.status === 'error') ? 'error' : 'completed';
      setSuites([...updatedSuites]);

      // Suite 3: CRUD de Recursos
      updatedSuites[2].status = 'running';
      setSuites([...updatedSuites]);

      const crudResults = await testCrudResources();
      updatedSuites[2].results = crudResults;
      updatedSuites[2].totalDuration = crudResults.reduce((sum, r) => sum + r.duration, 0);
      updatedSuites[2].status = crudResults.some(r => r.status === 'error') ? 'error' : 'completed';
      setSuites([...updatedSuites]);
    } catch (error) {
      console.error('Erro ao executar testes:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const resetTests = () => {
    setSuites(suites.map(suite => ({
      ...suite,
      results: [],
      totalDuration: 0,
      status: 'idle'
    })));
  };

  const getTotalStats = () => {
    const allResults = suites.flatMap(s => s.results);
    return {
      total: allResults.length,
      success: allResults.filter(r => r.status === 'success').length,
      error: allResults.filter(r => r.status === 'error').length,
      warning: allResults.filter(r => r.status === 'warning').length,
      totalDuration: suites.reduce((sum, s) => sum + s.totalDuration, 0)
    };
  };

  return {
    suites,
    isRunning,
    runTests,
    resetTests,
    getTotalStats
  };
}
