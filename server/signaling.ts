import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

export interface ParticipantInfo {
  id: string;
  name: string;
  role: 'student' | 'recruiter' | 'admin' | 'guest';
  avatar?: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  joinedAt: string;
}

interface RoomPeer {
  ws?: WebSocket;
  user: ParticipantInfo;
  pendingSignals: Array<{ from: string; data: any; timestamp: number }>;
  lastSeen: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
}

// In-memory room store: roomId -> Map<userId, RoomPeer>
const rooms = new Map<string, Map<string, RoomPeer>>();
// Chat history per room
const roomChats = new Map<string, ChatMessage[]>();

export function setupSignalingServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/meeting' });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomId: string | null = null;
    let currentUserId: string | null = null;

    ws.on('message', (messageRaw: string) => {
      try {
        const msg = JSON.parse(messageRaw.toString());
        const { type, roomId, user, to, from, data, audioEnabled, videoEnabled, text } = msg;

        switch (type) {
          case 'join': {
            if (!roomId || !user || !user.id) return;
            currentRoomId = roomId;
            currentUserId = user.id;

            if (!rooms.has(roomId)) {
              rooms.set(roomId, new Map());
            }
            const room = rooms.get(roomId)!;

            const participant: ParticipantInfo = {
              id: user.id,
              name: user.name || 'Participant',
              role: user.role || 'guest',
              avatar: user.avatar || '',
              audioEnabled: audioEnabled ?? true,
              videoEnabled: videoEnabled ?? true,
              joinedAt: new Date().toISOString(),
            };

            const existingPeer = room.get(user.id);
            if (existingPeer) {
              existingPeer.ws = ws;
              existingPeer.user = participant;
              existingPeer.lastSeen = Date.now();
            } else {
              room.set(user.id, {
                ws,
                user: participant,
                pendingSignals: [],
                lastSeen: Date.now(),
              });
            }

            // Collect existing peers in the room (excluding self)
            const peers: ParticipantInfo[] = [];
            room.forEach((peer, pId) => {
              if (pId !== user.id) {
                peers.push(peer.user);
              }
            });

            // Send acknowledgment & existing peers back to the joining user
            ws.send(JSON.stringify({
              type: 'joined',
              roomId,
              self: participant,
              peers,
              chatHistory: roomChats.get(roomId) || [],
            }));

            // Broadcast peer-joined to all other users in this room
            room.forEach((peer, pId) => {
              if (pId !== user.id && peer.ws && peer.ws.readyState === WebSocket.OPEN) {
                peer.ws.send(JSON.stringify({
                  type: 'peer-joined',
                  peer: participant,
                }));
              }
            });

            console.log(`[WebRTC] User ${user.name} (${user.role}) joined meeting room: ${roomId}. Total: ${room.size}`);
            break;
          }

          case 'signal': {
            // Forward WebRTC SDP offer, answer, or ICE candidate directly to the destination peer
            if (!currentRoomId || !to || !data) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const targetPeer = room.get(to);
            if (targetPeer && targetPeer.ws && targetPeer.ws.readyState === WebSocket.OPEN) {
              targetPeer.ws.send(JSON.stringify({
                type: 'signal',
                from: from || currentUserId,
                data,
              }));
            } else if (targetPeer) {
              // Queue for HTTP polling peer
              targetPeer.pendingSignals.push({
                from: from || currentUserId || 'unknown',
                data,
                timestamp: Date.now(),
              });
            }
            break;
          }

          case 'media-status': {
            if (!currentRoomId || !currentUserId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const sender = room.get(currentUserId);
            if (sender) {
              if (typeof audioEnabled === 'boolean') sender.user.audioEnabled = audioEnabled;
              if (typeof videoEnabled === 'boolean') sender.user.videoEnabled = videoEnabled;
            }

            room.forEach((peer, pId) => {
              if (pId !== currentUserId && peer.ws && peer.ws.readyState === WebSocket.OPEN) {
                peer.ws.send(JSON.stringify({
                  type: 'media-status',
                  userId: currentUserId,
                  audioEnabled,
                  videoEnabled,
                }));
              }
            });
            break;
          }

          case 'chat': {
            if (!currentRoomId || !currentUserId || !text) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const sender = room.get(currentUserId);
            const chatMsg: ChatMessage = {
              id: 'chat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              senderId: currentUserId,
              senderName: sender?.user.name || 'Anonymous',
              senderRole: sender?.user.role || 'guest',
              text: text.trim(),
              timestamp: new Date().toISOString(),
            };

            if (!roomChats.has(currentRoomId)) {
              roomChats.set(currentRoomId, []);
            }
            const chats = roomChats.get(currentRoomId)!;
            chats.push(chatMsg);
            if (chats.length > 100) chats.shift();

            // Broadcast to everyone in room including sender
            room.forEach((peer) => {
              if (peer.ws && peer.ws.readyState === WebSocket.OPEN) {
                peer.ws.send(JSON.stringify({
                  type: 'chat',
                  message: chatMsg,
                }));
              }
            });
            break;
          }

          case 'leave': {
            handleUserLeave(currentRoomId, currentUserId);
            currentRoomId = null;
            currentUserId = null;
            break;
          }

          case 'ping': {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
          }
        }
      } catch (err: unknown) {
        console.error('[WebRTC] Signaling error handling message:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId && currentUserId) {
        handleUserLeave(currentRoomId, currentUserId);
      }
    });

    ws.on('error', (err) => {
      console.warn('[WebRTC] WebSocket peer error:', err.message);
      if (currentRoomId && currentUserId) {
        handleUserLeave(currentRoomId, currentUserId);
      }
    });
  });

  return wss;
}

function handleUserLeave(roomId: string | null, userId: string | null) {
  if (!roomId || !userId) return;
  const room = rooms.get(roomId);
  if (!room) return;

  const leaving = room.get(userId);
  room.delete(userId);

  console.log(`[WebRTC] User ${leaving?.user.name || userId} left room ${roomId}. Remaining: ${room.size}`);

  // Broadcast peer-left to remaining participants
  room.forEach((peer) => {
    if (peer.ws && peer.ws.readyState === WebSocket.OPEN) {
      peer.ws.send(JSON.stringify({
        type: 'peer-left',
        userId,
      }));
    }
  });

  if (room.size === 0) {
    // Keep room and chat history for 1 hour so participants can reconnect
    setTimeout(() => {
      const checkRoom = rooms.get(roomId);
      if (checkRoom && checkRoom.size === 0) {
        rooms.delete(roomId);
        roomChats.delete(roomId);
      }
    }, 3600000);
  }
}

// -------------------------------------------------------------
// HTTP Fallback Signalling API (for networks blocking WebSockets)
// -------------------------------------------------------------

export function httpJoinRoom(roomId: string, user: { id: string; name: string; role: any; avatar?: string; audioEnabled?: boolean; videoEnabled?: boolean }) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }
  const room = rooms.get(roomId)!;

  const participant: ParticipantInfo = {
    id: user.id,
    name: user.name || 'Participant',
    role: user.role || 'guest',
    avatar: user.avatar || '',
    audioEnabled: user.audioEnabled ?? true,
    videoEnabled: user.videoEnabled ?? true,
    joinedAt: new Date().toISOString(),
  };

  const existing = room.get(user.id);
  if (existing) {
    existing.user = participant;
    existing.lastSeen = Date.now();
  } else {
    room.set(user.id, {
      user: participant,
      pendingSignals: [],
      lastSeen: Date.now(),
    });
  }

  // Broadcast to WS peers
  room.forEach((peer, pId) => {
    if (pId !== user.id && peer.ws && peer.ws.readyState === WebSocket.OPEN) {
      peer.ws.send(JSON.stringify({
        type: 'peer-joined',
        peer: participant,
      }));
    }
  });

  const peers: ParticipantInfo[] = [];
  room.forEach((peer, pId) => {
    if (pId !== user.id) peers.push(peer.user);
  });

  return {
    success: true,
    roomId,
    self: participant,
    peers,
    chatHistory: roomChats.get(roomId) || [],
  };
}

export function httpSendSignal(roomId: string, from: string, to: string, data: any) {
  const room = rooms.get(roomId);
  if (!room) return { success: false, error: 'Room not found' };

  const targetPeer = room.get(to);
  if (!targetPeer) return { success: false, error: 'Target peer not in room' };

  if (targetPeer.ws && targetPeer.ws.readyState === WebSocket.OPEN) {
    targetPeer.ws.send(JSON.stringify({ type: 'signal', from, data }));
  } else {
    targetPeer.pendingSignals.push({ from, data, timestamp: Date.now() });
  }

  return { success: true };
}

export function httpPollSignals(roomId: string, userId: string) {
  const room = rooms.get(roomId);
  if (!room) return { success: true, signals: [], peers: [] };

  const selfPeer = room.get(userId);
  if (selfPeer) {
    selfPeer.lastSeen = Date.now();
  }

  const signals = selfPeer ? [...selfPeer.pendingSignals] : [];
  if (selfPeer) {
    selfPeer.pendingSignals = [];
  }

  const peers: ParticipantInfo[] = [];
  room.forEach((peer, pId) => {
    if (pId !== userId) peers.push(peer.user);
  });

  return {
    success: true,
    signals,
    peers,
    chatHistory: roomChats.get(roomId) || [],
  };
}

export function httpLeaveRoom(roomId: string, userId: string) {
  handleUserLeave(roomId, userId);
  return { success: true };
}

export function getRoomInfo(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) {
    return {
      exists: false,
      participantCount: 0,
      participants: [],
    };
  }

  const participants: ParticipantInfo[] = [];
  room.forEach((peer) => {
    participants.push(peer.user);
  });

  return {
    exists: true,
    participantCount: participants.length,
    participants,
  };
}
