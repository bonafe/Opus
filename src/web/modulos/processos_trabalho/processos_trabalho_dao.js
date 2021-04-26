import { base_processos_trabalho_rfb_23_04_2021 } from './base/processos_trabalho_rfb_23_04_2021.js';



export class ProcessosTrabalhoDAO{



    static instancia = undefined;



    static getInstance(){
        if (ProcessosTrabalhoDAO.instancia === undefined){
            ProcessosTrabalhoDAO.instancia = new ProcessosTrabalhoDAO();
        }
        return ProcessosTrabalhoDAO.instancia;
    }



    constructor(){
        this.carregarBase();
    }



    carregarBase(){

        //A primeira vez que roda pega os dados do javascript, depois usa o localStorage para guardas as mudanças
        if (!localStorage.processosTrabalho){     

            console.log (`Base de dados não encontrada`);
            console.log (`Inicializando base de dados com a base: base_processos_trabalho_rfb_23_04_2021`);

            this.processosTrabalho = base_processos_trabalho_rfb_23_04_2021.processos_trabalho;            
            this.competencias = base_processos_trabalho_rfb_23_04_2021.competencias;

            //Cria o modelo do usuário para guardar suas competências e atividades realizadas
            this.competenciasUsuario = {};

            console.log (`Salvando a base de dados no armazenamento local do navegador`);
            localStorage.processosTrabalho = JSON.stringify(this.processosTrabalho);
            localStorage.competencias = JSON.stringify(this.competencias); 
            localStorage.competenciasUsuario = JSON.stringify(this.competenciasUsuario);

        }else{            
            
            console.log (`Carregando base de dados do armazenamento local`);
            this.processosTrabalho = JSON.parse(localStorage.processosTrabalho);
            this.competencias = JSON.parse(localStorage.competencias);
            this.competenciasUsuario =  JSON.parse(localStorage.competenciasUsuario);
        }
    }



    salvarCompetenciaUsuario(competencia){

        console.log (`Salvando competencia do usuário na base de dados local do navegador`);
        this.competenciasUsuario[competencia.id] = competencia;
        localStorage.competenciasUsuario = JSON.stringify(this.competenciasUsuario);
    }

}