const express = require("express");
const http = require("http");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("../frontend"));

const db = new sqlite3.Database("banco.db");

function inserirNoBanco(tempo, pv, sp, mv) {
  if (isNaN(tempo) || isNaN(pv) || isNaN(sp) || isNaN(mv)) return;

  db.run(
    `INSERT OR IGNORE INTO dados (tempo_simulador, pv, sp, mv) VALUES (?, ?, ?, ?)`,
    [tempo, pv, sp, mv],
    (err) => {
      if (err) console.error("Erro ao inserir no banco:", err);
    }
  );
}

setInterval(() => {
  try {
    const linhas = fs.readFileSync("./FIC101_2.txt", "utf8").trim().split("\n");
    console.log(linhas)
    const ultimaLinha = linhas[linhas.length - 1];

    if (!ultimaLinha || ultimaLinha.startsWith("Tempo")) return;
    const partes = ultimaLinha
      .split(";")
      .map((v) => parseFloat(v.replace(",", ".")));

    if (partes.length >= 4) {
      const [tempo, pv, sp, mv] = partes;

      //inserirNoBanco(tempo, pv, sp, mv); <- ajustar essa função depois

      io.emit("novo-dado", { tempo, pv, sp, mv });
    }
  } catch (err) {
    console.error("Erro ao ler arquivo:", err);
  }
}, 100);

app.get("/historico", (req, res) => {
  db.all("SELECT * FROM dados ORDER BY id DESC LIMIT 100", (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(rows.reverse());
    }
  });
});

server.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
