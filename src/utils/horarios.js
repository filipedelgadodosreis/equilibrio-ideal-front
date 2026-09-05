/**
 * Leitura de horário de negócio vindo da API.
 *
 * CONVENÇÃO: horários de negócio (`dataHora` dos agendamentos, `inicio`/`fim`
 * da disponibilidade) trafegam como wall-clock da clínica rotulado
 * indevidamente como UTC — `AgendamentoService.cs` faz
 * `data.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc)`. Ou seja:
 * "2026-09-05T08:00:00Z" significa 08:00 na clínica, e não 05:00.
 *
 * Por isso a hora é lida do próprio texto, sem `new Date`: converter para o
 * fuso local deslocaria toda a agenda em 3h (America/Sao_Paulo).
 *
 * DÍVIDA TÉCNICA: a correção durável é na API — emitir o offset correto
 * (-03:00) ou omitir o `Z`. Quando isso for feito, este helper deixa de ser
 * necessário e as chamadas voltam a usar `new Date`/`format` normalmente.
 */
export function horaDeIso(iso) {
  if (typeof iso !== 'string') return '';
  const m = iso.match(/T(\d{2}:\d{2})/);
  return m ? m[1] : '';
}

/**
 * Data em dd/MM/yyyy pelo mesmo princípio — componentes lidos do texto, sem
 * `new Date`. Aqui o motivo é ainda mais direto: `new Date('2026-05-02')` é
 * interpretado como meia-noite UTC e, em America/Sao_Paulo, exibiria 01/05.
 *
 * Aceita data pura ("2026-05-02") e data-hora ("2026-05-02T09:00:00Z").
 */
export function dataDeIso(iso) {
  if (typeof iso !== 'string') return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}
