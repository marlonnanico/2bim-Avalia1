import { gerarDesenho } from "../../lib/desenho.js";

export async function onRequest(context) {
  const { request, env } = context;

  // 1. Método deve ser POST (405)
  if (request.method !== "POST") {
    return new Response("Método Não Permitido", { status: 405 });
  }

  // 2. Validação do Corpo / JSON (400)
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response("JSON inválido", { status: 400 });
  }

  const numero = body?.numero;
  if (
    numero === undefined ||
    typeof numero !== "number" ||
    !Number.isInteger(numero) ||
    numero < 1 ||
    numero > 100
  ) {
    return new Response("Número inválido", { status: 400 });
  }

  // 3. Validação do Token (401)
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Token ausente", { status: 401 });
  }

  const idToken = authHeader.split(" ")[1];

  // Validação no Google
  const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!googleRes.ok) {
    return new Response("Token inválido no Google", { status: 401 });
  }

  const tokenData = await googleRes.json();

  if (tokenData.aud !== env.GOOGLE_CLIENT_ID || tokenData.email_verified !== "true") {
    return new Response("Token não autorizado", { status: 401 });
  }

  // 4. Sucesso (200) - Gera o SVG com a assinatura do e-mail do Google
  const emailAssinatura = tokenData.email;
  const svgTexto = gerarDesenho(numero, emailAssinatura);

  return new Response(svgTexto, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
    },
  });
}
