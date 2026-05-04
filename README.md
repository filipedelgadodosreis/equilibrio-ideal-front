# Clínica Equilíbrio Ideal — Front-end

> Sistema de gestão clínica desenvolvido sob medida para a Clínica Equilíbrio Ideal, Santo André/SP.

---

## 📋 Sobre o projeto

Sistema web completo para gestão de uma clínica multidisciplinar com psicologia, nutrição e fonoaudiologia. Desenvolvido como PWA (Progressive Web App), funciona no navegador e pode ser instalado como aplicativo no celular.

---

## 🗂️ Módulos

| Módulo | Status | Arquivo |
|---|---|---|
| Login & Acesso | ✅ Pronto | `login-equilibrio-v3.html` |
| Agenda | ✅ Pronto | `agenda-equilibrio-v3.html` |
| Novo Agendamento | ✅ Pronto | `modal-agendamento.html` |
| Cadastro de Pacientes | ✅ Pronto | `cadastro-pacientes.html` |
| Cadastro de Profissionais | 🔄 Em desenvolvimento | — |
| Painel de Senhas | 🔄 Em desenvolvimento | — |
| Faturamento | 📋 Requisitos em levantamento | — |
| App do Paciente | 🔄 Em desenvolvimento | — |

---

## 🎨 Design System

O projeto usa um design system consistente baseado em variáveis CSS:

```css
--sky:       #7DA8C9   /* Azul céu — cor principal */
--navy:      #1B3A5C   /* Azul marinho — textos e headers */
--gold:      #C9A96E   /* Dourado — destaques e marca */
--green:     #5AAE82   /* Verde — disponibilidade e sucesso */
```

**Tipografia:**
- `Playfair Display` — títulos e elementos de marca
- `Lato` — textos, campos e interface

---

## 🏗️ Arquitetura & Stack

### Fase atual — Protótipo
- **HTML5** + **CSS3** + **JavaScript** puro
- Sem dependências externas
- Design system com variáveis CSS reutilizáveis
- Publicado via **GitHub Pages**

### Próxima fase — Produção
- **React.js** — migração dos componentes HTML para React
- O design CSS é 100% portável — nada se perde na migração
- **Tailwind CSS** ou **Styled Components**
- Consumo das APIs REST do repositório back-end
- Deploy via **Vercel** ou **Netlify**

### Repositórios
| Repo | Descrição |
|---|---|
| `equilibrio-ideal-front` | Este repositório — Front-end |
| `equilibrio-ideal-api` | Back-end — APIs REST |

---

## 👥 Perfis de acesso

| Perfil | Permissões |
|---|---|
| 👑 **Admin** | Acesso completo — todos os módulos incluindo faturamento |
| 🏥 **Recepção** | Agenda, agendamentos, cadastros, painel de senhas |
| 🧠 **Profissional** | Própria agenda e pacientes |
| 👤 **Paciente** | Histórico, agendamentos e cancelamentos via app |

---

## 🏥 Dados da clínica

- **20 salas** de atendimento
- **30 profissionais** ativos
- **3 especialidades:** Psicologia, Nutrição, Fonoaudiologia
- **Horário:** Seg–Sex 08h–20h30 · Sáb 08h–14h
- **Convênios:** Hapvida, Bradesco Saúde, Prevent Senior, Porto Seguro, Total Medcare, Care Plus, Mediservice, Vivest, Bradesco Operadora, Omint Saúde, Fundação Saúde Itaú

---

## 🚀 Como visualizar localmente

1. Clone o repositório
```bash
git clone https://github.com/seuusuario/equilibrio-ideal-front.git
```
2. Abra o arquivo `index.html` no navegador
3. Navegue pelos módulos

---

## 🌐 Deploy — GitHub Pages

Acesse o protótipo em:
```
https://seuusuario.github.io/equilibrio-ideal-front
```

---

## 🔄 Roadmap de migração para React

Quando iniciar a migração para React, cada tela vira um componente:

```
src/
  pages/
    Login.jsx
    Agenda.jsx
    Pacientes.jsx
    Paciente.jsx        ← ficha individual
  components/
    Sidebar.jsx
    ModalAgendamento.jsx
    TabelaPacientes.jsx
    AgendaGrid.jsx
    FiltrosAgenda.jsx
  styles/
    variables.css       ← design system preservado
```

O CSS de variáveis é importado globalmente e todos os estilos são preservados.

---

*Clínica Equilíbrio Ideal · Cuidado que acolhe. Presença que transforma.*
