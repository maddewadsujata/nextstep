import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserModel } from '../models/User.ts';
import { InternshipModel } from '../models/Internship.ts';
import { StudentModel } from '../models/Student.ts';
import { CompanyModel } from '../models/Company.ts';
import { ApplicationModel } from '../models/Application.ts';
import { fallbackUsers, fallbackStorage, fallbackStudents, fallbackCompanies, fallbackApplications } from '../db.ts';
import { requireRole } from '../middleware/auth.ts';

const router = Router();

// Strictly guard ALL admin routes with Admin authorization
router.use(requireRole(['admin']));

// 1. GET /api/admin/overview — Statistics
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const [totalStudents, totalRecruiters, totalInternships, totalApplications, totalUsers] = await Promise.all([
        UserModel.countDocuments({ role: 'student' }),
        UserModel.countDocuments({ role: 'recruiter' }),
        InternshipModel.countDocuments(),
        ApplicationModel.countDocuments(),
        UserModel.countDocuments(),
      ]);

      res.json({
        success: true,
        source: 'mongodb',
        stats: {
          totalStudents,
          totalRecruiters,
          totalInternships,
          totalApplications,
          totalUsers,
        },
      });
      return;
    }

    const totalStudents = fallbackUsers.filter(u => u.role === 'student').length;
    const totalRecruiters = fallbackUsers.filter(u => u.role === 'recruiter').length;
    const totalInternships = fallbackStorage.length;
    const totalApplications = fallbackApplications.length;

    res.json({
      success: true,
      source: 'memory_fallback',
      stats: {
        totalStudents,
        totalRecruiters,
        totalInternships,
        totalApplications,
        totalUsers: fallbackUsers.length,
      },
    });
  } catch (err: unknown) {
    console.error('Admin overview error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve admin analytics',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 2. GET /api/admin/users — List all users (Students, Recruiters, Admins)
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const query: Record<string, unknown> = {};
      if (role && typeof role === 'string') query.role = role;
      const users = await UserModel.find(query, '-passwordHash').sort({ createdAt: -1 });
      res.json({ success: true, count: users.length, users });
      return;
    }

    let list = fallbackUsers.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      avatarUrl: u.avatarUrl,
      isDemo: u.isDemo,
      createdAt: u.createdAt,
    }));

    if (role && typeof role === 'string') {
      list = list.filter(u => u.role === role);
    }

    res.json({ success: true, count: list.length, users: list });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: 'Failed to list users' });
  }
});

// 3. PUT /api/admin/users/:id/status — Suspend or Activate user
router.put('/users/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      res.status(400).json({ success: false, error: 'Status must be active or suspended.' });
      return;
    }

    const isLive = mongoose.connection.readyState === 1;
    if (isLive) {
      const updated = await UserModel.findByIdAndUpdate(id, { status }, { new: true });
      if (!updated) {
        res.status(404).json({ success: false, error: 'User not found in MongoDB' });
        return;
      }
      res.json({ success: true, message: `User status changed to ${status}`, user: updated });
      return;
    }

    const idx = fallbackUsers.findIndex(u => u._id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    fallbackUsers[idx].status = status;
    res.json({ success: true, message: `User status changed to ${status}`, user: fallbackUsers[idx] });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
});

// 4. DELETE /api/admin/users/:id — Delete user
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const deleted = await UserModel.findByIdAndDelete(id);
      if (!deleted) {
        // Also try by userId if custom ID
        const deletedCustom = await UserModel.findOneAndDelete({ _id: id });
        if (!deletedCustom) {
          res.status(404).json({ success: false, error: 'User not found in MongoDB' });
          return;
        }
      }
      res.json({ success: true, message: 'User permanently deleted from database', deletedId: id });
      return;
    }

    const idx = fallbackUsers.findIndex(u => u._id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: 'User not found in store' });
      return;
    }

    const [removed] = fallbackUsers.splice(idx, 1);
    res.json({ success: true, message: `User "${removed.name}" deleted successfully`, deletedId: id });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

export default router;

