import { Router, Response } from 'express';
import { db } from '../datastore';
import { AuthRequest, authenticateUser, requireAdmin } from '../middleware/auth';
import { IComplaint } from '../types';

const router = Router();

// POST /api/complaints - Customer submits complaint
router.post('/', authenticateUser, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Please login to submit a complaint.' });

    const { title, description, bookingId, workerId } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Complaint title and description are required.' });
    }

    const newComplaint: IComplaint = {
      _id: 'cmp-' + Date.now(),
      id: 'cmp-' + Date.now(),
      customer: req.user.id,
      worker: workerId || undefined,
      booking: bookingId || undefined,
      title,
      description,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = db.createComplaint(newComplaint);
    return res.status(201).json({
      success: true,
      message: 'Your complaint has been submitted. Our support team will review it shortly.',
      complaint: db.populateComplaint(created),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit complaint.' });
  }
});

// GET /api/complaints/my - Customer views their complaints
router.get('/my', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  const complaints = db.getComplaints()
    .filter(c => {
      const cId = typeof c.customer === 'string' ? c.customer : (c.customer as any)._id;
      return cId === req.user!.id;
    })
    .map(c => db.populateComplaint(c));

  return res.json({ success: true, count: complaints.length, complaints });
});

// GET /api/complaints - Admin lists all complaints
router.get('/', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const complaints = db.getComplaints().map(c => db.populateComplaint(c));
    return res.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch complaints.' });
  }
});

// PUT /api/complaints/:id - Admin updates status / adds response
router.put('/:id', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { status, adminResponse } = req.body;
    const updated = db.updateComplaint(req.params.id, {
      ...(status && { status }),
      ...(adminResponse !== undefined && { adminResponse }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    return res.json({
      success: true,
      message: 'Complaint updated successfully.',
      complaint: db.populateComplaint(updated),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update complaint.' });
  }
});

export default router;
