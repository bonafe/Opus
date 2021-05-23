import { ProcessosTrabalhoDAO } from './processos_trabalho_dao.js';
import { UsuarioDAO } from '../pessoas/usuario_dao.js';

export class ProcessosTrabalhoView extends HTMLElement{

    static TAMANHO_MINIMO_PROCURA = 4;

    static EVENTO_EDITOU_PROCESSO_TRABALHO_USUARIO = "editouProcessoTrabalhoUsuario";
    
    
    static _template = undefined;



    static get TEMPLATE (){
        if (ProcessosTrabalhoView._template === undefined){
            ProcessosTrabalhoView._template = document.createElement("template");
            ProcessosTrabalhoView._template.innerHTML = `
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
                <link href="/bibliotecas/tabulator/css/tabulator.min.css" rel="stylesheet">
                <div class="mx-2">                         
                    <form>
                        <label class="checkbox-inline">
                        <input type="radio" name="filtro" value="todos">Todos
                        </label>
                        <label class="checkbox-inline">
                        <input type="radio" name="filtro" value="ativas">Minhas tarefas
                        </label>
                        <label class="checkbox-inline">
                        <input type="radio" name="filtro" value="preenchidos">Competências preenchidas
                        </label>
                        <label class="checkbox-inline">
                        <input type="radio" name="filtro" value="procurar"></input>Procurar <input type="text" id="processoProcurado"></input>
                        </label>
                    </form>
                    <div class="container-flex">
                        <style>
                            .tabulator-header{
                                #text-align: center;
                            }
                        </style>
                        <div id="tabelaProcessosTrabalho"></div>
                    </div>                    
                </div>
            `;
        }
        return ProcessosTrabalhoView._template;
    }



    constructor(){
        super();
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(ProcessosTrabalhoView.TEMPLATE.content.cloneNode(true));        

        this.deveFiltrar = false;

        this.carregarConfiguracoes();
        this.inicializarFiltros();        
    }

    redimensionar(largura, altura){
        this.tabela.setHeight(altura-100);
    }


    carregarConfiguracoes(){
        if (!localStorage.configuracoes){     

            console.log (`Configurações não encontradas na base de dados local`);
            console.log (`Inicializando configuração com valores padrão`);
            this.configuracoes = {
                filtro: "todos",
                valorProcurado: ""
            };
            this.salvarConfiguracoes();

        }else{            
            
            //console.log (`Carregando configurações do armazenamento local`);
            this.configuracoes = JSON.parse(localStorage.configuracoes);
        }
    }



    salvarConfiguracoes(){
        console.log (`Salvando as configurações na base de dados local do navegador`);
        localStorage.configuracoes = JSON.stringify(this.configuracoes);
    }



    inicializarFiltros(){
        this._shadowRoot.querySelectorAll("input[name='filtro']").forEach(elemento => {
            elemento.addEventListener("click", evento => {
                console.log (`Aplicar filtro: ${elemento.value}`);
                this.configuracoes.filtro = elemento.value;
                this.salvarConfiguracoes();
                this.selecionarProcessosTrabalho();
            });
        });
        this._shadowRoot.querySelector(`input[value='${this.configuracoes.filtro}']`).checked = true;

        let inputValor = this._shadowRoot.querySelector("#processoProcurado");
        inputValor.value = this.configuracoes.valorProcurado;
        inputValor.addEventListener("input", (evento) => {

            this._shadowRoot.querySelector("input[value='procurar']").checked = true;

            this.configuracoes.filtro = "procurar";
            this.configuracoes.valorProcurado = evento.target.value;
            this.salvarConfiguracoes();

            clearTimeout(this.idTimerProcurar);

            this.idTimerProcurar = setTimeout (()=>{
                this.selecionarProcessosTrabalho();
            }, 1000);
        });
    }



    renderizar(){
        this.criarTabelaProcessosTrabalho();
    }



    tituloFormatadoHTML(processoTrabalho){
        let titulo;
        if (processoTrabalho.criadaPeloUsuario !== undefined){
            titulo = `<span style='background-color:#ADD8E6;'>${processoTrabalho.titulo}</span>`;
        }else{
            titulo = processoTrabalho.titulo;
        }

        if (this.configuracoes.filtro == "procurar"){
            let indice_inicio = titulo.toLowerCase().indexOf(this.configuracoes.valorProcurado.toLowerCase());
            if (indice_inicio != -1){
                let indice_fim = indice_inicio + this.configuracoes.valorProcurado.length;
                titulo = `${titulo.slice(0, indice_inicio+1)}<strong><em>${titulo.slice(indice_inicio+1, indice_fim)}</em></strong>${titulo.slice(indice_fim)}`;
            }
        }
        return titulo;
    }



    criarTabelaProcessosTrabalho(){

        let container = this._shadowRoot.getElementById("tabelaProcessosTrabalho");

        this.tabela = new Tabulator(container, {
            dataTree:true,
            dataTreeChildField:"filhos",
            height:350,            
            layout:"fitColumns",
            columns:[                
                {title:"Processos de Trabalho", field:"titulo", width:450, formatter:(celula, parametros, onRendered)=>{
                    return this.tituloFormatadoHTML (celula.getData());
                }},
                {title:"Proficiência", field:"nivelProficiencia", width:180, hozAlign:"center", formatter:"star", formatterParams:{stars:5}, editor:true,
                    cellEdited: celula => {
                        console.log(`Nível de Proficiência: ${celula.getValue()}`)
                    },
                    editable: celula => this.editavel(celula.getRow().getData())
                },
                {title:"Afinidade", field:"nivelAfinidade", width:160, hozAlign:"center", formatter:"star", formatterParams:{stars:5}, editor:true,
                    cellEdited: celula => {
                        console.log(`Nível de Afinidade: ${celula.getValue()}`)
                    },
                    editable: celula => this.editavel(celula.getRow().getData())
                },
                {title:"Duração", field:"duracaoPadrao", width:145, hozAlign:"center", editor:"input",
                    cellEdited: celula => {
                        console.log(`Duração Padrão: ${celula.getValue()}`)
                    },
                    editable: celula => this.editavel(celula.getRow().getData())
                },
                {title:"Tarefa", field:"ativa", width:120, hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:true,
                    cellEdited: celula => {
                        console.log(`Ativa: ${celula.getValue()}`)
                    },
                    editable: celula => this.editavel(celula.getRow().getData())
                }
            ],
            rowClick:function(e, row){
                console.log ("clicou");
            },
            rowDblClick: (evento, linha) => {
                console.log(`Duplo clique na linha: ${linha.getData().titulo}`);
                let competenciaUsuario = linha.getData();
                linha.treeToggle();
                if (competenciaUsuario.filhos === undefined){

                    let processoTrabalho = linha.getTreeParent().getData();
                    competenciaUsuario.ativa = (competenciaUsuario.ativa === undefined ? true : !competenciaUsuario.ativa);                
                    ProcessosTrabalhoDAO.getInstance().salvarCompetenciaUsuario(processoTrabalho.id, competenciaUsuario);

                    this.tabela.updateData([{id:competenciaUsuario.id, ativa:competenciaUsuario.ativa}])
                        .then(()=>{
                            console.log("deu certo");
                        })
                        .catch(()=>{
                            console.log("deu erro");
                        });
                    this.dispatchEvent (new CustomEvent(ProcessosTrabalhoView.EVENTO_EDITOU_PROCESSO_TRABALHO_USUARIO, {detail:competenciaUsuario}));
                }
            },
            cellEdited: celula => this.editouProcessoTrabalho(celula.getRow().getTreeParent().getData(), celula.getRow().getData()),
            rowContextMenu: (componente, e) => {

                let menu = [];
                let processoTrabalho = componente.getData();

                if (processoTrabalho.filhos === undefined){
                    if (!processoTrabalho.criadaPeloUsuario){
                        return false;
                    }else{
                        menu.push({
                            label:"Renomear",
                            action:(e, linha) => {
                                this.renomearCompetencia(
                                    linha.getData().id,
                                    prompt("Digite o novo título da competência"));
                            }
                        });
                    }
                }else {
                    if (processoTrabalho.competencias){
                        //TODO: ordernar no momento em que adicionar
                        menu.push({
                            label:"Adicionar",
                            action:(e, linha) => {
                                linha.addTreeChild(
                                    this.adicionarCompetencia(
                                        linha.getData(), //processo de trabalho
                                        prompt("Digite o título da nova competência")));
                            }
                        });
                    }
                }
                return menu;
             }
        });
        this.selecionarProcessosTrabalho();
    }

    editavel(processoTrabalho){
        return processoTrabalho.filhos === undefined;
    }

    editouProcessoTrabalho(processoTrabalho, competencia){
        ProcessosTrabalhoDAO.getInstance().salvarCompetenciaUsuario(processoTrabalho.id, competencia);
        this.dispatchEvent (new CustomEvent(ProcessosTrabalhoView.EVENTO_EDITOU_PROCESSO_TRABALHO_USUARIO, {detail:competencia}));
    }

    adicionarCompetencia (processoTrabalho, tituloCompetencia){

        let competencia = {
            id: `${(new Date).getTime()}_${UsuarioDAO.getInstance().usuario.cpf}`,
            titulo: tituloCompetencia,
            criadaPeloUsuario: true
        };
        ProcessosTrabalhoDAO.getInstance().salvarCompetenciaUsuario(processoTrabalho.id, competencia);
        return competencia;
    }


    renomearCompetencia (idCompetencia, tituloCompetencia){

        let competencia = {
            id: idCompetencia,
            titulo: tituloCompetencia,
            criadaPeloUsuario: true
        };
        ProcessosTrabalhoDAO.getInstance().salvarCompetenciaUsuario(-1, competencia);
        return competencia;
    }


    verificaFiltroTitulo (processoTrabalho){
        if (this.configuracoes.valorProcurado.length < ProcessosTrabalhoView.TAMANHO_MINIMO_PROCURA){
            return false;
        }else{
            return processoTrabalho.titulo.toLowerCase().indexOf(this.configuracoes.valorProcurado.toLowerCase()) != -1;
        }
    }



    verificaAtiva (processoTrabalho){
        
        //Caso a varíavel ativa exista, retorna seu valor, senão retorna falso
        return (processoTrabalho.ativa !== undefined ? processoTrabalho.ativa : false);
    }



    verificaSePossuiConteudo (processoTrabalho){

        let possuiConteudo = 
            (processoTrabalho.nivelProficiencia !== undefined) ||
            (processoTrabalho.nivelAfinidade !== undefined) ||
            (processoTrabalho.criadaPeloUsuario !== undefined) ||
            this.verificaAtiva(processoTrabalho);

        return possuiConteudo;
    }



    criarFuncaoDeFiltro (funcaoCondicao){
        
        return processoTrabalho => {
        
            //Se esse processo de trabalho tem filhos
            if ((processoTrabalho.filhos !== undefined ? processoTrabalho.filhos.length > 0: false)){

                //Atualiza os filhos desse processo de trabalho apenas os filhos que passarem na função de condição (chama recusivamente essa função)
                processoTrabalho.filhos = processoTrabalho.filhos.filter(this.criarFuncaoDeFiltro(funcaoCondicao), this);

                //Se é passou na função de condição ou tem filho que passou na função de condição
                return funcaoCondicao(processoTrabalho) || processoTrabalho.filhos.length > 0;

            //Caso esse processo de trabalho não tenha filhos (seja uma atividade de ponta)
            }else{

                //Retorna se ele passou na função de condição
                return funcaoCondicao(processoTrabalho);
            }
        }
    }



    abrirArvoreTabelaProcessosTrabalho(linha, funcaoCondicao){
        
        let processoTrabalho = linha.getData();
        
        let ehFilhoOuExisteFilhoComCondicao = funcaoCondicao(processoTrabalho);

        linha.getTreeChildren().forEach( linhaFilha => {
            let existeFilhoComCondicao = this.abrirArvoreTabelaProcessosTrabalho(linhaFilha, funcaoCondicao);
            ehFilhoOuExisteFilhoComCondicao = ehFilhoOuExisteFilhoComCondicao || existeFilhoComCondicao;
        });

        if (ehFilhoOuExisteFilhoComCondicao){
            linha.treeExpand();
        }else{
            linha.treeCollapse();
        }

        return ehFilhoOuExisteFilhoComCondicao;
    }

    compararProcessosTrabalhos (e1, e2){
        let comp = e1.titulo.localeCompare(e2.titulo);
        if ((e1.criadaPeloUsuario && e2.criadaPeloUsuario) || (!e1.criadaPeloUsuario && !e2.criadaPeloUsuario)){
            return comp;
        }else if (e1.criadaPeloUsuario){
            return -1;
        }else{
            return 1;
        }
    }


    transformarBaseProcessosTrabalho(){

        let copiaProcessosTrabalho = JSON.parse(JSON.stringify(ProcessosTrabalhoDAO.getInstance().processosTrabalho));
        let copiaCompetencias = JSON.parse(JSON.stringify(ProcessosTrabalhoDAO.getInstance().competencias));

        //TODO: melhorar ordenação, permitir que o usuário ordene
        let lista = Object.values(copiaProcessosTrabalho).sort(this.compararProcessosTrabalhos);

        lista.map(function transformar(pt){
            pt.filhos = Object.values(pt.filhos);
            pt.filhos.map(transformar, this);
            if (pt.competencias !== undefined){
                pt.competencias.forEach(idCompetencia =>{
                    pt.filhos.push({...copiaCompetencias[idCompetencia]});
                });
            }
            pt.filhos = Object.values(pt.filhos).sort(this.compararProcessosTrabalhos);
            return pt;
        },this); 

        return lista;
    }



    selecionarProcessosTrabalho(){
        let dicionarioDeFiltrosEFuncoes = {
            "ativas": this.verificaAtiva,
            "preenchidos": this.verificaSePossuiConteudo.bind(this),
            "todos": processoTrabalho => true,
            "procurar": this.verificaFiltroTitulo.bind(this)
        };
        this.filtrarProcessosTrabalho(dicionarioDeFiltrosEFuncoes[this.configuracoes.filtro]);
    }



    filtrarProcessosTrabalho(funcaoFiltro){

        //Cria uma copia da lista completa pois as funções a seguir modificação seu conteudo
        this.processosTrabalho = this.transformarBaseProcessosTrabalho();
        this.processosTrabalho = this.processosTrabalho.filter(this.criarFuncaoDeFiltro(funcaoFiltro), this);

        //Filtra os elementos baseado na função de condição escolhida
        this.tabela.setData(this.processosTrabalho);
            
        //Problemas de performance se abrir todos os processos de trabalho
        if (this.configuracoes.filtro != "todos"){

            //Abre a estrutura de árvore conforme a condição escolhida
            this.tabela.getRows().forEach( linha => this.abrirArvoreTabelaProcessosTrabalho(linha,funcaoFiltro));
        }
    }  
}
customElements.define('processos-trabalho-view', ProcessosTrabalhoView);