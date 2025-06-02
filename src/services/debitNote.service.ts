import { DebitNoteRequest, CreateDebitNoteDTO } from '../interfaces/debitNote.interface';
import { convertirFecha, generarClaveAcceso } from '../utils/invoice.utils';
import { generarXMLNotaDebito } from '../utils/debitNote.xml.utils';
import { firmarXML } from '../utils/firma.utils';
import DebitNote from '../models/DebitNote';
import IssuingCompany from '../models/IssuingCompany';
import Client from '../models/Client';
import { InvoiceService } from './invoice.service';
import fs from 'fs';

export class DebitNoteService {
  static validarDatosNotaDebito(data: DebitNoteRequest): boolean {
    return !!(data.infoTributaria && data.infoNotaDebito && data.motivos);
  }

  static async generarSecuencial(rucCompany: string): Promise<string> {
    const empresa = await IssuingCompany.findOne({ ruc: rucCompany });
    if (!empresa) {
      throw new Error(`Empresa with RUC ${rucCompany} not found`);
    }

    const ultima = await DebitNote.findOne({ empresa_emisora_id: empresa._id }).sort({ secuencial: -1 });
    let sec = '000000001';
    if (ultima) {
      const siguiente = parseInt(ultima.secuencial) + 1;
      sec = siguiente.toString().padStart(9, '0');
    }
    return sec;
  }

  static async crearNotaDebito(datos: CreateDebitNoteDTO) {
    const nota = new DebitNote({
      empresa_emisora_id: datos.empresaId,
      cliente_id: datos.clienteId,
      fecha_emision: datos.fechaEmision,
      clave_acceso: datos.claveAcceso,
      secuencial: datos.secuencial,
      estado: 'CREADA',
      total_sin_impuestos: datos.totalSinImpuestos,
      valor_total: datos.valorTotal,
    });
    await nota.save();
    return nota;
  }

  static async crearNotaDebitoCompleta(datos: DebitNoteRequest) {
    if (!this.validarDatosNotaDebito(datos)) {
      throw new Error('Datos de nota de débito inválidos o incompletos');
    }

    const tipoIdent = await InvoiceService.buscarTipoIdentificacion(datos.infoNotaDebito.tipoIdentificacionComprador);
    if (!tipoIdent) {
      throw new Error('Identification type not found');
    }

    const empresa = await InvoiceService.buscarIssuingCompany(datos.infoTributaria.ruc);
    if (!empresa) {
      throw new Error('Empresa emisora no encontrada');
    }

    const cliente = await InvoiceService.buscarClient(datos.infoNotaDebito.identificacionComprador);
    if (!cliente) {
      throw new Error('Client not found');
    }

    const secuencial = await this.generarSecuencial(empresa.ruc);
    const fechaEmision = convertirFecha(datos.infoNotaDebito.fechaEmision);
    if (isNaN(fechaEmision.getTime())) {
      throw new Error('Invalid date format');
    }

    const serie = `${empresa.codigo_establecimiento}${empresa.punto_emision}`;
    const claveAcceso = generarClaveAcceso({
      fecha: fechaEmision,
      tipoComprobante: '05',
      ruc: empresa.ruc,
      ambiente: empresa.tipo_ambiente.toString(),
      serie,
      secuencial,
      codigoNumerico: Math.floor(10000000 + Math.random() * 89999999).toString(),
      tipoEmision: empresa.tipo_emision.toString(),
    });

    const xml = generarXMLNotaDebito(datos, empresa, cliente, claveAcceso, secuencial);

    const notaCreada = await this.crearNotaDebito({
      empresaId: empresa._id,
      clienteId: cliente._id,
      fechaEmision: fechaEmision,
      claveAcceso,
      secuencial,
      totalSinImpuestos: parseFloat(datos.infoNotaDebito.totalSinImpuestos),
      valorTotal: parseFloat(datos.infoNotaDebito.valorTotal),
    });

    notaCreada.xml = xml;
    notaCreada.sri_estado = 'PENDIENTE';
    notaCreada.datos_originales = JSON.stringify(datos);
    await notaCreada.save();

    if (empresa.certificatePath && fs.existsSync(empresa.certificatePath)) {
      try {
        const xmlFirmado = await firmarXML(notaCreada.xml, empresa.certificatePath, empresa.certificatePassword || '');
        notaCreada.xml_firmado = xmlFirmado;
        notaCreada.sri_estado = 'CREADA';
        await notaCreada.save();
      } catch (error: any) {
        notaCreada.sri_estado = 'ERROR_FIRMA';
        notaCreada.sri_mensajes = { error: error.message };
        await notaCreada.save();
      }
    }

    return {
      notaDebito: notaCreada,
      xml: notaCreada.xml,
      xml_firmado: notaCreada.xml_firmado || null,
    };
  }
}
