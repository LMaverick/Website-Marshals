document.addEventListener('DOMContentLoaded', function () {
  const contentForm = document.getElementById('content-form');
  const entendiBtn = document.getElementById('entendi-btn');
  const form = document.getElementById('form');
  const content = document.getElementById('content');
  const status = document.getElementById('status');
  const mensagem = document.getElementById('mensagem');



  const cpfInput = document.getElementById('cpf');

cpfInput.addEventListener('input', function(e) {
    let value = e.target.value;

    // Remove tudo que não for número
    value = value.replace(/\D/g, '');

    // Limita para 11 dígitos
    if (value.length > 11) {
        value = value.substring(0, 11);
    }

    // Aplica a máscara
    if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d+)/, '$1.$2');
    }

    e.target.value = value;
});


  // Evento de clique no botão "Entendi"
  entendiBtn.addEventListener('click', () => {
      content.classList.add('hide');

      setTimeout(() => {
          contentForm.classList.remove('hideDisplay');
          form.classList.add('show');
      }, 810);

      setTimeout(() => {
          content.classList.add('hideDisplay');
          contentForm.classList.remove('hide');
      }, 800);
  });




  // Evento de clique no botão "Salvar"
  document.getElementById('salvar-btn').addEventListener('click', () => {
      const nome = document.getElementById('nome').value.trim();
      const cpf = document.getElementById('cpf').value.trim();
      const dataNascimento = document.getElementById('dataNascimento').value.trim();
      const email = document.getElementById('email').value.trim();

      // Validação dos campos
      if (nome && cpf && dataNascimento && email) {
          const formData = new FormData();
          formData.append('nome', nome);
          formData.append('cpf', cpf);
          formData.append('dataNascimento', dataNascimento);
          formData.append('email', email);

          // Mostra o loader (carregando)
          status.style.display = 'block';
          mensagem.style.display = 'none';

          // Envia os dados via AJAX para o PHP (envio de e-mail e banco)
          fetch('envio_email.php', {
              method: 'POST',
              body: formData
          })
          .then(response => response.text())
          .then(data => {
              // Esconde o loader e mostra a mensagem de sucesso
              status.style.display = 'none';
              mensagem.style.display = 'block';
              mensagem.textContent = data;

              // ✅ Limpa os campos após envio
              document.getElementById('nome').value = '';
              document.getElementById('cpf').value = '';
              document.getElementById('dataNascimento').value = '';
              document.getElementById('email').value = '';

              // Mensagem some depois de 5 segundos (opcional)
              setTimeout(() => {
                  mensagem.style.display = 'none';
              }, 5000);
          })
          .catch(error => {
              status.style.display = 'none';
              alert('Erro ao enviar os dados: ' + error);
          });

      } else {
          alert('Por favor, preencha todos os campos!');
      }
  });
});
