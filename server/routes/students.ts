import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { StudentModel } from '../models/Student.ts';
import { fallbackStudents, SimulatedStudent } from '../db.ts';

const router = Router();

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// 1. GET /api/students — Get all student profiles
router.get('/students', async (_req: Request, res: Response) => {
  try {
    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const students = await StudentModel.find().sort({ createdAt: -1 });
      res.json({
        success: true,
        source: 'mongodb',
        count: students.length,
        data: students,
      });
      return;
    }

    res.json({
      success: true,
      source: 'memory_fallback',
      count: fallbackStudents.length,
      data: fallbackStudents,
    });
  } catch (err: unknown) {
    console.error('Error fetching students:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve student profiles',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 2. GET /api/students/:id — Get one student profile (by Mongo ObjectId or userId)
router.get('/students/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      let student = null;
      if (isValidObjectId(id)) {
        student = await StudentModel.findById(id);
      }
      if (!student) {
        student = await StudentModel.findOne({ userId: id });
      }

      if (!student) {
        res.status(404).json({ success: false, error: 'Student record not found in MongoDB' });
        return;
      }

      res.json({ success: true, source: 'mongodb', data: student });
      return;
    }

    const student = fallbackStudents.find(s => s._id === id || s.userId === id);
    if (!student) {
      res.status(404).json({ success: false, error: 'Student record not found' });
      return;
    }

    res.json({ success: true, source: 'memory_fallback', data: student });
  } catch (err: unknown) {
    console.error('Error fetching student:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student record',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 3. POST /api/students — Create student record
router.post('/students', async (req: Request, res: Response) => {
  try {
    const { userId, fullName, email, college, degree, branch, graduationYear, cgpa, skills, preferredRoles } = req.body;

    if (!userId || !fullName || !email) {
      res.status(400).json({ success: false, error: 'userId, fullName, and email are required fields' });
      return;
    }

    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const student = await StudentModel.create({
        userId,
        fullName,
        email,
        college: college || 'PICT Pune',
        degree: degree || 'B.Tech',
        branch: branch || 'Computer Science',
        graduationYear: graduationYear || '2026',
        cgpa: cgpa || '9.0',
        skills: Array.isArray(skills) ? skills : ['React', 'Node.js', 'MongoDB'],
        preferredRoles: Array.isArray(preferredRoles) ? preferredRoles : ['Software Engineer Intern'],
      });

      res.status(201).json({
        success: true,
        message: 'Student record created in MongoDB',
        source: 'mongodb',
        data: student,
      });
      return;
    }

    const newSimulated: SimulatedStudent = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      userId,
      fullName,
      email,
      college: college || 'PICT Pune',
      degree: degree || 'B.Tech',
      branch: branch || 'Computer Science',
      graduationYear: graduationYear || '2026',
      cgpa: cgpa || '9.0',
      skills: Array.isArray(skills) ? skills : ['React', 'Node.js', 'MongoDB'],
      preferredRoles: Array.isArray(preferredRoles) ? preferredRoles : ['Software Engineer Intern'],
      preferredLocations: ['Remote', 'Pune'],
      remotePreference: 'Flexible',
      resumeName: 'Resume.pdf',
      experienceLevel: 'Student',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fallbackStudents.unshift(newSimulated);

    res.status(201).json({
      success: true,
      message: 'Student record created (Fallback Store)',
      source: 'memory_fallback',
      data: newSimulated,
    });
  } catch (err: unknown) {
    console.error('Error creating student:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create student record',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 4. PUT /api/students/:id — Update student profile
router.put('/students/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      let updated = null;
      if (isValidObjectId(id)) {
        updated = await StudentModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
      }
      if (!updated) {
        updated = await StudentModel.findOneAndUpdate({ userId: id }, { ...updates, updatedAt: new Date() }, { new: true });
      }

      if (!updated) {
        res.status(404).json({ success: false, error: 'Student record not found in MongoDB' });
        return;
      }

      res.json({
        success: true,
        message: 'Student profile updated in MongoDB',
        source: 'mongodb',
        data: updated,
      });
      return;
    }

    const index = fallbackStudents.findIndex(s => s._id === id || s.userId === id);
    if (index === -1) {
      res.status(404).json({ success: false, error: 'Student record not found' });
      return;
    }

    fallbackStudents[index] = {
      ...fallbackStudents[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: 'Student profile updated (Fallback Store)',
      source: 'memory_fallback',
      data: fallbackStudents[index],
    });
  } catch (err: unknown) {
    console.error('Error updating student profile:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update student profile',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
