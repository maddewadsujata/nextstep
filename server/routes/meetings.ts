import { Router, Request, Response } from 'express';
import { 
  getRoomInfo, 
  httpJoinRoom, 
  httpSendSignal, 
  httpPollSignals, 
  httpLeaveRoom 
} from '../signaling.ts';

const router = Router();

// In-memory registry of scheduled interview meetings
interface ScheduledMeetingRecord {
  meetingId: string;
  candidateName: string;
  candidateId?: string;
  recruiterName: string;
  recruiterId?: string;
  position: string;
  companyName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

const scheduledMeetings = new Map<string, ScheduledMeetingRecord>();

// Seed default scheduled interview meeting between Sujata Maddewad and Sakshi Maddewad
const defaultMeeting: ScheduledMeetingRecord = {
  meetingId: 'meet-ns-sujata-sakshi',
  candidateName: 'Sujata Maddewad',
  candidateId: 'user-student-sujata-01',
  recruiterName: 'Sakshi Maddewad',
  recruiterId: 'user-recruiter-marcus-01',
  position: 'Software Development Intern',
  companyName: 'Persistent Systems',
  date: '2026-10-28',
  time: '11:00 AM',
  status: 'scheduled',
  createdAt: '2026-09-18T16:00:00Z',
};

scheduledMeetings.set('meet-ns-sujata-sakshi', defaultMeeting);
scheduledMeetings.set('meet-ns-sujata-suchita', { ...defaultMeeting, meetingId: 'meet-ns-sujata-suchita' });

// 1. GET /api/meetings/:id/info — Inspect meeting room and scheduled record
router.get('/:id/info', (req: Request, res: Response) => {
  const { id } = req.params;
  const roomLive = getRoomInfo(id);
  const scheduled = scheduledMeetings.get(id);

  res.json({
    success: true,
    meetingId: id,
    scheduled: scheduled || null,
    liveStatus: {
      participantCount: roomLive.participantCount,
      participants: roomLive.participants,
      isActive: roomLive.participantCount > 0,
    },
  });
});

// 2. POST /api/meetings/schedule — Schedule or register a new interview meeting
router.post('/schedule', (req: Request, res: Response) => {
  const { 
    meetingId, 
    candidateName, 
    candidateId, 
    recruiterName, 
    recruiterId, 
    position, 
    companyName, 
    date, 
    time 
  } = req.body;

  const id = meetingId || `meet-ns-${Math.random().toString(36).substring(2, 9)}`;

  const record: ScheduledMeetingRecord = {
    meetingId: id,
    candidateName: candidateName || 'Sujata Maddewad',
    candidateId,
    recruiterName: recruiterName || 'Sakshi Maddewad',
    recruiterId,
    position: position || 'Software Development Intern',
    companyName: companyName || 'Persistent Systems',
    date: date || '2026-10-28',
    time: time || '11:00 AM',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };

  scheduledMeetings.set(id, record);

  res.json({
    success: true,
    message: 'Interview meeting successfully scheduled',
    record,
    meetingId: id,
  });
});

// 3. POST /api/meetings/:id/join — HTTP fallback join
router.post('/:id/join', (req: Request, res: Response) => {
  const { id } = req.params;
  const { user } = req.body;

  if (!user || !user.id) {
    res.status(400).json({ success: false, error: 'User info required' });
    return;
  }

  const result = httpJoinRoom(id, user);
  res.json(result);
});

// 4. POST /api/meetings/:id/signal — HTTP fallback signal transmission
router.post('/:id/signal', (req: Request, res: Response) => {
  const { id } = req.params;
  const { from, to, data } = req.body;

  if (!from || !to || !data) {
    res.status(400).json({ success: false, error: 'Missing signal parameters' });
    return;
  }

  const result = httpSendSignal(id, from, to, data);
  res.json(result);
});

// 5. GET /api/meetings/:id/poll — HTTP fallback signal polling
router.get('/:id/poll', (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.query.userId as string;

  if (!userId) {
    res.status(400).json({ success: false, error: 'userId is required' });
    return;
  }

  const result = httpPollSignals(id, userId);
  res.json(result);
});

// 6. POST /api/meetings/:id/leave — HTTP fallback leave
router.post('/:id/leave', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ success: false, error: 'userId required' });
    return;
  }

  const result = httpLeaveRoom(id, userId);
  res.json(result);
});

export default router;
