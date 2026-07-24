import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../db.json');

// Initialize local database structure if database file does not exist
if (!existsSync(dbPath)) {
    const initialSchema = {
        cv_profiles: [],
        templates: []
    };
    writeFileSync(dbPath, JSON.stringify(initialSchema, null, 2));
}

// Custom simple client-safe native database wrapper
const db = {
    // Read all records
    read() {
        try {
            const data = readFileSync(dbPath, 'utf8');
            return JSON.parse(data);
        } catch {
            return { cv_profiles: [], templates: [] };
        }
    },

    // Write records
    write(data) {
        writeFileSync(dbPath, JSON.stringify(data, null, 2));
    },

    // Interface mimics
    profiles: {
        findMany() {
            const data = db.read();
            return data.cv_profiles.map(p => ({
                id: p.id,
                name: p.name,
                updated_at: p.updated_at
            }));
        },

        findOne(id) {
            const data = db.read();
            return data.cv_profiles.find(p => p.id === id);
        },

        insertOne(id, name, profileData) {
            const data = db.read();
            const newProfile = {
                id,
                name,
                profile_data: typeof profileData === 'string' ? JSON.parse(profileData) : profileData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            data.cv_profiles.push(newProfile);
            db.write(data);
            return newProfile;
        },

        updateOne(id, name, profileData) {
            const data = db.read();
            const profile = data.cv_profiles.find(p => p.id === id);
            if (!profile) return null;
            profile.name = name;
            profile.profile_data = typeof profileData === 'string' ? JSON.parse(profileData) : profileData;
            profile.updated_at = new Date().toISOString();
            db.write(data);
            return profile;
        },

        deleteOne(id) {
            const data = db.read();
            const lengthBefore = data.cv_profiles.length;
            data.cv_profiles = data.cv_profiles.filter(p => p.id !== id);
            db.write(data);
            return lengthBefore > data.cv_profiles.length;
        }
    },

    templates: {
        findMany() {
            const data = db.read();
            return data.templates.map(t => ({
                id: t.id,
                name: t.name,
                updated_at: t.updated_at
            }));
        },

        findOne(id) {
            const data = db.read();
            return data.templates.find(t => t.id === id);
        },

        saveOne(id, name, config) {
            const data = db.read();
            const index = data.templates.findIndex(t => t.id === id);
            const newTemplate = {
                id,
                name,
                config: typeof config === 'string' ? JSON.parse(config) : config,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (index >= 0) {
                data.templates[index] = newTemplate;
            } else {
                data.templates.push(newTemplate);
            }
            db.write(data);
            return newTemplate;
        }
    }
};

export default db;
