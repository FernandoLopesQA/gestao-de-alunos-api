import { api } from './api.js';

export async function cadastrarAluno(aluno, tokenAdmin) {
  return api().post('/api/admin/alunos').set('Authorization', `Bearer ${tokenAdmin}`).send(aluno);
}
