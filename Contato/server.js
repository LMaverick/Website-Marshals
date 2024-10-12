// backend/server.js
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configuração da conexão com o MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'marshals'
});

connection.connect(err => {
    if (err) {
        console.error('Erro ao conectar no MySQL:', err);
        return;
    }
    console.log('Conectado ao MySQL!');
});

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Pode ser outro serviço como 'hotmail', 'yahoo', etc.
    auth: {
        user: 'marshalsseguranca.enviodedados@gmail.com', // Seu email
        pass: 'marshals309764seguranca' // Sua senha (use Senha de App se estiver usando Gmail com autenticação de 2 fatores)
    }
});

// Função para enviar email
function enviarEmail(cliente) {
    const mailOptions = {
        from: 'marshalsseguranca.enviodedados@gmail.com',
        to: 'marshalsseguranca.receberdados@gmail.com', // Email de destino
        subject: 'Recebimento de Dados de Cliente Para Analise',
        html: `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Roboto', sans-serif; background-color: #f4f4f4; padding: 20px; }
                    .email-container { background-color: #222; color: white; padding: 20px; border-radius: 8px; text-align: center; }
                    .logo-container img { width: 150px; margin-bottom: 20px; }
                    h1 { font-size: 24px; }
                    p { font-size: 16px; margin: 5px 0; }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="logo-container">
                        <img src="https://marshalsseg.com.br/wp-content/uploads/2024/03/logotipo.png" alt="Logo Marshals">
                    </div>
                    <h1>Dados do Cliente</h1>
                    <p><strong>Nome:</strong> ${cliente.nome}</p>
                    <p><strong>CPF:</strong> ${cliente.cpf}</p>
                    <p><strong>Data de Nascimento:</strong> ${cliente.dataNascimento}</p>
                    <p><strong>Email:</strong> ${cliente.email}</p>
                </div>
            </body>
            </html>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erro ao enviar email:', error);
        } else {
            console.log('Email enviado:', info.response);
        }
    });
}

// Rota para salvar dados e enviar email
app.post('/salvarDados', (req, res) => {
    const { nome, cpf, dataNascimento, email } = req.body;

    const query = 'INSERT INTO clientes (nome, cpf, dataNascimento, email) VALUES (?, ?, ?, ?)';
    connection.query(query, [nome, cpf, dataNascimento, email], (err, result) => {
        if (err) {
            console.error('Erro ao inserir dados no MySQL:', err);
            return res.status(500).json({ message: 'Erro ao salvar os dados.' });
        }

        // Enviar email após salvar os dados
        enviarEmail({ nome, cpf, dataNascimento, email });

        res.status(200).json({ message: 'Dados salvos e email enviado com sucesso!' });
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
