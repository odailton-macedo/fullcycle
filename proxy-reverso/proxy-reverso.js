/************************************************
** Desafio Proxy Reverso                       **
** Nginx >> Nodejs >> MySQL                    **
************************************************/

const express = require('express');
const mysql = require('mysql2/promise');

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
app.use(async (req, res, next) => {
  try {
    // Conexão com o banco de dados
    failure_log = 'Falha na conexão com o banco de dados.';
    const db = await mysql.createConnection(dbConfig);    
    
    // Verifica se a tabela "people" existe
    failure_log = 'Falha ao verificar a existência da tabela "people".';
    const [rows] = await db.execute(`SELECT COUNT(1) as count FROM information_schema.tables WHERE table_schema = '${dbConfig.database}' AND table_name = 'people'`);
    const tableExists = rows[0].count > 0;  
    
    // Se a tabela não existir, cria a tabela
    if (!tableExists) {
      failure_log = 'Falha na criação da tabela "people".';
      await db.execute("CREATE TABLE people(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))");
      console.log('A tabela "people" foi criada.');
    }

    // Insert na tabela "people"
    failure_log = 'Falha ao inserir registro na tabela "people".';
    const query = `INSERT INTO people (name) values('${generateRandomName()}')`;
    db.execute(query);

    // Lista tabela "people"
    failure_log = 'Falha ao buscar registros na tabela "people".';
    const [peoples] = await db.execute('SELECT id, name FROM people ORDER BY id DESC');
    
    // Formata a exibição em HTML
    const html = tableHTML(peoples);
    
    // Retorna o HTML
    res.send(html);

    await db.end();
  }
  catch(err) {
    console.error(failure_log  + '\n', err);
    return res.status(500).json({ err: failure_log });
  }
});

// Formata a tabela "people" para exibição em HTML
function tableHTML(rows) {
    const html = `
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
          ${rows.map(row => `<tr><td>${row.id}</td><td>${row.name}</td></tr>`).join('')}
        </table>
      </body>
      </html>
    `;

    return html;
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
  const lastnames  = ["Gilmour", "Hendrix", "King", "Smith", "Gahan", "Morrison", "Jagger", "Franklin", "Joplin", "Merchant", "O´ Riordan"];

  const randomFirstname = getRandomElement(firstnames);
  const randomLastname = getRandomElement(lastnames);
  const name = randomFirstname +' '+ randomLastname ;
  return name;
}
