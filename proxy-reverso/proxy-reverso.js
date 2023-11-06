//////////////////////////////
// Desafio Proxy Reverso    //
// Nginx >> Nodejs >> MySQL // 
//////////////////////////////

const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Configuração da conexão com o MySQL
const dbConfig = {
  host: 'mysql',
  user: 'root',
  password: 'root',
  database: 'nodedb' 
};

// Middleware para conectar ao MySQL antes de lidar com as requisições
app.use((req, res, next) => {
  const db = mysql.createConnection(dbConfig);

  db.connect(err => {
    if (err) {
      const msg = 'O servidor de banco de dados não está disponível.'
      console.error(msg  + '\n', err);
      return res.status(500).json({ error: msg });
    }

    // Adicione o objeto de conexão ao pedido para que possa ser usado nas rotas
    req.db = db;

    next();
  });
});


// Responde à rota "/"
app.get('/', (req, res) => {
  insertPeople(req, res);
  listPeople(req, res);
  req.db.end();
});


// Insert na tabela "people"
function insertPeople(req, res) {
  const query = `INSERT INTO people (name) values('${generateRandomName()}')`;
  req.db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao inserir pessoa no banco de dados: ', err);
      res.status(500).send('Erro ao inserir pessoa no banco de dados');
      return;
    }
  });
}

// Lista a tabela "people"
function listPeople(req, res) {
  const query = 'SELECT id, name FROM people ORDER BY id DESC';  
  req.db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados: ', err);
      res.status(500).send('Erro ao consultar o banco de dados');
      return;
    }

    // Converte resultados em uma tabela HTML
    const tableHTML = `
      <html>
      <head>
        <style>
          table {
            border-collapse: collapse;
            width: 50%;
            margin: 20px auto;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h1>Full Cycle Rocks!</h1>
        <h2>Tabela People</h2>
        <table>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
          ${results.map(row => `<tr><td>${row.id}</td><td>${row.name}</td></tr>`).join('')}
        </table>
      </body>
      </html>
    `;

    res.send(tableHTML);
  });
}

app.listen(port, () => {
  console.log(`Servidor Node.js rodando na porta ${port}`);
});

function getRandomElement(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function generateRandomName() {
  const firstnames = ["David", "Jimi", "Albert", "Robert", "Dave", "Jim", "Mick", "Aretha", "Janis", "Natalie", "Dolores"];
  const lastnames = ["Gilmour", "Hendrix", "King", "Smith", "Gahan", "Morrison", "Jagger", "Franklin", "Joplin", "Merchant", "O´ Riordan"];

  const randomFirstname = getRandomElement(firstnames);
  const randomLastname = getRandomElement(lastnames);
  const name = randomFirstname +' '+ randomLastname ;
  return name;
}
