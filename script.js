// ============================
// VARIÁVEIS GLOBAIS
// ============================
let pastaSelecionada = null;

// ============================
// CADASTRO
// ============================
function cadastrar(){

  if(cadPass.value !== cadPass2.value){
    alert("As senhas não coincidem");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  if(usuarios.some(u => u.user === cadUser.value)){
    alert("Usuário já existe!");
    return;
  }

  usuarios.push({
    user: cadUser.value,
    pass: cadPass.value,
    pastas:[]
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  window.location.href = "login.html";
}


// ============================
// LOGIN
// ============================
function login(){
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  let usuario = usuarios.find(u =>
    u.user === logUser.value && u.pass === logPass.value
  );

  if(usuario){
    localStorage.setItem("usuarioLogado", usuario.user);
    window.location.href = "index.html"; // 🔥 AGORA VAI PARA INDEX
  }else{
    alert("Usuário ou senha incorretos");
  }
}


// ============================
// GALERIA - CARREGAR PASTAS
// ============================
function carregarPastas(){
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const userLogado = localStorage.getItem("usuarioLogado");
  const area = document.getElementById("pastas");

  if(!area) return;

  const usuario = usuarios.find(u => u.user === userLogado);
  if(!usuario) return;

  area.innerHTML = "";

  usuario.pastas.forEach(p => {
    const div = document.createElement("div");
    div.className = "pasta";
    div.innerHTML = `📁<span>${p.nome}</span>`;

    div.onclick = () => abrirPasta(p.nome);

    // 🔥 MENU COM BOTÃO DIREITO
    div.oncontextmenu = function(e){
      e.preventDefault();

      pastaSelecionada = p.nome;

      const menu = document.getElementById("menuContexto");
      menu.style.display = "flex";
      menu.style.left = e.pageX + "px";
      menu.style.top = e.pageY + "px";
    };

    area.appendChild(div);
  });
}

// ============================
// CRIAR PASTA
// ============================
function criarPasta(){
  const nome = prompt("Nome da pasta:");
  if(!nome) return;

  const usuarios = JSON.parse(localStorage.getItem("usuarios"));
  const userLogado = localStorage.getItem("usuarioLogado");

  const usuario = usuarios.find(u => u.user === userLogado);

  usuario.pastas.push({
    nome,
    imagens:[]
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  carregarPastas();
}

// ============================
// ABRIR PASTA
// ============================
function abrirPasta(nome){
  window.location.href = "pasta.html?nome=" + encodeURIComponent(nome);
}

// ============================
// FUNÇÕES DO MENU CONTEXTO
// ============================

// Fecha menu ao clicar fora
document.addEventListener("click", () => {
  const menu = document.getElementById("menuContexto");
  if(menu) menu.style.display = "none";
});

// Renomear pasta
function renomearPasta(){
  if(!pastaSelecionada) return;

  const novoNome = prompt("Novo nome da pasta:");
  if(!novoNome) return;

  const usuarios = JSON.parse(localStorage.getItem("usuarios"));
  const userLogado = localStorage.getItem("usuarioLogado");

  const usuario = usuarios.find(u => u.user === userLogado);
  const pasta = usuario.pastas.find(p => p.nome === pastaSelecionada);

  pasta.nome = novoNome;

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  carregarPastas();
}

// Excluir pasta
function excluirPasta(){
  if(!pastaSelecionada) return;

  if(!confirm("Deseja realmente excluir esta pasta?")) return;

  const usuarios = JSON.parse(localStorage.getItem("usuarios"));
  const userLogado = localStorage.getItem("usuarioLogado");

  const usuario = usuarios.find(u => u.user === userLogado);

  usuario.pastas = usuario.pastas.filter(p => p.nome !== pastaSelecionada);

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  carregarPastas();
}

// ============================
// CARREGAR IMAGENS
// ============================
function carregarImagens(){
  const nomePasta = new URLSearchParams(location.search).get("nome");
  const titulo = document.getElementById("nomePasta");
  if(titulo) titulo.innerText = nomePasta;

  const usuarios = JSON.parse(localStorage.getItem("usuarios"));
  const user = localStorage.getItem("usuarioLogado");
  if(!usuarios || !user) return;

  const usuario = usuarios.find(u => u.user === user);
  if(!usuario) return;

  const pasta = usuario.pastas.find(p => p.nome === nomePasta);
  if(!pasta) return;

  const area = document.getElementById("imagens");
  if(!area) return;

  area.innerHTML = "";

  pasta.imagens.forEach((src, i) => {
    const div = document.createElement("div");
    div.className = "imagem";
    div.draggable = true;

    const img = document.createElement("img");
    img.src = src;

    // 🔥 ABRIR EM TELA CHEIA
    img.onclick = () => abrirImagemTelaCheia(src);

    div.appendChild(img);

    div.ondragstart = e => {
      e.dataTransfer.setData("i", i);
    };

    area.appendChild(div);
  });

  // Botão +
  const add = document.createElement("div");
  add.className = "imagem add";
  add.innerText = "+";
  add.onclick = adicionarImagem;

  area.appendChild(add);

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// ============================
// ADICIONAR IMAGEM (COM LIMITE)
// ============================
function adicionarImagem(){

  const LIMITE_MB = 4;
  const LIMITE_BYTES = LIMITE_MB * 1024 * 1024;

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = () => {
    const file = input.files[0];
    if(!file) return;

    if(file.size > LIMITE_BYTES){
      alert(
        `⚠️ Imagem muito grande!\n\n` +
        `Permitido: até ${LIMITE_MB}MB\n` +
        `Imagem selecionada: ${(file.size / (1024*1024)).toFixed(2)}MB`
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = function(e){

      const nome = new URLSearchParams(location.search).get("nome");
      const usuarios = JSON.parse(localStorage.getItem("usuarios"));
      const user = localStorage.getItem("usuarioLogado");

      const pasta = usuarios
        .find(u => u.user === user)
        .pastas.find(p => p.nome === nome);

      if(!pasta.imagens) pasta.imagens = [];

      pasta.imagens.push(e.target.result);

      try{
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        carregarImagens();
      }
      catch(erro){
        alert("⚠️ Limite total de armazenamento do navegador atingido!, LIMITE DA IMAGEM ATÉ 4MB");
      }
    };

    reader.readAsDataURL(file);
  };

  input.click();
}

// ============================
// LIXEIRA (ARRASTAR PARA EXCLUIR)
// ============================
const lixeira = document.getElementById("lixeira");

if(lixeira){
  lixeira.ondragover = e => e.preventDefault();

  lixeira.ondrop = e => {
    const i = e.dataTransfer.getData("i");

    const nome = new URLSearchParams(location.search).get("nome");
    const usuarios = JSON.parse(localStorage.getItem("usuarios"));
    const user = localStorage.getItem("usuarioLogado");

    const pasta = usuarios
      .find(u => u.user === user)
      .pastas.find(p => p.nome === nome);

    pasta.imagens.splice(i,1);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    carregarImagens();
  };
}

// ============================
// VOLTAR
// ============================
function voltar(){
  window.location.href = "galeria.html";
}









// ============================
// ENTRAR NO ÁLBUM
// ============================
function entrarAlbum(){

  const usuarioLogado = localStorage.getItem("usuarioLogado");

  if(usuarioLogado){
    window.location.href = "galeria.html";
  }else{
    window.location.href = "login.html";
  }

}














// ============================
// PROTEÇÃO DE PÁGINAS
// ============================
(function protegerPaginas(){

  const pagina = window.location.pathname;

  const paginasProtegidas = [
    "galeria.html",
    "pasta.html",
    "index.html"
  ];

  const usuarioLogado = localStorage.getItem("usuarioLogado");

  paginasProtegidas.forEach(p => {
    if(pagina.includes(p) && !usuarioLogado){
      window.location.href = "login.html";
    }
  });

})();















// ============================
// IMAGEM TELA CHEIA
// ============================
function abrirImagemTelaCheia(src){

  const overlay = document.createElement("div");
  overlay.className = "overlay-imagem";

  const img = document.createElement("img");
  img.src = src;

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  // Fecha ao clicar fora
  overlay.onclick = () => {
    overlay.remove();
  };

  // Fecha com ESC
  function fechar(e){
    if(e.key === "Escape"){
      overlay.remove();
      document.removeEventListener("keydown", fechar);
    }
  }

  document.addEventListener("keydown", fechar);
}
