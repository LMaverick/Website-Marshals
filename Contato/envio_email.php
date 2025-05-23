<?php
require __DIR__ . '/PHPMailer-master/src/PHPMailer.php';
require __DIR__ . '/PHPMailer-master/src/SMTP.php';
require __DIR__ . '/PHPMailer-master/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Dados recebidos
$nome = $_POST['nome'] ?? '';
$cpf = $_POST['cpf'] ?? '';
$data_nascimento = $_POST['dataNascimento'] ?? '';
$email_cliente = $_POST['email'] ?? '';

// 🔗 Conexão com o banco para validar duplicidade
$host = "localhost";
$usuario = "root";
$senha = "";
$banco = "marshals";

$conn = new mysqli($host, $usuario, $senha, $banco);

if ($conn->connect_error) {
    die("Erro na conexão com o banco de dados: " . $conn->connect_error);
}

// 🔍 Verifica se já existe CPF ou E-mail cadastrado
$sqlVerifica = "SELECT cpf, email FROM clientes WHERE cpf = ? OR email = ?";
$stmtVerifica = $conn->prepare($sqlVerifica);
$stmtVerifica->bind_param("ss", $cpf, $email_cliente);
$stmtVerifica->execute();
$resultado = $stmtVerifica->get_result();

$cpfExistente = false;
$emailExistente = false;

$cpfNumerico = preg_replace('/\D/', '', $cpf); 

if (empty($nome) || empty($cpfNumerico) || empty($data_nascimento) || empty($email_cliente)) {
    die('Erro: Todos os campos são obrigatórios.');
}


if (strlen($cpfNumerico) != 11) {
    die('Erro: CPF inválido. Deve conter exatamente 11 números.');
}


//if (!filter_var($email_cliente, FILTER_VALIDATE_EMAIL)) {
  //  die('Erro: E-mail inválido.');
//}

if ($resultado->num_rows > 0) {
    while ($row = $resultado->fetch_assoc()) {
        if ($row['cpf'] === $cpf) {
            $cpfExistente = true;
        }
        if ($row['email'] === $email_cliente) {
            $emailExistente = true;
        }
    }

    $mensagemErro = "Erro: ";

    if ($cpfExistente && $emailExistente) {
        $mensagemErro .= "CPF e E-mail já estão cadastrados.";
    } elseif ($cpfExistente) {
        $mensagemErro .= "CPF já está cadastrado.";
    } elseif ($emailExistente) {
        $mensagemErro .= "E-mail já está cadastrado.";
    }

    echo $mensagemErro;

    $stmtVerifica->close();
    $conn->close();
    exit;
}

// ✔️ Se não existir, salva no banco
$sql = "INSERT INTO clientes (nome, cpf, data_nascimento, email) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $nome, $cpf, $data_nascimento, $email_cliente);

if ($stmt->execute()) {

    // ✔️ Agora faz o envio do e-mail
    $mail = new PHPMailer(true);
    $data_nascimento= date ('d/m/Y');

    try {
        // Configurações do servidor SMTP
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'marshalsseguranca.enviodedados@gmail.com';
        $mail->Password   = 'fifo doig ajgw hupg'; // Troque pela senha correta
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Destinatários
        $mail->setFrom('marshalsseguranca.enviodedados@gmail.com', 'Marshals envio de dados');
        $mail->addReplyTo('marshalsseguranca.enviodedados@gmail.com', 'Responder para Marshals');
        $mail->addAddress('marshalsseguranca.receberdados@gmail.com', 'Marshals recebimento dados');

        // Conteúdo do e-mail
        $mail->isHTML(true);
        $mail->Subject = 'Nova avaliacao de cliente - CPF --> ' . $cpf . '';

        $mail->Body = '
        <div style="background-color:#111; color:#fff; font-family:Roboto, sans-serif; padding:20px; border-radius:10px; max-width:600px; margin:auto; box-shadow:0 0 10px rgba(0,0,0,0.3);">

            <div style="text-align:center; margin-bottom:20px;">
                <img src="https://marshalsseg.com.br/wp-content/uploads/2024/03/logotipo.png" alt="Logo Marshals" style="width:120px;">
            </div>

            <h2 style="text-align:center; color:#fff;">Nova solicitacao de avaliacao</h2>

            <p style="font-size:16px; color:#ccc;">Você recebeu uma nova solicitação de avaliacao. Avalie os dados abaixo:</p>
            <table style="width:100%; margin-top:20px; font-size:16px; color:#eee;">
                <tr><td><strong>Nome:</strong></td><td>' . htmlspecialchars($nome) . '</td></tr>
                <tr><td><strong>CPF:</strong></td><td>' . htmlspecialchars($cpf) . '</td></tr>
                <tr><td><strong>Data de Nascimento:</strong></td><td>' . htmlspecialchars($data_nascimento) . '</td></tr>
                <tr><td><strong>Email:</strong></td><td>' . htmlspecialchars($email_cliente) . '</td></tr>
            </table>
            <p style="margin-top:30px; color:#aaa;">Atenciosamente,<br>Equipe Marshals</p>
        </div>
        ';

        $mail->AltBody = "Nova solicitação de avaliação:\nNome: $nome\nCPF: $cpf\nNascimento: $data_nascimento\nEmail: $email_cliente";

        $mail->send();
        echo 'Dados salvos e E-mail enviado com sucesso!';

    } catch (Exception $e) {
        echo "Erro ao enviar e-mail: {$mail->ErrorInfo}";
    }

} else {
    echo "Erro ao salvar dados: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
