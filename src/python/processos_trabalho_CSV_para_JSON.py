import pandas as pd
import json

pd.set_option('display.max_columns', None)

ds = pd.read_csv('../../dados/2021_02_03-[Receita Federal do Brasil]-Lista de todas as competИncias e processos de trabalho atВ nбvel 2.csv')
dsAtivos = ds[(ds["DesativacaoMacroprocesso"].isna()) & (ds["dsMacroprocesso"].notna())]

print(dsAtivos.columns.values)

json_pt = {
    "processos_trabalho": {},
    "competencias": {}
}

def criarNo(id, titulo, descricao):
    return {
        "id": id,
        "titulo": titulo,
        "descricao": descricao,
        "filhos": {}
    }


for indice, linha in dsAtivos.iterrows():

    processos_trabalho = json_pt["processos_trabalho"]
    competencias = json_pt["competencias"]

    if not linha["idMacroprocesso"] in processos_trabalho:
        processos_trabalho[linha["idMacroprocesso"]] = criarNo(linha["idMacroprocesso"], linha["titMacroprocesso"], linha["dsMacroprocesso"])
    macroProcesso = processos_trabalho[linha["idMacroprocesso"]]

    if linha["idProcesso"] != linha["idMacroprocesso"]:
        if not linha["idProcesso"] in macroProcesso["filhos"]:
            macroProcesso["filhos"][linha["idProcesso"]] = criarNo(linha["idProcesso"], linha["titProcesso"], linha["dsProcesso"])
        processo = macroProcesso["filhos"][linha["idProcesso"]]

        if linha["idSubProcesso"] != linha["idProcesso"]:
            if not linha["idSubProcesso"] in processo["filhos"]:
                processo["filhos"][linha["idSubProcesso"]] = criarNo(linha["idSubProcesso"], linha["titSubProcesso"], linha["dsSubProcesso"])
                processo["filhos"][linha["idSubProcesso"]]["competencias"] = []

            subprocesso = processo["filhos"][linha["idSubProcesso"]]

            idCompetencia = "_" + str(linha["idCompetencia"])

            subprocesso["competencias"].append(idCompetencia)

            if not idCompetencia in competencias:

                competencia = {
                    "id": idCompetencia,
                    "titulo": linha["dsCompetencia"],
                    "descricao": linha["titCompetencia"],
                    "tipo":  linha["tipoCompetencia"]
                }
                competencias[idCompetencia] = competencia

with open('../web/processos_trabalho_rfb.json', 'w') as arquivoJSON:
    json.dump(json_pt, arquivoJSON)
