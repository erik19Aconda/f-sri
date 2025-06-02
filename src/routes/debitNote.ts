import { Router } from 'express';
import { DebitNoteService } from '../services/debitNote.service';
import DebitNote from '../models/DebitNote';

const router = Router();

router.post('/complete', async (req, res) => {
  try {
    if (!req.body.notaDebito) {
      return res.status(400).json({ success: false, message: 'Debit note data is required' });
    }

    const resultado = await DebitNoteService.crearNotaDebitoCompleta(req.body.notaDebito);

    return res.status(201).json({ success: true, data: resultado, xml: resultado.xml });
  } catch (err: any) {
    const validationErrors = [
      'Client not found',
      'Identification type not found',
      'Empresa emisora no encontrada',
      'Invalid date format',
      'Datos de nota de débito inválidos o incompletos',
    ];
    const isValidationError = validationErrors.some((e) => err.message.includes(e));
    if (isValidationError) {
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    const docs = await DebitNote.find();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
