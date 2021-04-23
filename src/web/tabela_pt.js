
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
            pt.filhos.map(ptFilho => transformar(ptFilho));
            return pt;
        });
        return lista;
    }

    desenharTabulator(){
        this.tabela = new Tabulator("#divTabelaPT", {
            dataTree:true,
            dataTreeChildField:"filhos",
            height:205,
            data:this.processosTrabalho,
            layout:"fitColumns",
            columns:[
                {title:"id", field:"id"},
                {title:"titulo", field:"titulo"},
                {title:"descricao", field:"descricao"}
            ]
        });
    }
}
