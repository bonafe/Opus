  let estilo = {
    0:{
      forma: "triangle",
      cor: "#e76f51"
    },
    1:{
      forma: "triangle",
      cor: "#f4a261"
    },
    2:{
      forma: "triangle",
      cor: "#e9c46a"
    },
    3:{
      forma: "triangle",
      cor: "#2a9d8f"
    },
    3:{
      forma: "triangle",
      cor: "#264653"
    }
  };

  let nos = [];
  let ligacoes = [];

  function criarGrafo(jsonPT){

    for (item in jsonPT.competencias){
      criarCompetenciaGrafo(jsonPT.competencias[item]);
    }

    for (item in jsonPT.processos_trabalho){
      criarProcessoTrabalhoGrafo(null, jsonPT.processos_trabalho[item], 0);
    }

    desenharGrafo();
  }

  function criarCompetenciaGrafo(competencia){

    console.log(`********* ${competencia.titulo}  -${competencia.id}`);

    nos.push({
        id: competencia.id,
        label: competencia.titulo,
        shape: "square",
        color: "#ab4f50"
      });
  }

  function criarProcessoTrabalhoGrafo(pai, pt, nivel){

    console.log(`${Array(nivel).join(" ")}${pt.titulo}`);

    nos.push({
        id: pt.id,
        label: pt.titulo,
        shape: estilo[nivel].forma,
        color: estilo[nivel].cor
      });

    if (pai !== null){
      ligacoes.push({
        from: pai.id,
        to: pt.id
      });
    }

    for (competencia in pt.competencias){
        ligacoes.push({
            from: pt.id,
            to: pt.competencias[competencia]
        });
    }

    for (filho in pt.filhos){
      criarProcessoTrabalhoGrafo(pt, pt.filhos[filho], nivel+1);
    }
  }

  function desenharGrafo(){
    let container = document.getElementById("divGrafoPT");
    let data = {
      nodes: new vis.DataSet(nos),
      edges: new vis.DataSet(ligacoes)
    }
    let opcoes = {};
    let network = new vis.Network(container, data, opcoes);
  }