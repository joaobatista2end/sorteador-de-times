# Sorteador de Torneios

Aplicação para gerenciamento de torneios, jogadores e times.

## Deploy no Netlify

### Opção 1: Deploy Automático (Recomendado)

1. Faça o fork ou clone deste repositório para sua conta GitHub.
2. Acesse [app.netlify.com](https://app.netlify.com/) e faça login.
3. Clique em "Add new site" > "Import an existing project".
4. Selecione GitHub como provedor de Git e autorize o Netlify.
5. Selecione o repositório do projeto.
6. Na página de configuração do deploy, os campos já estarão preenchidos automaticamente graças ao arquivo `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Clique em "Deploy site".

### Opção 2: Deploy Manual

Se preferir configurar manualmente, use os seguintes parâmetros:

1. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Environment variables** (se necessário):
   - NODE_VERSION: 18

3. **Deploy settings**:
   - Ative "Enable Netlify Edge Functions" se quiser usar recursos avançados.

4. **Redirects**:
   - Adicione um redirecionamento de `/*` para `/index.html` com status 200 para suportar rotas SPA.

## Considerações sobre IndexedDB no Netlify

Esta aplicação utiliza IndexedDB (via Dexie.js) para armazenamento local de dados. Alguns pontos importantes:

1. **Persistência de dados**: Os dados são armazenados localmente no navegador do usuário. Cada usuário terá seu próprio banco de dados.

2. **Limitações**:
   - Os dados não são compartilhados entre dispositivos ou navegadores diferentes.
   - Se o usuário limpar os dados do navegador, os dados da aplicação serão perdidos.

3. **Compatibilidade**: A aplicação verifica automaticamente o suporte ao IndexedDB ao iniciar.

4. **Backup e Exportação**: A aplicação inclui funções para exportar e importar dados, que podem ser úteis para backup ou migração.

## Configurações Adicionais

### Domínio Personalizado

1. No painel do Netlify, vá para "Site settings" > "Domain management".
2. Clique em "Add custom domain" e siga as instruções.

### Variáveis de Ambiente

Se sua aplicação precisar de variáveis de ambiente:

1. No painel do Netlify, vá para "Site settings" > "Environment variables".
2. Adicione as variáveis necessárias.

### Continuous Deployment

O Netlify configurará automaticamente o CD para seu repositório. Cada push para a branch principal iniciará um novo deploy.

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Construir para produção
npm run build

# Visualizar build de produção localmente
npm run preview
```

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- Dexie.js (IndexedDB)
- React Router
- React Hook Form 