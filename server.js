// // const express = require('express');
// // const app = express();
// // const server = require('http').Server(app);
// // const io = require('socket.io')(server);
// // const { ExpressPeerServer } = require('peer');
// // const mongoose = require('mongoose');
// // const cors = require('cors');

// // app.use(cors());
// // app.use(express.json());
// // app.use(express.static('public')); 

// // // PeerJS Server
// // const peerServer = ExpressPeerServer(server, { debug: true });
// // app.use('/peerjs', peerServer);

// // // --- MONGODB CONNECTION ---
// // mongoose.connect('mongodb://127.0.0.1:27017/meetplus_ultimate')
// //     .then(() => console.log('✅ MongoDB Connected'))
// //     .catch(err => console.log('❌ DB Error:', err));

// // // --- SCHEMAS ---

// // // 1. User Schema (Login/Signup ke liye)
// // const UserSchema = new mongoose.Schema({
// //     name: String,
// //     email: { type: String, unique: true },
// //     password: String,
// //     joinedAt: { type: Date, default: Date.now }
// // });
// // const User = mongoose.model('User', UserSchema);

// // // 2. Meeting Schema (Analytics ke liye)
// // const MeetingSchema = new mongoose.Schema({
// //     meetingId: String,
// //     hostName: String,
// //     startTime: { type: Date, default: Date.now },
// //     status: { type: String, default: 'active' }, // active / ended
// //     participants: [{
// //         name: String,
// //         joinTime: Date,
// //         leaveTime: Date,
// //         avgAttention: Number,
// //         topEmotion: String
// //     }]
// // });
// // const Meeting = mongoose.model('Meeting', MeetingSchema);

// // // --- ROUTES ---

// // // 1. AUTH - SIGNUP
// // app.post('/api/signup', async (req, res) => {
// //     try {
// //         const { name, email, password } = req.body;
// //         // Simple check if user exists
// //         const existing = await User.findOne({ email });
// //         if (existing) return res.status(400).json({ error: "Email already exists" });

// //         const newUser = new User({ name, email, password });
// //         await newUser.save();
// //         res.json({ success: true, user: newUser });
// //     } catch (e) {
// //         res.status(500).json({ error: "Server Error" });
// //     }
// // });

// // // 2. AUTH - LOGIN 
// // app.post('/api/login', async (req, res) => {
// //     try {
// //         const { email, password } = req.body;
// //         const user = await User.findOne({ email, password });
// //         if (user) {
// //             res.json({ success: true, user });
// //         } else {
// //             res.status(400).json({ error: "Invalid Credentials" });
// //         }
// //     } catch (e) {
// //         res.status(500).json({ error: "Server Error" });
// //     }
// // });

// // // 3. CHECK MEETING STATUS 
// // app.get('/api/check-meeting/:id', async (req, res) => {
// //     try {
// //         const meeting = await Meeting.findOne({ meetingId: req.params.id });
// //         if(meeting && meeting.status === 'ended') {
// //             return res.json({ allowed: false, error: "Meeting ended by host" });
// //         }
// //         res.json({ allowed: true });
// //     } catch(e) { res.json({ allowed: true }); }
// // });

// // // 4. SAVE MEETING DATA (Jab call end ho)
// // app.post('/api/save-meeting', async (req, res) => {
// //     try {
// //         const { meetingId, hostName, participantData, forceEnd } = req.body;
        
// //         let meeting = await Meeting.findOne({ meetingId });
// //         if (!meeting) {
// //             meeting = new Meeting({ meetingId, hostName, participants: [] });
// //         }

// //         if(participantData) meeting.participants.push(participantData);
        
// //         if(forceEnd) {
// //             meeting.status = 'ended';
// //         }

// //         await meeting.save();
// //         res.json({ success: true });
// //     } catch (e) {
// //         console.log(e);
// //         res.status(500).json({ error: "Error saving data" });
// //     }
// // });

// // // 5. GET HISTORY (Dashboard ke liye)
// // app.get('/api/history/:name', async (req, res) => {
// //     try {
// //         const meetings = await Meeting.find({ hostName: req.params.name }).sort({ startTime: -1 });
// //         res.json(meetings);
// //     } catch(e) { res.json([]); }
// // });

// // // --- SOCKET IO (Realtime Logic) ---
// // io.on('connection', socket => {
// //     socket.on('join-room', (roomId, userId, userName) => {
// //         socket.join(roomId);
// //         socket.to(roomId).emit('user-connected', userId, userName);

// //         socket.on('disconnect', () => {
// //             socket.to(roomId).emit('user-disconnected', userId);
// //         });

// //         // Raise Hand
// //         socket.on('raise-hand', (data) => {
// //             io.to(roomId).emit('hand-raised', data);
// //         });

// //         // AI Sync
// //         socket.on('emotion-sync', (data) => {
// //             socket.to(roomId).emit('update-emotion', data);
// //         });

// //         // Admin Actions
// //         socket.on('admin-action', (data) => {
// //             io.to(data.roomId).emit('admin-command', data);
// //         });

// //         // Force End
// //         socket.on('end-meeting-for-all', (roomId) => {
// //             socket.to(roomId).emit('meeting-ended-signal');
// //         });
// //     });
// // });

// // const PORT = 3000;
// // server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// const express = require('express');
// const app = express();
// const server = require('http').Server(app);
// const io = require('socket.io')(server);
// const { ExpressPeerServer } = require('peer');
// const { Sequelize, DataTypes, Op } = require('sequelize'); // Yahan Op add kiya hai
// const cors = require('cors');

// app.use(cors());
// app.use(express.json());
// app.use(express.static('public')); 

// // PeerJS Server
// const peerServer = ExpressPeerServer(server, { debug: true });
// app.use('/peerjs', peerServer);

// // --- POSTGRESQL CONNECTION ---
// const sequelize = new Sequelize('meetplus_ultimate', 'postgres', 'Saurabh@123', {
//     host: '127.0.0.1',
//     dialect: 'postgres',
//     logging: false
// });

// sequelize.authenticate()
//     .then(() => console.log('✅ PostgreSQL Connected'))
//     .catch(err => console.log('❌ DB Error:', err));

// // --- SCHEMAS (Sequelize Models) ---
// const User = sequelize.define('User', {
//     name: { type: DataTypes.STRING },
//     email: { type: DataTypes.STRING, unique: true },
//     password: { type: DataTypes.STRING },
//     joinedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
// });

// const Meeting = sequelize.define('Meeting', {
//     meetingId: { type: DataTypes.STRING },
//     hostName: { type: DataTypes.STRING },
//     startTime: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
//     status: { type: DataTypes.STRING, defaultValue: 'active' }, 
//     participants: { 
//         type: DataTypes.JSONB, 
//         defaultValue: [] 
//     }
// });

// sequelize.sync().then(() => console.log('✅ Database Tables Synced'));

// // --- ROUTES ---

// app.post('/api/signup', async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
//         const existing = await User.findOne({ where: { email } });
//         if (existing) return res.status(400).json({ error: "Email already exists" });
//         const newUser = await User.create({ name, email, password });
//         res.json({ success: true, user: newUser });
//     } catch (e) { res.status(500).json({ error: "Server Error" }); }
// });

// app.post('/api/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ where: { email, password } });
//         if (user) res.json({ success: true, user });
//         else res.status(400).json({ error: "Invalid Credentials" });
//     } catch (e) { res.status(500).json({ error: "Server Error" }); }
// });

// app.get('/api/check-meeting/:id', async (req, res) => {
//     try {
//         const meeting = await Meeting.findOne({ where: { meetingId: req.params.id } });
//         if(meeting && meeting.status === 'ended') {
//             return res.json({ allowed: false, error: "Meeting ended by host" });
//         }
//         res.json({ allowed: true });
//     } catch(e) { res.json({ allowed: true }); }
// });

// app.post('/api/save-meeting', async (req, res) => {
//     try {
//         const { meetingId, hostName, participantData, forceEnd } = req.body;
//         let meeting = await Meeting.findOne({ where: { meetingId } });
//         if (!meeting) meeting = await Meeting.create({ meetingId, hostName, participants: [] });

//         if(participantData) {
//             const currentParticipants = meeting.participants || [];
//             // Duplicate entry se bachne ke liye filter
//             const filteredParticipants = currentParticipants.filter(p => p.name !== participantData.name);
//             meeting.participants = [...filteredParticipants, participantData];
//             meeting.changed('participants', true);
//         }
//         if(forceEnd) meeting.status = 'ended';
//         await meeting.save();
//         res.json({ success: true });
//     } catch (e) { res.status(500).json({ error: "Error saving data" }); }
// });

// // 📌 FIX 1: HISTORY API (Ab Host + Participants dono ko unki meetings dikhengi)
// app.get('/api/history/:name', async (req, res) => {
//     try {
//         const userName = req.params.name;
//         const meetings = await Meeting.findAll({ 
//             where: {
//                 [Op.or]: [
//                     { hostName: userName }, // Agar wo host hai
//                     { participants: { [Op.contains]: [{ name: userName }] } } // Agar wo participants list me hai
//                 ]
//             },
//             order: [['startTime', 'DESC']]
//         });
//         res.json(meetings);
//     } catch(e) { 
//         console.log("History error:", e);
//         res.json([]); 
//     }
// });



// // ==============================================
// // 🔥 EMAIL INVITATION SYSTEM (VIA GOOGLE APPS SCRIPT)
// // ==============================================
// app.post('/api/send-invites', async (req, res) => {
//     try {
//         // Aapka live Google Apps Script Web App URL
//         const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyE9cRBigBsvH9Yg0xaf3xKWZN8NBJnw7EUzo8VIJz4tlDSQFTSACCsh9QaOJw6lUSJ/exec"; 

//         // Node.js (Backend) se Google Script ko data bhejna
//         const response = await fetch(GOOGLE_SCRIPT_URL, {
//             method: 'POST',
//             body: JSON.stringify(req.body)
//         });

//         const result = await response.json();

//         // Agar Google Script ne 'success: true' return kiya
//         if (result.success) {
//             res.json({ success: true });
//         } else {
//             console.error("Google Script Error:", result.error);
//             res.status(500).json({ error: "Failed to process via Google Sheet" });
//         }
//     } catch (err) {
//         console.error("Backend Error:", err);
//         res.status(500).json({ error: "Failed to connect to Google Apps Script" });
//     }
// });

// // REPORT API
// app.get('/api/report/:id', async (req, res) => {
//     try {
//         const meeting = await Meeting.findOne({ where: { meetingId: req.params.id } });
//         if (!meeting) return res.json(null); 

//         const userName = req.query.user; 
//         const isHost = meeting.hostName === userName;
//         const participantsList = meeting.participants || [];
//         const isParticipant = participantsList.some(p => p.name === userName);

//         if (isHost || isParticipant) res.json(meeting); 
//         else res.status(403).json({ error: "Access Denied" }); 
//     } catch(e) { res.status(500).json({ error: "Server Error" }); }
// });

// // ==============================================
// // 🔥 AI MEETING ANALYSIS ROUTE (v3 — computed stats + pluggable AI narrative)
// // ==============================================
// //
// // IMPORTANT — read this before deploying:
// // Gnani.ai's publicly documented product ("Vachana", key prefix "vach_") is a
// // Speech-to-Text / Text-to-Speech API, not a general text-generation/LLM
// // completion API. There is no public documentation for a Gnani endpoint that
// // takes a text prompt and returns generated JSON like Gemini's
// // `generateContent` did. So AI_API_URL / AI_API_KEY below point at whatever
// // text-generation endpoint you actually have docs for.
// //
// // Fill in the values directly below — replace "12345" with your real key.
// // ==============================================

// const AI_API_URL = '';       // <- put your text-generation endpoint URL here
// const AI_API_KEY = 'vach_1ytE2CY5X2EsQYqOoFbnZMaXxpk36iu9UVIs5Xe1LWwBC0BgVzDEQ29skHnTWgMryrEqdHClO2IsOL21ez6G00oKjCHK54qM_23d72618ea83e0b6068fc8d17b6ac6e7';  // <- replace with your real key
// const AI_MODEL = '';         // <- optional model name, if the endpoint needs one

// // In-memory cache so repeat page loads don't re-call the AI every time
// const aiReportCache = new Map(); // meetingId -> { data, expiresAt }
// const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// function computeStats(participants = []) {
//     if (!participants.length) return null;

//     const scored = participants
//         .map(p => ({ name: p.name || 'Unknown', attention: Math.round(p.avgAttention || 0) }))
//         .sort((a, b) => b.attention - a.attention);

//     const overallAttention = Math.round(
//         scored.reduce((sum, p) => sum + p.attention, 0) / scored.length
//     );

//     const distribution = scored.reduce(
//         (acc, p) => {
//             if (p.attention >= 75) acc.high++;
//             else if (p.attention >= 45) acc.medium++;
//             else acc.low++;
//             return acc;
//         },
//         { high: 0, medium: 0, low: 0 }
//     );

//     return {
//         totalParticipants: scored.length,
//         overallAttention,
//         topPerformer: scored[0],
//         distribution
//     };
// }

// function buildPrompt(computed, participants) {
//     return `
// You are analyzing meeting engagement telemetry. Here is the pre-computed data (already calculated correctly, do not recompute):
// ${JSON.stringify(computed)}

// Raw per-participant data for tone/context only:
// ${JSON.stringify(participants || [])}

// Return ONLY a raw JSON object (no markdown, no code fences) with exactly these string fields:
// {
//   "summary": "1-2 sentence plain-language overview of how the session went",
//   "engagementNote": "1-2 sentences about the engagement leader and what drove it, referencing the given numbers",
//   "emotionalTone": "1-2 sentences describing the emotional environment based on the data",
//   "conclusion": "one short, professional closing sentence"
// }
// Treat a single participant as a valid solo session — never refuse. Do not invent numbers that contradict the pre-computed data.
// `;
// }

// // Generic caller — adjust the request/response shape here once you have the
// // real endpoint's docs. Written as an OpenAI-style chat-completion request by
// // default since that's the most common shape; change freely.
// async function callAiProvider(prompt) {
//     if (!AI_API_URL || !AI_API_KEY) return null;

//     const controller = new AbortController();
//     const timeout = setTimeout(() => controller.abort(), 15000);

//     try {
//         const res = await fetch(AI_API_URL, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${AI_API_KEY}`
//             },
//             signal: controller.signal,
//             body: JSON.stringify({
//                 ...(AI_MODEL ? { model: AI_MODEL } : {}),
//                 messages: [{ role: 'user', content: prompt }]
//             })
//         });

//         if (!res.ok) {
//             console.error('AI provider returned non-OK status:', res.status);
//             return null;
//         }

//         const data = await res.json();

//         // Try a couple of common response shapes; adjust once real docs are known.
//         let text =
//             data.choices?.[0]?.message?.content ??
//             data.candidates?.[0]?.content?.parts?.[0]?.text ??
//             data.output_text ??
//             null;

//         if (!text) return null;

//         text = text.replace(/```json|```/g, '').trim();
//         return JSON.parse(text);
//     } catch (err) {
//         console.error('AI provider call failed:', err.message);
//         return null;
//     } finally {
//         clearTimeout(timeout);
//     }
// }

// // ==============================================
// // 🔊 VOICE NARRATION — Gnani Vachana TTS (REST inference)
// // ==============================================
// // Confirmed from Gnani's official docs (docs.gnani.ai/api/TTS/tts-inference):
// //   POST https://api.vachana.ai/api/v1/tts/inference
// //   header: X-API-Key-ID: <key>
// //   body: { text, voice, model: "timbre-v2.5", language, speed, audio_config }
// //   response: 200 OK with the RAW AUDIO BINARY directly (no SSE parsing needed)
// //
// // IMPORTANT: "vachana-voice-v3" (used earlier) is deprecated — Gnani only
// // supports model "timbre-v2.5" now. Voices changed too (Karan/Simran were
// // for the old model) — use a Timbre v2.5 voice instead, e.g. "Kaveri"
// // (English) or "Nalini" (Hindi). Full catalog: docs.gnani.ai/api/TTS/available-voices
// //
// // Replace "12345" below with your real Gnani API key.
// const GNANI_API_KEY = 'vach_1ytE2CY5X2EsQYqOoFbnZMaXxpk36iu9UVIs5Xe1LWwBC0BgVzDEQ29skHnTWgMryrEqdHClO2IsOL21ez6G00oKjCHK54qM_23d72618ea83e0b6068fc8d17b6ac6e7'; // <- replace with your real key
// const GNANI_TTS_URL = 'https://api.vachana.ai/api/v1/tts/inference';
// const GNANI_MODEL = 'timbre-v2.5';
// const GNANI_VOICE = 'Kaveri';     // English voice; use "Nalini" for Hindi, etc.
// const GNANI_LANGUAGE = 'en-IN';   // or "auto" to detect from the text's script

// /**
//  * Synthesizes speech for the given text via Gnani Vachana's TTS inference
//  * endpoint and returns the full audio as a Buffer (mp3). Returns null (never
//  * throws) on any failure so callers can degrade gracefully.
//  */
// async function synthesizeSpeech(text, voice = GNANI_VOICE) {
//     if (!GNANI_API_KEY || GNANI_API_KEY === '12345') {
//         console.warn('[report-audio] GNANI_API_KEY not set (still using placeholder) — skipping narration.');
//         return null;
//     }
//     if (!text || !text.trim()) return null;

//     const controller = new AbortController();
//     const timeout = setTimeout(() => controller.abort(), 20000);

//     try {
//         const res = await fetch(GNANI_TTS_URL, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-API-Key-ID': GNANI_API_KEY
//             },
//             signal: controller.signal,
//             body: JSON.stringify({
//                 text,
//                 voice,
//                 model: GNANI_MODEL,
//                 language: GNANI_LANGUAGE,
//                 speed: 1.0,
//                 audio_config: {
//                     sample_rate: 44100,
//                     num_channels: 1,
//                     sample_width: 2,
//                     container: 'mp3',
//                     bitrate: '192k'
//                 }
//             })
//         });

//         if (!res.ok) {
//             let bodyText = '';
//             try { bodyText = await res.text(); } catch (_) { /* ignore */ }
//             console.error('[report-audio] Gnani TTS request failed:', res.status, res.statusText, '\nResponse body:', bodyText);
//             return null;
//         }

//         const arrayBuffer = await res.arrayBuffer();
//         return Buffer.from(arrayBuffer);
//     } catch (err) {
//         console.error('[report-audio] Gnani TTS call failed:', err.message);
//         return null;
//     } finally {
//         clearTimeout(timeout);
//     }
// }

// function buildNarrationScript(computed, ai) {
//     if (ai) {
//         return [ai.summary, ai.engagementNote, ai.emotionalTone, ai.conclusion].filter(Boolean).join(' ');
//     }
//     // Fallback script straight from computed numbers if no AI narrative exists yet
//     const lead = computed.topPerformer
//         ? `${computed.topPerformer.name} led engagement at ${computed.topPerformer.attention} percent.`
//         : '';
//     return `This session had an overall attention score of ${computed.overallAttention} percent across ${computed.totalParticipants} participant${computed.totalParticipants === 1 ? '' : 's'}. ${lead}`.trim();
// }

// // GET /api/report-audio/:id  -> audio/mpeg stream of the narrated report
// app.get('/api/report-audio/:id', async (req, res) => {
//     const meetingId = req.params.id;

//     try {
//         const meeting = await Meeting.findOne({ where: { meetingId } });
//         if (!meeting) return res.status(404).json({ error: 'Meeting not found in database.' });

//         const computed = computeStats(meeting.participants || []);
//         if (!computed) return res.status(404).json({ error: 'No usable telemetry to narrate yet.' });

//         // Reuse a cached AI narrative if we already generated one for this meeting
//         const cached = aiReportCache.get(meetingId);
//         const ai = cached?.data?.ai || null;

//         const script = buildNarrationScript(computed, ai);
//         const audioBuffer = await synthesizeSpeech(script, req.query.voice);

//         if (!audioBuffer) {
//             return res.status(502).json({ error: 'Voice narration is not available right now.' });
//         }

//         res.set({
//             'Content-Type': 'audio/mpeg',
//             'Content-Length': audioBuffer.length,
//             'Cache-Control': 'no-store'
//         });
//         res.send(audioBuffer);
//     } catch (err) {
//         console.error('🔥 REPORT AUDIO ERROR:', err);
//         res.status(500).json({ error: 'Backend error: ' + err.message });
//     }
// });

// app.get('/api/ai-report/:id', async (req, res) => {
//     const meetingId = req.params.id;
//     const forceRefresh = req.query.refresh === 'true';

//     try {
//         const meeting = await Meeting.findOne({ where: { meetingId } });
//         if (!meeting) {
//             return res.status(404).json({ error: 'Meeting not found in database.' });
//         }

//         const computed = computeStats(meeting.participants || []);
//         if (!computed) {
//             return res.json({ meetingId, computed: null, ai: null, generatedAt: Date.now() });
//         }

//         // Serve from cache unless explicitly refreshed
//         const cached = aiReportCache.get(meetingId);
//         if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
//             return res.json(cached.data);
//         }

//         if (!AI_API_URL || !AI_API_KEY) {
//             const fallback = { meetingId, computed, ai: null, generatedAt: Date.now() };
//             return res.json(fallback); // still return real numbers even with no AI configured
//         }

//         const prompt = buildPrompt(computed, meeting.participants);
//         const aiPayload = await callAiProvider(prompt);

//         const responseData = {
//             meetingId,
//             computed,
//             ai: aiPayload,
//             generatedAt: Date.now()
//         };

//         // Cache successful AI results only — always retry AI on a degraded response
//         if (aiPayload) {
//             aiReportCache.set(meetingId, { data: responseData, expiresAt: Date.now() + CACHE_TTL_MS });
//         }

//         res.json(responseData);
//     } catch (err) {
//         console.error('🔥 AI REPORT ERROR:', err);
//         res.status(500).json({ error: 'Backend error: ' + err.message });
//     }
// });







// // --- SOCKET IO ---
// io.on('connection', socket => {
//     socket.on('join-room', (roomId, userId, userName) => {
//         socket.join(roomId);
//         socket.to(roomId).emit('user-connected', userId, userName);
//         socket.on('disconnect', () => socket.to(roomId).emit('user-disconnected', userId));
//         socket.on('raise-hand', (data) => io.to(roomId).emit('hand-raised', data));
//         socket.on('emotion-sync', (data) => socket.to(roomId).emit('update-emotion', data));
//         socket.on('admin-action', (data) => io.to(data.roomId).emit('admin-command', data));
//         socket.on('end-meeting-for-all', (roomId) => socket.to(roomId).emit('meeting-ended-signal'));
//     });
// });

// const PORT = 3000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const { Sequelize, DataTypes, Op } = require('sequelize'); 
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// PeerJS Server
const peerServer = ExpressPeerServer(server, { debug: true });
app.use('/peerjs', peerServer);

// ==============================================
// 🔥 POSTGRESQL CONNECTION (Hardcoded Password)
// ==============================================
const sequelize = new Sequelize('meetplus_ultimate', 'postgres', 'Saurabh@123', {
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: false
});

sequelize.authenticate()
    .then(() => console.log('✅ PostgreSQL Connected'))
    .catch(err => console.log('❌ DB Error:', err));

// --- SCHEMAS (Sequelize Models) ---
const User = sequelize.define('User', {
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    joinedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
});

const Meeting = sequelize.define('Meeting', {
    meetingId: { type: DataTypes.STRING },
    hostName: { type: DataTypes.STRING },
    startTime: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    status: { type: DataTypes.STRING, defaultValue: 'active' },
    participants: {
        type: DataTypes.JSONB,
        defaultValue: []
    }
});

sequelize.sync().then(() => console.log('✅ Database Tables Synced'));

// ==============================================
// 🔥 ROUTES (Auth & Meeting)
// ==============================================

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ error: "Email already exists" });
        const newUser = await User.create({ name, email, password });
        res.json({ success: true, user: newUser });
    } catch (e) { res.status(500).json({ error: "Server Error" }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email, password } });
        if (user) res.json({ success: true, user });
        else res.status(400).json({ error: "Invalid Credentials" });
    } catch (e) { res.status(500).json({ error: "Server Error" }); }
});

app.get('/api/check-meeting/:id', async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ where: { meetingId: { [Op.iLike]: req.params.id } } });
        if(meeting && meeting.status === 'ended') {
            return res.json({ allowed: false, error: "Meeting ended by host" });
        }
        res.json({ allowed: true });
    } catch(e) { res.json({ allowed: true }); }
});

app.post('/api/save-meeting', async (req, res) => {
    try {
        const { meetingId, hostName, participantData, forceEnd } = req.body;
        let meeting = await Meeting.findOne({ where: { meetingId: { [Op.iLike]: meetingId } } });
        
        if (!meeting) {
            meeting = await Meeting.create({ meetingId: meetingId.toLowerCase(), hostName, participants: [] });
        }

        if(participantData) {
            const currentParticipants = meeting.participants || [];
            const filteredParticipants = currentParticipants.filter(p => p.name !== participantData.name);
            meeting.participants = [...filteredParticipants, participantData];
            meeting.changed('participants', true);
        }
        if(forceEnd) meeting.status = 'ended';
        await meeting.save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Error saving data" }); }
});

app.get('/api/history/:name', async (req, res) => {
    try {
        const userName = req.params.name;
        const meetings = await Meeting.findAll({
            where: {
                [Op.or]: [
                    { hostName: userName }, 
                    { participants: { [Op.contains]: [{ name: userName }] } } 
                ]
            },
            order: [['startTime', 'DESC']]
        });
        res.json(meetings);
    } catch(e) {
        console.log("History error:", e);
        res.json([]);
    }
});

// ==============================================
// 🔥 EMAIL INVITATION SYSTEM (Hardcoded URL)
// ==============================================
app.post('/api/send-invites', async (req, res) => {
    try {
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyE9cRBigBsvH9Yg0xaf3xKWZN8NBJnw7EUzo8VIJz4tlDSQFTSACCsh9QaOJw6lUSJ/exec";

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(req.body)
        });

        const result = await response.json();

        if (result.success) {
            res.json({ success: true });
        } else {
            console.error("Google Script Error:", result.error);
            res.status(500).json({ error: "Failed to process via Google Sheet" });
        }
    } catch (err) {
        console.error("Backend Error:", err);
        res.status(500).json({ error: "Failed to connect to Google Apps Script" });
    }
});

app.get('/api/report/:id', async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ where: { meetingId: { [Op.iLike]: req.params.id } } });
        if (!meeting) return res.json(null);

        const userName = req.query.user;
        const isHost = meeting.hostName === userName;
        const participantsList = meeting.participants || [];
        const isParticipant = participantsList.some(p => p.name === userName);

        if (isHost || isParticipant) res.json(meeting);
        else res.status(403).json({ error: "Access Denied" });
    } catch(e) { res.status(500).json({ error: "Server Error" }); }
});

// ==============================================
// 🔥 AI TEXT ANALYSIS (Powered by Gemini)
// ==============================================
const GEMINI_API_KEY = 'AIzaSyAv4e-dsjkHI0GigzAbUlr3ab8eibmRr7I';
const aiReportCache = new Map(); 
const CACHE_TTL_MS = 10 * 60 * 1000; 

function computeStats(participants = []) {
    if (!participants.length) return null;

    const scored = participants
        .map(p => ({ name: p.name || 'Unknown', attention: Math.round(p.avgAttention || 0) }))
        .sort((a, b) => b.attention - a.attention);

    const overallAttention = Math.round(
        scored.reduce((sum, p) => sum + p.attention, 0) / scored.length
    );

    const distribution = scored.reduce(
        (acc, p) => {
            if (p.attention >= 75) acc.high++;
            else if (p.attention >= 45) acc.medium++;
            else acc.low++;
            return acc;
        },
        { high: 0, medium: 0, low: 0 }
    );

    return {
        totalParticipants: scored.length,
        overallAttention,
        topPerformer: scored[0],
        distribution
    };
}

app.get('/api/ai-report/:id', async (req, res) => {
    const meetingId = req.params.id;
    const forceRefresh = req.query.refresh === 'true';

    try {
        const meeting = await Meeting.findOne({ where: { meetingId: { [Op.iLike]: meetingId } } });
        if (!meeting) return res.status(404).json({ error: 'Meeting not found in database.' });

        const computed = computeStats(meeting.participants || []);
        if (!computed) return res.json({ meetingId, computed: null, ai: null, generatedAt: Date.now() });

        const cached = aiReportCache.get(meetingId);
        if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
            return res.json(cached.data);
        }

        const prompt = `
        Analyze this meeting engagement telemetry. 
        Pre-computed data: ${JSON.stringify(computed)}
        Raw participant data: ${JSON.stringify(meeting.participants || [])}

        Return ONLY a raw JSON object with no formatting or markdown. Include these fields:
        {
          "summary": "1-2 sentence overview of the session",
          "engagementNote": "1-2 sentences about the leader",
          "emotionalTone": "1-2 sentences describing the emotional environment",
          "conclusion": "A professional closing sentence"
        }`;

        // 🔥 FIX: Updated Model to "gemini-2.5-flash" based on your working Java code
        const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await aiRes.json();
        
        if (!aiRes.ok) {
            console.error("❌ Google API Error:", JSON.stringify(data, null, 2));
            throw new Error(data.error?.message || `HTTP Error ${aiRes.status}`);
        }

        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            console.error("❌ Unexpected Gemini Response Shape:", JSON.stringify(data, null, 2));
            throw new Error(`AI generated no text. Finish Reason: ${data.candidates?.[0]?.finishReason || "Unknown"}`);
        }

        // 🔥 FIX: Bulletproof JSON parsing
        text = text.replace(/```json|```/g, '').trim();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            text = text.substring(jsonStart, jsonEnd + 1);
        }

        const aiPayload = JSON.parse(text);

        const responseData = { meetingId, computed, ai: aiPayload, generatedAt: Date.now() };
        aiReportCache.set(meetingId, { data: responseData, expiresAt: Date.now() + CACHE_TTL_MS });

        res.json(responseData);
    } catch (err) {
        console.error('🔥 AI REPORT ERROR:', err.message);
        
        // Return graceful fallback so the frontend doesn't break
        res.json({
            meetingId,
            computed: computeStats(meeting?.participants || []),
            ai: {
                summary: "AI analysis is currently processing.",
                engagementNote: "Please check back later.",
                emotionalTone: "Data logged successfully.",
                conclusion: "Error details: " + err.message
            },
            generatedAt: Date.now()
        });
    }
});

// ==============================================
// 🔊 VOICE NARRATION — Gnani Vachana TTS (Hardcoded Key)
// ==============================================
const GNANI_API_KEY = 'vach_1ytE2CY5X2EsQYqOoFbnZMaXxpk36iu9UVIs5Xe1LWwBC0BgVzDEQ29skHnTWgMryrEqdHClO2IsOL21ez6G00oKjCHK54qM_23d72618ea83e0b6068fc8d17b6ac6e7'; 
const GNANI_TTS_URL = 'https://api.vachana.ai/api/v1/tts/inference';
const GNANI_MODEL = 'timbre-v2.5';
const GNANI_VOICE = 'Kaveri';     
const GNANI_LANGUAGE = 'en-IN';   

async function synthesizeSpeech(text, voice = GNANI_VOICE) {
    if (!text || !text.trim()) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
        const res = await fetch(GNANI_TTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key-ID': GNANI_API_KEY
            },
            signal: controller.signal,
            body: JSON.stringify({
                text,
                voice,
                model: GNANI_MODEL,
                language: GNANI_LANGUAGE,
                speed: 1.0,
                audio_config: {
                    sample_rate: 44100,
                    num_channels: 1,
                    sample_width: 2,
                    container: 'mp3',
                    bitrate: '192k'
                }
            })
        });

        if (!res.ok) {
            console.error('[report-audio] Gnani TTS request failed:', res.status, res.statusText);
            return null;
        }

        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err) {
        console.error('[report-audio] Gnani TTS call failed:', err.message);
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

function buildNarrationScript(computed, ai) {
    if (ai) {
        return [ai.summary, ai.engagementNote, ai.emotionalTone, ai.conclusion].filter(Boolean).join(' ');
    }
    const lead = computed.topPerformer
        ? `${computed.topPerformer.name} led engagement at ${computed.topPerformer.attention} percent.`
        : '';
    return `This session had an overall attention score of ${computed.overallAttention} percent across ${computed.totalParticipants} participant${computed.totalParticipants === 1 ? '' : 's'}. ${lead}`.trim();
}

app.get('/api/report-audio/:id', async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ where: { meetingId: { [Op.iLike]: req.params.id } } });
        if (!meeting) return res.status(404).json({ error: 'Meeting not found in database.' });

        const computed = computeStats(meeting.participants || []);
        if (!computed) return res.status(404).json({ error: 'No usable telemetry to narrate yet.' });

        const cached = aiReportCache.get(meeting.meetingId);
        const ai = cached?.data?.ai || null;

        const script = buildNarrationScript(computed, ai);
        const audioBuffer = await synthesizeSpeech(script, req.query.voice);

        if (!audioBuffer) {
            return res.status(502).json({ error: 'Voice narration is not available right now.' });
        }

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
            'Cache-Control': 'no-store'
        });
        res.send(audioBuffer);
    } catch (err) {
        console.error('🔥 REPORT AUDIO ERROR:', err);
        res.status(500).json({ error: 'Backend error: ' + err.message });
    }
});

// ==============================================
// 🔥 SOCKET IO
// ==============================================
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId, userName);
        socket.on('disconnect', () => socket.to(roomId).emit('user-disconnected', userId));
        socket.on('raise-hand', (data) => io.to(roomId).emit('hand-raised', data));
        socket.on('emotion-sync', (data) => socket.to(roomId).emit('update-emotion', data));
        socket.on('admin-action', (data) => io.to(data.roomId).emit('admin-command', data));
        socket.on('end-meeting-for-all', (roomId) => socket.to(roomId).emit('meeting-ended-signal'));
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));