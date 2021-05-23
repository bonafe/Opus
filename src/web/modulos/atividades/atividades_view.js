import { AtividadesDAO } from './atividades_dao.js';
import { UsuarioDAO } from '../pessoas/usuario_dao.js';

export class AtividadesView extends HTMLElement{

    static DURACAO_PADRAO = 45;

    static EVENTO_CRIAR_ATIVIDADE = "criarAtividade";


    static _template = undefined;

    static get TEMPLATE (){
        if (AtividadesView._template === undefined){
            AtividadesView._template = document.createElement("template");
            AtividadesView._template.innerHTML = `
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
                <link href="/bibliotecas/visjs/vis-timeline-graph2d.min.css" rel="stylesheet" type="text/css" />
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

        this.dataSetTimeLine.add([{
            id: 'centro',
            type: 'background',
            start: new Date().getTime(),
            end: new Date().getTime() + 1000 * 60 * 30,
            tipo: 'indicador_lancamento'
        }]);

        let agora = new Date();
        let dozeHoraAtras = agora.valueOf() - 1000 * 60 * 60 * 12; //30 minutos = 1000 * 60 * 30 milissegundos
        //let daquiAUmMinuto = agora.valueOf() + 1000 * 60; //1 minuto = 1000 * 60 milissegundos
        let daquiAMeiaHora = agora.valueOf() + 1000 * 60 * 30; //1 minuto = 1000 * 60 milissegundos


        let options = {
            start: dozeHoraAtras,
            end: daquiAMeiaHora,
            editable: true,
            multiselect: true,
            tooltip:{
                followMouse: true
            },
            onMove: item => {
                console.log (`Atualizou item linha do tempo: ${item}`);
                AtividadesDAO.getInstance().atualizarDuracaoAtividade(item.id, item.start, item.end);
                this.dataSetTimeLine.update(item);
            },
            onRemove: item => {
                console.log (`Removeu item linha do tempo: ${item}`);
                AtividadesDAO.getInstance().removerAtividade(item.id);
                this.dataSetTimeLine.remove(item.id);
            }
        };

        this.timeline = new vis.Timeline(container, this.dataSetTimeLine, options);

        this.timeline.on('rangechange', properties => {
            this.atualizarTipoElementos();
        });
    
        this.timeline.on('rangechanged', properties => {
            this.atualizarTipoElementos();
        });

        this.timeline.on ('doubleClick', obj => {
            if (obj.event instanceof MouseEvent){
                console.log ("mouse");
                let conteudo = prompt("Digite o conteúdo da atividade:");
                let atividade = AtividadesDAO.getInstance().atualizarConteudo(obj.item, conteudo);
                this.dataSetTimeLine.update({id:obj.item, title:this.tituloAtividade(atividade)});
            }
        });
    }

    centroJanela(){
        let janela = this.timeline.getWindow().end.getTime() - this.timeline.getWindow().start.getTime();
        let centroJanela = this.timeline.getWindow().start.getTime() + (janela/2);
        return centroJanela;
    }

    atualizarTipoElementos(){
        let janela = this.timeline.getWindow().end.getTime() - this.timeline.getWindow().start.getTime();
        let diasJanela = janela / 1000 / 60 / 60 / 24;
        console.log(`Janela de ${diasJanela} dias`);

        let tipoElemento = "range";

        if (diasJanela > 1.29){
            tipoElemento = "box";
        }else{
            tipoElemento = "range";
        }

        this.dataSetTimeLine.forEach(elemento => {
            if (elemento.tipo == "atividade"){
                elemento.type = tipoElemento;
                this.dataSetTimeLine.update(elemento);
            }else if (elemento.tipo == "indicador_lancamento"){
                elemento.start = this.centroJanela();
                elemento.end = this.centroJanela() + 1000 * 60 * 30;
                this.dataSetTimeLine.update(elemento);
            }
        });
    }


    criarItemTimeline (atividade){
        return {
            id: atividade.id,
            start: atividade.inicio,
            end: atividade.fim,
            content: atividade.competencia.titulo,
            type: "range",
            title: this.tituloAtividade(atividade),
            tipo: "atividade"
        };
    }

    tituloAtividade (atividade){
        return atividade.competencia.titulo + ((atividade.conteudo !== undefined) && (atividade.conteudo.length > 0) ? `: ${atividade.conteudo}` : "");
    }


    adicionarAtividadeDepoisDaMaisRecente(competencia){

        let dataFimItemMaisRecente = 0;

        this.dataSetTimeLine.forEach(item => {
            if (item.end > dataFimItemMaisRecente){
                dataFimItemMaisRecente = item.end;
            }
        });

        let duracaoPadrao = this.calcularDuracaoPadrao(competencia);

        //Se não existrem items
        if (dataFimItemMaisRecente == 0){
            dataFimItemMaisRecente = (new Date()).getTime() - duracaoPadrao;
        }

        let agora = (new Date()).getTime();
        let centro = this.centroJanela();
        this.adicionarAtividade(competencia, centro - duracaoPadrao, centro);
    }


    calcularDuracaoPadrao(competencia){
        let duracao = parseInt(competencia.duracaoPadrao);
         if (isNaN(duracao)){
            duracao = AtividadesView.DURACAO_PADRAO;
         }
         return duracao * 60 * 1000;
    }


    adicionarAtividade (competencia, inicio, fim){

        let agora = new Date();

        let cpf = UsuarioDAO.getInstance().usuario.cpf;

        let atividade = {
            id:`${agora.getTime()}_${cpf}`,
            inicio:inicio,
            fim:fim,
            competencia:competencia,
            conteudo: "",
            dataCriacao: agora.toISOString()
        }
        AtividadesDAO.getInstance().salvarAtividadeUsuario(atividade);
        
        this.dataSetTimeLine.add([this.criarItemTimeline(atividade)]);
    }
}

customElements.define('atividades-view', AtividadesView);