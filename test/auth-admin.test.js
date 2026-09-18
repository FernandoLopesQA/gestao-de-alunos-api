import { readFileSync } from 'node:fs';
import { expect } from 'chai';
import { api } from './helpers/api.js';

const cenarios = JSON.parse(
  readFileSync(new URL('./fixtures/login-admin.json', import.meta.url), 'utf8')
);

describe('Autenticação do administrador', () => {
  before(() => {
    expect(process.env.ADMIN_EMAIL, 'Configure ADMIN_EMAIL').to.be.a('string').and.not.be.empty;
    expect(process.env.ADMIN_SENHA, 'Configure ADMIN_SENHA').to.be.a('string').and.not.be.empty;
  });

  describe('Credenciais válidas', () => {
    it('deve autenticar o administrador com credenciais válidas', async () => {
      const resposta = await api().post('/api/auth/login').send({
        email: process.env.ADMIN_EMAIL,
        senha: process.env.ADMIN_SENHA,
      });

      expect(resposta.status).to.equal(200);
      expect(resposta.body.token).to.be.a('string').and.not.be.empty;
      expect(resposta.body.usuario.id).to.be.a('string').and.not.be.empty;
      expect(resposta.body.usuario).to.include({
        email: process.env.ADMIN_EMAIL,
        role: 'admin',
      });
      expect(resposta.body.usuario).not.to.have.property('senha');
    });
  });

  describe('Credenciais inválidas', () => {
    for (const cenario of cenarios.invalidos) {
      it(`deve rejeitar login com ${cenario.cenario}`, async () => {
        const resposta = await api()
          .post('/api/auth/login')
          .send({
            email: process.env.ADMIN_EMAIL,
            senha: process.env.ADMIN_SENHA,
            ...cenario.alteracoes,
          });

        expect(resposta.status).to.equal(cenario.statusEsperado);
        expect(resposta.body.error).to.equal(cenario.mensagemEsperada);
        expect(resposta.body).not.to.have.property('token');
      });
    }
  });
});
