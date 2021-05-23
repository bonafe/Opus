
//jsPanel: Janelas flutuantes
import { jsPanel } from '/bibliotecas/jspanel/jspanel.min.js';

//Módulos locais
import { ProcessosTrabalhoView } from "./modulos/processos_trabalho/processos_trabalho_view.js";
import { AtividadesView } from "./modulos/atividades/atividades_view.js";
import { CompetenciasView } from "./modulos/processos_trabalho/competencias_view.js";

import { AtividadesDAO } from "./modulos/atividades/atividades_dao.js";
import { ProcessosTrabalhoDAO } from "./modulos/processos_trabalho/processos_trabalho_dao.js";
import { UsuarioDAO } from "./modulos/pessoas/usuario_dao.js";
import { OpusDAO } from './modulos/OpusDAO.js';

export class TrabalhoRFB{

    static CONFIGURACAO_PADRAO = {
        processosTrabalho:{
            altura: "395.00px",
            largura: "496.00px",
            x: "11.00px",
            y: "71.00px"
        },
        competencias:{
            altura: "395.00px",
            largura: "300.00px",
            x: "520.00px",
            y: "71.00px"
        },
        atividades:{
            altura: "226.00px",
            largura: "820.00px",
            x: "11.00px",
            y: "488.00px"
        },
    };


    static instancia = undefined;

    static getInstance(){
        if (TrabalhoRFB.instancia === undefined){
            TrabalhoRFB.instancia = new TrabalhoRFB();
        }
        return TrabalhoRFB.instancia;
    }



    constructor() {
        this.paineis = {};
        this.configuracoesPaineis = {};

        OpusDAO.getInstance().carregar();
        UsuarioDAO.getInstance();

        this.iniciarServiceWorkers();
        this.carregarConfiguracaoJanelas();
    }

    iniciarServiceWorkers(){
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                console.log('Service Worker registrado! Escopo:', registration.scope);
            })
            .catch(function(error) {
                console.log('Falha no registro do Service Worker! Erro:', error);
            });
    }

    renderizar(){

        this.atividades = document.createElement("atividades-view");
        this.criarPainel("atividades", "Atividades Realizadas", this.atividades);
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
            this.atividades.adicionarAtividade(competencia);
        });
        this.competencias.renderizar();


    
        document.addEventListener("jspanelresizestop", evento => {
            this.atualizarConfiguracoes(true);
        });
    
        document.addEventListener("jspanelresize", evento => {
           //TODO: fica lento se redimensionar em tempo real
           //this.processosTrabalho.redimensionar(parseInt(evento.panel.style.width, 10), parseInt(evento.panel.style.height, 10));
        });

        document.addEventListener("jspanelmaximized", evento => {
            this.atualizarConfiguracoes(true);
        });

        document.addEventListener("jspanelnormalized", evento => {
            this.atualizarConfiguracoes(true);
        });

        document.addEventListener("jspaneldragstop", evento => {
            this.atualizarConfiguracoes(true);
        });

        document.addEventListener("jspanelfronted", evento => {
            this.atualizarConfiguracoes(false);
        });

        this.aplicarConfiguracoes();
        this.atualizarConfiguracoes(true);
    }


    criarPainel (id, titulo, conteudo){

        let painel = jsPanel.create({
            id: id,
            theme: 'dark',
            headerLogo: '<i class="fad fa-home-heart ml-2"></i>',
            headerTitle: `${titulo}`,
            animateIn: 'jsPanelFadeIn',
            onwindowresize: true,
            content: conteudo
        });

        this.paineis[painel.id] = painel;

        return painel;
    }


    redimensionarConteudoPaineis(){
        this.processosTrabalho.redimensionar(parseInt(this.paineis["processosTrabalho"].style.width, 10), parseInt(this.paineis["processosTrabalho"].style.height, 10));
    }



    aplicarConfiguracoes(){
        Object.values(this.paineis).forEach(painel => {
            this.aplicarConfiguracoesPainel (painel);
        });
        this.redimensionarConteudoPaineis();
    }



     aplicarConfiguracoesPainel (painel) {

        if (this.configuracoesPaineis[painel.id] === undefined){
            this.configuracoesPaineis[painel.id] = TrabalhoRFB.CONFIGURACAO_PADRAO[painel.id];
        }

        painel.style.height = this.configuracoesPaineis[painel.id].altura;
        painel.style.width = this.configuracoesPaineis[painel.id].largura;
        painel.style.left = this.configuracoesPaineis[painel.id].x;
        painel.style.top = this.configuracoesPaineis[painel.id].y;

        if (this.configuracoesPaineis[painel.id].z !== undefined){
            painel.style.zIndex = this.configuracoesPaineis[painel.id].z;
        }
    }



    atualizarConfiguracoes(redimensionar){
        Object.values(this.paineis).forEach(painel => {
            this.atualizarConfiguracoesPainel (painel);
        });
        this.salvarConfiguracaoJanelas();
        if (redimensionar){
            this.redimensionarConteudoPaineis();
        }
    }


    atualizarConfiguracoesPainel (painel) {

        this.configuracoesPaineis[painel.id] = {
            altura: painel.style.height,
            largura: painel.style.width,
            x: painel.style.left,
            y: painel.style.top,
            z: painel.style.zIndex
        };
    }



    salvarConfiguracaoJanelas () {
        localStorage.configuracaoPaineis = JSON.stringify (this.configuracoesPaineis);
    }



    carregarConfiguracaoJanelas (){
        if (localStorage.configuracaoPaineis !== undefined){
            this.configuracoesPaineis = JSON.parse(localStorage.configuracaoPaineis);
        }else{
            this.configuracoesPaineis = {};
        }
    }



    limpar (){
        delete localStorage.atividadesUsuario;
        delete localStorage.processosTrabalho;
        delete localStorage.competencias;
        delete localStorage.competenciasUsuario;
        delete localStorage.configuracaoPaineis;
        delete localStorage.configuracoes;
    }


    exportarCSV(){
        let zip = new JSZip();
        let cpf = UsuarioDAO.getInstance().usuario.cpf;
        let agora = new Date();
        let arquivoZIP = `${agora.getFullYear()}_${agora.getMonth()+1}_${agora.getDay()}_${agora.getHours()}_${agora.getMinutes()}-Relatório Opus RFB-${cpf}.zip`;
        let arquivoAtividades = `${AtividadesDAO.getInstance().idBaseAtividades}.csv`;
        let conteudoAtividades = AtividadesDAO.getInstance().atividadesCSV();
        zip.file(arquivoAtividades,conteudoAtividades);

        let arquivoProcessosTrabalho = `${ProcessosTrabalhoDAO.getInstance().idBaseProcessosTrabalho}.csv`;
        let conteudoProcessosTrabalho = ProcessosTrabalhoDAO.getInstance().processosTrabalhoCSV();
        zip.file(arquivoProcessosTrabalho, conteudoProcessosTrabalho);

        zip.generateAsync({type:"blob"})
        .then(function(content) {
            saveAs(content, arquivoZIP);
        });
    }

    fazerBackup(){
        let zip = new JSZip();
        let cpf = UsuarioDAO.getInstance().usuario.cpf;
        let agora = new Date();
        let arquivoZIP = `${agora.getFullYear()}_${agora.getMonth()+1}_${agora.getDay()}_${agora.getHours()}_${agora.getMinutes()}-Backup Opus RFB-${cpf}.zip`;
        let arquivoAtividades = `${AtividadesDAO.getInstance().idBaseAtividades}.csv`;
        let conteudoAtividades = JSON.stringify(AtividadesDAO.getInstance().atividades);
        zip.file(arquivoAtividades,conteudoAtividades);

        let arquivoProcessosTrabalho = `${ProcessosTrabalhoDAO.getInstance().idBaseProcessosTrabalho}.csv`;
        let conteudoProcessosTrabalho = JSON.stringify(ProcessosTrabalhoDAO.getInstance().processosTrabalho);
        zip.file(arquivoProcessosTrabalho, conteudoProcessosTrabalho);

        zip.generateAsync({type:"blob"})
        .then(function(content) {
            saveAs(content, arquivoZIP);
        });
    }
}