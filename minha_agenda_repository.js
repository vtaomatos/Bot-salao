import puppeteer from "puppeteer";

export class MinhaAgendaRepository {
  constructor({ usuario, senha }) {
    this.usuario = usuario;
    this.senha = senha;
    this.baseUrl = "https://portal.minhaagendaapp.com.br";
  }

  async setAgendamento(browser, agendamento) {

    const page = await browser.newPage();

    // Acessa a página de login
    await page.goto(this.baseUrl + "/login", {
      waitUntil: "networkidle2",
    });

    // Preenche os campos (ajuste os seletores conforme o HTML da página)
    await page.type('input[type="email"]', this.usuario, { delay: 10 });
    await page.type('input[type="password"]', this.senha, { delay: 10 });

    // Clica no botão de login
    await page.click('button[type="submit"]');

    // Aguarda a navegação ou outro seletor da página logada
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("Login realizado com sucesso!");


    try {
      await page.waitForSelector('button[aria-label="adicionar agendamento"]', { timeout: 5000 });
      await page.click('button[aria-label="adicionar agendamento"]');
      console.log("✅ Botão de adicionar agendamento encontrado e clicado.");
    } catch {
      console.log("🚨 Botão de adicionar agendamento não encontrado.");
    }


    try {
      await page.waitForSelector('#simple-menu > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiMenu-paper.MuiPopover-paper.MuiMenu-paper.css-1smm44m > ul > li:nth-child(1) > div.MuiListItemText-root.css-1tsvksn > span', { timeout: 5000 });
      await page.click('#simple-menu > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiMenu-paper.MuiPopover-paper.MuiMenu-paper.css-1smm44m > ul > li:nth-child(1) > div.MuiListItemText-root.css-1tsvksn > span');
      console.log("✅ Botão de Novo Agendamento encontrado e clicado.");
    } catch {
      console.log("🚨 Botão de Novo Agendamento não encontrado.");
    }


    try {
      // campos input: name="date", name="startTime", cliente será seletor: #downshift-0-input, serviço será seletor: #downshift-1-input, botao salvar: body > div.MuiDialog-root.MuiModal-root.css-126xj0f > div.MuiDialog-container.MuiDialog-scrollPaper.css-ekeie0 > div > form > div.MuiDialogActions-root.MuiDialogActions-spacing.css-145sc4c-actionsRoot > div > button
      await page.waitForSelector('input[name="date"]', { timeout: 5000 });
      await page.type('input[name="date"]', agendamento.data, { delay: 10 });
      console.log("✅ Campo de data encontrado e preenchido.");
    } catch (error) {
      console.log("🚨 Campo de data não encontrado.", error);
    }

    try {
      await page.waitForSelector('input[name="startTime"]', { timeout: 5000 })
      await page.type('input[name="startTime"]', agendamento.hora, { delay: 10 })
      console.log("✅ Campo de hora encontrado e preenchido.")
    }
    catch (error) {
      console.log("🚨 Campo de hora não encontrado.", error);
    }

    //preencher cliente
    try {
      await page.waitForSelector('#downshift-0-input', { timeout: 5000 })
      await page.type('#downshift-0-input', agendamento.telefone, { delay: 10 })

      try {
        // Espera o container da lista
        await page.waitForSelector("#downshift-0-menu", { timeout: 5000 });

        try {
          // Tenta pegar o primeiro <li>
          const clienteItemNode = await page.waitForSelector("#downshift-0-item-0", { timeout: 3000 });
          console.log("clienteItemNode", clienteItemNode);

          // Clicou no primeiro <li>
          await clienteItemNode.click();
          console.log("✅ Cliquei no primeiro cliente li da lista");
        } catch (error) {
          console.log(error);
          // Se não encontrou, tenta o botão alternativo
          try {
            const botaoAlternativo = await page.waitForSelector("#downshift-0-menu > div > div > div:nth-child(2) > button", { timeout: 3000 });

            if (botaoAlternativo) {
              await botaoAlternativo.click();
              console.log("✅ Cliquei no botão alternativo para adicionar novo cliente");

              // inicia cadatro de novo cliente

              //input name="name"
              //name="phone1"
              //name="birthDate" se houver o campo dataNascimento no obj agendamento

              // Espera o modal de cadastro de cliente abrir
              await page.waitForSelector('body > div:nth-child(8) > div.MuiDialog-container.MuiDialog-scrollPaper.css-ekeie0 > div > form', { timeout: 5000 });

              //Limpar o campo name antes de digitar
              const inputName = await page.$('input[name="name"]');

              // Limpa o campo
              await inputName.click({ clickCount: 3 }); // seleciona todo o texto
              await page.keyboard.press('Backspace');  // apaga o texto

              // Digita o novo valor
              await inputName.type(agendamento.cliente, { delay: 10 });
              await page.type('input[name="phone1"]', agendamento.telefone, { delay: 10 });
              if (agendamento.dataNascimento) {
                await page.type('input[name="birthDate"]', agendamento.dataNascimento, { delay: 10 });
              }
              //seletor do botaão salvar: body > div:nth-child(8) > div.MuiDialog-container.MuiDialog-scrollPaper.css-ekeie0 > div > form > div.MuiDialogActions-root.MuiDialogActions-spacing.css-145sc4c-actionsRoot > button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.css-1yoits6
              await page.click('body > div:nth-child(8) > div.MuiDialog-container.MuiDialog-scrollPaper.css-ekeie0 > div > form > div.MuiDialogActions-root.MuiDialogActions-spacing.css-145sc4c-actionsRoot > button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.css-1yoits6');
              console.log("✅ Botão de Salvar cliente encontrado e clicado.");
            } else {
              console.log("🚨 Nem li nem botão alternativo foram encontrados");
            }
          } catch (err) {
            console.error("❌ Erro ao tentar encontrar o botão alternativo:", err);
          }
        }
      } catch (err) {
        console.error("❌ Erro ao tentar clicar:", err);
      }
      console.log("✅ Campo de cliente encontrado e preenchido.")
    } catch (error) {
      console.log("🚨 Campo de cliente não encontrado.", error);
    }

    try {
      await page.waitForSelector('#downshift-1-input', { timeout: 5000 })
      await page.type('#downshift-1-input', agendamento.servico, { delay: 10 })
      //Pegar o nome exato da lista de serviços e exibir para o usuario no wpp com numeros;
      //Ao usuario digitar o numero do serviço, guardar o nome exato do serviço;
      //usar esse nome exato para preencher o campo de serviço;
      //clicar no primeiro item da lista que abrir;

      try {
        // Tenta pegar o primeiro <li>
        const servicoItemNode = await page.waitForSelector("#downshift-1-item-0", { timeout: 3000 });
        console.log("serviço item", servicoItemNode);

        // Clicou no primeiro <li>
        await servicoItemNode.click();
        console.log("✅ Cliquei no primeiro serviço li da lista");
      } catch {
        console.log("🚨 Não encontrei o primeiro li da lista de serviços.");
        throw new Error("Não encontrei o primeiro li da lista de serviços.");
      }
      console.log("✅ Campo de serviço encontrado e preenchido.")
    } catch (error) {
      console.log("🚨 Campo de serviço não encontrado.", error);
    }

    try {
      await page.waitForSelector('body > div.MuiDialog-root.MuiModal-root.css-126xj0f > div.MuiDialog-container.MuiDialog-scrollPaper.css-ekeie0 > div > form > div.MuiDialogActions-root.MuiDialogActions-spacing.css-145sc4c-actionsRoot > div > button', { timeout: 5000 });
      await page.click('body > div.MuiDialog-root.MuiModal-root.css-126xj0f > div.MuiDialog-container.MuiDialog-scrollPaper.css-ekeie0 > div > form > div.MuiDialogActions-root.MuiDialogActions-spacing.css-145sc4c-actionsRoot > div > button');
      console.log("✅ Botão de Salvar encontrado e clicado.");
    } catch (error) {
      console.log("🚨 Botão de Salvar não encontrado.", error);
    }

    await browser.close(); // descomente se quiser fechar ao final
  }

  async checarConflitosAgendamento(browser, agendamento) {

    const page = await browser.newPage();

    // Acessa a página de login
    await page.goto(this.baseUrl + "/login", {
      waitUntil: "networkidle2",
    });

    // Preenche os campos (ajuste os seletores conforme o HTML da página)
    await page.type('input[type="email"]', this.usuario, { delay: 10 });
    await page.type('input[type="password"]', this.senha, { delay: 10 });

    // Clica no botão de login
    await page.click('button[type="submit"]');

    // Aguarda a navegação ou outro seletor da página logada
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("Login realizado com sucesso!");


    await page.goto(`${this.baseUrl}/agenda`, { waitUntil: "networkidle2" });

    console.log("Página de agendamento carregada — iniciando fluxo...");

    /** ------------------------ Funções auxiliares ------------------------- */
    function monthNameToNumber(name) {
      const map = {
        janeiro: 1, fevereiro: 2, março: 3, marco: 3, abril: 4,
        maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9,
        outubro: 10, novembro: 11, dezembro: 12
      };
      return map[name.toLowerCase()] || null;
    }

    function monthsDiff(currentMonth, currentYear, targetMonth, targetYear) {
      console.log("monthsDiff:", currentMonth, currentYear, targetMonth, targetYear, "=>", (targetYear - currentYear) * 12 + (targetMonth - currentMonth));
      return (targetYear - currentYear) * 12 + (targetMonth - currentMonth);

    }

    function timeToMinutes(t) {
      const [h, m] = t.split(':').map(n => parseInt(n.trim(), 10));
      return h * 60 + m;
    }

    function minutesToTimeString(min) {
      const h = Math.floor(min / 60).toString().padStart(2, '0');
      const m = (min % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    }


    function isOverlap(aStart, aEnd, bStart, bEnd) {

      const aStartStr = minutesToTimeString(aStart);
      const aEndStr = minutesToTimeString(aEnd);
      const bStartStr = minutesToTimeString(bStart);
      const bEndStr = minutesToTimeString(bEnd);

      console.log("------------------------------------------------");
      console.log("Comparando agendamentos:");
      console.log("Solicitado  =>", aStartStr, "até", aEndStr, `(${aStart}-${aEnd})`);
      console.log("Existente   =>", bStartStr, "até", bEndStr, `(${bStart}-${bEnd})`);

      const result = (aStart < bEnd) && (bStart < aEnd);

      console.log("Conflito?   =>", result);
      console.log("------------------------------------------------");

      return result;
    }


    const dataSolicitacaoUsuario = agendamento.data;
    console.log("Data solicitada pelo usuário:", dataSolicitacaoUsuario);
    const horaInicioSolicitacaoUsuario = agendamento.hora;
    const duracaoMinutos = agendamento.duracaoMinutos ?? 90;

    /** ---------------------- 1) Abrir o date picker ----------------------- */
    const dateInputSelector =
      '.MuiInputBase-root.MuiInput-root.MuiInputBase-adornedEnd.Mui-readOnly, ' +
      '.MuiInputBase-root.MuiInput-root.MuiInputBase-adornedEnd.Mui-readOnly input[readonly]';

    await page.waitForSelector(dateInputSelector, { timeout: 5000 });
    await page.click(dateInputSelector);

    /** ---------------------- 2) Obter mês/ano atuais ---------------------- */
    const headerSelector = '.MuiPickersCalendarHeader-label';
    await page.waitForSelector(headerSelector);

    let headerText = await page.$eval(headerSelector, el => el.textContent.trim());
    console.log("Header inicial:", headerText);

    const [mesAtualNome, anoAtualStr] = headerText.split(" ");
    const mesAtual = monthNameToNumber(mesAtualNome);
    const anoAtual = parseInt(anoAtualStr);

    /** ---------------------- Parse da data desejada ----------------------- */
    const [ddStr, mmStr, yyyyStr] = dataSolicitacaoUsuario.split('/');
    const targetDay = parseInt(ddStr);
    const targetMonth = parseInt(mmStr);
    const targetYear = parseInt(yyyyStr);

    /** ---------------------- 3) Calcular cliques -------------------------- */
    const clicksNeeded = monthsDiff(mesAtual, anoAtual, targetMonth, targetYear);

    if (clicksNeeded < 0) {
      console.log("Data escolhida é de um mês passado — não voltamos meses.");
      throw new Error("Data inválida: mês/ano já passaram. Mes/Ano: " + targetMonth + "/" + targetYear);
    }

    console.log("Cliques necessários:", clicksNeeded);

    const nextButtonSelector = 'button[title="Next month"], button[aria-label="Next month"]';
    await page.waitForSelector(nextButtonSelector);

    for (let i = 0; i < clicksNeeded; i++) {
      await page.click(nextButtonSelector);
      await page.waitForTimeout(250);
    }

    /** ---------------------- 4) Validar mês final -------------------------- */
    headerText = await page.$eval(headerSelector, el => el.textContent.trim());
    const [finalMesNome, finalAnoStr] = headerText.split(" ");

    if (monthNameToNumber(finalMesNome) !== targetMonth ||
      parseInt(finalAnoStr) !== targetYear) {
      console.warn("Não chegou no mês alvo:", headerText);
    } else {
      console.log("Mês correto alcançado:", headerText);
    }

    /** ---------------------- 5) Selecionar dia ----------------------------- */
    const allButtons = await page.$$('button');
    const candidateButtons = [];

    for (const btn of allButtons) {
      const span = await btn.$('span');
      if (!span) continue;

      let txt = await (await span.getProperty('textContent')).jsonValue();
      txt = txt.replace(/\s+/g, '');

      if (txt === String(targetDay)) {
        candidateButtons.push(btn);
      }
    }

    console.log("Botões encontrados para o dia:", candidateButtons.length);

    let chosenBtn;
    if (candidateButtons.length === 1) chosenBtn = candidateButtons[0];
    else if (targetDay < 15) chosenBtn = candidateButtons[0];
    else chosenBtn = candidateButtons[1] ?? candidateButtons[0];

    await chosenBtn.click();
    console.log("Dia selecionado:", targetDay);

    /** ---------------------- 6) Clicar OK ----------------------------- */
    const okButtons = await page.$$('button');
    for (const btn of okButtons) {
      const txt = await (await btn.getProperty('textContent')).jsonValue();
      if (txt && txt.trim().toUpperCase() === "OK") {
        await btn.click();
        console.log("OK clicado");
        break;
      }
    }

    /** ---------------------- 7) Extrair horários do dia ----------------------------- */
    await new Promise(res => setTimeout(res, 300));

    const intervals = await page.$$eval(".fc-time", els =>
      els.map(n => {
        const p = n.querySelector("p");
        return (p ? p.textContent : n.textContent).trim();
      })
    );

    console.log("Horários encontrados:", intervals);

    const parsed = intervals
      .map(txt => {
        const m = txt.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        if (!m) return null;
        return {
          raw: txt,
          start: (parseInt(m[1].split(':')[0]) * 60) + parseInt(m[1].split(':')[1]),
          end: (parseInt(m[2].split(':')[0]) * 60) + parseInt(m[2].split(':')[1]),
        };
      })
      .filter(x => x);

    console.log("Intervalos parseados:", parsed);

    const agendamentosDoDia = parsed;

    /** ---------------------- 8) Verificar conflitos ----------------------------- */
    const userStart = timeToMinutes(horaInicioSolicitacaoUsuario);
    const userEnd = userStart + duracaoMinutos;

    let conflicts = [];
    for (const it of agendamentosDoDia) {
      if (isOverlap(userStart, userEnd, it.start, it.end)) {
        conflicts.push(it);
      }
    }

    console.log("Conflitos:", conflicts.length);

    if (conflicts.length >= 2) {
      console.log("Dois ou mais conflitos encontrados. Não disponível.");
      return { ok: false, reason: "Dois ou mais conflitos", conflicts };
    }
    if (conflicts.length === 1) {
      console.log("Um conflito encontrado. Disponível.");
    } else {  
      console.log("Nenhum conflito encontrado. Disponível.");
    }

    this.setAgendamento(browser, agendamento)
    return { ok: true, reason: "Disponível", conflicts: [] };
  }


  async getServicos(browser) {
    const page = await browser.newPage();
    await page.goto(this.baseUrl, {
      waitUntil: "networkidle2",
    });

    // Preenche os campos (ajuste os seletores conforme o HTML da página)
    await page.type('input[type="email"]', this.usuario, { delay: 10 });
    await page.type('input[type="password"]', this.senha, { delay: 10 });

    // Clica no botão de login
    await page.click('button[type="submit"]');

    // Aguarda a navegação ou outro seletor da página logada
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("Login realizado com sucesso!");

    // Acessa a página de serviços
    await page.goto(`${this.baseUrl}/servicos`, {
      waitUntil: "networkidle2",
    });

    // Espera a tabela de serviços carregar
    // Altera a quantidade de serviços exibidos para 50 (ultimo item da lista do select dropdown)
    // Para alterar, clique no seletor de quantidade de serviços exibidos: #\:r19\:
    // selecione o último item da lista (50)
    // Espera a tabela de serviços carregar novamente
    // Pega todos os nomes de serviços exibidos na tabela
    // Para pegar os nomes, use o seletor: #infiniteScrollDiv > div:nth-child(2) > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation1.css-g73cc8 > div.css-zwft14-content > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1.MuiCard-root.css-12nolks-root > div.MuiCardContent-root.css-1p9cd3b-content > div > div:nth-child(1) > table > tbody > tr:nth-child(28) > td:nth-child(1) > div > div.css-1keoiy0-cellNameColumnValue
    // Para cada linha da tabela, pegue o texto do elemento que contém o nome do serviço


    await page.waitForSelector('#infiniteScrollDiv > div:nth-child(2) > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation1.css-g73cc8 > div.css-zwft14-content > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1.MuiCard-root.css-12nolks-root > div.MuiCardActions-root.MuiCardActions-spacing.css-11ah5ux-actions > div > div > div.MuiInputBase-root.MuiInputBase-colorPrimary.MuiTablePagination-input.css-fml6nx', { timeout: 5000 });
    await page.click('#infiniteScrollDiv > div:nth-child(2) > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation1.css-g73cc8 > div.css-zwft14-content > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1.MuiCard-root.css-12nolks-root > div.MuiCardActions-root.MuiCardActions-spacing.css-11ah5ux-actions > div > div > div.MuiInputBase-root.MuiInputBase-colorPrimary.MuiTablePagination-input.css-fml6nx');
    await page.waitForSelector('#menu- > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiMenu-paper.MuiPopover-paper.MuiMenu-paper.css-1smm44m > ul > li:nth-child(3)', { timeout: 5000 });
    await page.click('#menu- > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiMenu-paper.MuiPopover-paper.MuiMenu-paper.css-1smm44m > ul > li:nth-child(3)');
    await page.waitForSelector('#infiniteScrollDiv > div:nth-child(2) > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation1.css-g73cc8 > div.css-zwft14-content > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1.MuiCard-root.css-12nolks-root > div.MuiCardContent-root.css-1p9cd3b-content > div > div:nth-child(1) > table', { timeout: 5000 });
    console.log("Tabela de serviços carregada, extraindo nomes...");
    // Lógica para extrair os nomes dos serviços
    const servicos = await page.evaluate(() => {
      const servicoElements = document.querySelectorAll('#infiniteScrollDiv > div:nth-child(2) > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation1.css-g73cc8 > div.css-zwft14-content > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1.MuiCard-root.css-12nolks-root > div.MuiCardContent-root.css-1p9cd3b-content > div > div:nth-child(1) > table > tbody tr td:nth-child(1) .css-1keoiy0-cellNameColumnValue');
      const duracaoElements = document.querySelectorAll('#infiniteScrollDiv > div:nth-child(2) > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation1.css-g73cc8 > div.css-zwft14-content > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1.MuiCard-root.css-12nolks-root > div.MuiCardContent-root.css-1p9cd3b-content > div > div:nth-child(1) > table > tbody tr td:nth-child(2)');
      const precoElements = document.querySelectorAll('#infiniteScrollDiv > div:nth-child(2) > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation1.css-g73cc8 > div.css-zwft14-content > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1.MuiCard-root.css-12nolks-root > div.MuiCardContent-root.css-1p9cd3b-content > div > div:nth-child(1) > table > tbody tr td:nth-child(3)');
      const servicos = [];
      servicoElements.forEach((el, index) => {
        servicos.push({
          nome: el.innerText.trim(),
          duracao: duracaoElements[index] ? duracaoElements[index].innerText.trim() : null,
          preco: precoElements[index] ? precoElements[index].innerText.trim() : null,
        });
      });
      return servicos;
    });

    console.log("Serviços encontrados:", servicos);

    browser.close(); // fecha o navegador após a extração
    return servicos;
  }

  // async getAgendamentos(browser) {
  //   const page = await browser.newPage();
  //   await page.goto(this.baseUrl, {
  //     waitUntil: "networkidle2",
  //   });

  //   // Preenche os campos (ajuste os seletores conforme o HTML da página)
  //   await page.type('input[type="email"]', this.usuario, { delay: 10 });
  //   await page.type('input[type="password"]', this.senha, { delay: 10 });

  //   // Clica no botão de login
  //   await page.click('button[type="submit"]');

  //   // Aguarda a navegação ou outro seletor da página logada
  //   await page.waitForNavigation({ waitUntil: "networkidle2" });

  //   console.log("Login realizado com sucesso!");

  //   // Acessa a página de serviços
  //   await page.goto(`${this.baseUrl}/servicos`, {
  //     waitUntil: "networkidle2",
  //   });





  // // ACESSAR: https://online.maapp.com.br/login?slug=StudioDamarisBraids
  // // ENCONTRAR ESSE ELEMENTO: *[@id="root"]/div[2]/div/div/div/div[3]/div[2]/button[2]/span[2] QUE TEM O TEXTO: Continuar com EmaiL
  // // Clicar nesse botão para continuar com o email
  // // Clicar no botão que tem um filho span com o texto "Entrar"
  // // //*[@id="root"]/div[2]/div/div/div/div[3]/div/button[1]/span[2]
  // // pegar esse inpiut de email: <input aria-invalid="true" id=":r0:" name="email" placeholder="Email" type="email" class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputAdornedStart css-n215ma" value="" aria-describedby=":r0:-helper-text">
  // // pegar esse input de senha: <input aria-invalid="false" id=":r1:" name="password" placeholder="Senha" type="password" class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputAdornedStart MuiInputBase-inputAdornedEnd css-1ufwp3z" value="">
  // // Clicar nesse botão que tem o texto "Entrar": <button class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-colorPrimary MuiButton-fullWidth MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-colorPrimary MuiButton-fullWidth rounded css-1d8e2l4" tabindex="0" type="submit">Entrar <span class="MuiTouchRipple-root css-w0pj6f"></span></button>



  // async #login(page) {
  //     await page.goto(this.baseUrl);
  //     await page.type("#usuario", this.usuario);
  //     await page.type("#senha", this.senha);
  //     await page.click("#btnLogin");
  //     await page.waitForNavigation();
  //   }

  // async create(agendamento) {
  //     const browser = await puppeteer.launch({ headless: true });
  //     const page = await browser.newPage();

  //     try {
  //       await this.#login(page);

  //       // Criar agendamento
  //       await page.click("#btnNovoAgendamento");
  //       await page.type("#cliente", agendamento.cliente);
  //       await page.select("#servico", agendamento.servico);
  //       await page.type("#data", agendamento.data);
  //       await page.select("#hora", agendamento.hora);
  //       await page.click("#btnSalvar");

  //       await page.waitForTimeout(2000);

  //       console.log("✅ Agendamento criado, verificando...");

  //       // Confirmar se foi criado
  //       const existe = await this.findOne(page, agendamento);
  //       if (existe) {
  //         console.log("🎉 Agendamento confirmado!");
  //       } else {
  //         console.log("🚨 Atenção: não encontrei o agendamento após criar!");
  //       }

  //       return existe;
  //     } catch (e) {
  //       console.error("❌ Erro ao criar agendamento:", e.message);
  //       return false;
  //     } finally {
  //       await browser.close();
  //     }
  //   }

  // async read(filtro = {}) {
  //     const browser = await puppeteer.launch({ headless: true });
  //     const page = await browser.newPage();

  //     try {
  //       await this.#login(page);
  //       //mostre que logou usando infos disponiveis na página
  //       console.log("✅ Logado com sucesso!", await page.title());
  //       await page.click("#menuAgendamentos");
  //       await page.waitForSelector("#tabelaAgendamentos");

  //       const resultados = await page.evaluate(() => {
  //         const linhas = document.querySelectorAll("#tabelaAgendamentos tbody tr");
  //         return Array.from(linhas).map(linha => {
  //           const cols = linha.innerText.split("\t");
  //           return {
  //             cliente: cols[0],
  //             servico: cols[1],
  //             data: cols[2],
  //             hora: cols[3]
  //           };
  //         });
  //       });

  //       // aplicar filtros
  //       return resultados.filter(r => {
  //         return (
  //           (!filtro.cliente || r.cliente.includes(filtro.cliente)) &&
  //           (!filtro.servico || r.servico.includes(filtro.servico)) &&
  //           (!filtro.data || r.data.includes(filtro.data)) &&
  //           (!filtro.hora || r.hora.includes(filtro.hora))
  //         );
  //       });
  //     } catch (e) {
  //       console.error("❌ Erro ao consultar agendamentos:", e.message);
  //       return [];
  //     } finally {
  //       await browser.close();
  //     }
  //   }

  // async update(id, novosDados) {
  //     const browser = await puppeteer.launch({ headless: true });
  //     const page = await browser.newPage();

  //     try {
  //       await this.#login(page);
  //       await page.click("#menuAgendamentos");
  //       await page.waitForSelector(`#agendamento-${id} .btnEditar`);

  //       await page.click(`#agendamento-${id} .btnEditar`);
  //       if (novosDados.servico) await page.select("#servico", novosDados.servico);
  //       if (novosDados.data) await page.type("#data", novosDados.data);
  //       if (novosDados.hora) await page.select("#hora", novosDados.hora);

  //       await page.click("#btnSalvar");
  //       await page.waitForTimeout(2000);

  //       console.log("✅ Agendamento atualizado!");
  //       return true;
  //     } catch (e) {
  //       console.error("❌ Erro ao atualizar agendamento:", e.message);
  //       return false;
  //     } finally {
  //       await browser.close();
  //     }
  //   }

  // async delete (id) {
  //     const browser = await puppeteer.launch({ headless: true });
  //     const page = await browser.newPage();

  //     try {
  //       await this.#login(page);
  //       await page.click("#menuAgendamentos");
  //       await page.waitForSelector(`#agendamento-${id} .btnExcluir`);

  //       await page.click(`#agendamento-${id} .btnExcluir`);
  //       await page.waitForTimeout(1000);

  //       console.log("🗑️ Agendamento excluído!");
  //       return true;
  //     } catch (e) {
  //       console.error("❌ Erro ao excluir agendamento:", e.message);
  //       return false;
  //     } finally {
  //       await browser.close();
  //     }
  //   }

  // // 🔹 método interno para confirmar criação
  // async findOne(page, { cliente, servico, data, hora }) {
  //     await page.click("#menuAgendamentos");
  //     await page.waitForSelector("#tabelaAgendamentos");

  //     return await page.evaluate(({ cliente, servico, data, hora }) => {
  //       const linhas = document.querySelectorAll("#tabelaAgendamentos tbody tr");
  //       for (let linha of linhas) {
  //         const cols = linha.innerText.split("\t");
  //         if (
  //           cols[0].includes(cliente) &&
  //           cols[1].includes(servico) &&
  //           cols[2].includes(data) &&
  //           cols[3].includes(hora)
  //         ) {
  //           return true;
  //         }
  //       }
  //       return false;
  //     }, { cliente, servico, data, hora });
  //   }
  // }
}
