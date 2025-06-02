export interface DebitNoteMotivo {
  motivo: {
    razonModificacion: string;
    valorModificacion: string;
  };
}

export interface DebitNoteInfo {
  fechaEmision: string;
  tipoIdentificacionComprador: string;
  razonSocialComprador: string;
  identificacionComprador: string;
  totalSinImpuestos: string;
  valorTotal: string;
}

export interface DebitNoteTaxInfo {
  ruc: string;
  claveAcceso: string;
  secuencial: string;
}

export interface DebitNoteRequest {
  infoTributaria: DebitNoteTaxInfo;
  infoNotaDebito: DebitNoteInfo;
  motivos: DebitNoteMotivo[];
  infoAdicional?: Array<{ nombre: string; valor: string }>;
}

export interface CreateDebitNoteDTO {
  empresaId: string | any;
  clienteId: string | any;
  fechaEmision: Date;
  claveAcceso: string;
  secuencial: string;
  totalSinImpuestos: number;
  valorTotal: number;
}
