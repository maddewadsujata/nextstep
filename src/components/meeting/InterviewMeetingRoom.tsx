import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Share2, 
  MessageSquare, 
  Users, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  Settings, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  MonitorUp, 
  AlertCircle, 
  Send, 
  X, 
  RefreshCw,
  Camera,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { InterviewFeedbackComponent } from '../recruiter/InterviewFeedbackComponent';

interface InterviewMeetingRoomProps {
  meetingId: string;
  onLeave: () => void;
}

interface PeerInfo {
  id: string;
  name: string;
  role: 'student' | 'recruiter' | 'admin' | 'guest';
  avatar?: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

interface ChatMsg {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
};

export const InterviewMeetingRoom: React.FC<InterviewMeetingRoomProps> = ({ meetingId, onLeave }) => {
  const { currentUser, switchDemoRole } = useAuth();
  const { applications } = useData();

  // Find linked application or scheduled interview details
  const linkedApp = useMemo(() => {
    return applications.find(a => a.interviewDetails?.meetingId === meetingId || a.interviewDetails?.meetingUrl?.includes(meetingId));
  }, [applications, meetingId]);

  const interviewDetails = linkedApp?.interviewDetails;

  // Active state
  const [hasEnteredRoom, setHasEnteredRoom] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'failed' | 'waiting'>('connecting');
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Side drawers & Modals
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Participants & Media
  const [remotePeers, setRemotePeers] = useState<PeerInfo[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Stream refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socketRef = useRef<WebSocket | null>(null);
  const pollTimerRef = useRef<any>(null);
  const useHttpPollingRef = useRef<boolean>(false);

  // Identity for meeting
  const currentParticipant = useMemo(() => {
    if (currentUser) {
      return {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatarUrl,
      };
    }
    // Guest or anonymous joiner from mobile link
    return {
      id: 'guest-' + Math.random().toString(36).substring(2, 8),
      name: 'Guest Candidate',
      role: 'student' as const,
    };
  }, [currentUser]);

  // Full shareable URL
  const publicMeetingUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/meeting/${meetingId}` 
    : `/meeting/${meetingId}`;

  // 1. Initial Device Camera & Mic Acquisition
  useEffect(() => {
    let active = true;

    async function initMedia() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Your browser does not support camera/microphone access or requires HTTPS.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setPermissionError(null);
      } catch (err: unknown) {
        console.warn('Media access warning/error:', err);
        const errMsg = err instanceof Error ? err.message : 'Camera/mic permission denied.';
        setPermissionError(errMsg);
        // Create an empty fallback stream with audio synthesis or blank canvas if needed
      }
    }

    initMedia();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
    };
  }, []);

  // Update local video element when stream is ready or user enters room
  useEffect(() => {
    if (hasEnteredRoom && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [hasEnteredRoom]);

  // Meeting duration timer
  useEffect(() => {
    if (!hasEnteredRoom) return;
    const interval = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasEnteredRoom]);

  // 2. Establish Real-Time Signaling (WebSocket with HTTP polling fallback)
  useEffect(() => {
    if (!hasEnteredRoom) return;

    let isSubscribed = true;

    function connectSignaling() {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws/meeting`;

      try {
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!isSubscribed) return;
          console.log('[WebRTC] Signaling WebSocket connected to room:', meetingId);
          useHttpPollingRef.current = false;
          setConnectionStatus('connecting');

          ws.send(JSON.stringify({
            type: 'join',
            roomId: meetingId,
            user: currentParticipant,
            audioEnabled: micEnabled,
            videoEnabled: videoEnabled,
          }));
        };

        ws.onmessage = async (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            await handleSignalingMessage(data);
          } catch (e) {
            console.error('[WebRTC] Failed to parse signaling payload:', e);
          }
        };

        ws.onerror = (err) => {
          console.warn('[WebRTC] WebSocket error, engaging HTTP fallback:', err);
          engageHttpPollingFallback();
        };

        ws.onclose = () => {
          console.log('[WebRTC] Signaling WebSocket closed');
          if (isSubscribed && !useHttpPollingRef.current) {
            engageHttpPollingFallback();
          }
        };
      } catch (err) {
        console.warn('[WebRTC] Could not create WebSocket, fallback to HTTP signaling:', err);
        engageHttpPollingFallback();
      }
    }

    function engageHttpPollingFallback() {
      if (useHttpPollingRef.current || !isSubscribed) return;
      useHttpPollingRef.current = true;
      console.log('[WebRTC] Using HTTP long-polling signaling for multi-device reliability');

      // Join via HTTP
      fetch(`/api/meetings/${meetingId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentParticipant }),
      })
        .then(res => res.json())
        .then(async data => {
          if (data && data.peers) {
            handleJoinedRoom(data.peers, data.chatHistory || []);
          }
        })
        .catch(err => console.warn('HTTP join error:', err));

      // Poll signals every 1200ms
      pollTimerRef.current = setInterval(async () => {
        if (!isSubscribed) return;
        try {
          const res = await fetch(`/api/meetings/${meetingId}/poll?userId=${encodeURIComponent(currentParticipant.id)}`);
          const data = await res.json();
          if (data && data.signals && data.signals.length > 0) {
            for (const sig of data.signals) {
              await handleSignalingMessage({ type: 'signal', from: sig.from, data: sig.data });
            }
          }
          if (data && data.peers) {
            setRemotePeers(data.peers.filter((p: PeerInfo) => p.id !== currentParticipant.id));
          }
        } catch {
          // ignore transient poll drops
        }
      }, 1200);
    }

    connectSignaling();

    return () => {
      isSubscribed = false;
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'leave',
          roomId: meetingId,
          userId: currentParticipant.id,
        }));
        socketRef.current.close();
      } else {
        // Send leave via HTTP beacon
        try {
          fetch(`/api/meetings/${meetingId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentParticipant.id }),
            keepalive: true,
          }).catch(() => {});
        } catch {}
      }

      // Close all peer connections
      peerConnectionsRef.current.forEach(pc => pc.close());
      peerConnectionsRef.current.clear();
    };
  }, [hasEnteredRoom, meetingId, currentParticipant]);

  // Handle incoming signaling message (offer, answer, candidate, peer events)
  const handleSignalingMessage = async (msg: any) => {
    switch (msg.type) {
      case 'joined': {
        handleJoinedRoom(msg.peers || [], msg.chatHistory || []);
        break;
      }

      case 'peer-joined': {
        const newPeer: PeerInfo = msg.peer;
        setRemotePeers(prev => {
          if (prev.some(p => p.id === newPeer.id)) return prev;
          return [...prev, newPeer];
        });

        // The existing participant initiates an offer to the newly joined peer
        await createPeerConnection(newPeer.id, true);
        break;
      }

      case 'peer-left': {
        const leftUserId = msg.userId;
        setRemotePeers(prev => prev.filter(p => p.id !== leftUserId));
        const pc = peerConnectionsRef.current.get(leftUserId);
        if (pc) {
          pc.close();
          peerConnectionsRef.current.delete(leftUserId);
        }
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        break;
      }

      case 'media-status': {
        const { userId, audioEnabled, videoEnabled } = msg;
        setRemotePeers(prev => prev.map(p => {
          if (p.id === userId) {
            return {
              ...p,
              audioEnabled: audioEnabled ?? p.audioEnabled,
              videoEnabled: videoEnabled ?? p.videoEnabled,
            };
          }
          return p;
        }));
        break;
      }

      case 'chat': {
        if (msg.message) {
          setChatMessages(prev => [...prev, msg.message]);
          if (!showChat) setUnreadChatCount(c => c + 1);
        }
        break;
      }

      case 'signal': {
        const { from, data } = msg;
        if (!from || !data) return;

        let pc = peerConnectionsRef.current.get(from);
        if (!pc) {
          pc = await createPeerConnection(from, false);
        }

        if (data.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          sendSignal(from, answer);
          setConnectionStatus('connected');
        } else if (data.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          setConnectionStatus('connected');
        } else if (data.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (e) {
            console.warn('[WebRTC] Error adding ICE candidate:', e);
          }
        }
        break;
      }
    }
  };

  const handleJoinedRoom = (peers: PeerInfo[], initialChats: ChatMsg[]) => {
    setRemotePeers(peers.filter(p => p.id !== currentParticipant.id));
    setChatMessages(initialChats);
    if (peers.length === 0) {
      setConnectionStatus('waiting');
    } else {
      setConnectionStatus('connected');
    }
  };

  // Helper to send signal via WebSocket or HTTP fallback
  const sendSignal = (to: string, data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'signal',
        roomId: meetingId,
        to,
        from: currentParticipant.id,
        data,
      }));
    } else {
      fetch(`/api/meetings/${meetingId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: currentParticipant.id,
          to,
          data,
        }),
      }).catch(err => console.warn('Failed to send HTTP signal:', err));
    }
  };

  // Create an RTCPeerConnection for a remote peer
  const createPeerConnection = async (targetUserId: string, isInitiator: boolean): Promise<RTCPeerConnection> => {
    if (peerConnectionsRef.current.has(targetUserId)) {
      return peerConnectionsRef.current.get(targetUserId)!;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current.set(targetUserId, pc);

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(targetUserId, { candidate: event.candidate });
      }
    };

    // Handle incoming remote track
    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track from peer:', targetUserId);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setConnectionStatus('connected');
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${targetUserId} state:`, pc.connectionState);
      if (pc.connectionState === 'connected') {
        setConnectionStatus('connected');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setConnectionStatus('reconnecting');
      }
    };

    // If initiator, create and send an offer
    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal(targetUserId, offer);
      } catch (err) {
        console.error('[WebRTC] Error creating offer:', err);
      }
    }

    return pc;
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !micEnabled;
        audioTracks.forEach(t => (t.enabled = nextState));
        setMicEnabled(nextState);

        // Broadcast media status
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'media-status',
            roomId: meetingId,
            audioEnabled: nextState,
          }));
        }
      }
    }
  };

  // Toggle Camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoEnabled;
        videoTracks.forEach(t => (t.enabled = nextState));
        setVideoEnabled(nextState);

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'media-status',
            roomId: meetingId,
            videoEnabled: nextState,
          }));
        }
      }
    }
  };

  // Screen Share Toggle
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert to user camera
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 } },
        });
        const camTrack = camStream.getVideoTracks()[0];

        peerConnectionsRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(camTrack);
        });

        if (localStreamRef.current) {
          const oldTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldTrack) oldTrack.stop();
          localStreamRef.current.removeTrack(oldTrack);
          localStreamRef.current.addTrack(camTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }

        setIsScreenSharing(false);
      } catch (e) {
        console.warn('Reverting to camera failed:', e);
      }
    } else {
      try {
        if (!navigator.mediaDevices.getDisplayMedia) {
          alert('Screen sharing is not supported by your current browser.');
          return;
        }
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        screenTrack.onended = () => {
          setIsScreenSharing(false);
          toggleScreenShare(); // revert
        };

        peerConnectionsRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);
      } catch (err) {
        console.warn('Screen share cancelled/denied:', err);
      }
    }
  };

  // Send In-Meeting Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    setChatInput('');

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'chat',
        roomId: meetingId,
        text,
      }));
    } else {
      // HTTP fallback
      const localMsg: ChatMsg = {
        id: 'chat-' + Date.now(),
        senderId: currentParticipant.id,
        senderName: currentParticipant.name,
        senderRole: currentParticipant.role,
        text,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, localMsg]);
    }
  };

  // Copy Meeting URL to Clipboard
  const handleCopyMeetingLink = () => {
    navigator.clipboard.writeText(publicMeetingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Leave Meeting Trigger - opens custom non-blocking modal (never window.confirm)
  const handleLeaveClick = () => {
    setShowLeaveConfirmModal(true);
  };

  // Confirm and Execute Leave
  const confirmAndExecuteLeave = () => {
    setShowLeaveConfirmModal(false);

    // 1. Release all camera and microphone tracks immediately
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
          track.enabled = false;
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // 2. Close peer connections
    peerConnectionsRef.current.forEach(pc => {
      try {
        pc.close();
      } catch (e) {
        console.warn('Error closing pc:', e);
      }
    });
    peerConnectionsRef.current.clear();

    // 3. Send leave event to signaling server to inform other participants
    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'leave',
          roomId: meetingId,
          userId: currentParticipant.id,
        }));
        socketRef.current.close();
        socketRef.current = null;
      } else {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon(`/api/meetings/${meetingId}/leave`, JSON.stringify({ userId: currentParticipant.id }));
        }
      }
    } catch (e) {
      console.warn('Error sending leave signaling:', e);
    }

    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    // 4. If recruiter, open feedback modal to rate candidate; otherwise navigate to dashboard
    const isRecruiter = currentUser?.role === 'recruiter' || currentParticipant.role === 'recruiter';
    if (isRecruiter) {
      setShowFeedbackModal(true);
    } else {
      onLeave();
    }
  };

  // Format Duration seconds into MM:SS
  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Primary peer display name
  const primaryRemotePeer = remotePeers[0];

  // -------------------------------------------------------------
  // PRE-JOIN SCREEN / WAITING ROOM
  // -------------------------------------------------------------
  if (!hasEnteredRoom) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        
        {/* Top Header */}
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <button
            onClick={onLeave}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-slate-900"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">NextStep Secure Video Meeting</span>
          </div>
        </div>

        {/* Center Card */}
        <div className="max-w-4xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Live Video & Audio Preview */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              {permissionError ? (
                <div className="p-6 text-center space-y-2 max-w-sm">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs font-semibold text-amber-200">Media Device Notice</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Camera or microphone access is restricted ({permissionError}). You can still join the room in audio-only or screen observation mode.
                  </p>
                </div>
              ) : (
                <video
                  ref={previewVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover scale-x-[-1] ${!videoEnabled ? 'hidden' : ''}`}
                />
              )}

              {!videoEnabled && !permissionError && (
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold text-2xl flex items-center justify-center mx-auto">
                    {currentParticipant.name.charAt(0)}
                  </div>
                  <p className="text-xs text-slate-400">Camera is turned off</p>
                </div>
              )}

              {/* Bottom Quick Controls in Preview */}
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-3 rounded-full transition-colors ${
                    micEnabled ? 'bg-slate-800/90 text-white hover:bg-slate-700' : 'bg-rose-600 text-white hover:bg-rose-500'
                  }`}
                  title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
                >
                  {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    videoEnabled ? 'bg-slate-800/90 text-white hover:bg-slate-700' : 'bg-rose-600 text-white hover:bg-rose-500'
                  }`}
                  title={videoEnabled ? 'Stop Video' : 'Start Video'}
                >
                  {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-500">
              Check your hair, lighting, and audio before entering the room.
            </p>
          </div>

          {/* Right Column: Interview Details & Join Button */}
          <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
            <div>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                Technical Interview Room
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                {linkedApp?.internshipTitle || 'Software Development Intern'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {linkedApp?.companyName || 'Persistent Systems'} · Pune, Maharashtra
              </p>
            </div>

            {/* Candidate & Recruiter Badges */}
            <div className="space-y-2 py-3 border-y border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Candidate:</span>
                <span className="font-semibold text-slate-200">
                  {interviewDetails?.candidateName || 'Sujata Maddewad'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Interviewer:</span>
                <span className="font-semibold text-indigo-400">
                  {interviewDetails?.recruiterName || 'Sakshi Maddewad'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Scheduled Date & Time:</span>
                <span className="font-semibold text-emerald-400">
                  {interviewDetails?.date ? `${interviewDetails.date}, ${interviewDetails.time || '11:00 AM'}` : '28 October 2026, 11:00 AM'}
                </span>
              </div>
            </div>

            {/* Notice if Joining Early */}
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Your interview is scheduled for 11:00 AM.</span>
              </p>
              <p className="text-slate-400">
                You may enter early to test your connection or wait for the host.
              </p>
            </div>

            {/* Joining As / Role Switcher for Demo testing */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block font-medium">Joining as:</span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {currentParticipant.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{currentParticipant.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{currentParticipant.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => switchDemoRole('student')}
                    className={`px-2 py-1 rounded ${currentUser?.role === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('recruiter')}
                    className={`px-2 py-1 rounded ${currentUser?.role === 'recruiter' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Recruiter
                  </button>
                </div>
              </div>
            </div>

            {/* Enter Meeting Button */}
            <button
              type="button"
              onClick={() => setHasEnteredRoom(true)}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Join Interview Meeting</span>
            </button>

            {/* Multi-device Public URL Copy */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleCopyMeetingLink}
                className="text-xs text-slate-400 hover:text-indigo-300 inline-flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link copied! Open on phone or second browser' : 'Copy Multi-Device Meeting Link'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="max-w-5xl mx-auto w-full text-center text-xs text-slate-600">
          NextStep Encrypted WebRTC Video Meeting · Powered by Google STUN signaling
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE CALL ROOM UI
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none">
      
      {/* 1. TOP HEADER BAR */}
      <header className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
            N
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>{linkedApp?.internshipTitle || 'Software Development Intern'}</span>
              <span className="hidden sm:inline text-slate-500">·</span>
              <span className="hidden sm:inline text-xs text-slate-400 font-normal">
                {linkedApp?.companyName || 'Persistent Systems'}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Meeting ID: <span className="font-mono text-indigo-400 font-semibold">{meetingId}</span>
            </p>
          </div>
        </div>

        {/* Center: Timer & Connection Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatDuration(meetingDuration)}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
              connectionStatus === 'waiting' ? 'bg-amber-400' :
              connectionStatus === 'reconnecting' ? 'bg-orange-400 animate-ping' : 'bg-slate-400'
            }`} />
            <span className="capitalize text-slate-300">
              {connectionStatus === 'connected' ? 'WebRTC Live' : connectionStatus === 'waiting' ? 'Waiting for peer' : connectionStatus}
            </span>
          </div>
        </div>

        {/* Right Action: Copy Public Link */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMeetingLink}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            title="Copy meeting link to open on phone or another laptop"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN VIDEO STAGE */}
      <div className="flex-1 relative bg-slate-950 flex flex-col lg:flex-row items-center justify-center p-3 sm:p-4 gap-3 sm:gap-4 overflow-hidden">
        
        {/* Remote Video Container (or Waiting placeholder) */}
        <div className="relative flex-1 w-full h-full min-h-[220px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${remotePeers.length === 0 ? 'hidden' : ''}`}
          />

          {/* Placeholder if remote peer hasn't joined yet */}
          {remotePeers.length === 0 && (
            <div className="text-center p-6 space-y-4 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Waiting for the other participant to join...
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Open this link on another device (such as your phone or a secondary browser) to test the live candidate interview call:
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between gap-2 text-left">
                <span className="font-mono text-xs text-indigo-300 truncate">{publicMeetingUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyMeetingLink}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold shrink-0"
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 flex items-center justify-center gap-2">
                <span>Candidate: Sujata Maddewad</span>
                <span>·</span>
                <span>Recruiter: Sakshi Maddewad</span>
              </div>
            </div>
          )}

          {/* Remote Peer Overlay Tag */}
          {remotePeers.length > 0 && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="font-bold text-white">
                {primaryRemotePeer?.name || 'Remote Participant'}
              </span>
              <span className="text-[10px] uppercase font-semibold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded">
                {primaryRemotePeer?.role || 'Guest'}
              </span>
            </div>
          )}
        </div>

        {/* Local Video Picture-in-Picture / Split Container */}
        <div className={`relative ${
          remotePeers.length === 0 
            ? 'w-full lg:w-80 h-48 lg:h-56' 
            : 'absolute bottom-20 right-4 sm:bottom-24 sm:right-6 w-36 sm:w-56 aspect-video'
        } bg-slate-900 rounded-2xl overflow-hidden border-2 border-indigo-600/70 shadow-2xl transition-all z-20 group`}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover scale-x-[-1] ${!videoEnabled ? 'hidden' : ''}`}
          />

          {!videoEnabled && (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-center p-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center">
                {currentParticipant.name.charAt(0)}
              </div>
            </div>
          )}

          {/* Local overlay label */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white">
            <span>You ({currentParticipant.name.split(' ')[0]})</span>
            {!micEnabled && <MicOff className="w-2.5 h-2.5 text-rose-400" />}
          </div>
        </div>

        {/* -------------------------------------------------------------
            SIDE DRAWER: IN-MEETING CHAT
        ------------------------------------------------------------- */}
        {showChat && (
          <aside className="absolute top-0 right-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 z-30 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>In-Call Chat</span>
              </h3>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.length === 0 ? (
                <p className="text-center text-slate-500 py-8 text-[11px]">
                  No messages yet. Use this chat to share links, code snippets, or notes.
                </p>
              ) : (
                chatMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`p-2.5 rounded-xl space-y-1 ${
                      msg.senderId === currentParticipant.id ? 'bg-indigo-600/20 border border-indigo-500/30 ml-4' : 'bg-slate-800 border border-slate-700 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-indigo-300">{msg.senderName}</span>
                      <span className="text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-200 break-words">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type message..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </aside>
        )}

        {/* -------------------------------------------------------------
            SIDE DRAWER: PARTICIPANTS LIST
        ------------------------------------------------------------- */}
        {showParticipants && (
          <aside className="absolute top-0 right-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 z-30 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Participants ({1 + remotePeers.length})</span>
              </h3>
              <button onClick={() => setShowParticipants(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {/* You */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {currentParticipant.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">{currentParticipant.name} (You)</p>
                    <p className="text-[10px] text-slate-400 capitalize">{currentParticipant.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  {micEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-rose-400" />}
                  {videoEnabled ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5 text-rose-400" />}
                </div>
              </div>

              {/* Remote Peers */}
              {remotePeers.map(peer => (
                <div key={peer.id} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-600 text-white font-bold text-xs flex items-center justify-center">
                      {peer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">{peer.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{peer.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    {peer.audioEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-rose-400" />}
                    {peer.videoEnabled ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

      </div>

      {/* 3. BOTTOM FLOATING CALL CONTROLS */}
      <footer className="h-20 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0">
        
        {/* Left Side: Device & Info Tag */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Peer-to-Peer</span>
        </div>

        {/* Center: Main Call Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-4 mx-auto">
          {/* Mic */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3.5 rounded-full transition-all shadow-md ${
              micEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400'
            }`}
            title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera */}
          <button
            type="button"
            onClick={toggleVideo}
            className={`p-3.5 rounded-full transition-all shadow-md ${
              videoEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400'
            }`}
            title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            type="button"
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-full transition-all shadow-md hidden sm:block ${
              isScreenSharing ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <MonitorUp className="w-5 h-5" />
          </button>

          {/* In-Meeting Chat */}
          <button
            type="button"
            onClick={() => { setShowChat(!showChat); setUnreadChatCount(0); }}
            className={`relative p-3.5 rounded-full transition-all shadow-md ${
              showChat ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title="Meeting Chat"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadChatCount > 0 && !showChat && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Participants */}
          <button
            type="button"
            onClick={() => setShowParticipants(!showParticipants)}
            className={`p-3.5 rounded-full transition-all shadow-md ${
              showParticipants ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title="Participants List"
          >
            <Users className="w-5 h-5" />
          </button>

          {/* Leave Interview Button */}
          <button
            type="button"
            onClick={handleLeaveClick}
            className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            title="Leave this interview"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">Leave Interview</span>
          </button>
        </div>

        {/* Right Side: Quick Persona switch for multi-device test */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
          <span>Active: {currentParticipant.name.split(' ')[0]}</span>
        </div>

      </footer>

      {/* 4. LEAVE INTERVIEW CONFIRMATION MODAL (Non-blocking replacement for window.confirm) */}
      {showLeaveConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner">
              <PhoneOff className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Leave Interview Call?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your camera and microphone will disconnect immediately. The other participant will remain in the call, and your interview record remains safely stored in MongoDB. You can rejoin anytime before the meeting concludes.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLeaveConfirmModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                Stay in Meeting
              </button>
              <button
                type="button"
                onClick={confirmAndExecuteLeave}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30"
              >
                Yes, Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. INTERVIEW FEEDBACK & EVALUATION MODAL (Recruiter Evaluation Note) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto my-auto">
            <InterviewFeedbackComponent
              applicationId={linkedApp?.id || 'app-001'}
              candidateName={linkedApp?.studentName || 'Sujata Maddewad'}
              position={linkedApp?.internshipTitle || 'Software Development Intern'}
              companyName={linkedApp?.companyName || 'Persistent Systems'}
              meetingId={meetingId}
              onClose={() => {
                setShowFeedbackModal(false);
                onLeave();
              }}
              onSaved={(_feedback) => {
                setShowFeedbackModal(false);
                onLeave();
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};
