import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { CustomerService, ProductService, OrderService } from './server/services/services';

const app = express();
const PORT = 3000;

// Instantiate backend clean services
const customerService = new CustomerService();
const productService = new ProductService();
const orderService = new OrderService();

// Support parsing json bodies
app.use(express.json());

// ----------------------------------------------------
// CLEAN CONTROLLER ROUTES (/api/*)
// ----------------------------------------------------

// CRM CUSTOMERS ENDPOINTS
app.get('/api/customers', async (req, res) => {
  try {
    const list = await customerService.list();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone } = req.body;
    const added = await customerService.create(companyName, contactPerson, email, phone);
    res.status(201).json(added);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const deleted = await customerService.delete(req.params.id);
    if (deleted) {
      res.json({ success: true, message: 'Customer deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Customer not found.' });
    }
  } catch (error: any) {
    res.status(550).json({ error: error.message });
  }
});

// WMS PHYSICAL CATALOGUE ENDPOINTS
app.get('/api/products', async (req, res) => {
  try {
    const list = await productService.list();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, sku, price, quantity } = req.body;
    const added = await productService.create(name, sku, Number(price), Number(quantity));
    res.status(201).json(added);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/products/:id/adjust', async (req, res) => {
  try {
    const { delta } = req.body;
    const updated = await productService.adjustStock(req.params.id, Number(delta));
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await productService.delete(req.params.id);
    if (deleted) {
      res.json({ success: true, message: 'Catalog SKU removed successfully.' });
    } else {
      res.status(404).json({ error: 'Product SKU was not found.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ERP ORDERS TICKETS ENDPOINTS
app.get('/api/orders', async (req, res) => {
  try {
    const list = await orderService.list();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, draftItems } = req.body;
    const order = await orderService.placeOrder(customerId, draftItems);
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await orderService.updateStatus(req.params.id, statusAddressNormalize(status));
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

function statusAddressNormalize(st: string): 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' {
  if (['PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].includes(st)) {
    return st as any;
  }
  return 'PENDING';
}

// ----------------------------------------------------
// VITE CLIENT INTEGRATION MIDDLEWARE
// ----------------------------------------------------
async function initializeServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Dynamic DEV Server utilizing Vite compilation middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite compilation middleware integrated.');
  } else {
    // Serving built production resources from /dist/
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static serving linked.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Enterprise System Server operational on host: http://localhost:${PORT}`);
  });
}

initializeServer().catch(err => {
  console.error('Failure booting Central Hub server:', err);
});
