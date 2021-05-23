import { base_processos_trabalho_rfb_02_05_2021 } from './base/2021_05_02_processos_trabalho_rfb.js';
import { UsuarioDAO } from '../pessoas/usuario_dao.js';
import { OpusDAO } from '../OpusDAO.js';

export class ProcessosTrabalhoDAO{



    static instancia = undefined;



    static getInstance(){
        if (ProcessosTrabalhoDAO.instancia === undefined){
            ProcessosTrabalhoDAO.instancia = new ProcessosTrabalhoDAO();
        }
        return ProcessosTrabalhoDAO.instancia;
    }



    constructor(){
    }



    iniciarBase(){

        console.log (`Inicializando base de dados com a base: base_processos_trabalho_rfb_23_04_2021`);

        this.processosTrabalho = base_processos_trabalho_rfb_02_05_2021.processos_trabalho;
        this.competencias = base_processos_trabalho_rfb_02_05_2021.competencias;
    }

    carregarBase(){

        this.processosTrabalho = OpusDAO.getInstance().base["processosTrabalho"];
        this.competencias = OpusDAO.getInstance().base["competencias"];
    }



    salvarBase(){
        OpusDAO.getInstance().base["competencias"] = this.competencias;
        OpusDAO.getInstance().base["processosTrabalho"] = this.processosTrabalho;
        OpusDAO.getInstance().salvar();
    }


    salvarCompetenciaUsuario(idProcessoTrabalho, competencia){

        console.log (`Salvando competencia do usuário na base de dados local do navegador`);
        this.competencias[competencia.id] = competencia;


        if (competencia.criadaPeloUsuario && (idProcessoTrabalho != -1)){
            console.log (`processo id: ${idProcessoTrabalho}`);
            let processoTrabalho = this.procurarProcessoTrabalho (idProcessoTrabalho, Object.values(this.processosTrabalho));
            if (processoTrabalho == null){
                alert("Atenção! Não foi possível salvar competencia: processo de trabalho não encontrado!")
            }else{
                console.log (`Salvando processo de trabalho com nova competencia na base de dados local do navegador`);

                let competenciaEncontrada = false;

                if (processoTrabalho.competencias === undefined){
                    processoTrabalho.competencias = [];
                }else{
                    competenciaEncontrada =  processoTrabalho.competencias.filter (idCompetenciaLista => idCompetenciaLista == competencia.id).length > 0;
                }

                if (!competenciaEncontrada){
                    processoTrabalho.competencias.push(competencia.id);

                }
            }
        }
        this.salvarBase();
    }

    procurarProcessoTrabalho (idProcessoTrabalho, processoTrabalho){

        if (Array.isArray(processoTrabalho)){

            for (let i = 0; i < processoTrabalho.length; i++){
                let processoTrabalhoEncontrado = this.procurarProcessoTrabalho (idProcessoTrabalho, processoTrabalho[i]);
                if (processoTrabalhoEncontrado !== null){
                    return processoTrabalhoEncontrado;
                }
            }

            return null;

        }else if (processoTrabalho.id == idProcessoTrabalho){

            return processoTrabalho;

        }else if (processoTrabalho.filhos[idProcessoTrabalho] !== undefined){

            return processoTrabalho.filhos[idProcessoTrabalho];

        }else{
            let filhos = Object.values(processoTrabalho.filhos);

            for (let i = 0; i < filhos.length; i++){
                let processoTrabalhoEncontrado = this.procurarProcessoTrabalho (idProcessoTrabalho, filhos[i]);
                if (processoTrabalhoEncontrado !== null){
                    return processoTrabalhoEncontrado;
                }
            }
            return null;
        }
    }



    processosTrabalhoCSV(){
        const CABECALHO = ["id_macroprocesso", "titulo_macroprocesso", "id_subprocesso", "titulo_subprocesso", "id_processo", "titulo_processo", "id_competencia", "titulo_competencia", "proficiencia", "afinidade", "tarefa", "criada_pelo_usuario"];
        let linhas = [CABECALHO.join(";")];


        Object.values(this.processosTrabalho).forEach(macroprocesso => {
            Object.values(macroprocesso.filhos).forEach(processo => {
                Object.values(processo.filhos).forEach(subprocesso => {
                    linhas = linhas.concat(this.competenciasCSV (macroprocesso, processo, subprocesso, subprocesso.competencias));
                });
                linhas = linhas.concat(this.competenciasCSV (macroprocesso, processo, null, processo.competencias));
            });
            linhas = linhas.concat(this.competenciasCSV (macroprocesso, null, null, macroprocesso.competencias));
        });
        return linhas.join("\n");
    }



    competenciasCSV (macroprocesso, processo, subprocesso, competencias){
        let competenciasCSV = [];
        if (competencias !== undefined){
            competencias.forEach(id_competencia => {
                competenciasCSV.push(this.competenciaCSV (macroprocesso, processo, subprocesso, this.competencias[id_competencia]));
            });
        }
        return competenciasCSV;
    }



    competenciaCSV (macroprocesso, processo, subprocesso, competencia){
        return [
            (macroprocesso !== null?macroprocesso.id:""),
            (macroprocesso !== null?macroprocesso.titulo:""),
            (processo !== null?processo.id:""),
            (processo !== null?processo.titulo:""),
            (subprocesso !== null?subprocesso.id:""),
            (subprocesso !== null?subprocesso.titulo:""),
            competencia.id,
            competencia.titulo,
            competencia.nivelProficiencia,
            competencia.nivelAfinidade,
            competencia.ativa,
            competencia.criadaPeloUsuario
        ].join(";");
    }
}