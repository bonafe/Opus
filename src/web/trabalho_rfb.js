
//jsPanel: Janelas flutuantes
import { jsPanel } from './bibliotecas/jspanel/jspanel.min.js';

//Módulos locais
import { ProcessosTrabalhoView } from "./modulos/processos_trabalho/processos_trabalho_view.js";
import { AtividadesView } from "./modulos/atividades/atividades_view.js";
import { CompetenciasView } from "./modulos/processos_trabalho/competencias_view.js";
import { UsuarioDAO } from "./modulos/pessoas/usuario_dao.js";



export class TrabalhoRFB{


    static instancia = undefined;

    static getInstance(){
        if (TrabalhoRFB.instancia === undefined){
            TrabalhoRFB.instancia = new TrabalhoRFB();
        }
        return TrabalhoRFB.instancia;
    }



    constructor() {
        UsuarioDAO.getInstance();
        this.carregarConfiguracaoJanelas();
    }



    renderizar(){

        this.atividades = document.createElement("atividades-view");
        this.criarPainel("atividade", "Atividades Realizadas", this.atividades);
        this.atividades.renderizar();
    
    
        this.processosTrabalho = document.createElement('processos-trabalho-view');
        let painelProcessosTrabalho = this.criarPainel("processosTrabalho","Processos de Trabalho e Competências", this.processosTrabalho);
        this.processosTrabalho.addEventListener (ProcessosTrabalhoView.EVENTO_EDITOU_PROCESSO_TRABALHO_USUARIO, evento => {
            let competencia = evento.detail;
            console.log ("atualizou competência usuário");
            this.competencias.renderizar();
        });
        this.processosTrabalho.renderizar();
        this.processosTrabalho.redimensionar(parseInt(painelProcessosTrabalho.style.width, 10), parseInt(painelProcessosTrabalho.style.height, 10));
    
    
        this.competencias = document.createElement('competencias-view');
        this.criarPainel("competencias", "Tarefas", this.competencias);
        this.competencias.addEventListener (AtividadesView.EVENTO_CRIAR_ATIVIDADE, evento => {
            let competencia = evento.detail;
            console.log ("adicionarAtividade");
            this.atividades.adicionarAtividadeDepoisDaMaisRecente(competencia);
        });
        this.competencias.renderizar();
    
    
        document.addEventListener("jspanelresizestop", evento => {
            this.salvarPosicaoPainel(evento.panel);
            if (evento.panel.id == "processosTrabalho"){
                this.processosTrabalho.redimensionar(parseInt(evento.panel.style.width, 10), parseInt(evento.panel.style.height, 10));
            }
        });
    
        document.addEventListener("jspanelresize", evento => {
           //TODO: fica lento se redimensionar em tempo real
           //this.processosTrabalho.redimensionar(parseInt(evento.panel.style.width, 10), parseInt(evento.panel.style.height, 10));
        });
    
    
        document.addEventListener("jspaneldragstop", evento => {
            this.salvarPosicaoPainel(evento.panel);
        });
    }



    criarPainel (id, titulo, conteudo){
        let configuracao  = this.paineis[id];

        if (configuracao === undefined){
            configuracao = {
                altura: Math.min(500, this.innerHeight*0.6),
                largura: Math.min(800, this.innerWidth*0.9),
                x: 10,
                y: 10
            };
        }

        let painel = jsPanel.create({
            id: id,
            theme: 'dark',
            headerLogo: '<i class="fad fa-home-heart ml-2"></i>',
            headerTitle: `${titulo}`,
            animateIn: 'jsPanelFadeIn',
            onwindowresize: true,
            content: conteudo
        });

        painel.style.height = configuracao.altura;
        painel.style.width = configuracao.largura;
        painel.style.left = configuracao.x;
        painel.style.top = configuracao.y;

        return painel;
    }



    salvarPosicaoPainel (painel) {

        this.paineis[painel.id] = {
            altura: painel.style.height,
            largura: painel.style.width,
            x: painel.style.left,
            y: painel.style.top
        };

        this.salvarConfiguracaoJanelas();
    }



    salvarConfiguracaoJanelas () {
        localStorage.configuracaoPaineis = JSON.stringify (this.paineis);
    }



    carregarConfiguracaoJanelas (){
        if (localStorage.configuracaoPaineis !== undefined){
            this.paineis = JSON.parse(localStorage.configuracaoPaineis);
        }else{
            this.paineis = {};
        }
    }



    limpar (){
        delete localStorage.atividadesUsuario;
        delete localStorage.processosTrabalho;
        delete localStorage.competencias;
        delete localStorage.competenciasUsuario;
        delete localStorage.configuracaoPaineis;
    }
}