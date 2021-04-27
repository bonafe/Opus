import { ProcessosTrabalhoDAO } from './processos_trabalho_dao.js';


export class ProcessosTrabalhoView extends HTMLElement{

    
    
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
                        <input type="radio" name="filtro" value="favoritos">Favoritos
                        </label>
                        <label class="checkbox-inline">
                        <input type="radio" name="filtro" value="preenchidos">Preenchidos
                        </label>
                    </form>
                    <div class="container-flex">
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
        this.tabela.setHeight(altura);
    }


    carregarConfiguracoes(){
        if (!localStorage.configuracoes){     

            console.log (`Configurações não encontradas na base de dados local`);
            console.log (`Inicializando configuração com valores padrão`);
            this.configuracoes = {
                filtro: "favoritos"
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
                {title:"Nível de Proficiência", field:"nivelProficiencia", width:180, hozAlign:"center", formatter:"star", formatterParams:{stars:5}, editor:true, headerFilter:true,
                    cellEdited: celula => {
                        console.log(`Nível de Proficiência: ${celula.getValue()}`)
                    },
                        editable: celula => (celula.getRow().getData().filhos === undefined)
                    },
                {title:"Nível de Afinidade", field:"nivelAfinidade", width:160, hozAlign:"center", formatter:"star", formatterParams:{stars:5}, editor:true, headerFilter:true,
                    cellEdited: celula => {
                        console.log(`Nível de Afinidade: ${celula.getValue()}`)
                    },
                    editable: celula => (celula.getRow().getData().filhos === undefined)
                },
                {title:"Duração Padrão", field:"duracaoMedia", width:145, hozAlign:"center", editor:"input", headerFilter:true,
                    ccellEdited: celula => {
                        console.log(`Duração Padrão: ${celula.getValue()}`)
                    },
                    editable: celula => (celula.getRow().getData().filhos === undefined)
                },
                {title:"Ativado", field:"favorito", width:90, hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:true, headerFilter:true,
                    cellEdited: celula => {
                        console.log(`Favorito: ${celula.getValue()}`)
                    },
                    editable: celula => (celula.getRow().getData().filhos === undefined)
                }
            ],
            rowDblClick: (evento, linha) => {
                console.log(`Duplo clique na linha: ${linha.getData().titulo}`);
                //TODO: exibir detalhes                
            },
            cellEdited: celula => {                

                ProcessosTrabalhoDAO.getInstance().salvarCompetenciaUsuario(celula.getRow().getData());
            }
        });

        this.filtrarProcessosTrabalho();
    }



    verificaFavorito (processoTrabalho){
        
        //Caso a varíavel favorita exista, retorna seu valor, senão retorna falso
        return (processoTrabalho.favorito !== undefined ? processoTrabalho.favorito : false);
    }



    verificaSePossuiConteudo (processoTrabalho){

        let possuiConteudo = 
            (processoTrabalho.nivelProficiencia !== undefined) ||
            (processoTrabalho.nivelAfinidade !== undefined) ||
            this.verificaFavorito(processoTrabalho);            

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
            "favoritos": this.verificaFavorito,
            "preenchidos": this.verificaSePossuiConteudo.bind(this),
            "todos": processoTrabalho => true
        };
                
        //Cria uma copia da lista completa pois as funções a seguir modificação seu conteudo
        let processosTrabalho = this.transformarBaseProcessosTrabalho();

        //Filtra os elementos baseado na função de condição escolhida
        this.tabela.setData(processosTrabalho.filter(this.criarFuncaoDeFiltro(dicionarioDeFiltrosEFuncoes[this.configuracoes.filtro]), this));        
            
        //Problemas de performance se abrir todos os processos de trabalho
        if (this.configuracoes.filtro != "todos"){

            //Abre a estrutura de árvore conforme a condição escolhida
            this.tabela.getRows().forEach( linha => this.abrirArvoreTabelaProcessosTrabalho(linha,dicionarioDeFiltrosEFuncoes[this.configuracoes.filtro]));
        }
    }  
}
customElements.define('processos-trabalho-view', ProcessosTrabalhoView);