const apiKey = "df281c5e";
 
const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const moviesContainer = document.getElementById("movies");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const historyList = document.getElementById("historyList");
const typeFilter = document.getElementById("typeFilter");
 
let currentPage = 1;
let currentSearch = "";
 
async function buscarFilmes(title, page = 1) {
  mostrarLoading();
 
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&s=${title}&type=${typeFilter.value}&page=${page}`
    );
 
    const data = await response.json();
 
    if (data.Response === "False") {
      mostrarErro("Filme não encontrado.");
      return;
    }
 
    renderizarFilmes(data.Search);
    salvarHistorico(title);
 
  } catch (error) {
    mostrarErro("Erro ao buscar filmes.");
  }
}
 
async function buscarDetalhes(id) {
  const response = await fetch(
    `https://www.omdbapi.com/?apikey=${apiKey}&i=${id}`
  );
 
  const data = await response.json();
  abrirModal(data);
}
 
function renderizarFilmes(filmes) {
  moviesContainer.innerHTML = "";
 
  filmes.forEach(movie => {
    const article = document.createElement("article");
    article.classList.add("movie-card");
 
    article.innerHTML = `
      <figure>
        <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200'}"
             alt="Poster do filme ${movie.Title}">
        <figcaption>${movie.Title} (${movie.Year})</figcaption>
      </figure>
    `;
 
    article.addEventListener("click", () => buscarDetalhes(movie.imdbID));
    moviesContainer.appendChild(article);
  });
}
 
function abrirModal(movie) {
  modalBody.innerHTML = `
    <h2>${movie.Title}</h2>
    <p><strong>Ano:</strong> ${movie.Year}</p>
    <p><strong>Gênero:</strong> ${movie.Genre}</p>
    <p><strong>Sinopse:</strong> ${movie.Plot}</p>
  `;
  modal.classList.add("active");
}
 
function fecharModal() {
  modal.classList.remove("active");
}
 
closeModal.addEventListener("click", fecharModal);
modal.addEventListener("click", e => {
  if (e.target.classList.contains("modal-overlay")) {
    fecharModal();
  }
});
 
function mostrarLoading() {
  moviesContainer.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement("div");
    skeleton.classList.add("skeleton");
    moviesContainer.appendChild(skeleton);
  }
}
 
function mostrarErro(msg) {
  moviesContainer.innerHTML = `<p class="error">${msg}</p>`;
}
 
function salvarHistorico(busca) {
  let historico = JSON.parse(localStorage.getItem("historico")) || [];
 
  if (!historico.includes(busca)) {
    historico.unshift(busca);
  }
 
  historico = historico.slice(0, 5);
  localStorage.setItem("historico", JSON.stringify(historico));
  renderHistorico();
}
 
function renderHistorico() {
  const historico = JSON.parse(localStorage.getItem("historico")) || [];
  historyList.innerHTML = "";
 
  historico.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.onclick = () => buscarFilmes(item);
    historyList.appendChild(li);
  });
}
 
renderHistorico();
 
form.addEventListener("submit", e => {
  e.preventDefault();
  const value = input.value.trim();
 
  if (!value) {
    alert("Digite um nome de filme.");
    return;
  }
 
  currentSearch = value;
  currentPage = 1;
  buscarFilmes(value);
});
 
document.getElementById("nextBtn").onclick = () => {
  currentPage++;
  buscarFilmes(currentSearch, currentPage);
};
 
document.getElementById("prevBtn").onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    buscarFilmes(currentSearch, currentPage);
  }
};