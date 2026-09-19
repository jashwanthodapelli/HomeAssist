import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../datastore';
import { AuthRequest, authenticateUser } from '../middleware/auth';
import { IUser, IWorker } from '../types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'homeassist_super_secret_jwt_key_hackathon_2025';

const generateToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const assignedRole = role === 'worker' ? 'worker' : 'user';
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'usr-' + Date.now();

    const newUser: IUser = {
      _id: userId,
      id: userId,
      name,
      email: email.toLowerCase().trim(),
      phone,
      password: hashedPassword,
      role: assignedRole,
      status: 'Active',
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    let workerRecord: IWorker | null = null;
    if (assignedRole === 'worker') {
      const workerId = 'wrk-' + Date.now();
      workerRecord = {
        _id: workerId,
        id: workerId,
        user: userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        profession: req.body.profession || 'General Technician',
        services: req.body.services || ['Plumbing'],
        experience: Number(req.body.experience) || 1,
        skills: req.body.skills || ['General Repair'],
        about: req.body.about || 'Skilled local service professional ready to help.',
        serviceArea: req.body.serviceArea || 'Citywide',
        city: req.body.city || 'Bangalore',
        address: req.body.address || '',
        location: {
          lat: 12.9716,
          lng: 77.5946,
          addressText: req.body.city || 'Bangalore Central'
        },
        availability: 'Available',
        rating: 0,
        totalReviews: 0,
        completedJobs: 0,
        verificationStatus: 'Unverified',
        status: 'Pending', // New workers start as Pending approval!
        profileImage: newUser.profileImage,
        hourlyRate: Number(req.body.hourlyRate) || 300,
        joinedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.createWorker(workerRecord);
    }

    const token = generateToken(newUser);
    const safeUser = { ...newUser };
    delete safeUser.password;

    return res.status(201).json({
      success: true,
      message: assignedRole === 'worker' 
        ? 'Registration successful! Your worker profile is submitted for approval.' 
        : 'Registration successful! Welcome to HomeAssist.',
      token,
      user: safeUser,
      worker: workerRecord,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'Disabled') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const safeUser = { ...user };
    delete safeUser.password;

    let workerRecord = null;
    if (user.role === 'worker') {
      workerRecord = db.getWorkerByUserId(user._id);
    }

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser,
      worker: workerRecord,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  const safeUser = { ...user };
  delete safeUser.password;

  let workerRecord = null;
  if (user.role === 'worker') {
    workerRecord = db.getWorkerByUserId(user._id);
  }

  return res.json({
    success: true,
    user: safeUser,
    worker: workerRecord,
  });
});

// PUT /api/auth/profile
router.put('/profile', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
  
  const { name, phone, address, city, area, bio, profileImage } = req.body;
  const updated = db.updateUser(req.user.id, {
    ...(name && { name }),
    ...(phone && { phone }),
    ...(address !== undefined && { address }),
    ...(city !== undefined && { city }),
    ...(area !== undefined && { area }),
    ...(bio !== undefined && { bio }),
    ...(profileImage && { profileImage }),
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Also update worker name/phone/image if worker
  if (req.user.role === 'worker') {
    const worker = db.getWorkerByUserId(req.user.id);
    if (worker) {
      db.updateWorker(worker._id, {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(city && { city }),
        ...(profileImage && { profileImage }),
      });
    }
  }

  const safeUser = { ...updated };
  delete safeUser.password;

  return res.json({
    success: true,
    message: 'Profile updated successfully!',
    user: safeUser,
  });
});

// PUT /api/auth/password
router.put('/password', authenticateUser, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
  
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
  }

  const user = db.getUserById(req.user.id);
  if (!user || !user.password) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Incorrect current password.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  const hashedNew = await bcrypt.hash(newPassword, 10);
  db.updateUser(user._id, { password: hashedNew });

  return res.json({
    success: true,
    message: 'Password changed successfully.',
  });
});

export default router;
