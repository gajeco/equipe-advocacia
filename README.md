Landing page — Escritório de Advocacia

Página de apresentação para escritório de advocacia, em **HTML, CSS e JavaScript puros**.
Sem build, sem dependências, sem requisições a terceiros: basta abrir o `index.html`.

> **Atenção:** esta é uma página **demonstrativa**. O nome do escritório, o endereço, o
> registro da OAB, os indicadores numéricos e os depoimentos são **fictícios** e existem
> apenas para mostrar o layout. Troque tudo antes de publicar.

---

Como abrir

```bash
Opção 1 — abrir o arquivo direto
start index.html          # Windows
xdg-open index.html      # Linux
open index.html           # macOS

Opção 2 — servidor local (recomendado, evita restrições de file://)
python -m http.server 8000
depois acesse http://localhost:8000
```

Para publicar, envie a pasta inteira para qualquer hospedagem estática
(Netlify, Vercel, GitHub Pages, Hostinger, Locaweb…). Não há build: os arquivos
vão exatamente como estão.

---

Estrutura

```
page/
├── index.html          toda a página (conteúdo estático, bom para SEO)
├── css/
│   ├── base.css        reset, tokens de design, tipografia, utilitários, a11y
│   ├── components.css  botões, cards, header, menu, forms, accordion, modal…
│   └── sections.css    estilos de cada seção da landing page
├── js/
│   ├── config.js       ← FONTE ÚNICA DOS DADOS DO ESCRITÓRIO
│   └── main.js         toda a interatividade (12 módulos)
├── assets/
│   ├── favicon.svg     ícone do navegador
│   └── og-image.svg    imagem de compartilhamento (exportar para PNG)
├── robots.txt
└── sitemap.xml
```

---

O que editar primeiro

1. `js/config.js` — dados do escritório

É o único lugar onde você troca nome, contatos, endereço, redes, SEO e as
mensagens dos botões de WhatsApp:

| Chave | O que é |
| --- | --- |
| `brand.name` | Nome do escritório |
| `brand.monogram` | Siglas exibidas no rodapé |
| `brand.oab` | Registro profissional (ex.: `OAB/SP 42.118`) |
| `contact.whatsapp` | WhatsApp em formato internacional, **só dígitos** (`5511912345678`) |
| `contact.phoneDisplay` | Telefone como aparece na tela |
| `contact.phoneHref` | Telefone para o `tel:` |
| `contact.email` | E-mail de contato |
| `contact.address*` | Rua, bairro, cidade, UF, CEP e link do mapa |
| `contact.hours` | Horário de atendimento |
| `social[]` | LinkedIn, Instagram e Facebook |
| `messages.*` | Texto que abre pré-preenchido em cada botão de WhatsApp |
| `seo.url` | Domínio (usado no canonical e no JSON-LD) |
| `seo.ogImage` | Caminho da imagem de compartilhamento |

> **Importante:** os mesmos valores aparecem **escritos direto no HTML** como
> fallback, para a página funcionar sem JavaScript e para o Google indexar o
> conteúdo. Se você alterar um valor no `config.js`, **mantenha o texto do HTML
> igual** — ou rode a página e copie os valores atualizados.

2. `index.html` — textos e seções

Procure por `EDIT:` no arquivo. Há marcações em:

- `<title>` e `<meta name="description">` (linhas 30–35)
- Blocos JSON-LD `LegalService` e `FAQPage`
- Links das redes sociais no rodapé
- Conteúdo dos modais legais (Política de Privacidade, Termos, Cookies)
- Depoimentos — hoje com aviso de "conteúdo ilustrativo"

3. `robots.txt` e `sitemap.xml`

Troque `https://exemplo.com.br` pelo domínio real e atualize a `<lastmod>`.

4. Imagem de compartilhamento (OG)

O `index.html` referencia `assets/og-image.png`, porque a maioria dos
aplicativos (WhatsApp, Facebook, X, LinkedIn) **não aceita SVG**. O arquivo
`assets/og-image.svg` é a fonte editável: exporte como **PNG 1200×630**
(F12 → *Captura de tela do nó*, ou Figma/Canva em 2×) e salve ao lado dele
com o nome `og-image.png`.

---

Seções da página

| # | Seção | Âncora |
| --- | --- | --- |
| 1 | Hero | `#inicio` |
| 2 | Indicadores de confiança | — |
| 3 | Áreas de atuação | `#areas` |
| 4 | Diferenciais | `#diferenciais` |
| 5 | Como funciona | `#processo` |
| 6 | Equipe | `#equipe` |
| 7 | Depoimentos (carrossel) | `#depoimentos` |
| 8 | Perguntas frequentes | `#faq` |
| 9 | CTA final + formulário | `#contato` |
| 10 | Rodapé + modais legais | — |

---

Como o formulário funciona

O formulário **não tem back-end**. Ao validar, ele monta uma mensagem
estruturada e abre o WhatsApp em uma nova aba:

```
Olá! Gostaria de solicitar uma consulta com um advogado.

Nome:...
Contato: ...
Área de atuação: ...

relato do caso
```

Vantagens: zero custo, zero spam, sem servidor. Se preferir receber por e-mail,
substitua a chamada `window.open(...)` em `js/main.js` (módulo 11) por um
`fetch()` para um serviço de formulários (Formspree, Basin, Web3Forms) e
adapte a função de validação de e-mail.

---

Acessibilidade e performance

- Navegação completa por teclado, com skip link e foco visível
- Menu mobile com trava de foco, `inert` e fechamento por `Esc`
- Accordions, carrossel e modais com ARIA e `<dialog>` nativo
- Respeita `prefers-reduced-motion` (desliga animações)
- Funciona **sem JavaScript**: o conteúdo fica visível e o menu vira uma lista
  estática (fallback via `<noscript>`)
- Zero requisições externas: sem fontes da web, sem analytics, sem CDN
- `robots.txt`, `sitemap.xml`, canonical, Open Graph e JSON-LD prontos

Antes de publicar, confira o contraste de cores e a ordem de foco do formulário
com um leitor de tela — as Diretrizes WCAG 2.2 AA são o padrão de referência.

---

Checklist de publicação

- [ ] `js/config.js` com nome, contatos, endereço e domínio reais
- [ ] Textos fallback do `index.html` iguais aos do `config.js`
- [ ] Depoimentos reais (ou remova a seção e o `FAQPage` do JSON-LD)
- [ ] Textos jurídica e LGPD revisados por um advogado
- [ ] `assets/og-image.png` exportado (1200×630)
- [ ] `robots.txt` e `sitemap.xml` com o domínio real
- [ ] Links das redes sociais apontando para os perfis reais
- [ ] Testado em 375px, 768px e 1440px, com teclado e com `prefers-reduced-motion`
- [ ] `https` habilitado (o WhatsApp exige conexão segura em alguns navegadores)

---

## Licença

Uso livre. Substitua o conteúdo de demonstração pelos dados reais do
escritório antes de utilizar em produção.
