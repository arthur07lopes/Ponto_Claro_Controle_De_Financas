# Ponto Claro

O Ponto Claro é um caderno financeiro pessoal, independente e educativo. Ele permite registrar entradas e saídas, acompanhar o saldo de um mês e consultar o extrato no próprio navegador.

> **Importante:** este projeto não é um serviço oficial do Sicredi, não se conecta a bancos e não deve ser usado para armazenar dados bancários reais.

## Funcionalidades

- Cadastro de movimentações com descrição, valor e tipo (entrada ou saída).
- Data preenchida automaticamente no dia do cadastro.
- Filtro por mês e resumo de entradas, saídas e saldo do período selecionado.
- Extrato mensal ordenado pelas movimentações mais recentes, com opção de exclusão.
- Aviso quando as saídas do mês superam as entradas.
- Tema claro e escuro, com preferência salva no navegador.
- Layout responsivo para telas menores.
- Valores formatados em reais (BRL) e datas em português do Brasil.

## Tecnologias

O site é estático e não requer framework, instalação de dependências ou processo de build. Foi desenvolvido com HTML, CSS e JavaScript nativos.

## Estrutura do projeto

```text
.
├── index.html              # Estrutura, conteúdo e formulário da página
├── css/
│   └── style.css           # Temas, componentes e layout responsivo
└── javascript/
    └── finance.js          # Registros, resumo mensal, extrato e tema
```

## Armazenamento e privacidade

As movimentações são salvas no `localStorage` do navegador, sob a chave `ponto-claro-transactions-v1`; a preferência de tema é salva separadamente. Os dados não são enviados a um servidor pelo código do projeto. Eles ficam associados ao navegador e à origem do site e podem ser apagados ao limpar os dados do site ou do navegador. O projeto não oferece sincronização, backup ou proteção de dados financeiros.

As fontes são carregadas do Google Fonts e as duas imagens ilustrativas são carregadas do portal do Sicredi. Esses recursos externos precisam de conexão com a internet e suas políticas e direitos pertencem aos respectivos titulares. O uso das imagens é apenas demonstrativo; o projeto não é afiliado nem endossado pelo Sicredi.

## Acessibilidade e NVDA

O NVDA (NonVisual Desktop Access) é um leitor de tela gratuito para Windows. A página institucional do NV Access lista navegadores como Mozilla Firefox e Google Chrome entre os aplicativos compatíveis. A documentação oficial do NVDA descreve os modos de navegação na Web e a navegação por conteúdo de páginas.

O site inclui recursos que favorecem o uso com leitor de tela e teclado:

- idioma da página definido como português do Brasil (`lang="pt-BR"`);
- link para pular diretamente ao conteúdo principal;
- regiões semânticas de cabeçalho, navegação, conteúdo principal e rodapé;
- hierarquia de títulos, rótulos associados aos campos do formulário e botão de tema com estado anunciado;
- tabela de extrato com legenda e cabeçalhos de coluna e de linha;
- mensagens de estado para operações do formulário e alerta para saldo negativo;
- descrições alternativas para as imagens.

Esses recursos ajudam a expor a estrutura e as atualizações da interface às tecnologias assistivas, mas **não são uma certificação de acessibilidade**. A compatibilidade e a forma como os controles são anunciados podem variar conforme as versões do NVDA e do navegador. O projeto ainda precisa ser validado manualmente com NVDA; em particular, recomenda-se verificar a navegação por regiões e títulos, o preenchimento do formulário, os anúncios de confirmação/erro, a leitura do extrato e a exclusão de uma movimentação com teclado. O seletor de mês nativo (`input type="month"`) também pode ter apresentação e interação diferentes entre navegadores.

### Referências oficiais do NV Access

- [Sobre o NVDA](https://www.nvaccess.org/about-nvda/) — informações sobre o leitor de tela e aplicativos compatíveis.
- [Guia do usuário do NVDA](https://download.nvaccess.org/documentation/userGuide.html) — documentação oficial, incluindo [navegação na Web](https://download.nvaccess.org/documentation/userGuide.html#WebNavigation) e [modo de navegação](https://download.nvaccess.org/documentation/userGuide.html#BrowseMode).

## Licença e uso de recursos externos

Este repositório não declara direitos sobre as imagens ou marcas de terceiros mencionadas. Antes de redistribuir ou publicar recursos externos, confira as permissões e condições aplicáveis junto aos respectivos titulares.
