import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApplicationModel } from '../models/Application.ts';
import { fallbackApplications, SimulatedApplication } from '../db.ts';

const router = Router();

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// 1. GET /api/applications — Get all applications (optional filter by studentId or internshipId)
router.get('/applications', async (req: Request, res: Response) => {
  try {
    const { studentId, internshipId } = req.query;
    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const filter: Record<string, unknown> = {};
      if (studentId) filter.studentId = studentId;
      if (internshipId) filter.internshipId = internshipId;

      const records = await ApplicationModel.find(filter).sort({ createdAt: -1 });
      res.json({
        success: true,
        source: 'mongodb',
        count: records.length,
        data: records,
      });
      return;
    }

    let filtered = [...fallbackApplications];
    if (studentId) {
      filtered = filtered.filter(a => a.studentId === studentId);
    }
    if (internshipId) {
      filtered = filtered.filter(a => a.internshipId === internshipId);
    }

    res.json({
      success: true,
      source: 'memory_fallback',
      count: filtered.length,
      data: filtered,
    });
  } catch (err: unknown) {
    console.error('Error fetching applications:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve applications',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 2. GET /api/applications/:id — Get one application
router.get('/applications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        error: `Invalid MongoDB ObjectId: "${id}"`,
      });
      return;
    }

    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const record = await ApplicationModel.findById(id);
      if (!record) {
        res.status(404).json({ success: false, error: 'Application record not found in MongoDB' });
        return;
      }
      res.json({ success: true, source: 'mongodb', data: record });
      return;
    }

    const record = fallbackApplications.find(a => a._id === id);
    if (!record) {
      res.status(404).json({ success: false, error: 'Application record not found' });
      return;
    }

    res.json({ success: true, source: 'memory_fallback', data: record });
  } catch (err: unknown) {
    console.error('Error fetching application by ID:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch application',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 3. POST /api/applications — Submit an application
router.post('/applications', async (req: Request, res: Response) => {
  try {
    const {
      internshipId,
      internshipTitle,
      companyName,
      studentId,
      studentName,
      studentEmail,
      coverLetter,
    } = req.body;

    if (!internshipId || !studentId || !studentName) {
      res.status(400).json({
        success: false,
        error: 'internshipId, studentId, and studentName are required',
      });
      return;
    }

    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const newApp = await ApplicationModel.create({
        internshipId,
        internshipTitle: internshipTitle || 'Internship Position',
        companyName: companyName || 'Company',
        studentId,
        studentName,
        studentEmail: studentEmail || 'student@university.edu',
        status: 'applied',
        coverLetter: coverLetter || '',
        appliedAt: new Date(),
        history: [
          {
            status: 'applied',
            timestamp: new Date(),
            note: 'Application submitted successfully through NextStep.',
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Application recorded in MongoDB',
        source: 'mongodb',
        data: newApp,
      });
      return;
    }

    const newSimulated: SimulatedApplication = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      internshipId,
      internshipTitle: internshipTitle || 'Internship Position',
      companyName: companyName || 'Company',
      studentId,
      studentName,
      studentEmail: studentEmail || 'student@university.edu',
      status: 'applied',
      coverLetter: coverLetter || '',
      appliedAt: new Date().toISOString(),
      recruiterNotes: '',
      history: [
        {
          status: 'applied',
          timestamp: new Date().toISOString(),
          note: 'Application submitted successfully through NextStep.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fallbackApplications.unshift(newSimulated);

    res.status(201).json({
      success: true,
      message: 'Application created (Fallback Store)',
      source: 'memory_fallback',
      data: newSimulated,
    });
  } catch (err: unknown) {
    console.error('Error submitting application:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 4. PUT /api/applications/:id — Update application (e.g. status transition, recruiter notes, interview scheduling)
const handleUpdateApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, recruiterNotes, note, interviewDetails, offerDetails } = req.body;

    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      let existing = null;
      if (isValidObjectId(id)) {
        existing = await ApplicationModel.findById(id);
      }
      if (!existing) {
        existing = await ApplicationModel.findOne({ $or: [{ _id: id }, { id: id }] });
      }

      if (!existing) {
        // Check fallback store before 404
        const fallbackIdx = fallbackApplications.findIndex(a => a._id === id || (a as any).id === id);
        if (fallbackIdx !== -1) {
          const rec = fallbackApplications[fallbackIdx];
          if (status) rec.status = status;
          if (recruiterNotes !== undefined) rec.recruiterNotes = recruiterNotes;
          if (interviewDetails) (rec as any).interviewDetails = interviewDetails;
          if (offerDetails) (rec as any).offerDetails = offerDetails;
          rec.updatedAt = new Date().toISOString();
          res.json({ success: true, message: 'Application updated', source: 'memory_fallback', data: rec });
          return;
        }
        res.status(404).json({ success: false, error: 'Application record not found' });
        return;
      }

      if (status) existing.status = status;
      if (recruiterNotes !== undefined) existing.recruiterNotes = recruiterNotes;
      if (interviewDetails) existing.interviewDetails = interviewDetails;
      if (offerDetails) existing.offerDetails = offerDetails;

      if (status) {
        existing.history.push({
          status,
          timestamp: new Date(),
          note: note || `Status updated to ${status}`,
        });
      }

      const updated = await existing.save();

      res.json({
        success: true,
        message: 'Application updated in MongoDB',
        source: 'mongodb',
        data: updated,
      });
      return;
    }

    const index = fallbackApplications.findIndex(a => a._id === id);
    if (index === -1) {
      res.status(404).json({ success: false, error: 'Application record not found' });
      return;
    }

    const record = fallbackApplications[index];
    if (status) record.status = status;
    if (recruiterNotes !== undefined) record.recruiterNotes = recruiterNotes;
    if (status) {
      record.history.push({
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status}`,
      });
    }
    record.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Application updated (Fallback Store)',
      source: 'memory_fallback',
      data: record,
    });
  } catch (err: unknown) {
    console.error('Error updating application:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update application',
      details: err instanceof Error ? err.message : String(err),
    });
  }
};

// Mount PUT route under both router-relative and absolute paths
router.put('/applications/:id', handleUpdateApplication);
router.put('/api/applications/:id', handleUpdateApplication);

// 5. DELETE /api/applications/:id — Delete or withdraw application
router.delete('/applications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        error: `Invalid MongoDB ObjectId format: "${id}"`,
      });
      return;
    }

    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const deleted = await ApplicationModel.findByIdAndDelete(id);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Application record not found in MongoDB' });
        return;
      }
      res.json({
        success: true,
        message: 'Application deleted from MongoDB',
        source: 'mongodb',
        deletedId: id,
      });
      return;
    }

    const index = fallbackApplications.findIndex(a => a._id === id);
    if (index === -1) {
      res.status(404).json({ success: false, error: 'Application record not found' });
      return;
    }

    fallbackApplications.splice(index, 1);

    res.json({
      success: true,
      message: 'Application record deleted (Fallback Store)',
      source: 'memory_fallback',
      deletedId: id,
    });
  } catch (err: unknown) {
    console.error('Error deleting application:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete application',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
