import express from 'express';
import cors from 'cors';
import db from './database/db.js';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve frontend build static files
app.use(express.static(distPath));

// ============================================
// CV Profiles routes
// ============================================

// Get all profiles
app.get('/api/profiles', (req, res) => {
    try {
        const list = db.profiles.findMany();
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get profile by ID
app.get('/api/profiles/:id', (req, res) => {
    try {
        const row = db.profiles.findOne(req.params.id);
        if (!row) return res.status(404).json({ error: 'Profile not found' });
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create profile
app.post('/api/profiles', (req, res) => {
    try {
        const { name, data } = req.body;
        const id = uuid();
        const newProfile = db.profiles.insertOne(id, name || 'Unnamed Profile', data);
        res.status(201).json({ id, name, message: 'Profile created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update profile
app.put('/api/profiles/:id', (req, res) => {
    try {
        const { name, data } = req.body;
        const updated = db.profiles.updateOne(req.params.id, name, data);
        if (!updated) return res.status(404).json({ error: 'Profile not found' });
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete profile
app.delete('/api/profiles/:id', (req, res) => {
    try {
        const success = db.profiles.deleteOne(req.params.id);
        if (!success) return res.status(404).json({ error: 'Profile not found' });
        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// Templates routes
// ============================================

// Get custom templates
app.get('/api/templates', (req, res) => {
    try {
        const list = db.templates.findMany();
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get template config
app.get('/api/templates/:id', (req, res) => {
    try {
        const row = db.templates.findOne(req.params.id);
        if (!row) return res.status(404).json({ error: 'Template not found' });
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create/Register template config
app.post('/api/templates', (req, res) => {
    try {
        const { name, config } = req.body;
        const id = config.id || `template-${uuid()}`;
        db.templates.saveOne(id, name, config);
        res.status(201).json({ id, message: 'Template configuration saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route everything else to React index.html (SPA routing support)
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
    console.log(`Server executing at http://localhost:${PORT}`);
});
