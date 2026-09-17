import request from 'supertest';
import app from '../../src/app.js';

export async function cadastrarAluno(aluno, tokenAdmin) {
  return request(app)
    .post('/api/admin/alunos')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send(aluno);
}
