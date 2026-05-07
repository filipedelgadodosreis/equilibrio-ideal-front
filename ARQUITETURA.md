# 🏗️ Arquitetura do Sistema — Clínica Equilíbrio Ideal

> Documento de referência para a fase de desenvolvimento.  
> Versão 1.0 · Maio 2026

---

## 📌 Visão Geral

Sistema de gestão clínica multidisciplinar desenvolvido sob medida para a **Clínica Equilíbrio Ideal** (Santo André, SP).

| Item | Decisão |
|---|---|
| **Front-end** | React.js + Vite |
| **Back-end** | .NET 8 (ASP.NET Core Web API) |
| **Banco de dados** | PostgreSQL |
| **Hospedagem** | Railway |
| **Autenticação** | JWT (JSON Web Tokens) |
| **Padrão XML** | TISS 4.02.00 (ANS) |

---

## 🗂️ Repositórios

```
equilibrio-ideal-front/     ← React.js (este repositório, protótipo hoje)
equilibrio-ideal-api/       ← .NET 8 Web API (já em desenvolvimento)
```

---

## 🏛️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                │
│  React.js + Vite · PWA                             │
│  Axios → chamadas HTTP/HTTPS para a API            │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS (REST + JSON)
┌────────────────────▼────────────────────────────────┐
│               RAILWAY (Hospedagem)                  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         .NET 8 ASP.NET Core Web API          │  │
│  │                                              │  │
│  │  Controllers → Services → Repositories       │  │
│  │  Middlewares: Auth (JWT) · CORS · Logging    │  │
│  │  Background: XML Generator · Notificações    │  │
│  └────────────────────┬─────────────────────────┘  │
│                       │ EF Core                     │
│  ┌────────────────────▼─────────────────────────┐  │
│  │              PostgreSQL                       │  │
│  │         (Railway Managed DB)                  │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 🗃️ Modelo de Dados (PostgreSQL)

### Tabelas principais

```sql
-- Usuários e autenticação
usuarios (
  id, nome, email, senha_hash,
  perfil [admin|recepcao|profissional|paciente],
  ativo, criado_em, atualizado_em
)

-- Pacientes
pacientes (
  id, nome, cpf, rg, data_nascimento, sexo,
  telefone, whatsapp, email, endereco,
  convenio_id, carteirinha, validade_carteirinha,
  ativo, criado_em, atualizado_em
)

-- Profissionais
profissionais (
  id, usuario_id, nome, cpf, rg,
  especialidade [psico|nutri|fono],
  registro_conselho,   -- CRP / CRN / CREFONO
  telefone, whatsapp, email,
  ativo, criado_em, atualizado_em
)

-- Salas
salas (
  id, numero, nome, ativo,
  criado_em, atualizado_em
)

-- Convênios
convenios (
  id, nome, codigo_ans,   -- registro ANS 6 dígitos
  ativo, criado_em
)

-- Tabela de valores por convênio x especialidade
valores_consulta (
  id, convenio_id, especialidade,
  valor_consulta,   -- valor bruto
  atualizado_em
)

-- Agendamentos
agendamentos (
  id, paciente_id, profissional_id, sala_id, convenio_id,
  data_hora, duracao_minutos,
  status [agendado|confirmado|realizado|cancelado|falta],
  motivo_cancelamento,
  codigo_tuss,        -- preenchido automaticamente pela especialidade
  valor,              -- puxado da tabela valores_consulta
  numero_guia,        -- número da guia do convênio
  criado_por,         -- usuario_id
  criado_em, atualizado_em
)

-- Fila de senhas
fila_senhas (
  id, profissional_id, paciente_id, agendamento_id,
  numero_senha,   -- ex: PSI-007
  status [aguardando|chamado|atendido|removido],
  data, chamado_em, atendido_em
)

-- Lotes de faturamento XML
lotes_faturamento (
  id, convenio_id, periodo_inicio, periodo_fim,
  numero_lote, total_guias, valor_total,
  xml_gerado, xml_path,
  status [pendente|gerado|enviado|aceito|rejeitado],
  criado_em
)

-- Repasse profissionais
repasses (
  id, profissional_id, periodo_inicio, periodo_fim,
  total_consultas, valor_bruto, percentual_repasse,
  valor_repasse,
  status [pendente|pago],
  data_pagamento, criado_em
)

-- Log de auditoria
auditoria (
  id, usuario_id, acao, modulo, registro_id,
  dados_anteriores, dados_novos,   -- JSON
  ip, criado_em
)

-- Configurações da clínica
configuracoes (
  id, chave, valor, atualizado_em
  -- cnpj, cnes, versao_tiss, lote_atual, etc.
)
```

---

## 🔌 API Endpoints (.NET 8)

### Autenticação
```
POST   /api/auth/login          → JWT token + perfil
POST   /api/auth/refresh        → renovar token
POST   /api/auth/logout
```

### Pacientes
```
GET    /api/pacientes           → lista com filtros e paginação
GET    /api/pacientes/{id}      → ficha completa
POST   /api/pacientes           → criar
PUT    /api/pacientes/{id}      → editar
PATCH  /api/pacientes/{id}/status → ativar/inativar
```

### Profissionais
```
GET    /api/profissionais
GET    /api/profissionais/{id}
POST   /api/profissionais
PUT    /api/profissionais/{id}
PATCH  /api/profissionais/{id}/status
```

### Salas
```
GET    /api/salas
POST   /api/salas
PUT    /api/salas/{id}
PATCH  /api/salas/{id}/status
```

### Agenda
```
GET    /api/agendamentos?data=&profissional=&sala=&status=
GET    /api/agendamentos/{id}
POST   /api/agendamentos           → novo agendamento
PUT    /api/agendamentos/{id}
PATCH  /api/agendamentos/{id}/status  → confirmar/realizar/cancelar/falta
GET    /api/agenda/disponibilidade?profissional=&data=
GET    /api/agenda/relatorio?de=&ate=&profissional=&convenio=&status=
```

### Painel de Senhas
```
GET    /api/senhas/fila?data=&profissional=
POST   /api/senhas                 → adicionar à fila
PATCH  /api/senhas/{id}/chamar
PATCH  /api/senhas/{id}/finalizar
DELETE /api/senhas/{id}
GET    /api/senhas/tv              → estado atual para display da TV
```

### Convênios e Valores
```
GET    /api/convenios
GET    /api/valores-consulta
PUT    /api/valores-consulta/{convenio_id}
```

### Faturamento
```
GET    /api/faturamento/dashboard?periodo=
GET    /api/faturamento/repasse?de=&ate=&profissional=&especialidade=
PATCH  /api/faturamento/repasse/{id}/pagar
GET    /api/faturamento/xml?convenio=&de=&ate=
POST   /api/faturamento/xml/gerar  → gera e salva o XML TISS
GET    /api/faturamento/xml/{id}/download
```

### Relatórios
```
GET    /api/relatorios/agenda?de=&ate=&profissional=&convenio=&status=
GET    /api/relatorios/agenda/exportar   → CSV
GET    /api/relatorios/repasse/exportar  → PDF
```

### Auditoria
```
GET    /api/auditoria?categoria=&de=&ate=&usuario=
GET    /api/auditoria/exportar → CSV
```

### Configurações
```
GET    /api/configuracoes
PUT    /api/configuracoes
```

---

## 🔐 Autenticação e Perfis

```
JWT Token → Header: Authorization: Bearer {token}

Perfis e permissões:
┌─────────────────┬───────────────────────────────────────┐
│ Perfil          │ Acesso                                │
├─────────────────┼───────────────────────────────────────┤
│ admin           │ Tudo — incluindo faturamento, XML,    │
│                 │ configurações e auditoria             │
│ recepcao        │ Agenda, agendamentos, cadastros,      │
│                 │ painel de senhas                      │
│ profissional    │ Própria agenda, própria fila          │
│ paciente        │ App móvel — consultas e histórico     │
└─────────────────┴───────────────────────────────────────┘
```

---

## ⚛️ Front-end React.js

### Estrutura de pastas
```
src/
  api/                    ← chamadas HTTP (Axios)
    agendamentos.js
    pacientes.js
    faturamento.js
    ...
  components/             ← componentes reutilizáveis
    Sidebar.jsx
    Header.jsx
    Modal.jsx
    StatusTag.jsx
    ...
  pages/                  ← páginas (1 por tela)
    Login.jsx
    Agenda.jsx
    ModalAgendamento.jsx
    Pacientes.jsx
    Paciente.jsx           ← ficha individual
    Profissionais.jsx
    Salas.jsx
    PainelControle.jsx
    PainelTV.jsx
    PainelTerapeuta.jsx
    AppPaciente.jsx
    Faturamento.jsx
    RelatorioAgenda.jsx
    Auditoria.jsx
    Configuracoes.jsx
  context/                ← estado global
    AuthContext.jsx        ← usuário logado e JWT
    ClinicaContext.jsx     ← dados da clínica
  styles/
    variables.css          ← design system preservado do protótipo
  App.jsx                 ← rotas React Router
  main.jsx
```

### Bibliotecas recomendadas
```
react-router-dom    → navegação entre páginas
axios               → chamadas HTTP
react-query         → cache e sincronização de dados da API
date-fns            → manipulação de datas (período 26→25)
react-hook-form     → formulários
recharts            → gráficos no faturamento
react-to-print      → impressão dos relatórios
```

---

## 🚂 Railway — Configuração

```
Serviços no Railway:
┌──────────────────────┬────────────────────────────────┐
│ Serviço              │ Configuração                   │
├──────────────────────┼────────────────────────────────┤
│ equilibrio-api       │ .NET 8 · Docker · porta 8080  │
│ equilibrio-db        │ PostgreSQL 15 (managed)        │
│ equilibrio-front     │ React (build estático)         │
└──────────────────────┴────────────────────────────────┘

Variáveis de ambiente (.NET):
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRY=8h
CORS_ORIGINS=https://equilibrio-ideal.railway.app
```

---

## 📅 Plano de Desenvolvimento

### Fase 1 — Base (semanas 1–3)
- [ ] Setup do projeto React + estrutura de pastas
- [ ] Design system CSS migrado para variáveis globais
- [ ] Autenticação JWT — login + proteção de rotas
- [ ] CRUD de Pacientes integrado à API
- [ ] CRUD de Profissionais integrado à API
- [ ] CRUD de Salas integrado à API

### Fase 2 — Agenda (semanas 4–6)
- [ ] Grid da agenda com dados reais da API
- [ ] Modal de agendamento conectado
- [ ] Filtros e modo disponibilidade
- [ ] Status de consultas (confirmar / realizar / cancelar / falta)
- [ ] Regras de horário da clínica

### Fase 3 — Operação (semanas 7–9)
- [ ] Painel de senhas — recepção, TV e terapeuta
- [ ] Sincronização em tempo real (SignalR ou polling)
- [ ] App do paciente (PWA)
- [ ] Notificações WhatsApp (fase separada)

### Fase 4 — Financeiro (semanas 10–12)
- [ ] Tabela de valores por convênio
- [ ] Relatório da agenda com exportação CSV
- [ ] Repasse mensal com filtros e período 26→25
- [ ] Gerador de XML TISS com campos obrigatórios
- [ ] Log de auditoria
- [ ] Configurações da clínica (CNPJ, CNES, TUSS, ANS)

### Fase 5 — Homologação (semanas 13–14)
- [ ] Testes com dados reais da clínica
- [ ] Validação do XML TISS em validadortiss.com.br
- [ ] Ajustes de UX com as donas
- [ ] Deploy em produção no Railway
- [ ] Treinamento da equipe

---

## ⚠️ Pontos de atenção antes de começar

| Item | Status | Responsável |
|---|---|---|
| CNPJ da clínica | ❌ Coletar | Donas |
| CNES da clínica | ❌ Coletar | Donas |
| Código ANS de cada convênio | ❌ Coletar | Donas / cada operadora |
| Código TUSS por especialidade | ✅ Mapeado | Sistema |
| Percentual de repasse padrão | ✅ 60% definido | — |
| Período de fechamento | ✅ Dia 26 ao 25 | — |
| Credenciais dos portais de convênios | ❌ Coletar | Donas |

---

## 🔄 Fluxo de geração do XML TISS

```
1. Agendamento marcado como "realizado" na agenda
          ↓
2. Sistema registra: paciente, profissional, convênio,
   data, código TUSS, valor
          ↓
3. No fechamento mensal (dia 26→25):
   Admin acessa Faturamento → aba XML
          ↓
4. Seleciona período e convênio → clica "Gerar XML"
          ↓
5. .NET monta o arquivo XML TISS 4.02.00 com:
   - Dados da clínica (CNPJ + CNES)
   - Dados de cada guia (paciente + profissional + TUSS + valor)
   - Hash de integridade
   - Numeração sequencial de lotes
          ↓
6. Admin baixa o XML e envia no portal de cada convênio
```

---

*Clínica Equilíbrio Ideal · Sistema de Gestão · v1.0*  
*Cuidado que acolhe. Presença que transforma.*
