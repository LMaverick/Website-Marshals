<?php
$host = "localhost";
$usuario = "root";
$senha = "";
$banco = "marshals";

$conn = new mysqli($host, $usuario, $senha, $banco);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}



$nome = $_POST['nome'] ?? '';
$cpf = $_POST['cpf'] ?? '';
$dataNascimento = $_POST['dataNascimento'] ?? '';
$email = $_POST['email'] ?? '';


$sqlVerifica = "SELECT cpf, email FROM clientes WHERE cpf = ? OR email = ?";
$stmtVerifica = $conn->prepare($sqlVerifica);
$stmtVerifica->bind_param("ss", $cpf, $email);
$stmtVerifica->execute();
$resultado = $stmtVerifica->get_result();

$cpfExistente = false;
$emailExistente = false;

if ($resultado->num_rows > 0) {
    while ($row = $resultado->fetch_assoc()) {
        if ($row['cpf'] === $cpf) {
            $cpfExistente = true;
        }
        if ($row['email'] === $email) {
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


$sql = "INSERT INTO clientes (nome, cpf, data_nascimento, email) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $nome, $cpf, $dataNascimento, $email);

if ($stmt->execute()) {

    include 'envio_email.php';
    echo "Dados enviados e salvos com sucesso!";
} else {
    echo "Erro ao salvar dados: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
