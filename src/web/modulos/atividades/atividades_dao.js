import { UsuarioDAO } from '../pessoas/usuario_dao.js';



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

        let cpf = UsuarioDAO.getInstance().usuario.cpf;
        this.idBaseAtividades = `atividades_${cpf}`;

        //A primeira vez que roda pega os dados do javascript, depois usa o localStorage para guardas as mudanças
        if (!localStorage[this.idBaseAtividades]){

            console.log (`Base de dados de atividades do usuário não encontrada`);

            //Cria o modelo do usuário para guardar suas atividades realizadas
            this.atividadesUsuario = {};

            console.log (`Salvando a base de dados de atividades do usuário no armazenamento local do navegador`);
            localStorage[this.idBaseAtividades] = JSON.stringify(this.atividadesUsuario);

        }else{            
            
            console.log (`Carregando base de dados de atividades do usuário do armazenamento local`);
            this.atividadesUsuario = JSON.parse(localStorage[this.idBaseAtividades]);
        }
    }


    salvarBase(){
        console.log (`Salvando competencia do usuário na base de dados local do navegador`);
        localStorage.atividadesUsuario = JSON.stringify(this.atividadesUsuario);
    }



    salvarAtividadeUsuario(atividade){

        console.log (`Atualizando atividade do usuário`);
        this.atividadesUsuario[atividade.id] = atividade;
        this.salvarBase();
    }



    atualizarDuracaoAtividade(id, inicio, fim){

        console.log (`Atualizando atividade do usuário`);

        let atividade = this.atividadesUsuario[id];
        atividade.inicio = inicio;
        atividade.fim = fim;

        this.atividadesUsuario[id] = atividade;
        this.salvarBase();
    }



    removerAtividade(id){
        delete this.atividadesUsuario[id];
        this.salvarBase();
    }
}