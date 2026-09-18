import { api } from './api.js';

export async function matricularAluno(alunoId, disciplinaId, tokenAdmin) {
  return api()
    .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ alunoId });
}
