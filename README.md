# Autores:

Artur Henrique Bernardo
Felipe da Silva Gonçalves
Matheus Laurentino Alves Barbosa Vieira

# Este repositório faz parte do projeto integrador MOOC IFPR
# Este projeto é uma aplicação Next.js que consome uma API feita em Spring Boot.
# Links ao final do README.

## Para rodar este projeto localmente é necessário ter o Node.js instalado na sua máquina.

Primeiramente para rodar a aplicação localmente você precisa clonar este repositório.
Após clonar, copie o arquivo .env-example e renomei para .env, coloque o endereço da API Spring Boot que está rodando localmente como valor da variável de ambiente.
Por fim, para rodar a aplicação, siga os passos abaixo:

```bash
npm install
# para instalar as dependências
# and
npm run dev
# or
npm run build
# and
npm start
```
A unica diferença entre os dois comandos é que o `npm run dev` roda a aplicação em modo de desenvolvimento, já o `npm run build` e `npm start` rodam a aplicação em modo de produção.

