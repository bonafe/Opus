
class TabelaProcessosTrabalho{

    constructor(dados){
        this.dados = dados;
        this.processosTrabalho = this.transformarDadosProcessosTrabalho(this.dados);
        this.desenharTabulator();
    }

    transformarDadosProcessosTrabalho(dados){
        let lista = Object.values(dados.processos_trabalho);
        lista.map(function transformar(pt){
            pt.filhos = Object.values(pt.filhos);
            pt.filhos.map(transformar, this);
            if (pt.competencias !== undefined){
                pt.competencias.forEach(idCompetencia =>{
                    pt.filhos.push(this.dados.competencias[idCompetencia]);
                });
            }
            return pt;
        },this);        
        return lista;
    }

    desenharTabulator(){
        this.tabela = new Tabulator("#divTabelaPT", {
            dataTree:true,
            dataTreeChildField:"filhos",
            height:700,
            data:this.processosTrabalho,
            layout:"fitColumns",
            columns:[                
                {title:"Processos de Trabalho", field:"titulo"}                
            ]
        });
    }
}
