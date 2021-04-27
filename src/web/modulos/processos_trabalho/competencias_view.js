import { ProcessosTrabalhoDAO } from './processos_trabalho_dao.js';
import { AtividadesView } from '../atividades/atividades_view.js' ;

export class CompetenciasView extends HTMLElement{

    
    static _template = undefined;



    static get TEMPLATE (){
        if (CompetenciasView._template === undefined){
            CompetenciasView._template = document.createElement("template");
            CompetenciasView._template.innerHTML = `    
                <!-- TODO: colocar tudo em um arquivo só para distribuição -->
                <!-- Bootstrap TODO: Puxar local-->
                <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
                        
                <div class="container-flex m-3 text-center justify-content-center">                        
                </div>                                    
            `;
        }
        return CompetenciasView._template;
    }



    constructor(){
        super();
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(CompetenciasView.TEMPLATE.content.cloneNode(true));        
    } 



    renderizar(){
        this.desenharBotoesCompetencias();        
    }



    desenharBotoesCompetencias(){
        let container = this._shadowRoot.querySelector("div");

        //Limpa todos os botões
        while (container.firstChild) {
            container.removeChild(container.lastChild);
        }

        //Cria os botões baseados nas competências ativas
        this.competenciasUsuario = JSON.parse(JSON.stringify(ProcessosTrabalhoDAO.getInstance().competenciasUsuario));

        Object.values(this.competenciasUsuario)
            .filter(competencia => competencia.ativa)
            .forEach( competencia => {
                let botao = document.createElement("button");
                botao.type = "button";
                botao.classList.add("btn");
                botao.classList.add("btn-primary");
                botao.classList.add("m-1");
                botao.textContent = competencia.titulo;
                botao.style.width = '240px';
                botao.addEventListener("click", ()=>{
                    this.dispatchEvent (new CustomEvent(AtividadesView.EVENTO_CRIAR_ATIVIDADE, {detail:competencia}));
                });
                container.appendChild(botao);
            });
    }
}
customElements.define('competencias-view', CompetenciasView);