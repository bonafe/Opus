import { UsuarioDAO } from './pessoas/usuario_dao.js';
import { AtividadesDAO } from "./atividades/atividades_dao.js";
import { ProcessosTrabalhoDAO } from "./processos_trabalho/processos_trabalho_dao.js";

export class OpusDAO{

    static VERSAO = 1;

    static instancia = undefined;



    static getInstance(){
        if (OpusDAO.instancia === undefined){
            OpusDAO.instancia = new OpusDAO();
        }
        return OpusDAO.instancia;
    }



    constructor(){
    }



    carregar(){

        let cpf = UsuarioDAO.getInstance().usuario.cpf;

        this.idBase = `opus_v${OpusDAO.VERSAO}_${cpf}`;

        //A primeira vez que roda pega os dados do javascript, depois usa o localStorage para guardas as mudanças
        if (!localStorage[this.idBase]){

            console.log (`Base de dados não encontrada`);
            console.log (`Inicializando base de dados com a base`);

            this.base = {
                processosTrabalho:{},
                competencias:{},
                atividades:{}
            };

            AtividadesDAO.getInstance().iniciarBase();
            ProcessosTrabalhoDAO.getInstance().iniciarBase();

            AtividadesDAO.getInstance().salvarBase();
            ProcessosTrabalhoDAO.getInstance().salvarBase();

            console.log (`Salvando a base de dados no armazenamento local do navegador`);
            localStorage[this.idBase] = JSON.stringify(this.base);

        }else{
            this.base = JSON.parse(localStorage[this.idBase]);

            AtividadesDAO.getInstance().carregarBase();
            ProcessosTrabalhoDAO.getInstance().carregarBase();
        }
    }



    salvar(){
        localStorage[this.idBase] = JSON.stringify(this.base);
    }
}