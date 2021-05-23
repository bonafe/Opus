
export class TabulatorProcessosTrabalho extends HTMLElement{


    static _template = undefined;



    static get TEMPLATE (){
        if (TabulatorProcessosTrabalho._template === undefined){
            TabulatorProcessosTrabalho._template = document.createElement("template");
            TabulatorProcessosTrabalho._template.innerHTML = `
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
                <link href="/bibliotecas/tabulator/css/tabulator.min.css" rel="stylesheet">

                <div class="container-flex">
                    <style>
                        .tabulator-header{
                            #text-align: center;
                        }
                    </style>
                    <div id="tabelaProcessosTrabalho"></div>
                </div>
            `;
        }
        return TabulatorProcessosTrabalho._template;
    }



    constructor(){
        super();
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(TabulatorProcessosTrabalho.TEMPLATE.content.cloneNode(true));
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
                {title:"Processos de Trabalho", field:"titulo", width:450},
                {title:"Proficiência", field:"nivelProficiencia", width:180, hozAlign:"center", formatter:"star", formatterParams:{stars:5}, editor:true,
                    cellEdited: celula => {
                        console.log(`Nível de Proficiência: ${celula.getValue()}`)
                    }
                }
            ],
            rowClick:function(e, row){
                console.log ("clicou");
            },

            rowDblClick: (evento, linha) => {
                console.log(`Duplo clique na linha: ${linha.getData().titulo}`);
            }

        });

        this.tabela.setData([{titulo:"oi", nivelProficiencia:5},{titulo:"aaaaa", nivelProficiencia:3}])
    }
}
customElements.define('tabulator-processos-trabalho', TabulatorProcessosTrabalho);