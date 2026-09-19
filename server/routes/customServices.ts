import { Router, Response } from 'express';
import { db } from '../datastore';
import { AuthRequest, authenticateUser, requireAdmin } from '../middleware/auth';
import { ICustomServiceRequest } from '../types';

const router = Router();

// POST /api/custom-services - Customer requests Other/Custom Service
router.post('/', authenticateUser, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Please login to submit a custom service request.' });

    const { title, description, image, preferredDate, preferredTime, location } = req.body;

    if (!title || !description || !preferredDate || !preferredTime || !location || !location.address) {
      return res.status(400).json({ success: false, message: 'Please provide service title, problem description, date, time, and address.' });
    }

    const newRequest: ICustomServiceRequest = {
      _id: 'csr-' + Date.now(),
      id: 'csr-' + Date.now(),
      customer: req.user.id,
      title,
      description,
      image: image || '',
      preferredDate,
      preferredTime,
      location: {
        address: location.address,
        city: location.city || 'Bangalore',
        area: location.area || 'City Area',
      },
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = db.createCustomService(newRequest);
    return res.status(201).json({
      success: true,
      message: 'Your custom service request has been submitted! Our admin team will review and assign a qualified professional.',
      customService: db.populateCustomService(created),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit custom service request.' });
  }
});

// GET /api/custom-services/my - Customer requests
router.get('/my', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  const list = db.getCustomServices()
    .filter(cs => {
      const cId = typeof cs.customer === 'string' ? cs.customer : (cs.customer as any)._id;
      return cId === req.user!.id;
    })
    .map(cs => db.populateCustomService(cs));

  return res.json({ success: true, count: list.length, customServices: list, requests: list });
});

// GET /api/custom-services - Admin
router.get('/', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const list = db.getCustomServices().map(cs => db.populateCustomService(cs));
    return res.json({ success: true, count: list.length, customServices: list, requests: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch custom services.' });
  }
});

// PUT /api/custom-services/:id - Admin review (Approve, Reject, Convert)
router.put('/:id', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { status, adminNotes, convertToCategory, basePrice } = req.body;
    const existing = db.getCustomServiceById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // If admin wants to convert it into a standard category/service
    if (convertToCategory) {
      // Check if service exists or create it
      const categoryName = req.body.categoryName || 'General Services';
      db.createService({
        _id: 'srv-' + Date.now(),
        name: existing.title,
        category: categoryName,
        description: existing.description,
        basePrice: Number(basePrice) || 399,
        status: 'Active',
        createdAt: new Date().toISOString(),
      });
    }

    const updated = db.updateCustomService(req.params.id, {
      ...(status && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
    });

    return res.json({
      success: true,
      message: `Custom service request marked as ${status}.`,
      customService: db.populateCustomService(updated!),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update custom service request.' });
  }
});

export default router;
