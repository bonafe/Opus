import { ProcessosTrabalhoDAO } from './processos_trabalho_dao.js';
import { UsuarioDAO } from '../pessoas/usuario_dao.js';

export class ProcessosTrabalhoView extends HTMLElement{


    static EVENTO_EDITOU_PROCESSO_TRABALHO_USUARIO = "editouProcessoTrabalhoUsuario";
    
    
    static _template = undefined;



    static get TEMPLATE (){
        if (ProcessosTrabalhoView._template === undefined){
            ProcessosTrabalhoView._template = document.createElement("template");
            ProcessosTrabalhoView._template.innerHTML = `
                <link href="bibliotecas/tabulator/css/tabulator.min.css" rel="stylesheet">
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

        this.carregarConfiguracoes();
        this.inicializarFiltros();        
    }

    redimensionar(largura, altura){
        this.tabela.setHeight(altura-80);
    }


    carregarConfiguracoes(){
        if (!localStorage.configuracoes){     

            console.log (`Configurações não encontradas na base de dados local`);
            console.log (`Inicializando configuração com valores padrão`);
            this.configuracoes = {
                filtro: "ativas"
            };
            this.salvarConfiguracoes();

        }else{            
            
            console.log (`Carregando configurações do armazenamento local`);
            this.configuracoes = JSON.parse(localStorage.configuracoes);
        }
    }



    salvarConfiguracoes(){
        console.log (`Salvando as configurações na base de dados local do navegador`);
        localStorage.configuracoes = JSON.stringify(this.configuracoes);
    }



    inicializarFiltros(){
        this._shadowRoot.querySelectorAll("input").forEach(elemento => {
            elemento.addEventListener("click", evento => {
                console.log (`Aplicar filtro: ${elemento.value}`);
                this.configuracoes.filtro = elemento.value;
                this.salvarConfiguracoes();
                this.filtrarProcessosTrabalho();
            });
        });
        this._shadowRoot.querySelector(`input[value='${this.configuracoes.filtro}']`).checked = true;
    }



    renderizar(){
        this.criarTabelaProcessosTrabalho();
    }



    criarTabelaProcessosTrabalho(){

        let container = this._shadowRoot.getElementById("tabelaProcessosTrabalho");

        this.tabela = new Tabulator(container, {
            dataTree:true,
            dataTreeChildField:"filhos",
            height:350,            
            layout:"fitColumns",
            columns:[                
                {title:"Processos de Trabalho", field:"titulo", width:450, headerFilter:true},
                {title:"Proficiência", field:"nivelProficiencia", width:180, hozAlign:"center", formatter:"star", formatterParams:{stars:5}, editor:true, headerFilter:true,
                    cellEdited: celula => {
                        console.log(`Nível de Proficiência: ${celula.getValue()}`)
                    },
                        editable: celula => (celula.getRow().getData().filhos === undefined)
                    },
                {title:"Afinidade", field:"nivelAfinidade", width:160, hozAlign:"center", formatter:"star", formatterParams:{stars:5}, editor:true, headerFilter:true,
                    cellEdited: celula => {
                        console.log(`Nível de Afinidade: ${celula.getValue()}`)
                    },
                    editable: celula => (celula.getRow().getData().filhos === undefined)
                },
                {title:"Duração", field:"duracaoMedia", width:145, hozAlign:"center", editor:"input", headerFilter:true,
                    ccellEdited: celula => {
                        console.log(`Duração Padrão: ${celula.getValue()}`)
                    },
                    editable: celula => (celula.getRow().getData().filhos === undefined)
                },
                {title:"Tarefa", field:"ativa", width:120, hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:true, headerFilter:true,
                    cellEdited: celula => {
                        console.log(`Ativa: ${celula.getValue()}`)
                    },
                    editable: celula => (celula.getRow().getData().filhos === undefined)
                }
            ],
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
            cellEdited: celula => {
                let processoTrabalho = celula.getRow().getTreeParent().getData();
                let competenciaUsuario = celula.getRow().getData();
                ProcessosTrabalhoDAO.getInstance().salvarCompetenciaUsuario(processoTrabalho, competenciaUsuario);
                this.dispatchEvent (new CustomEvent(ProcessosTrabalhoView.EVENTO_EDITOU_PROCESSO_TRABALHO_USUARIO, {detail:competenciaUsuario}));
            },
             rowContextMenu: (componente, e) => {

                    let processoTrabalho = componente.getData();
                    if (processoTrabalho.filhos === undefined){
                        return false;
                    }else if (processoTrabalho.filhos.length == 0){
                        return false;
                    }else if (processoTrabalho.filhos[0].filhos === undefined){
                        let menu = [];
                        menu.push({
                            label:"Adicionar",
                            action:(e, linha) => {
                                linha.addTreeChild(
                                    this.adicionarCompetenciaUsuario(
                                        linha.getData(), //processo de trabalho
                                        prompt("Digite o título da nova competência")));
                            }
                        });
                        return menu;
                    }
                }
        });

        this.filtrarProcessosTrabalho();
    }


    adicionarCompetenciaUsuario (processoTrabalho, tituloCompetencia){

        console.dir(processoTrabalho);

        let competencia = {
            id: `${(new Date).getTime()}_${UsuarioDAO.getInstance().usuario.cpf}`,
            titulo: tituloCompetencia,
            criadaPeloUsuario: true
        };
        ProcessosTrabalhoDAO.getInstance().salvarCompetenciaUsuario(processoTrabalho.id, competencia);
        return competencia;
    }


    verificaAtiva (processoTrabalho){
        
        //Caso a varíavel ativa exista, retorna seu valor, senão retorna falso
        return (processoTrabalho.ativa !== undefined ? processoTrabalho.ativa : false);
    }



    verificaSePossuiConteudo (processoTrabalho){

        let possuiConteudo = 
            (processoTrabalho.nivelProficiencia !== undefined) ||
            (processoTrabalho.nivelAfinidade !== undefined) ||
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
    


    transformarBaseProcessosTrabalho(){

        let copiaProcessosTrabalho = JSON.parse(JSON.stringify(ProcessosTrabalhoDAO.getInstance().processosTrabalho));
        let copiaCompetencias = JSON.parse(JSON.stringify(ProcessosTrabalhoDAO.getInstance().competencias));
        let copiacompetenciasUsuario = JSON.parse(JSON.stringify(ProcessosTrabalhoDAO.getInstance().competenciasUsuario));

        let lista = Object.values(copiaProcessosTrabalho);

        lista.map(function transformar(pt){
            pt.filhos = Object.values(pt.filhos);
            pt.filhos.map(transformar, this);
            if (pt.competencias !== undefined){
                pt.competencias.forEach(idCompetencia =>{
                    pt.filhos.push({...copiaCompetencias[idCompetencia], ...copiacompetenciasUsuario[idCompetencia]});
                });
            }
            return pt;
        },this); 

        return lista;
    }



    filtrarProcessosTrabalho(){
                
        let dicionarioDeFiltrosEFuncoes = {
            "ativas": this.verificaAtiva,
            "preenchidos": this.verificaSePossuiConteudo.bind(this),
            "todos": processoTrabalho => true
        };
                
        //Cria uma copia da lista completa pois as funções a seguir modificação seu conteudo
        this.processosTrabalho = this.transformarBaseProcessosTrabalho();
        this.processosTrabalho = this.processosTrabalho.filter(this.criarFuncaoDeFiltro(dicionarioDeFiltrosEFuncoes[this.configuracoes.filtro]), this);

        //Filtra os elementos baseado na função de condição escolhida
        this.tabela.setData(this.processosTrabalho);
            
        //Problemas de performance se abrir todos os processos de trabalho
        if (this.configuracoes.filtro != "todos"){

            //Abre a estrutura de árvore conforme a condição escolhida
            this.tabela.getRows().forEach( linha => this.abrirArvoreTabelaProcessosTrabalho(linha,dicionarioDeFiltrosEFuncoes[this.configuracoes.filtro]));
        }
    }  
}
customElements.define('processos-trabalho-view', ProcessosTrabalhoView);