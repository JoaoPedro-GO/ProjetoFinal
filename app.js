
const CHAVE_ARMAZENAMENTO = 'filmes';


function obterFilmes() {
  return JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO) || '[]');
}

function salvarFilmes(lista) {
  localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(lista));
}

function buscarFilme(id) {
  return obterFilmes().find(f => f.id === id);
}

function gerarId() {
  const lista = obterFilmes();
  return lista.length ? Math.max(...lista.map(f => +f.id)) + 1 : 1;
}


function renderizarGradeFilmes(pesquisa = '') {
  const grade = document.getElementById('moviesGrid');
  if (!grade) return;

  const filmesFiltrados = obterFilmes().filter(f =>
    f.titulo.toLowerCase().includes((pesquisa || '').toLowerCase())
  );

  grade.innerHTML = filmesFiltrados
    .map(
      f => `
     <div class="card">
       <img src="${
         f.imagem ||
         'https://via.placeholder.com/300x450?text=' + encodeURIComponent(f.titulo)
       }" alt="${f.titulo}">
       <div class="info">
          <div class="meta"><span class="nota">Nota: ${f.notaUsuario ?? 'N/A'}</span></div>
          <h3>${f.titulo} (${f.ano})</h3>
          <p><strong>Classificação:</strong> ${f.classificacao || 'N/A'}</p>
          <p class="sinopse">${
            f.sinopse ? f.sinopse.substring(0, 80) + '...' : 'Sem sinopse.'
          }</p>
          <div class="actions">
             <button onclick="location.href='details.html?id=${f.id}'">Ver</button>
             <button onclick="location.href='form.html?id=${f.id}'">Editar</button>
             <button onclick="excluirFilme(${f.id})">Excluir</button>
          </div>
       </div>
     </div>
  `
    )
    .join('');
}


function excluirFilme(id) {
  if (!confirm('Tem certeza que deseja excluir?')) return;
  const listaAtualizada = obterFilmes().filter(f => +f.id !== +id);
  salvarFilmes(listaAtualizada);
  renderizarGradeFilmes();
}


function configurarFormulario() {
  const parametros = new URLSearchParams(location.search);
  const id = +parametros.get('id');

  if (id) {
    const filme = buscarFilme(id);
    if (filme) {
      document.getElementById('movieId').value = id;
      for (const campo in filme) {
        if (document.getElementById(campo)) {
          document.getElementById(campo).value = filme[campo];
        }
      }
      
      if (filme.imagem) {
        const preview = document.getElementById('preview');
        preview.src = filme.imagem;
        preview.style.display = 'block';
      }
    }
  }

  
  document.getElementById('imagemInput').addEventListener('change', e => {
    const arquivo = e.target.files[0];
    const leitor = new FileReader();
    leitor.onload = function (evt) {
      const preview = document.getElementById('preview');
      preview.src = evt.target.result;
      preview.style.display = 'block';
    };
    if (arquivo) leitor.readAsDataURL(arquivo);
  });

  
  document.getElementById('movieForm').addEventListener('submit', e => {
    e.preventDefault();
    const dadosFormulario = new FormData(e.target);
    const filmeObj = Object.fromEntries(dadosFormulario.entries());

    filmeObj.id = filmeObj.id ? +filmeObj.id : null;
    filmeObj.ano = +filmeObj.ano;
    filmeObj.duracao = +filmeObj.duracao;
    filmeObj.notaUsuario = +filmeObj.notaUsuario;

    const previewImg = document.getElementById('preview');
    if (previewImg && previewImg.src && previewImg.style.display !== 'none') {
      filmeObj.imagem = previewImg.src;
    }

    if (filmeObj.id) {
      const lista = obterFilmes();
      const idx = lista.findIndex(f => +f.id === filmeObj.id);
      if (idx > -1) {
        lista[idx] = { ...lista[idx], ...filmeObj };
        salvarFilmes(lista);
      }
    } else {
      filmeObj.id = gerarId();
      filmeObj.dataAdicao = new Date().toISOString().split('T')[0];
      const lista = obterFilmes();
      lista.push(filmeObj);
      salvarFilmes(lista);
    }
    location.href = 'index.html';
  });
}


function renderizarDetalhes() {
  const parametros = new URLSearchParams(location.search);
  const id = +parametros.get('id');
  const container = document.getElementById('detailsContainer');
  const filme = buscarFilme(id);

  if (!filme) {
    container.innerHTML = '<p>Filme não encontrado.</p>';
    return;
  }

  container.innerHTML = `
    ${
      filme.imagem
        ? `<img src="${filme.imagem}" alt="Imagem do Filme" style="max-width:300px;">`
        : ''
    }
    <h2>${filme.titulo}</h2>
    <p><strong>Diretor:</strong> ${filme.diretor}</p>
    <p><strong>Ano:</strong> ${filme.ano}</p>
    <p><strong>Gênero:</strong> ${filme.genero}</p>
    <p><strong>Duração:</strong> ${filme.duracao} min</p>
    <p><strong>Elenco:</strong> ${filme.elenco}</p>
    <p><strong>Classificação:</strong> ${filme.classificacao}</p>
    <p><strong>Nota do usuário:</strong> ${filme.notaUsuario}</p>
    <p><strong>Data de Adição:</strong> ${filme.dataAdicao}</p>
    <p><strong>Sinopse:</strong> ${filme.sinopse}</p>
    <button class="btn" onclick="location.href='index.html'">Voltar</button>

  `;
}
