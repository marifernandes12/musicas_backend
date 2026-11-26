
import express from "express";
import cors from "cors";
import mysql2 from "mysql2";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

const sql = mysql2.createPool({
    host: process.env.HOST_BANCO,
    user: process.env.USUARIO_BANCO,
    password: process.env.SENHA_BANCO,
    database: process.env.NOME_BANCO
});

sql.getConnection((error, connection) => {
    if (error) {
        console.log("Erro ao conectar ao banco:", error);
        return;
    }

    console.log("Banco conectado com sucesso!");
    connection.release();
});


app.get("/", (request, response) => {

    const comandoSelect =
        "SELECT * FROM musicas_marianasilva";

    sql.query(comandoSelect, (error, data) => {

        if (error) {
            console.log(error);

            return response.status(500).json({
                erro: "Erro ao listar músicas"
            });
        }

        response.status(200).json(data);
    });
});


app.post("/cadastrar", (request, response) => {

    const { titulo, artista, genero, ano, duracao } = request.body;

    console.log("Recebendo cadastro:", request.body);

    if (
        !titulo ||
        !artista ||
        !genero ||
        ano == null ||
        duracao == null
    ) {
        return response.status(400).json({
            erro: "Preencha todos os campos!"
        });
    }

    const comandoInsert = `
        INSERT INTO musicas_marianasilva
        (titulo, artista, genero, ano, duracao)
        VALUES (?, ?, ?, ?, ?)
    `;

    sql.query(
        comandoInsert,
        [titulo, artista, genero, ano, duracao],
        (error, resultado) => {

            if (error) {
                console.log("ERRO NO CADASTRO:", error);

                return response.status(500).json({
                    erro: "Não foi possível cadastrar a música."
                });
            }

            console.log("Cadastro realizado. ID:", resultado.insertId);

            return response.status(201).json({
                mensagem: "Música cadastrada com sucesso!",
                id: resultado.insertId
            });
        }
    );
});


app.get("/:id", (request, response) => {

    const { id } = request.params;

    const comandoSelect = `
        SELECT * FROM musicas_marianasilva
        WHERE id = ?
    `;

    sql.query(comandoSelect, [id], (error, data) => {

        if (error) {
            console.log(error);

            return response.status(500).json({
                erro: "Erro ao buscar música"
            });
        }

        if (data.length === 0) {
            return response.status(404).json({
                erro: "Música não encontrada"
            });
        }

        response.json(data[0]);
    });
});


app.put("/:id", (request, response) => {

    const { id } = request.params;

    const { titulo, artista, genero, ano, duracao } = request.body;

    const comandoUpdate = `
        UPDATE musicas_marianasilva
        SET titulo = ?, artista = ?, genero = ?, ano = ?, duracao = ?
        WHERE id = ?
    `;

    sql.query(
        comandoUpdate,
        [titulo, artista, genero, ano, duracao, id],
        (error, resultado) => {

            if (error) {
                console.log(error);

                return response.status(500).json({
                    erro: "Erro ao atualizar música"
                });
            }

            if (resultado.affectedRows === 0) {
                return response.status(404).json({
                    erro: "Música não encontrada"
                });
            }

            response.json({
                mensagem: "Música atualizada com sucesso!"
            });
        }
    );
});


app.listen(3000, () => {
    console.log("Servidor online na porta 3000");
});

export default app;

app.delete("/apagar/:id", (request, response) => {
    const { id } = request.params

    const comandoDelete = "DELETE FROM musicas_marianasilva WHERE id = ?"

    sql.query(comandoDelete, [id], (error) => {
        if (error) {
            console.log(error)
            return
        }

        response.json({ mensagem: "Música apagada com sucesso!" })
    })
})
