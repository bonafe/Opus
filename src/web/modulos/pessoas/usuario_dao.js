export class UsuarioDAO {

    static instancia = undefined;

    static getInstance(){
        if (UsuarioDAO.instancia === undefined){
            UsuarioDAO.instancia = new ProcessosTrabalhoDAO();
        }
        return UsuarioDAO.instancia;
    }

    constructor(){
        this.usuario = {cpf:"00000000000"};
    }
}