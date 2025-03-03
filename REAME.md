Preciso que realize um conjunto de alterações na minha aplicação React com ShadcnUI

## Contexto

Preciso de um aplicações que realize a criação de torneios com as seguitnes funcionalidades.

Gerenciamento de Jogadores:
- Criar jogador
- Editar jogador
- Remover jogador

Gerenciamento de Times:
- Criar time
- Editar time
- Remover time
- Adicionar jogar ao time
- Deve ser possível adicionar os jogadores no time

Gerenciamento de Torneios:
- Criar torneio de times
- Criar torneio de jogadores
- Editar torneio
- Excluir torneio
- Gerar disputas entre os times e jogadores
- Computação dos resultados das partidas
- Um torneio pode ser de times ou de jogadores e deve ser especificado na hora de criação do torneio
- Deve ser possível adicionar jogadore ou times ao torneio
- Deve ser possível gerar as partidas necessárias para o torneio
- Deve ser possível gerenciar as partidas com a finalidade de adicionar os resultados da partida
- Na partida deve existe dois participantes, que pode ser time ou jogador
- Na página do torneio deve ser exibido um dashboard com o ranking parcial dos participantes do torneio.

## Requisitos

- Toda interface deve ser feita utilizando shadcnui e tailwindcss
- Preciso que as informações sejam salvas em um banco de dados no navegador
- Preciso que o formulário da criação do torneio seja realizado em passos
- Preciso que realize o gerenciamento de rotas
- Utilize typescript para tipar as instancias necessárias
- Utilize enums para caso precise representar alguma opção


## Melhorias

- Preciso que crie a possibilidade de um tema escuro e um tema claro.
No tema escuro preciso que a cor primária seja dourado(gradiente dourado) e azul marinho (gradiente azul marinho com azul mais escuro)

- Preciso que adapte a interface para dispositívos móveis

- Preciso de uma interface mais moderna, sem tantas tabelas. Quando possível, utilize alternativas mais modernas para a exibição dos dados
a não ser tabelas.

- Adicione breadcrumbs para que o usuário se localize

- Altere o layout da página de gerenciamento de torneios, para utilizar cards ao invés de tabelas.