import { AtividadesDAO } from './atividades_dao.js';

export class AtividadesView extends HTMLElement{


    static EVENTO_CRIAR_ATIVIDADE = "criarAtividade";


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
            multiselect: true,
            onMove: item => {
                console.log (`Atualizou item linha do tempo: ${item}`);
                AtividadesDAO.getInstance().atualizarDuracaoAtividade(item.id, item.start, item.end);
            },
            onRemove: item => {
                console.log (`Removeu item linha do tempo: ${item}`);
                AtividadesDAO.getInstance().removerAtividade(item.id);
                this.dataSetTimeLine.remove(item.id);
            }
        };

        this.timeline = new vis.Timeline(container, this.dataSetTimeLine, options);

        this.timeline.on('rangechange', properties => {
            //console.dir(properties);
            //console.log('rangechange');
        });
    
        this.timeline.on('rangechanged', properties => {
            //console.dir(this.timeline);
            //console.dir(properties);
            //console.log('rangechanged');
        });
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



    adicionarAtividadeDepoisDaMaisRecente(competencia){

        let dataFimItemMaisRecente = 0;

        this.dataSetTimeLine.forEach(item => {
            if (item.end > dataFimItemMaisRecente){
                dataFimItemMaisRecente = item.end;
            }
        });

        let duracaoPadrao = 45 * 60 * 1000;

        //Se não existrem items
        if (dataFimItemMaisRecente == 0){
            dataFimItemMaisRecente = (new Date()).getTime() - duracaoPadrao;
        }

        this.adicionarAtividade(competencia, dataFimItemMaisRecente, dataFimItemMaisRecente + duracaoPadrao);
    }



    adicionarAtividade (competencia, inicio, fim){

        let agora = new Date();

        let atividade = {
            id:`${agora.getTime()}_${competencia.id}`,
            inicio:inicio,
            fim:fim,
            competencia:competencia,
            dataCriacao: agora.toISOString()
        }
        AtividadesDAO.getInstance().salvarAtividadeUsuario(atividade);
        
        this.dataSetTimeLine.add([this.criarItemTimeline(atividade)]);
    }
}

customElements.define('atividades-view', AtividadesView);