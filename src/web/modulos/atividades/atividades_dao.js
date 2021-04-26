export class AtividadesDAO{



    static instancia = undefined;



    static getInstance(){
        if (AtividadesDAO.instancia === undefined){
            AtividadesDAO.instancia = new AtividadesDAO();
        }
        return AtividadesDAO.instancia;
    }



    constructor(){
        this.carregarBase();
    }



    carregarBase(){

        //A primeira vez que roda pega os dados do javascript, depois usa o localStorage para guardas as mudanças
        if (!localStorage.atividadesUsuario){     

            console.log (`Base de dados de atividades do usuário não encontrada`);

            //Cria o modelo do usuário para guardar suas atividades realizadas
            this.atividadesUsuario = {};

            console.log (`Salvando a base de dados de atividades do usuário no armazenamento local do navegador`);
            localStorage.atividadesUsuario = JSON.stringify(this.atividadesUsuario);            

        }else{            
            
            console.log (`Carregando base de dados de atividades do usuário do armazenamento local`);
            this.atividadesUsuario = JSON.parse(localStorage.atividadesUsuario);            
        }
    }



    salvarAtividadeUsuario(atividade){

        console.log (`Salvando competencia do usuário na base de dados local do navegador`);
        this.atividadesUsuario[atividade.id] = atividade;
        localStorage.atividadesUsuario = JSON.stringify(this.atividadesUsuario);
    }

}