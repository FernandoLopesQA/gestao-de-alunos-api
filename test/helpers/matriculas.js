import request from 'supertest';
import app from '../../src/app.js';

export async function matricularAluno(alunoId, disciplinaId, tokenAdmin) {
  return request(app)
    .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ alunoId });
}
