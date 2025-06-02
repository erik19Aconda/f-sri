import { create } from 'xmlbuilder2';
import { IIssuingCompany } from '../models/IssuingCompany';
import { IClient } from '../models/Client';
import { DebitNoteRequest } from '../interfaces/debitNote.interface';

export function generarXMLNotaDebito(
  nota: DebitNoteRequest,
  empresa: IIssuingCompany,
  cliente: IClient,
  claveAcceso: string,
  secuencial: string,
): string {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('notaDebito', { id: 'comprobante', version: '1.0.0' })
    .ele('infoTributaria')
    .ele('ambiente')
    .txt(String(empresa.tipo_ambiente))
    .up()
    .ele('tipoEmision')
    .txt(String(empresa.tipo_emision))
    .up()
    .ele('razonSocial')
    .txt(empresa.razon_social)
    .up()
    .ele('nombreComercial')
    .txt(empresa.nombre_comercial)
    .up()
    .ele('ruc')
    .txt(empresa.ruc)
    .up()
    .ele('claveAcceso')
    .txt(claveAcceso)
    .up()
    .ele('codDoc')
    .txt('05')
    .up()
    .ele('estab')
    .txt(empresa.codigo_establecimiento)
    .up()
    .ele('ptoEmi')
    .txt(empresa.punto_emision)
    .up()
    .ele('secuencial')
    .txt(secuencial)
    .up()
    .ele('dirMatriz')
    .txt(empresa.direccion_matriz || empresa.direccion || 'Dirección no especificada')
    .up()
    .up()
    .ele('infoNotaDebito')
    .ele('fechaEmision')
    .txt(nota.infoNotaDebito.fechaEmision)
    .up()
    .ele('dirEstablecimiento')
    .txt(empresa.direccion_establecimiento || empresa.direccion || 'Dirección no especificada')
    .up()
    .ele('tipoIdentificacionComprador')
    .txt(nota.infoNotaDebito.tipoIdentificacionComprador)
    .up()
    .ele('razonSocialComprador')
    .txt(nota.infoNotaDebito.razonSocialComprador)
    .up()
    .ele('identificacionComprador')
    .txt(nota.infoNotaDebito.identificacionComprador)
    .up()
    .ele('totalSinImpuestos')
    .txt(nota.infoNotaDebito.totalSinImpuestos)
    .up()
    .ele('valorTotal')
    .txt(nota.infoNotaDebito.valorTotal)
    .up()
    .up()
    .ele('motivos');

  for (const mot of nota.motivos) {
    const m = mot.motivo;
    doc.ele('motivo').ele('razon').txt(m.razonModificacion).up().ele('valor').txt(m.valorModificacion).up().up();
  }

  if (nota['infoAdicional'] && Array.isArray((nota as any).infoAdicional)) {
    doc.up().ele('infoAdicional');
    for (const campo of (nota as any).infoAdicional) {
      doc.ele('campoAdicional', { nombre: campo.nombre }).txt(campo.valor).up();
    }
  }

  return doc.end({ prettyPrint: true });
}
