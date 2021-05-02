import { CPF } from '../cpf/CPF.js';

export class UsuarioDAO {

    static instancia = undefined;

    static getInstance(){
        if (UsuarioDAO.instancia === undefined){
            UsuarioDAO.instancia = new UsuarioDAO();
        }
        return UsuarioDAO.instancia;
    }

    constructor(){
        this.carregarBaseUsuario();
    }

    carregarBaseUsuario(){

        if (localStorage["usuario"] == undefined){

            let cpf = undefined;
            let valido = false;
            do{
                cpf = prompt("Digite seu CPF:");
                valido = CPF.valido(cpf);
                if (!valido){
                    alert("Atenção: CPF digitado inválido!")
                }
            }while (!valido);

            this.usuario = {cpf:cpf};
            localStorage["usuario"] = JSON.stringify(this.usuario);
        }else{
            this.usuario = JSON.parse(localStorage["usuario"]);
        }
    }
}