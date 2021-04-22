import pandas as pd
import json

pd.set_option('display.max_columns', None)

ds = pd.read_csv('./dados/2021_02_03-[Receita Federal do Brasil]-Lista de todas as competИncias e processos de trabalho atВ nбvel 2.csv')
dsAtivos = ds[(ds["DesativacaoMacroprocesso"].isna()) & (ds["dsMacroprocesso"].notna())]

print(dsAtivos.columns.values)

json_pt = {}

def criarNo(id, titulo, descricao):
    return {
        "id": id,
        "titulo": titulo,
        "descricao": descricao,
        "filhos": {}
    }


for indice, linha in dsAtivos.iterrows():

    if not linha["titMacroprocesso"] in json_pt:
        json_pt[linha["titMacroprocesso"]] = criarNo(linha["idMacroprocesso"], linha["titMacroprocesso"], linha["dsMacroprocesso"])
    macroProcesso = json_pt[linha["titMacroprocesso"]]

    if linha["idProcesso"] != linha["idMacroprocesso"]:
        if not linha["titProcesso"] in macroProcesso["filhos"]:
            macroProcesso["filhos"][linha["titProcesso"]] = criarNo(linha["idProcesso"], linha["titProcesso"], linha["dsProcesso"])
        processo = macroProcesso["filhos"][linha["titProcesso"]]

        if linha["idSubProcesso"] != linha["idProcesso"]:
            if not linha["titSubProcesso"] in processo["filhos"]:
                processo["filhos"][linha["titSubProcesso"]] = criarNo(linha["idSubProcesso"], linha["titSubProcesso"], linha["dsSubProcesso"])


with open('processos_trabalho_rfb.json', 'w') as arquivoJSON:
    json.dump(json_pt, arquivoJSON)
