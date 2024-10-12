  document.addEventListener('DOMContentLoaded', function () {
        const contentForm = document.getElementById('content-form');
      const entendiBtn = document.getElementById('entendi-btn');
      const form = document.getElementById('form');
      const content = document.getElementById('content');
      
      entendiBtn.addEventListener('click', () => {
        // Verifique se o evento click está sendo chamado corretamente
        console.log('Botão "Entendi" clicado!');
        
        // Esconde o conteúdo inicial lentamente
        content.classList.add('hide');
        
        setTimeout(() => {
            contentForm.classList.remove('hideDisplay');
            form.classList.add('show');
        }, 810)
        // Após 0.8s, mostra o formulário
        setTimeout(() => {
            content.classList.add('hideDisplay');
            
            form.style.display = 'flex'; // Força a exibição do formulário
            form.classList.add('show'); // Mostra o formulário com a animação de baixo para cima
            contentForm.classList.remove('hide');
        }, 800); // Espera 0.8s para esconder completamente o conteúdo antes de mostrar o formulário
      });


  function autoPreencherData() {
    const dataNascimento = document.getElementById('dataNascimento');
    if (!dataNascimento.value) {
      const hoje = new Date().toISOString().split('T')[0];
      dataNascimento.value = hoje;
    }
  }

  document.getElementById('salvar-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const dataNascimento = document.getElementById('dataNascimento').value;
    const email = document.getElementById('email').value;

    if (nome && cpf && dataNascimento && email) {
      const dadosCliente = { nome, cpf, dataNascimento, email };

      fetch('http://localhost:3000/salvarDados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosCliente)
      })
      .then(response => response.json())
      .then(data => {
        if(data.message) {
          alert('Dados salvos e email enviado com sucesso!');
          form.reset();
          contentForm.classList.remove('show');
          contentForm.classList.add('hideDisplay');
          content.classList.remove('hide');
        }
      })
      .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar os dados. Tente novamente.');
      });
    } else {
      alert('Por favor, preencha todos os campos!');
    }
  });
});
