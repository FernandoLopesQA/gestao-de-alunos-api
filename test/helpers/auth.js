import { expect } from 'chai';
import { api } from './api.js';

async function login({ email, senha }, role) {
  const resposta = await api().post('/api/auth/login').send({ email, senha });

  expect(resposta.status, `Login de ${role}`).to.equal(200);
  expect(resposta.body.token).to.be.a('string').and.not.be.empty;
  expect(resposta.body.usuario).to.include({ email, role });
  expect(resposta.body.usuario.id).to.be.a('string').and.not.be.empty;

  return resposta.body;
}

export async function loginAdmin() {
  return login(
    {
      email: process.env.ADMIN_EMAIL,
      senha: process.env.ADMIN_SENHA,
    },
    'admin'
  );
}

export async function loginAluno({ email, senha }) {
  return login({ email, senha }, 'aluno');
}
