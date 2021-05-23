import { UsuarioDAO } from '../pessoas/usuario_dao.js';
import { OpusDAO } from '../OpusDAO.js';


export class AtividadesDAO{



    static instancia = undefined;



    static getInstance(){
        if (AtividadesDAO.instancia === undefined){
            AtividadesDAO.instancia = new AtividadesDAO();
        }
        return AtividadesDAO.instancia;
    }



    constructor(){
    }


    iniciarBase(){

         console.log (`Base de dados de atividades do usuário não encontrada`);

        //Cria o modelo do usuário para guardar suas atividades realizadas
        this.atividadesUsuario = {};
    }

    carregarBase(){

        this.atividadesUsuario =  OpusDAO.getInstance().base["atividades"];
    }


    salvarBase(){
        console.log (`Salvando competencia do usuário na base de dados local do navegador`);
        OpusDAO.getInstance().base["atividades"] = this.atividadesUsuario;
        OpusDAO.getInstance().salvar();
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


    atualizarConteudo(id, conteudo){

        console.log (`Atualizando atividade do usuário`);

        let atividade = this.atividadesUsuario[id];
        atividade.conteudo = conteudo;

        this.atividadesUsuario[id] = atividade;
        this.salvarBase();

        return atividade;
    }


    removerAtividade(id){
        delete this.atividadesUsuario[id];
        this.salvarBase();
    }


    atividadesCSV(){
        const CABECALHO = ["id_competencia", "id_atividade", "inicio", "fim", "data_criacao", "conteudo"];
        let linhas = [CABECALHO.join(";")];
        Object.values(this.atividadesUsuario).forEach(atividade => linhas.push(this.atividadeCSV(atividade)));
        return linhas.join("\n");
    }


    atividadeCSV(atividade){
        return [atividade.competencia.id, atividade.id, atividade.inicio, atividade.fim, atividade.dataCriacao, atividade.conteudo].join(";");
    }
}