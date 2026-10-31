import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';
import * as c from '../controllers/app.controller.js';

const api = Router();

api.get('/health', (_req, res) => res.json({ ok: true }));
api.post('/session', c.createSession);

api.use(requireUser);
api.get('/state', c.getState);
api.post('/restaurant/select', c.selectRestaurant);
api.post('/rooms/join', c.join);
api.post('/prefs', c.savePrefs);
api.post('/cart/add', c.addToCart);
api.post('/cart/qty', c.updateQty);
api.post('/cart/eat', c.toggleEater);
api.get('/agent', c.getAgent);
api.post('/agent/accept', c.acceptAgent);
api.post('/order/place', c.placeOrder);
api.post('/paid', c.confirmPaid);
api.post('/ledger/settle', c.settleLedger);

export default api;
