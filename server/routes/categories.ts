import { Router, Request, Response } from 'express';
import { db } from '../datastore';
import { AuthRequest, requireAdmin, authenticateUser } from '../middleware/auth';
import { ICategory } from '../types';

const router = Router();

// GET /api/categories - Public
router.get('/', (req: Request, res: Response) => {
  try {
    const categories = db.getCategories();
    // Add worker count for each category
    const workers = db.getWorkers().filter(w => w.status === 'Approved');
    const enriched = categories.map(cat => {
      const count = workers.filter(w => 
        w.services.some(s => s.toLowerCase() === cat.name.toLowerCase()) ||
        w.profession.toLowerCase().includes(cat.name.toLowerCase())
      ).length;
      return { ...cat, workerCount: count };
    });

    return res.json({ success: true, categories: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

// POST /api/categories - Admin
router.post('/', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, description, icon, image, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const newCat: ICategory = {
      _id: 'cat-' + Date.now(),
      name,
      description: description || '',
      icon: icon || 'Wrench',
      image: image || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
      status: status || 'Active',
      createdAt: new Date().toISOString(),
    };

    const created = db.createCategory(newCat);
    return res.status(201).json({ success: true, message: 'Category added successfully.', category: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
});

// PUT /api/categories/:id - Admin
router.put('/:id', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, description, icon, image, status } = req.body;
    const updated = db.updateCategory(req.params.id, {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(icon && { icon }),
      ...(image && { image }),
      ...(status && { status }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.json({ success: true, message: 'Category updated.', category: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
});

// DELETE /api/categories/:id - Admin
router.delete('/:id', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const deleted = db.deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    return res.json({ success: true, message: 'Category removed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
});

export default router;
