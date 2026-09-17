import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { expect } from 'chai';
import { api } from './helpers/api.js';
import { loginAdmin } from './helpers/auth.js';
import { cadastrarAluno } from './helpers/alunos.js';

const cenarios = JSON.parse(
  readFileSync(new URL('./fixtures/login-aluno.json', import.meta.url), 'utf8')
);

const [cenarioBase] = JSON.parse(
  readFileSync(new URL('./fixtures/alunos.json', import.meta.url), 'utf8')
);

describe('Autenticação do aluno', () => {
  let aluno;
  let alunoId;

  before(async () => {
    const identificador = randomUUID();

    aluno = {
      ...cenarioBase.aluno,
      email: cenarioBase.aluno.email.replace('@', `+${identificador}@`),
      matricula: `${cenarioBase.aluno.matricula}-${identificador}`,
    };

    const { token } = await loginAdmin();
    const resposta = await cadastrarAluno(aluno, token);

    expect(resposta.status).to.equal(201);
    alunoId = resposta.body.id;
  });

  describe('Credenciais válidas', () => {
    for (const cenario of cenarios.filter((item) => item.statusEsperado === 200)) {
      it(`deve autenticar com ${cenario.cenario}`, async () => {
        const resposta = await api()
          .post('/api/auth/login')
          .send({
            email: aluno.email,
            senha: aluno.senha,
            ...cenario.alteracoes,
          });

        expect(resposta.status).to.equal(cenario.statusEsperado);
        expect(resposta.body.token).to.be.a('string').and.not.be.empty;
        expect(resposta.body.usuario).to.include({
          id: alunoId,
          nome: aluno.nome,
          email: aluno.email,
          role: 'aluno',
        });
        expect(resposta.body.usuario).not.to.have.property('senha');
      });
    }
  });

  describe('Credenciais inválidas', () => {
    for (const cenario of cenarios.filter((item) => item.statusEsperado !== 200)) {
      it(`deve rejeitar login com ${cenario.cenario}`, async () => {
        const resposta = await api()
          .post('/api/auth/login')
          .send({
            email: aluno.email,
            senha: aluno.senha,
            ...cenario.alteracoes,
          });

        expect(resposta.status).to.equal(cenario.statusEsperado);
        expect(resposta.body.error).to.equal(cenario.mensagemEsperada);
        expect(resposta.body).not.to.have.property('token');
      });
    }
  });
});
