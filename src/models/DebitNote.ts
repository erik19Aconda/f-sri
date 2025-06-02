import { Schema, model, Document, Types } from 'mongoose';

export interface IDebitNote extends Document {
  empresa_emisora_id: Types.ObjectId;
  cliente_id: Types.ObjectId;
  fecha_emision: Date;
  clave_acceso: string;
  secuencial: string;
  estado: string;
  total_sin_impuestos: number;
  valor_total: number;
  xml: string;
  xml_firmado: string;
  sri_estado?: string;
  sri_mensajes?: any;
  sri_fecha_envio?: Date;
  sri_fecha_respuesta?: Date;
  datos_originales?: string;
}

const schema = new Schema<IDebitNote>({
  empresa_emisora_id: { type: Schema.Types.ObjectId, ref: 'IssuingCompany', required: true },
  cliente_id: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  fecha_emision: { type: Date, required: true },
  clave_acceso: { type: String, required: true },
  secuencial: { type: String, required: true },
  estado: { type: String, required: true },
  total_sin_impuestos: { type: Number, required: true },
  valor_total: { type: Number, required: true },
  xml: { type: String },
  xml_firmado: { type: String },
  sri_estado: { type: String },
  sri_mensajes: { type: Schema.Types.Mixed },
  sri_fecha_envio: { type: Date },
  sri_fecha_respuesta: { type: Date },
  datos_originales: { type: String },
});

export default model<IDebitNote>('DebitNote', schema);
