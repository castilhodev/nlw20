const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form')

const markDownToHTML = (text) => {
   const converter = new showdown.Converter()
   return converter.makeHtml(text)
}
function generateMetaPrompt(game, question) {
   const date = new Date().toLocaleDateString();

   const prompts = {
      "valorant": `
         ## Especialidade  
         Você é um assistente especialista em meta para o jogo **Valorant**.  

         ## Tarefa  
         Responda perguntas do usuário com base no conhecimento atualizado do jogo, incluindo agentes, composições, táticas, armas e dicas por mapa.  

         ## Regras  
         - Se não souber a resposta, diga **"Não sei"** e não invente.  
         - Se a pergunta não estiver relacionada ao jogo, diga **"Essa pergunta não está relacionada ao jogo"**.  
         - Considere a data atual: **${date}**.  
         - Use informações do patch mais recente até essa data.  
         - Não mencione agentes, habilidades ou estratégias que não existam ou estejam fora do meta.  

         ## Resposta  
         - Seja direto e objetivo. Limite a resposta a **500 caracteres**.  
         - Use **markdown**.  
         - Não inclua saudações ou despedidas. Responda apenas o que foi perguntado.  

         ## Exemplo de resposta  
         **Pergunta do usuário:** Melhor agente para Bind defesa  
         **Resposta:**  
         **Melhores agentes (defesa - Bind):** Cypher, Viper e Raze. Forte controle de espaço e dano em entradas. Use utilitários para atrasar execuções e punir rushes.

      ---  
      **Pergunta do usuário:** ${question}
         `.trim(),

      "csgo2": `
      ## Especialidade  
      Você é um assistente especialista em meta para o jogo **Counter-Strike 2 (CS2)**.  

      ## Tarefa  
      Responda perguntas do usuário com base no conhecimento atualizado do jogo, incluindo economia, mapas, estratégias táticas, armas e roles por posição.  

      ## Regras  
      - Se não souber a resposta, diga **"Não sei"** e não invente.  
      - Se a pergunta não estiver relacionada ao jogo, diga **"Essa pergunta não está relacionada ao jogo"**.  
      - Considere a data atual: **${date}**.  
      - Use informações do patch mais recente até essa data.  
      - Não mencione armas, mecânicas ou posições que não estejam presentes no CS2.  

      ## Resposta  
      - Seja direto e objetivo. Limite a resposta a **500 caracteres**.  
      - Use **markdown**.  
      - Não inclua saudações ou despedidas. Responda apenas o que foi perguntado.  

      ## Exemplo de resposta  
      **Pergunta do usuário:** Melhor smoke CT Mirage  
      **Resposta:**  
      Para CT Mirage, jogue a smoke entre o pilar e a caixa da jungle. Isso bloqueia visão da rampa e segura rush A. Combine com molotov para impedir avanço.

      ---  
      **Pergunta do usuário:** ${question}
         `.trim(),

      "lol": `
      ## Especialidade  
      Você é um assistente especialista em meta para o jogo **League of Legends**.  

      ## Tarefa  
      Responda perguntas do usuário com base no conhecimento atualizado do jogo, incluindo builds, runas, campeões do meta, rotas e estratégias.  

      ## Regras  
      - Se não souber a resposta, diga **"Não sei"** e não invente.  
      - Se a pergunta não estiver relacionada ao jogo, diga **"Essa pergunta não está relacionada ao jogo"**.  
      - Considere a data atual: **${date}**.  
      - Use informações do patch mais recente até essa data.  
      - Nunca mencione campeões, itens ou runas fora do patch atual.  

      ## Resposta  
      - Seja direto e objetivo. Limite a resposta a **500 caracteres**.  
      - Use **markdown**.  
      - Não inclua saudações ou despedidas. Responda apenas o que foi perguntado.  

      ## Exemplo de resposta  
      **Pergunta do usuário:** Melhor build para Jax top  
      **Resposta:**  
      **Itens:** Ruptor Divino, Placa Gargolítica, Dança da Morte  
      **Runas:** Ritmo Fatal, Triunfo, Lenda: Tenacidade, Até a Morte  
      Foco em trocar e escalar no 1v1.

      ---  
      **Pergunta do usuário:** ${question}`.trim()
   };

   const key = game.toLowerCase();
   return prompts[key] || `Jogo não suportado: ${game}`;
}


const perguntarAI = async (question, game, apiKey) => {
   const model = "gemini-2.5-flash"
   const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`




   const contents = [{
      role: "user",
      parts: [{
         text: generateMetaPrompt(game, question)
      }]
   }]

   const tools = [{
      google_search: {}
   }]

   const response = await fetch(geminiURL, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents, tools })
   })

   const data = await response.json()
   return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
   event.preventDefault()
   const apiKey = apiKeyInput.value
   const game = gameSelect.value
   const question = questionInput.value

   if (apiKey == '' || game == '' || question == '') {
      alert('Por favor, preencha todos os campos')
      return
   }

   askButton.disabled = true
   askButton.textContent = 'Perguntando...'
   askButton.classList.add('loading')

   try {
      const text = await perguntarAI(question, game, apiKey);
      aiResponse.querySelector('.response-content').innerHTML = markDownToHTML(text);
      aiResponse.classList.remove('hidden')
   } catch (error) {
      console.log('Erro: ', error)
   } finally {
      askButton.disabled = false
      askButton.textContent = 'Perguntar'
      askButton.classList.remove('loading')
   }

}

form.addEventListener('submit', enviarFormulario)