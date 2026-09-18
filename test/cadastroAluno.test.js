import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { expect } from 'chai';
import { loginAdmin } from './helpers/auth.js';
import { cadastrarAluno } from './helpers/alunos.js';

const cenariosValidos = JSON.parse(
  readFileSync(new URL('./fixtures/cadastro-aluno.json', import.meta.url), 'utf8')
);

const cenariosInvalidos = JSON.parse(
  readFileSync(new URL('./fixtures/cadastro-aluno-invalido.json', import.meta.url), 'utf8')
);

const cenariosDuplicados = JSON.parse(
  readFileSync(new URL('./fixtures/cadastro-aluno-duplicado.json', import.meta.url), 'utf8')
);

function prepararAluno(dados) {
  const identificador = randomUUID();

  return {
    ...dados,
    email: dados.email.replace('@', `+${identificador}@`),
    matricula: `${dados.matricula}-${identificador}`,
  };
}

describe('Cadastro de aluno', () => {
  let tokenAdmin;

  before(async () => {
    const { token } = await loginAdmin();
    tokenAdmin = token;
  });

  describe('Dados válidos', () => {
    for (const cenario of cenariosValidos) {
      it(`deve cadastrar ${cenario.aluno.nome}`, async () => {
        const aluno = prepararAluno(cenario.aluno);

        const resposta = await cadastrarAluno(aluno, tokenAdmin);

        expect(resposta.status).to.equal(201);
        expect(resposta.body.id).to.be.a('string').and.not.be.empty;
        expect(resposta.body).to.include({
          nome: aluno.nome,
          email: aluno.email,
          matricula: aluno.matricula,
          role: 'aluno',
        });
        expect(resposta.body).not.to.have.property('senha');
      });
    }
  });

  describe('Dados inválidos', () => {
    for (const cenario of cenariosInvalidos) {
      it(`deve rejeitar cadastro com ${cenario.cenario}`, async () => {
        const aluno = prepararAluno(cenariosValidos[0].aluno);
        aluno[cenario.campo] = cenario.valor;

        const resposta = await cadastrarAluno(aluno, tokenAdmin);

        expect(resposta.status).to.equal(cenario.statusEsperado);
        expect(resposta.body.error).to.equal(cenario.mensagemEsperada);
      });
    }
  });

  describe('Dados duplicados', () => {
    for (const cenario of cenariosDuplicados) {
      it(`deve rejeitar cadastro com ${cenario.cenario}`, async () => {
        const alunoExistente = prepararAluno(cenariosValidos[0].aluno);

        const respostaInicial = await cadastrarAluno(alunoExistente, tokenAdmin);

        expect(respostaInicial.status).to.equal(201);

        const novoAluno = prepararAluno(cenariosValidos[0].aluno);
        novoAluno[cenario.campo] = alunoExistente[cenario.campo];

        const resposta = await cadastrarAluno(novoAluno, tokenAdmin);

        expect(resposta.status).to.equal(cenario.statusEsperado);
        expect(resposta.body.error).to.equal(cenario.mensagemEsperada);
      });
    }
  });
});
