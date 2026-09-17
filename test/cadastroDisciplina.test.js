import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { expect } from 'chai';
import { loginAdmin } from './helpers/auth.js';
import { cadastrarDisciplina } from './helpers/disciplinas.js';

const cenarios = JSON.parse(
  readFileSync(new URL('./fixtures/cadastro-disciplina.json', import.meta.url), 'utf8')
);

function prepararDisciplina(dados) {
  return {
    ...dados,
    codigo: dados.codigo ? `${dados.codigo}-${randomUUID()}` : dados.codigo,
  };
}

describe('Cadastro de disciplina', () => {
  let tokenAdmin;

  before(async () => {
    const { token } = await loginAdmin();
    tokenAdmin = token;
  });

  describe('Dados válidos', () => {
    for (const cenario of cenarios.validos) {
      it(`deve cadastrar disciplina ${cenario.cenario}`, async () => {
        const disciplina = prepararDisciplina(cenario.dados);

        const resposta = await cadastrarDisciplina(disciplina, tokenAdmin);

        expect(resposta.status).to.equal(cenario.statusEsperado);
        expect(resposta.body.id).to.be.a('string').and.not.be.empty;
        expect(resposta.body).to.include({
          nome: disciplina.nome,
          codigo: disciplina.codigo,
          cargaHoraria: cenario.cargaHorariaEsperada,
        });
      });
    }
  });

  describe('Dados inválidos', () => {
    for (const cenario of cenarios.invalidos) {
      it(`deve rejeitar cadastro com ${cenario.cenario}`, async () => {
        const disciplina = prepararDisciplina(cenario.dados);

        const resposta = await cadastrarDisciplina(disciplina, tokenAdmin);

        expect(resposta.status).to.equal(cenario.statusEsperado);
        expect(resposta.body.error).to.equal(cenario.mensagemEsperada);
      });
    }
  });

  describe('Dados duplicados', () => {
    for (const cenario of cenarios.duplicados) {
      it(`deve rejeitar cadastro com ${cenario.cenario}`, async () => {
        const disciplina = prepararDisciplina(cenario.dados);

        const respostaInicial = await cadastrarDisciplina(disciplina, tokenAdmin);

        expect(respostaInicial.status).to.equal(201);

        const resposta = await cadastrarDisciplina(disciplina, tokenAdmin);

        const mensagemEsperada = cenario.mensagemEsperada.replace('{codigo}', disciplina.codigo);

        expect(resposta.status).to.equal(cenario.statusEsperado);
        expect(resposta.body.error).to.equal(mensagemEsperada);
      });
    }
  });
});
