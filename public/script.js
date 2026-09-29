let googleToken = null;

// Chamada automaticamente quando o utilizador faz login no Google
function handleCredentialResponse(response) {
  googleToken = response.credential;
  document.getElementById("mensagem-erro").textContent = "";
}

document.getElementById("form-desenho").addEventListener("submit", async (event) => {
  event.preventDefault();
  const erroDiv = document.getElementById("mensagem-erro");
  const containerSvg = document.getElementById("container-svg");

  erroDiv.textContent = "";
  containerSvg.innerHTML = "";

  if (!googleToken) {
    erroDiv.textContent = "Por favor, faça login com o Google primeiro.";
    return;
  }

  const numero = parseInt(document.getElementById("numero").value, 10);

  try {
    const response = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${googleToken}`
      },
      body: JSON.stringify({ numero })
    });

    if (response.status === 400) {
      erroDiv.textContent = "Erro 400: Dados do formulário inválidos.";
      return;
    }

    if (response.status === 401) {
      erroDiv.textContent = "Erro 401: Token inválido ou não autorizado.";
      return;
    }

    if (!response.ok) {
      erroDiv.textContent = `Erro inesperado: HTTP ${response.status}`;
      return;
    }

    const svgTexto = await response.text();
    containerSvg.innerHTML = svgTexto;

  } catch (err) {
    erroDiv.textContent = "Erro na comunicação com o servidor.";
  }
});
