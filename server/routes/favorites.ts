import { Router, Response } from 'express';
import { db } from '../datastore';
import { AuthRequest, authenticateUser } from '../middleware/auth';

const router = Router();

// GET /api/favorites - Customer's saved workers
router.get('/', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Please login to view favorites.' });

  const favs = db.getFavorites(req.user.id);
  const workers = favs
    .map(f => db.getWorkerById(f.worker))
    .filter(Boolean)
    .map(w => ({
      ...w,
      isFavorite: true,
    }));

  return res.json({ success: true, count: workers.length, workers });
});

// POST /api/favorites/:workerId - Toggle favorite
router.post('/:workerId', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Please login to save favorites.' });

  const worker = db.getWorkerById(req.params.workerId);
  if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

  const result = db.toggleFavorite(req.user.id, worker._id);
  return res.json({
    success: true,
    isFavorite: result.isFavorite,
    message: result.isFavorite ? 'Worker saved to your favorites!' : 'Worker removed from favorites.',
  });
});

export default router;
