const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const mongoose = require('mongoose');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static('index.html')); 

// PeerJS Server
const peerServer = ExpressPeerServer(server, { debug: true });
app.use('/peerjs', peerServer);

// --- MONGODB CONNECTION ---
mongoose.connect('mongodb://127.0.0.1:27017/meetplus_ultimate')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ DB Error:', err));

// --- SCHEMAS ---

// 1. User Schema (Login/Signup ke liye)
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    joinedAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// 2. Meeting Schema (Analytics ke liye)
const MeetingSchema = new mongoose.Schema({
    meetingId: String,
    hostName: String,
    startTime: { type: Date, default: Date.now },
    status: { type: String, default: 'active' }, // active / ended
    participants: [{
        name: String,
        joinTime: Date,
        leaveTime: Date,
        avgAttention: Number,
        topEmotion: String
    }]
});
const Meeting = mongoose.model('Meeting', MeetingSchema);

// --- ROUTES ---

// 1. AUTH - SIGNUP
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Simple check if user exists
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: "Email already exists" });

        const newUser = new User({ name, email, password });
        await newUser.save();
        res.json({ success: true, user: newUser });
    } catch (e) {
        res.status(500).json({ error: "Server Error" });
    }
});

// 2. AUTH - LOGIN 
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(400).json({ error: "Invalid Credentials" });
        }
    } catch (e) {
        res.status(500).json({ error: "Server Error" });
    }
});

// 3. CHECK MEETING STATUS 
app.get('/api/check-meeting/:id', async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ meetingId: req.params.id });
        if(meeting && meeting.status === 'ended') {
            return res.json({ allowed: false, error: "Meeting ended by host" });
        }
        res.json({ allowed: true });
    } catch(e) { res.json({ allowed: true }); }
});

// 4. SAVE MEETING DATA (Jab call end ho)
app.post('/api/save-meeting', async (req, res) => {
    try {
        const { meetingId, hostName, participantData, forceEnd } = req.body;
        
        let meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
            meeting = new Meeting({ meetingId, hostName, participants: [] });
        }

        if(participantData) meeting.participants.push(participantData);
        
        if(forceEnd) {
            meeting.status = 'ended';
        }

        await meeting.save();
        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Error saving data" });
    }
});

// 5. GET HISTORY (Dashboard ke liye)
app.get('/api/history/:name', async (req, res) => {
    try {
        const meetings = await Meeting.find({ hostName: req.params.name }).sort({ startTime: -1 });
        res.json(meetings);
    } catch(e) { res.json([]); }
});

// --- SOCKET IO (Realtime Logic) ---
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId, userName);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });

        // Raise Hand
        socket.on('raise-hand', (data) => {
            io.to(roomId).emit('hand-raised', data);
        });

        // AI Sync
        socket.on('emotion-sync', (data) => {
            socket.to(roomId).emit('update-emotion', data);
        });

        // Admin Actions
        socket.on('admin-action', (data) => {
            io.to(data.roomId).emit('admin-command', data);
        });

        // Force End
        socket.on('end-meeting-for-all', (roomId) => {
            socket.to(roomId).emit('meeting-ended-signal');
        });
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



