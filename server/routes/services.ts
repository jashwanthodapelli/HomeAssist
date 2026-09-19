import { Router, Request, Response } from 'express';
import { db } from '../datastore';
import { AuthRequest, requireAdmin, authenticateUser } from '../middleware/auth';
import { IService } from '../types';

const router = Router();

// GET /api/services - Public
router.get('/', (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let services = db.getServices();

    if (category && typeof category === 'string' && category !== 'All') {
      services = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    // Add available workers count for each service
    const workers = db.getWorkers().filter(w => w.status === 'Approved');
    const enriched = services.map(s => {
      const count = workers.filter(w => 
        w.services.some(srv => srv.toLowerCase() === s.category.toLowerCase())
      ).length;
      return { ...s, availableWorkers: count };
    });

    return res.json({ success: true, services: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch services.' });
  }
});

// POST /api/services - Admin
router.post('/', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, category, description, basePrice, status } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and category are required.' });
    }

    const newService: IService = {
      _id: 'srv-' + Date.now(),
      name,
      category,
      description: description || '',
      basePrice: Number(basePrice) || 299,
      status: status || 'Active',
      createdAt: new Date().toISOString(),
    };

    const created = db.createService(newService);
    return res.status(201).json({ success: true, message: 'Service added successfully.', service: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
});

// PUT /api/services/:id - Admin
router.put('/:id', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, category, description, basePrice, status } = req.body;
    const updated = db.updateService(req.params.id, {
      ...(name && { name }),
      ...(category && { category }),
      ...(description !== undefined && { description }),
      ...(basePrice !== undefined && { basePrice: Number(basePrice) }),
      ...(status && { status }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    return res.json({ success: true, message: 'Service updated.', service: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
});

// DELETE /api/services/:id - Admin
router.delete('/:id', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const deleted = db.deleteService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    return res.json({ success: true, message: 'Service deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete service.' });
  }
});

export default router;
