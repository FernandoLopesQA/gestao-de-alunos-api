import { api } from './api.js';

export async function cadastrarDisciplina(disciplina, tokenAdmin) {
  return api()
    .post('/api/admin/disciplinas')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send(disciplina);
}
