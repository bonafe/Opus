import pandas as pd
import json

pd.set_option('display.max_columns', None)

ds = pd.read_csv('../../dados/2021_02_03-[Receita Federal do Brasil]-Lista de todas as competИncias e processos de trabalho atВ nбvel 2.csv')
dsAtivos = ds[(ds["DesativacaoMacroprocesso"].isna()) & (ds["dsMacroprocesso"].notna())]
dsAtivos['idSubProcesso'] = dsAtivos['idSubProcesso'].astype(int)

print(dsAtivos.columns.values)

json_pt = {
    "processos_trabalho": {},
    "competencias": {}
}

def criarNo(id, titulo):
    print (f'{id}---{titulo}')
    return {
        "id": id,
        "titulo": titulo,
        "filhos": {}
    }


for indice, linha in dsAtivos.iterrows():

    processos_trabalho = json_pt["processos_trabalho"]
    competencias = json_pt["competencias"]

    #Recupera ou cria o Macroprocesso
    if not linha["idMacroprocesso"] in processos_trabalho:
        macroProcesso = processos_trabalho[linha["idMacroprocesso"]] = criarNo(linha["idMacroprocesso"], linha["titMacroprocesso"])
        macroProcesso["sigla"] = linha["siglaMacroprocesso"]
        macroProcesso["uaGestora"] = linha["uaGestoraProcesso"]
    macroProcesso = processos_trabalho[linha["idMacroprocesso"]]

    if (linha["idMacroprocesso"] == linha["idProcesso"]):
        print ('!!!!!!!!!!!! mesmo id processo')

    # Recupera ou cria o Processo
    if not linha["idProcesso"] in macroProcesso["filhos"]:
        macroProcesso["filhos"][linha["idProcesso"]] = criarNo(linha["idProcesso"], linha["titProcesso"])
    processo = macroProcesso["filhos"][linha["idProcesso"]]

    noCompetencia = None

    if (processo.get("id") == linha["idSubProcesso"]):

        #se o processo possui mesmo id que o subprocesso é porque a competência está relacionada com o processo
        noCompetencia = processo
    else:
        # Recupera ou cria o Subprocesso
        if not linha["idSubProcesso"] in processo["filhos"]:
            processo["filhos"][linha["idSubProcesso"]] = criarNo(linha["idSubProcesso"], linha["titSubProcesso"])
        subprocesso = processo["filhos"][linha["idSubProcesso"]]
        noCompetencia = subprocesso

    # cria lista de competências no nó se não existir
    if (noCompetencia.get("competencias") == None):
        noCompetencia["competencias"] = []

    # Cada linha é um relacionamento entre competência e subprocesso/processo
    idCompetencia = "_" + str(linha["idCompetencia"])
    noCompetencia["competencias"].append(idCompetencia)

    # Atualiza a lista de compet~encias
    if not idCompetencia in competencias:

        competencia = {
            "id": idCompetencia,
            "descricao": linha["dsCompetencia"],
            "titulo": linha["titCompetencia"],
            "tipo":  linha["tipoCompetencia"]
        }
        competencias[idCompetencia] = competencia



with open('../web/modulos/processos_trabalho/base/2021_05_02_processos_trabalho_rfb.json', 'w') as arquivoJSON:
    json.dump(json_pt, arquivoJSON)
