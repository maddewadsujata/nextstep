import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { CompanyModel } from '../models/Company.ts';
import { fallbackCompanies, SimulatedCompany } from '../db.ts';

const router = Router();

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// 1. GET /api/companies — Get all companies
router.get('/companies', async (_req: Request, res: Response) => {
  try {
    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const records = await CompanyModel.find().sort({ createdAt: -1 });
      res.json({
        success: true,
        source: 'mongodb',
        count: records.length,
        data: records,
      });
      return;
    }

    res.json({
      success: true,
      source: 'memory_fallback',
      count: fallbackCompanies.length,
      data: fallbackCompanies,
    });
  } catch (err: unknown) {
    console.error('Error fetching companies:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve companies',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 2. GET /api/companies/:id — Get company by ID or userId
router.get('/companies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      let company = null;
      if (isValidObjectId(id)) {
        company = await CompanyModel.findById(id);
      }
      if (!company) {
        company = await CompanyModel.findOne({ userId: id });
      }

      if (!company) {
        res.status(404).json({ success: false, error: 'Company record not found in MongoDB' });
        return;
      }

      res.json({ success: true, source: 'mongodb', data: company });
      return;
    }

    const company = fallbackCompanies.find(c => c._id === id || c.userId === id);
    if (!company) {
      res.status(404).json({ success: false, error: 'Company record not found' });
      return;
    }

    res.json({ success: true, source: 'memory_fallback', data: company });
  } catch (err: unknown) {
    console.error('Error fetching company:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company record',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 3. POST /api/companies — Register company profile
router.post('/companies', async (req: Request, res: Response) => {
  try {
    const { userId, companyName, recruiterName, workEmail, companyDescription, website, industry, location } = req.body;

    if (!userId || !companyName || !recruiterName || !workEmail) {
      res.status(400).json({ success: false, error: 'userId, companyName, recruiterName, and workEmail are required' });
      return;
    }

    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      const company = await CompanyModel.create({
        userId,
        companyName,
        recruiterName,
        workEmail,
        companyDescription: companyDescription || '',
        website: website || '',
        industry: industry || 'Technology',
        location: location || 'Bengaluru',
        verificationStatus: 'verified',
      });

      res.status(201).json({
        success: true,
        message: 'Company profile created in MongoDB',
        source: 'mongodb',
        data: company,
      });
      return;
    }

    const newSimulated: SimulatedCompany = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      userId,
      companyName,
      recruiterName,
      workEmail,
      companyDescription: companyDescription || '',
      website: website || '',
      industry: industry || 'Technology',
      location: location || 'Bengaluru',
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fallbackCompanies.unshift(newSimulated);

    res.status(201).json({
      success: true,
      message: 'Company profile created (Fallback Store)',
      source: 'memory_fallback',
      data: newSimulated,
    });
  } catch (err: unknown) {
    console.error('Error creating company profile:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create company profile',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 4. PUT /api/companies/:id — Update company profile
router.put('/companies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const isLive = mongoose.connection.readyState === 1;

    if (isLive) {
      let updated = null;
      if (isValidObjectId(id)) {
        updated = await CompanyModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
      }
      if (!updated) {
        updated = await CompanyModel.findOneAndUpdate({ userId: id }, { ...updates, updatedAt: new Date() }, { new: true });
      }

      if (!updated) {
        res.status(404).json({ success: false, error: 'Company record not found in MongoDB' });
        return;
      }

      res.json({
        success: true,
        message: 'Company profile updated in MongoDB',
        source: 'mongodb',
        data: updated,
      });
      return;
    }

    const index = fallbackCompanies.findIndex(c => c._id === id || c.userId === id);
    if (index === -1) {
      res.status(404).json({ success: false, error: 'Company record not found' });
      return;
    }

    fallbackCompanies[index] = {
      ...fallbackCompanies[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: 'Company profile updated (Fallback Store)',
      source: 'memory_fallback',
      data: fallbackCompanies[index],
    });
  } catch (err: unknown) {
    console.error('Error updating company profile:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update company profile',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
