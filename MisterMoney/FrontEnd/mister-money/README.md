This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Integração com a API Java

O dashboard da rota `/` consome `GET {API_BASE_URL}/api/dashboard/{MISTERMONEY_USUARIO_ID}` do backend em `../../BackEnd`.

```bash
# na raiz do front (opcional; os valores abaixo são os padrões)
cp ../../.env.example .env.local
npm run dev
```

- `API_BASE_URL` — padrão `http://localhost:8081`
- `MISTERMONEY_USUARIO_ID` — padrão `2` (usuário criado pelo seed de desenvolvimento)

A busca acontece em um **Server Component** (`src/app/page.tsx`) dentro de um `<Suspense>`, como exigido pelo `cacheComponents: true` do Next 16. O fetch é feito por request (`cache: "no-store"`). Se a API estiver fora, a página continua funcionando com os dados demonstrativos e exibe um aviso. O botão "Atualizar" usa `router.refresh()` para buscar novamente.

Dados reais alimentam: saldo total e saldo por conta, gastos/impostos/retorno do mês, progresso dos orçamentos e o valor do DAS. O gráfico de 6/12 meses e a lista de movimentações seguem demonstrativos porque a API ainda não expõe séries temporais nem transações.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
