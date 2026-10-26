import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { InternshipModel } from '../models/Internship.ts';
import { getDatabaseStatus, connectToDatabase, seedLiveDatabaseIfEmpty, fallbackStorage, SimulatedInternship } from '../db.ts';

const router = Router();

// Validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// 1. Database Connection Status Endpoint
router.get('/db/status', (_req: Request, res: Response) => {
  const status = getDatabaseStatus();
  res.json(status);
});

// 2. Connect / Reconnect to MongoDB Endpoint
router.post('/db/connect', async (req: Request, res: Response) => {
  const { uri } = req.body;
  const result = await connectToDatabase(uri);
  if (result.success) {
    await seedLiveDatabaseIfEmpty();
  }
  const status = getDatabaseStatus();
  res.status(result.success ? 200 : 400).json({
    ...result,
    status,
  });
});

// 3. READ ALL: GET /api/internships
router.get('/internships', async (_req: Request, res: Response) => {
  try {
    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const records = await InternshipModel.find().sort({ createdAt: -1 });
      res.json({
        success: true,
        source: 'mongodb',
        count: records.length,
        data: records,
      });
      return;
    }

    // Fallback mode when MongoDB is disconnected
    res.json({
      success: true,
      source: 'memory_fallback',
      count: fallbackStorage.length,
      data: fallbackStorage,
      notice: 'Operating in fallback mode. Connect to MongoDB Atlas or local daemon to persist in MongoDB.',
    });
  } catch (err: unknown) {
    console.error('Error fetching internships:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve internships',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 4. READ ONE: GET /api/internships/:id
router.get('/internships/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        error: `Invalid MongoDB ObjectId format: "${id}". Must be a 24-character hexadecimal string.`,
      });
      return;
    }

    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const record = await InternshipModel.findById(id);
      if (!record) {
        res.status(404).json({ success: false, error: 'Internship not found in MongoDB' });
        return;
      }
      res.json({ success: true, source: 'mongodb', data: record });
      return;
    }

    const record = fallbackStorage.find(item => item._id === id);
    if (!record) {
      res.status(404).json({ success: false, error: 'Internship record not found' });
      return;
    }
    res.json({ success: true, source: 'memory_fallback', data: record });
  } catch (err: unknown) {
    console.error('Error fetching internship by ID:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch internship record',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 5. CREATE: POST /api/internships
router.post('/internships', async (req: Request, res: Response) => {
  try {
    const { title, company, location, skills, description, stipend, openings, workType } = req.body;

    // Strict validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }
    if (!company || typeof company !== 'string' || company.trim() === '') {
      res.status(400).json({ success: false, error: 'Company name is required' });
      return;
    }
    if (!location || typeof location !== 'string' || location.trim() === '') {
      res.status(400).json({ success: false, error: 'Location is required' });
      return;
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
      res.status(400).json({ success: false, error: 'Description is required' });
      return;
    }

    // Format skills array
    let skillsArray: string[] = [];
    if (Array.isArray(skills)) {
      skillsArray = skills.map(s => String(s).trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (skillsArray.length === 0) {
      res.status(400).json({ success: false, error: 'At least one skill is required' });
      return;
    }

    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const newRecord = await InternshipModel.create({
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        skills: skillsArray,
        description: description.trim(),
        stipend: stipend ? String(stipend).trim() : '₹18,000 / month',
        openings: openings ? Math.max(1, Number(openings)) : 1,
        workType: ['Remote', 'Hybrid', 'On-site'].includes(workType) ? workType : 'Hybrid',
      });

      res.status(201).json({
        success: true,
        message: 'Internship document created in MongoDB',
        source: 'mongodb',
        data: newRecord,
      });
      return;
    }

    // Fallback in-memory creation
    const newSimulated: SimulatedInternship = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      skills: skillsArray,
      description: description.trim(),
      stipend: stipend ? String(stipend).trim() : '₹18,000 / month',
      openings: openings ? Math.max(1, Number(openings)) : 1,
      workType: ['Remote', 'Hybrid', 'On-site'].includes(workType) ? workType : 'Hybrid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fallbackStorage.unshift(newSimulated);

    res.status(201).json({
      success: true,
      message: 'Internship document created (Fallback Store)',
      source: 'memory_fallback',
      data: newSimulated,
      notice: 'Operating in fallback mode. Connect to MongoDB to persist in MongoDB database.',
    });
  } catch (err: unknown) {
    console.error('Error creating internship:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create internship document',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 6. UPDATE: PUT /api/internships/:id
router.put('/internships/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        error: `Invalid MongoDB ObjectId: "${id}"`,
      });
      return;
    }

    const updates = req.body;
    if (updates.skills && typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const updated = await InternshipModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updated) {
        res.status(404).json({ success: false, error: 'Internship record not found in MongoDB' });
        return;
      }

      res.json({
        success: true,
        message: 'Internship document updated in MongoDB',
        source: 'mongodb',
        data: updated,
      });
      return;
    }

    // Fallback update
    const index = fallbackStorage.findIndex(item => item._id === id);
    if (index === -1) {
      res.status(404).json({ success: false, error: 'Internship record not found' });
      return;
    }

    fallbackStorage[index] = {
      ...fallbackStorage[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: 'Internship record updated (Fallback Store)',
      source: 'memory_fallback',
      data: fallbackStorage[index],
    });
  } catch (err: unknown) {
    console.error('Error updating internship:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update internship document',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 7. DELETE: DELETE /api/internships/:id
router.delete('/internships/:id', async (req: Request, res: Response) => {
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
      const deleted = await InternshipModel.findByIdAndDelete(id);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Internship document not found in MongoDB' });
        return;
      }

      res.json({
        success: true,
        message: 'Internship document deleted from MongoDB',
        source: 'mongodb',
        deletedId: id,
      });
      return;
    }

    // Fallback delete
    const index = fallbackStorage.findIndex(item => item._id === id);
    if (index === -1) {
      res.status(404).json({ success: false, error: 'Internship record not found' });
      return;
    }

    fallbackStorage.splice(index, 1);

    res.json({
      success: true,
      message: 'Internship record deleted (Fallback Store)',
      source: 'memory_fallback',
      deletedId: id,
    });
  } catch (err: unknown) {
    console.error('Error deleting internship:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete internship document',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 8. SEED: POST /api/internships/seed
router.post('/internships/seed', async (_req: Request, res: Response) => {
  try {
    const isLive = mongoose.connection.readyState === 1;

    const sampleData = [
      {
        title: 'Full-Stack Software Engineering Intern',
        company: 'Persistent Systems',
        location: 'Pune, Maharashtra',
        skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Express'],
        description: 'Build robust scalable full-stack features with React and MongoDB NoSQL document persistence at Persistent Systems Hinjawadi campus.',
        stipend: '₹18,000 / month',
        openings: 3,
        workType: 'Hybrid',
      },
      {
        title: 'Cloud & Database Backend Intern',
        company: 'Tata Consultancy Services (TCS)',
        location: 'Pune, Maharashtra',
        skills: ['MongoDB', 'Mongoose', 'Docker', 'REST APIs', 'Node.js'],
        description: 'Design schema validations, indexing strategies, and aggregation pipelines on high-throughput enterprise systems.',
        stipend: '₹20,000 / month',
        openings: 4,
        workType: 'Hybrid',
      },
      {
        title: 'AI Platform Engineering Intern',
        company: 'Infosys',
        location: 'Bengaluru, Karnataka',
        skills: ['Python', 'TypeScript', 'Vector DB', 'MongoDB', 'Gemini AI'],
        description: 'Integrate multi-modal LLM workflows and persistent document storage for next-generation developer tooling.',
        stipend: '₹25,000 / month',
        openings: 2,
        workType: 'Remote',
      },
      {
        title: 'Software Development Intern (Placement Track)',
        company: 'Tech Mahindra',
        location: 'Pune, Maharashtra',
        skills: ['Java', 'Spring Boot', 'React', 'MongoDB', 'SQL'],
        description: 'Work with the digital engineering division on enterprise client solutions with pre-placement interview (PPI) opportunity.',
        stipend: '₹15,000 / month',
        openings: 5,
        workType: 'On-site',
      },
    ];

    if (isLive) {
      // Clear and re-seed
      await InternshipModel.deleteMany({});
      const seeded = await InternshipModel.insertMany(sampleData);
      res.json({
        success: true,
        message: `Successfully seeded ${seeded.length} records into MongoDB database.`,
        source: 'mongodb',
        count: seeded.length,
        data: seeded,
      });
      return;
    }

    // Reset fallback storage
    fallbackStorage.length = 0;
    for (const item of sampleData) {
      fallbackStorage.push({
        ...item,
        _id: new mongoose.Types.ObjectId().toHexString(),
        workType: item.workType as 'Remote' | 'Hybrid' | 'On-site',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: `Seeded ${fallbackStorage.length} records in fallback store.`,
      source: 'memory_fallback',
      count: fallbackStorage.length,
      data: fallbackStorage,
    });
  } catch (err: unknown) {
    console.error('Error seeding internships:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to seed sample documents',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
