import { clienteSchema } from '@/lib/validations/cliente';
import { eventoSchema } from '@/lib/validations/evento';
import { estoqueSchema, serialEstoqueSchema } from '@/lib/validations/estoque';
import { demandaSchema, reembolsoSchema } from '@/lib/validations/demanda';
import { loginSchema, signupSchema } from '@/lib/validations/auth';
import type { TestResult } from './eventosFlow.test';

/**
 * Testes de validação de inputs usando schemas Zod
 */
export async function testInputValidation(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: Validação de Cliente
  try {
    const start = performance.now();
    
    // Dados válidos
    const validCliente = {
      nome: 'Cliente Teste',
      tipo: 'CPF' as const,
      documento: '12345678901',
      email: 'teste@exemplo.com',
      telefone: '11987654321',
      endereco: {
        cep: '01310100',
        logradouro: 'Avenida Paulista',
        numero: '1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP'
      }
    };

    clienteSchema.parse(validCliente);

    // Dados inválidos
    try {
      clienteSchema.parse({ ...validCliente, email: 'email-invalido' });
      throw new Error('Deveria ter falhado na validação de email');
    } catch (error: any) {
      if (!error.errors) throw error;
    }

    const duration = performance.now() - start;

    results.push({
      name: 'Validação Cliente',
      status: 'success',
      message: 'Schema de cliente validando corretamente',
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'Validação Cliente',
      status: 'error',
      message: error.message,
      duration: 0
    });
  }

  // Test 2: Validação de Evento
  try {
    const start = performance.now();
    
    const validEvento = {
      nome: 'Evento Teste',
      tipoEvento: 'bar' as const,
      dataInicio: new Date(),
      dataFim: new Date(Date.now() + 86400000),
      horaInicio: '18:00',
      horaFim: '23:00',
      local: 'Local Teste',
      cidade: 'São Paulo',
      estado: 'SP',
      endereco: 'Rua Teste, 123',
      clienteId: '123e4567-e89b-12d3-a456-426614174000',
      comercialId: '123e4567-e89b-12d3-a456-426614174001',
      tags: ['teste']
    };

    eventoSchema.parse(validEvento);

    // Testar data inválida
    try {
      eventoSchema.parse({ 
        ...validEvento, 
        dataFim: new Date(Date.now() - 86400000) 
      });
      throw new Error('Deveria ter falhado na validação de data');
    } catch (error: any) {
      if (!error.errors) throw error;
    }

    const duration = performance.now() - start;

    results.push({
      name: 'Validação Evento',
      status: 'success',
      message: 'Schema de evento validando corretamente',
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'Validação Evento',
      status: 'error',
      message: error.message,
      duration: 0
    });
  }

  // Test 3: Validação de Estoque
  try {
    const start = performance.now();
    
    const validEstoque = {
      nome: 'Material Teste',
      categoria: 'iluminacao',
      quantidadeTotal: 10,
      descricao: 'Descrição teste',
      valorUnitario: 100.50
    };

    estoqueSchema.parse(validEstoque);

    // Testar quantidade negativa
    try {
      estoqueSchema.parse({ ...validEstoque, quantidadeTotal: -1 });
      throw new Error('Deveria ter falhado na validação de quantidade');
    } catch (error: any) {
      if (!error.errors) throw error;
    }

    const duration = performance.now() - start;

    results.push({
      name: 'Validação Estoque',
      status: 'success',
      message: 'Schema de estoque validando corretamente',
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'Validação Estoque',
      status: 'error',
      message: error.message,
      duration: 0
    });
  }

  // Test 4: Validação de Serial
  try {
    const start = performance.now();
    
    const validSerial = {
      materialId: '123e4567-e89b-12d3-a456-426614174000',
      serial: 'SN123456',
      status: 'disponivel' as const
    };

    serialEstoqueSchema.parse(validSerial);

    // Testar serial inválido
    try {
      serialEstoqueSchema.parse({ ...validSerial, serial: 'SN@123#456' });
      throw new Error('Deveria ter falhado na validação de serial');
    } catch (error: any) {
      if (!error.errors) throw error;
    }

    const duration = performance.now() - start;

    results.push({
      name: 'Validação Serial',
      status: 'success',
      message: 'Schema de serial validando corretamente',
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'Validação Serial',
      status: 'error',
      message: error.message,
      duration: 0
    });
  }

  // Test 5: Validação de Demanda
  try {
    const start = performance.now();
    
    const validDemanda = {
      titulo: 'Demanda Teste',
      descricao: 'Descrição da demanda de teste',
      categoria: 'tecnica' as const,
      prioridade: 'media' as const,
      tags: ['teste']
    };

    demandaSchema.parse(validDemanda);

    // Testar título curto
    try {
      demandaSchema.parse({ ...validDemanda, titulo: 'abc' });
      throw new Error('Deveria ter falhado na validação de título');
    } catch (error: any) {
      if (!error.errors) throw error;
    }

    const duration = performance.now() - start;

    results.push({
      name: 'Validação Demanda',
      status: 'success',
      message: 'Schema de demanda validando corretamente',
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'Validação Demanda',
      status: 'error',
      message: error.message,
      duration: 0
    });
  }

  // Test 6: Validação de Reembolso
  try {
    const start = performance.now();
    
    const validReembolso = {
      descricao: 'Reembolso teste',
      tipo: 'frete' as const,
      valor: 50.00
    };

    reembolsoSchema.parse(validReembolso);

    // Testar valor inválido
    try {
      reembolsoSchema.parse({ ...validReembolso, valor: -10 });
      throw new Error('Deveria ter falhado na validação de valor');
    } catch (error: any) {
      if (!error.errors) throw error;
    }

    const duration = performance.now() - start;

    results.push({
      name: 'Validação Reembolso',
      status: 'success',
      message: 'Schema de reembolso validando corretamente',
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'Validação Reembolso',
      status: 'error',
      message: error.message,
      duration: 0
    });
  }

  // Test 7: Validação de Auth
  try {
    const start = performance.now();
    
    const validLogin = {
      email: 'usuario@exemplo.com',
      password: 'senha123'
    };

    loginSchema.parse(validLogin);

    const validSignup = {
      nome: 'Usuário Teste',
      email: 'usuario@exemplo.com',
      password: 'Senha123!@#'
    };

    signupSchema.parse(validSignup);

    // Testar senha fraca
    try {
      signupSchema.parse({ ...validSignup, password: '123456' });
      throw new Error('Deveria ter falhado na validação de senha');
    } catch (error: any) {
      if (!error.errors) throw error;
    }

    const duration = performance.now() - start;

    results.push({
      name: 'Validação Auth',
      status: 'success',
      message: 'Schemas de autenticação validando corretamente',
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'Validação Auth',
      status: 'error',
      message: error.message,
      duration: 0
    });
  }

  return results;
}
