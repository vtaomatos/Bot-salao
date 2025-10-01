import 'dotenv/config';
import venom from 'venom-bot';
import OpenAI from 'openai';
import { readFileSync } from 'fs';

const clientAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sessions = {};
const TIMEOUT_ATENDIMENTO = 24 * 60 * 60 * 1000; // 24h
const BUFFER_TIME = 2 * 60 * 1000; // 2 minutos
const MAX_HISTORY = 10;
const grupoAtendimento = '120363418732966493@g.us';

const INFOS_FIXAS = `
    - Curso Nagô Penteado: R$ 550 | 1 dia (8h)
    - Curso Nagô Detalhado com Jumbo: R$ 850 | 2 dias (6h/dia)
    - Curso Box Braids: R$ 850 | 2 dias (6h/dia)
    - Curso Entrelace VIP: R$ 850 | 2 dias (6h/dia)
    - Matrícula: R$ 50 (sinal)
    - Endereço: Santos/SP (detalhe enviado pelo atendente)
    - Agendamento: https://online.maapp.com.br/StudioDamarisBraids
    `;

// 🔹 Carregar dúvidas do arquivo
function carregarDuvidas() {
    try {
        const raw = readFileSync("./duvidas.json", "utf-8");
        const data = JSON.parse(raw);
        return data.data
            .map(d => `Pergunta: ${d.duvida}\nResposta: ${d.resposta}`)
            .join("\n\n");
    } catch (err) {
        console.error("Erro ao carregar duvidas.json:", err);
        return "";
    }
}
const INFOS_DUVIDAS = carregarDuvidas();

function resetSession(from) {
    if (sessions[from]?.timeoutId) clearTimeout(sessions[from].timeoutId);
    sessions[from] = {
        atendimentoAtivo: false,
        timeoutId: null,
        pendingMessages: [],
        history: [],
        bufferTimer: null,
        falhasConsecutivas: 0
    };
}

function startTimeoutAtendimento(client, from) {
    const session = sessions[from];
    if (!session) return;
    if (session.timeoutId) clearTimeout(session.timeoutId);

    session.timeoutId = setTimeout(async () => {
        session.atendimentoAtivo = false;
        session.timeoutId = null;
        await client.sendText(from, 'O atendimento automático foi reativado após 24h de inatividade.');
        await apresentarIA(from, client);
    }, TIMEOUT_ATENDIMENTO);
}

async function apresentarIA(to, client) {
    await client.sendText(to,
        `Olá! Sou a IA Damaris Braids 🤖💁🏽‍♀️✨
Estou aqui para tirar suas dúvidas e adiantar seu atendimento.
Confira nosso catálogo completo aqui:  
https://wa.me/c/5513997833427  

E agende diretamente pelo link:  
https://online.maapp.com.br/StudioDamarisBraids

*Já vou te responder!*`
    );
}

async function chamarGPT(from, mensagensAgrupadas, infosDisponiveisText = "") {
    const session = sessions[from];
    const historico = session.history.slice(-MAX_HISTORY);

    const KNOWLEDGE_BASE = `
    Você é a IA oficial do Studio Damaris Braids. Você praticamente é a Damaris, mas em versão virtual. Sempre objetiva, simpática e prestativa.
    Responda sempre em JSON, sem texto fora do JSON.
    Se souber a resposta, use este formato:
    {
    "resposta": "texto da resposta para o cliente",
    "atendente": false
    }
    Se não souber, devolva no formato acima uma pergunta para entender melhor.
    Agora, caso ja tiver nas mensagens anteriores que você ja perguntou e ainda não souber responder use este formato:
    {
    "resposta": "Não consigo responder essa dúvida. Vou te direcionar para um atendente.",
    "atendente": true
    }

    Informações cursos:
    ${INFOS_FIXAS}

    Lista de perguntas frequentes e respostas fornecidas pela Damaris:
    ${INFOS_DUVIDAS}

    Serviços: [
    {
        nome: 'Alinhamento de Cachos',
        duracao: '3 h 30 min',
        preco: 'R$ 250,00'
    },
    { nome: 'Boho braids', duracao: '3 h 5 min', preco: 'R$ 490,00' },
    { nome: 'Box Braids', duracao: '2 h 55 min', preco: 'R$ 370,00' },
    {
        nome: 'Box Braids Chanel',
        duracao: '2 h 55 min',
        preco: 'R$ 330,00'
    },
    { nome: 'Box braids PP', duracao: '6 h 15 min', preco: 'R$ 500,00' },
    { nome: 'Boxeadora', duracao: '1 h 10 min', preco: 'R$ 65,00' },
    { nome: 'Channel Gooddes', duracao: '5 h 5 min', preco: 'R$ 350,00' },
    { nome: 'Corte Cachos', duracao: '2 h', preco: 'R$ 95,00' },
    { nome: 'Entrelace', duracao: '4 h', preco: 'R$ 370,00' },
    {
        nome: 'Entrelace com Fulani',
        duracao: '2 h 30 min',
        preco: 'R$ 350,00'
    },
    { nome: 'Faux Locs', duracao: '5 h 5 min', preco: 'R$ 450,00' },
    { nome: 'Fresh curl', duracao: '5 h 45 min', preco: 'R$ 370,00' },
    { nome: 'Fulani', duracao: '3 h', preco: 'R$ 290,00' },
    { nome: 'Fulani com Cachos', duracao: '5 h', preco: 'R$ 310,00' },
    { nome: 'Ghanna Braids', duracao: '2 h 30 min', preco: 'R$ 75,00' },
    {
        nome: 'Ghanna Detalhada',
        duracao: '2 h 30 min',
        preco: 'R$ 190,00'
    },
    { nome: 'Gladiadora', duracao: '2 h 10 min', preco: 'R$ 95,00' },
    { nome: 'Goddess braids', duracao: '4 h 40 min', preco: 'R$ 400,00' },
    { nome: 'Gypsy Braids', duracao: '3 h', preco: 'R$ 450,00' },
    { nome: 'Knotles Braids', duracao: '5 h', preco: 'R$ 420,00' },
    { nome: 'Lemonade Braids', duracao: '3 h', preco: 'R$ 180,00' },
    { nome: 'Manutenção', duracao: '2 h', preco: 'R$ 0,00' },
    {
        nome: 'Masculino - Box Braids',
        duracao: '1 h 5 min',
        preco: 'R$ 190,00'
    },
    {
        nome: 'Masculino - Knotless Braids',
        duracao: '2 h 30 min',
        preco: 'R$ 160,00'
    },
    { nome: 'Masculino - Nagô', duracao: '1 h', preco: 'R$ 70,00' },
    { nome: 'Penteado', duracao: '1 h', preco: 'R$ 80,00' },
    { nome: 'Penteado Nago + Bubles', duracao: '1 h', preco: 'R$ 45,00' },
    { nome: 'Penteado Nagô', duracao: '45 min', preco: 'R$ 45,00' },
    { nome: 'Praia Caracol', duracao: '3 h 30 min', preco: 'R$ 375,00' },
    { nome: 'Rabo Nagô', duracao: '3 h 30 min', preco: 'R$ 195,00' },
    { nome: 'Tiara Nago', duracao: '1 h', preco: 'R$ 60,00' },
    { nome: 'Trança Beyonce', duracao: '2 h', preco: 'R$ 75,00' },
    {
        nome: 'Trança lateral simples',
        duracao: '30 min',
        preco: 'R$ 25,00'
    },
    { nome: 'Tratamento Capilar', duracao: '3 h', preco: 'R$ 130,00' }
    ]

    `;

    const mensagensParaGPT = [
        { role: "system", content: KNOWLEDGE_BASE },
        ...historico.map(h => ({ role: h.role, content: `[${h.date}] ${h.text}` })),
        { role: "user", content: mensagensAgrupadas.join("\n") }
    ];

    try {
        const response = await clientAI.chat.completions.create({
            model: "gpt-4o-mini",
            messages: mensagensParaGPT,
        });

        const text = response.choices[0].message.content;

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                parsed = JSON.parse(match[0]);
            } else {
                throw new Error("Resposta não era JSON");
            }
        }

        session.history.push({ role: "user", text: mensagensAgrupadas.join(" | "), date: new Date().toISOString() });
        session.history.push({ role: "assistant", text: parsed.resposta, date: new Date().toISOString() });

        return parsed;
    } catch (err) {
        console.error("Erro GPT:", err);
        ativarAtendente(client, from, "Erro ao processar mensagem", true);
        return;
    }
}

async function ativarAtendente(client, from, ultimaMsg, erro = false) {
    console.log(`Ativando atendente para ${from} (motivo: ${ultimaMsg})`);

    if (erro) {
        await client.sendText(from, 'Houve um erro no atendimento automático. Vou te direcionar para um atendente.');
    }

    if (!sessions[from]) {
        resetSession(from);
    }

    const session = sessions[from];

    if (session.atendimentoAtivo) {
        await client.sendText(from, 'Um atendente já está em atendimento com você.');
        return;
    }

    session.atendimentoAtivo = true;
    session.falhasConsecutivas = 0;

    if (session.timeoutId) {
        clearTimeout(session.timeoutId);
        session.timeoutId = null;
    }

    await client.sendText(from,
        `Olá! Seja muito bem-vinda ao Studio Damaris Braids.  

    ⚠️ O atendimento via WhatsApp pode levar até 24 horas, conforme ordem de chegada.  

    Confira nosso catálogo completo aqui:  
    https://wa.me/c/5513997833427  

    E agende diretamente pelo link:  
    https://online.maapp.com.br/StudioDamarisBraids`
    );

    const numeroCliente = from.replace('@c.us', '');
    await client.sendText(grupoAtendimento,
        `⚠️ *Novo pedido de atendimento*  
    Cliente: [${numeroCliente}](https://wa.me/${numeroCliente})  
    Mensagem: "${ultimaMsg}"`
    );

    startTimeoutAtendimento(client, from);
}

function ignorarMensagem(message) {
    if (!message.body) return true;
    if (message.from.endsWith("@g.us")) return true;
    if (message.isGroupMsg) return true;
    if (["saiu", "entrou", "chamada", "bloqueou"].some(p => message.body.toLowerCase().includes(p))) return true;
    return false;
}

async function processarBuffer(client, from) {
    const session = sessions[from];
    const mensagensAgrupadas = [...session.pendingMessages];
    session.pendingMessages = [];
    session.bufferTimer = null;

    const respostaGPT = await chamarGPT(from, mensagensAgrupadas, INFOS_FIXAS);

    if (respostaGPT.atendente) {
        session.falhasConsecutivas++;
        await client.sendText(from, respostaGPT.resposta);

        if (session.falhasConsecutivas >= 2) {
            await ativarAtendente(client, from, mensagensAgrupadas.join(" | "));
            session.falhasConsecutivas = 0;
        }
    } else {
        session.falhasConsecutivas = 0;
        await client.sendText(from, respostaGPT.resposta);
    }
}

// MAIN
venom.create({
    session: 'bot-salao',
    multidevice: true,
    headless: true
})
    .then(client => {
        client.onMessage(async message => {
            const from = message.from;
            const msgRaw = message.body?.trim();

            if (ignorarMensagem(message)) return;

            if (message.type !== "chat") {
                await ativarAtendente(client, from, `[Mídia recebida: ${message.type}]`);
                return;
            }

            if (!sessions[from]) {
                resetSession(from);
                await apresentarIA(from, client);
            }

            const session = sessions[from];

            if (session.atendimentoAtivo) {
                startTimeoutAtendimento(client, from);
                return;
            }

            if (msgRaw.toLowerCase() === "falar com atendente") {
                session.falhasConsecutivas = 0;
                await ativarAtendente(client, from, msgRaw);
                return;
            }

            session.pendingMessages.push(msgRaw);

            if (!session.bufferTimer) {
                session.bufferTimer = setTimeout(() => processarBuffer(client, from), BUFFER_TIME);
            }
        });
    })
    .catch(e => console.error("Erro venom:", e));
