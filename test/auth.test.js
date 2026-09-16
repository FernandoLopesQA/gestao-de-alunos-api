import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { loginAdmin } from './helpers/auth.js';

after(async () => {
  await mongoose.connection.close();
});

describe('POST /api/auth/login', () => {
  it('deve retornar 200 e um token quando o admin informar e-mail e senha corretos', async () => {
    const { token, usuario } = await loginAdmin();

    expect(token).to.be.a('string').and.not.be.empty;
    expect(usuario.role).to.equal('admin');
  });

  it('deve retornar 401 quando a senha informada for inválida', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.ADMIN_EMAIL, senha: 'senha-incorreta' });

    expect(resposta.status).to.equal(401);
    expect(resposta.body.error).to.equal('E-mail ou senha inválidos.');
  });
});
