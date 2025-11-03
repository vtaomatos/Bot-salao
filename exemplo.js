import { MinhaAgendaRepository } from "./minha_agenda_repository.js";
import puppeteer from "puppeteer";

const repo = new MinhaAgendaRepository({
  usuario: "damarys.santos@hotmail.com",
  senha: "damarisbraids19"
});

function parseDateBR(str) {
  const [dia, mes, ano] = str.split('/');
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
}


(async () => {

  

  const agendamento = {
    cliente: "TESTE Maria Silva",
    telefone: "11999999999",
    servico: "box braids",
    duracaoMinutos: 240,
    data: "04/11/2025",
    hora: "07:30",
    dataNascimento:"06/05/1990"
  }

  const browser = await puppeteer.launch({
    headless: false, // mostra o navegador (coloque true se quiser rodar em background)
    defaultViewport: null,
  });

  // repo.setAgendamento(browser, agendamento)
  // repo.getServicos(browser)
  repo.checarConflitosAgendamento(browser, agendamento)
  return;

  // Criar
  // await repo.create({
  //   cliente: "Maria Silva",
  //   servico: "box-braids",
  //   data: "16/08/2025",
  //   hora: "14:00"
  // });

  // Ler
  // const lista = await repo.read({ cliente: "Maria" });
  // console.log("📋 Lista filtrada:", lista);
})();
