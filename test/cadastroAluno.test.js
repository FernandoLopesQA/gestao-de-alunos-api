import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { expect } from 'chai';
import { api } from './helpers/api.js';
import { loginAdmin, loginAluno } from './helpers/auth.js';
import { cadastrarAluno } from './helpers/alunos.js';
import { matricularAluno } from './helpers/matriculas.js';

const cenarios = JSON.parse(
  readFileSync(new URL('./fixtures/alunos.json', import.meta.url), 'utf8')
);

describe('Fluxo de entrega de trabalho pelo aluno', () => {
  for (const cenario of cenarios) {
    it(`deve concluir o fluxo de ${cenario.cenario}`, async () => {
      const identificador = randomUUID();

      const aluno = {
        ...cenario.aluno,
        email: cenario.aluno.email.replace('@', `+${identificador}@`),
        matricula: `${cenario.aluno.matricula}-${identificador}`,
      };

      const { token } = await loginAdmin();

      const resposta = await cadastrarAluno(aluno, token);

      expect(resposta.status).to.equal(201);
      expect(resposta.body.id).to.be.a('string').and.not.be.empty;
      expect(resposta.body).to.include({
        nome: aluno.nome,
        email: aluno.email,
        matricula: aluno.matricula,
        role: 'aluno',
      });
      expect(resposta.body).not.to.have.property('senha');

      // Matricular o aluno usando o token do administrador
      const alunoId = resposta.body.id;
      const disciplinaId = cenario.trabalho.disciplinaId;

      const respostaMatricula = await matricularAluno(alunoId, disciplinaId, token);

      expect(respostaMatricula.status).to.equal(201);
      expect(respostaMatricula.body).to.include({
        alunoId,
        disciplinaId,
      });

      // Autenticar o aluno recém-cadastrado
      const { token: tokenAluno, usuario } = await loginAluno(aluno);

      expect(usuario.id).to.equal(alunoId);

      // Entregar o trabalho usando o token do aluno
      const respostaTrabalho = await api()
        .post(`/api/alunos/${alunoId}/trabalhos`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send(cenario.trabalho);

      expect(respostaTrabalho.status).to.equal(201);
      expect(respostaTrabalho.body.id).to.be.a('string').and.not.be.empty;
      expect(respostaTrabalho.body).to.include({
        alunoId,
        disciplinaId,
        titulo: cenario.trabalho.titulo,
        descricao: cenario.trabalho.descricao,
        status: 'entregue',
      });
    });
  }
});
