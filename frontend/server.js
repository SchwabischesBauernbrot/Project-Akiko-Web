import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });
const CHARACTER_FOLDER = './src/shared_data/character_info/';
const CHARACTER_IMAGES_FOLDER = './src/shared_data/character_images/';
const CHARACTER_ADVANCED_FOLDER = './src/shared_data/advanced_characters/';

function allowed_file(filename) {
    const allowed_extensions = ['png', 'jpg', 'jpeg', 'gif'];
    const extension = path.extname(filename).slice(1).toLowerCase();
    return allowed_extensions.includes(extension);
}
  
function secure_filename(filename) {
    return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}
  
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  app.get('/', async (req, res) => {
    const viteServer = await createServer();
    const url = viteServer.url;

    res.redirect(url);
  });
}

// GET /api/characters
app.get('/characters', (req, res) => {
    const characters = [];
  
    fs.readdirSync(CHARACTER_FOLDER).forEach((filename) => {
      if (filename.endsWith('.json')) {
        const characterData = JSON.parse(fs.readFileSync(path.join(CHARACTER_FOLDER, filename), 'utf-8'));
        characters.push(characterData);
      }
    });
  
    res.json(characters);
  });
  
  // POST /api/characters
app.post('/characters', upload.single('avatar'), (req, res) => {
    const fields = {
        char_id: 'char_id',
        name: 'name',
        personality: 'personality',
        description: 'description',
        scenario: 'scenario',
        first_mes: 'first_mes',
        mes_example: 'mes_example'
    };

    let avatar = null;
    if (req.file && allowed_file(req.file.filename)) {
        const filename = secure_filename(`${req.body.char_id}.png`);
        fs.renameSync(req.file.path, path.join(CHARACTER_IMAGES_FOLDER, filename));
        avatar = filename;
    }

    const character = Object.fromEntries(Object.entries(fields).map(([key, value]) => [value, req.body[key]]));
    character.avatar = avatar || 'default.png';

    fs.writeFileSync(path.join(CHARACTER_FOLDER, `${character.char_id}.json`), JSON.stringify(character));

    res.json(character);
});

// GET /api/characters/:char_id
app.get('/characters/:char_id', (req, res) => {
    const characterPath = path.join(CHARACTER_FOLDER, `${req.params.char_id}.json`);

    if (!fs.existsSync(characterPath)) {
        return res.status(404).json({ error: 'Character not found' });
    }

    const characterData = JSON.parse(fs.readFileSync(characterPath, 'utf-8'));
    res.json(characterData);
});

// DELETE /api/characters/:char_id
app.delete('/characters/:char_id', (req, res) => {
    const advancedCharacterFolder = path.join(CHARACTER_ADVANCED_FOLDER, req.params.char_id);
    const characterPath = path.join(CHARACTER_FOLDER, `${req.params.char_id}.json`);
    const imagePath = path.join(CHARACTER_IMAGES_FOLDER, `${req.params.char_id}.png`);
  
      if (!fs.existsSync(characterPath)) {
    return res.status(404).json({ error: 'Character not found' });
  }

  fs.unlinkSync(characterPath);
  if (fs.existsSync(advancedCharacterFolder)) {
    fs.rmSync(advancedCharacterFolder, { recursive: true, force: true });
  }
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  res.json({ message: 'Character deleted successfully' });
});

// PUT /api/characters/:char_id
app.put('/characters/:char_id', upload.single('avatar'), (req, res) => {
    const fields = {
      name: 'name',
      personality: 'personality',
      description: 'description',
      scenario: 'scenario',
      first_mes: 'first_mes',
      mes_example: 'mes_example'
    };
  
    const avatar = req.file && allowed_file(req.file.filename) ? req.file.filename : null;
  
    const characterPath = path.join(CHARACTER_FOLDER, `${req.params.char_id}.json`);
  
    if (!fs.existsSync(characterPath)) {
      return res.status(404).json({ error: 'Character not found' });
    }
  
    const character = JSON.parse(fs.readFileSync(characterPath, 'utf-8'));
  
    if (avatar) {
      const filename = secure_filename(`${req.params.char_id}.png`);
      fs.renameSync(req.file.path, path.join(CHARACTER_IMAGES_FOLDER, filename));
      character.avatar = filename;
    }
  
    Object.entries(fields).forEach(([key, value]) => {
      if (req.body[key]) {
        character[value] = req.body[key];
      }
    });
  
    fs.writeFileSync(characterPath, JSON.stringify(character));
  
    res.json({ message: 'Character updated successfully', avatar });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
