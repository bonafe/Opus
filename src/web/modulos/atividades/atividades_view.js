import { AtividadesDAO } from './atividades_dao.js';

export class AtividadesView extends HTMLElement{



    static _template = undefined;

    static get TEMPLATE (){
        if (AtividadesView._template === undefined){
            AtividadesView._template = document.createElement("template");
            AtividadesView._template.innerHTML = `
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
                <link href="//unpkg.com/vis-timeline@latest/styles/vis-timeline-graph2d.min.css" rel="stylesheet" type="text/css" />
                <div class="mx-2">                    
                    <div id="linhaDoTempo" class="container-flex">
                        <div></div>
                    </div>                    
                </div>
            `;
        }
        return AtividadesView._template;
    }



    constructor(){
        super();
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(AtividadesView.TEMPLATE.content.cloneNode(true));        
    }



    renderizar(){
        this.exibirLinhaDoTempo();
    }
  


    exibirLinhaDoTempo(){
        let container = this._shadowRoot.querySelector("#linhaDoTempo>div");

        // Create a DataSet (allows two way data-binding)
        this.dataSetTimeLine = 
            new vis.DataSet(
                JSON.parse(JSON.stringify(
                    Object.values(AtividadesDAO.getInstance().atividadesUsuario).map( atividade => this.criarItemTimeline(atividade))
                ))
            );

        let agora = new Date();
        let dozeHoraAtras = agora.valueOf() - 1000 * 60 * 60 * 12; //30 minutos = 1000 * 60 * 30 milissegundos
        //let daquiAUmMinuto = agora.valueOf() + 1000 * 60; //1 minuto = 1000 * 60 milissegundos
        let daquiAMeiaHora = agora.valueOf() + 1000 * 60 * 30; //1 minuto = 1000 * 60 milissegundos


        let options = {
            start: dozeHoraAtras,
            end: daquiAMeiaHora,
            editable: true,
            onMove: (item, callback) => {
                console.log (`Atualizou item linha do tempo: ${item}`);
                AtividadesDAO.getInstance().atualizarDuracaoAtividade(item.id, item.start, item.end);
            }
        };

        this.timeline = new vis.Timeline(container, this.dataSetTimeLine, options);
    }


    criarItemTimeline (atividade){
        return {
            id: atividade.id,
            start: atividade.inicio,
            end: atividade.fim,
            content: atividade.competencia.titulo,
            type: "range"
        };
    }


    adicionarAtividade (competencia){

        let agora = new Date();
        let meiaHoraAtras = agora.valueOf() - 1000 * 60 * 30; //30 minutos = 1000 * 60 * 30 milissegundos
        let daquiAUmMinuto = agora.valueOf() + 1000 * 60; //1 minuto = 1000 * 60 milissegundos

        let atividade = {
            id:`${agora.getTime()}_${competencia.id}`,
            inicio:meiaHoraAtras,
            fim:daquiAUmMinuto,
            competencia:competencia
        }
        AtividadesDAO.getInstance().salvarAtividadeUsuario(atividade);
        
        this.dataSetTimeLine.add([this.criarItemTimeline(atividade)]);
    }
}

customElements.define('atividades-view', AtividadesView);