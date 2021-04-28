//jsPanel: Janelas flutuantes
import { jsPanel } from './bibliotecas/jspanel/jspanel.min.js';
//import './bibliotecas/jspanel/extensions/hint/jspanel.hint.min.js';
//import './bibliotecas/jspanel/extensions/modal/jspanel.modal.min.js';
//import './bibliotecas/jspanel/extensions/contextmenu/jspanel.contextmenu.min.js';
//import './bibliotecas/jspanel/extensions/tooltip/jspanel.tooltip.min.js';
import './bibliotecas/jspanel/extensions/layout/jspanel.layout.min.js';
//import './bibliotecas/jspanel/extensions/dock/jspanel.dock.min.js';

//Módulos locais
import { ProcessosTrabalhoView } from "./modulos/processos_trabalho/processos_trabalho_view.js";
import { AtividadesView } from "./modulos/atividades/atividades_view.js";
import { CompetenciasView } from "./modulos/processos_trabalho/competencias_view.js";


window.limpar = () => {
    delete localStorage.atividadesUsuario;
    delete localStorage.processosTrabalho;
    delete localStorage.competencias;
    delete localStorage.competenciasUsuario;
    delete localStorage.configuracaoPaineis;
}

window.onload = () => {

    window.carregarConfiguracaoJanelas();

    //let paineis = {};

    //Object.values(window.paineis).forEach(configuracaoPainel => {
    //    paineis[configuracaoPainel.id] = jsPanel.create(configuracaoPainel);
    //});

    window.atividades = document.createElement("atividades-view");
    window.criarPainel("atividade", "Atividades", window.atividades);
    //paineis["atividades"].content.appendChild(window.atividades);
    window.atividades.renderizar();

    window.processosTrabalho = document.createElement('processos-trabalho-view');
    window.criarPainel("processosTrabalho","Processos de Trabalho", window.processosTrabalho);
    //paineis["processosTrabalho"].content.appendChild(window.processosTrabalho);
    window.processosTrabalho.addEventListener (ProcessosTrabalhoView.EVENTO_EDITOU_PROCESSO_TRABALHO_USUARIO, evento => {
        let competencia = evento.detail;
        console.log ("atualizou competência usuário");
        window.competencias.renderizar();
    });
    window.processosTrabalho.renderizar();

    window.competencias = document.createElement('competencias-view');
    window.criarPainel("competencias", "Competências", window.competencias);
    //paineis["competencias"].content.appendChild(window.competencias);
    window.competencias.addEventListener (AtividadesView.EVENTO_CRIAR_ATIVIDADE, evento => {
        let competencia = evento.detail;
        console.log ("adicionarAtividade");
        window.atividades.adicionarAtividadeDepoisDaMaisRecente(competencia);
    });
    window.competencias.renderizar();
    window.atualizarDimensoes();


    document.addEventListener("jspanelresizestop", evento => {
        window.salvarPosicaoPainel(evento.panel);
    });

    document.addEventListener("jspaneldragstop", evento => {

        window.salvarPosicaoPainel(evento.panel);
    });
};

window.onresize = () => {
    window.atualizarDimensoes();
};

window.atualizarDimensoes = () => {
    //window.atividades.style.height = `200px`;
    //window.competencias.style.height = `150px`;
    //window.processosTrabalho.redimensionar(screen.availWidth, screen.availHeight - 500);
};

window.criarPainel = (id, titulo, conteudo) => {
    let configuracao  = window.paineis[id];

    if (configuracao === undefined){
        configuracao = {
            altura: Math.min(500, window.innerHeight*0.6),
            largura: Math.min(800, window.innerWidth*0.9),
            x: 10,
            y: 10
        };
    }

    console.log (titulo);
    console.dir(configuracao);

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
}

window.salvarPosicaoPainel = painel => {

    window.paineis[painel.id] = {
        altura: painel.style.height,
        largura: painel.style.width,
        x: painel.style.left,
        y: painel.style.top
    };

    console.log (`mudou painel: ${window.paineis[painel.id].altura} ${window.paineis[painel.id].largura} ${window.paineis[painel.id].y} ${window.paineis[painel.id].x}`);
    window.salvarConfiguracaoJanelas();
};

window.salvarConfiguracaoJanelas = () => {
    localStorage.configuracaoPaineis = JSON.stringify (window.paineis);
};

window.carregarConfiguracaoJanelas = () => {
    if (localStorage.configuracaoPaineis !== undefined){
        window.paineis = JSON.parse(localStorage.configuracaoPaineis);
    }else{
        window.paineis = {};
    }
};