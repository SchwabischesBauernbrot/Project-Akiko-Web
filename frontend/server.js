import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import multer from 'multer';
import axios from 'axios';
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });
const CHARACTER_FOLDER = './src/shared_data/character_info/';
const CHARACTER_IMAGES_FOLDER = './src/shared_data/character_images/';
const CHARACTER_ADVANCED_FOLDER = './src/shared_data/advanced_characters/';
const BACKGROUNDS_FOLDER = './src/shared_data/backgrounds/';
const USER_IMAGES_FOLDER = './src/shared_data/user_avatars/';
const AUDIO_OUTPUT = './src/audio/';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const CONVERSATIONS_FOLDER = './src/shared_data/conversations/';
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

// Signal handling
process.on('SIGINT', () => {
  console.log('Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

/*
############################################
##                                        ##
##          CHARACTER ROUTES              ##
##                                        ##
############################################
*/

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


/*
############################################
##                                        ##
##             TTS ROUTES                 ##
##                                        ##
############################################
*/
const ELEVENLABS_ENDPOINT = 'https://api.elevenlabs.io/v1';
// FETCH VOICE IDS
app.get('/tts/fetchvoices/', async (req, res) => {
  try {
    const response = await axios.get(`${ELEVENLABS_ENDPOINT}/voices`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ELEVENLABS_API_KEY,
      },
    });

    const voice_id = response.data.voices[0].voice_id;
    res.send(voice_id);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// STREAMING AUDIO
app.post('/tts/generate/:voice_id', async (req, res) => {
  try {
    const voice_id = req.params.voice_id;
    const prompt = req.params.prompt;
    const stability = req.params.stability;
    const similarity_boost = req.params.similarity_boost;

    const payload = {
      text: prompt,
      voice_settings: {
        stability: stability,
        similarity_boost: similarity_boost,
      },
    };

    const response = await axios.post(
      `${ELEVENLABS_ENDPOINT}/text-to-speech/${voice_id}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ELEVENLABS_API_KEY,
        },
        responseType: 'arraybuffer',
      }
    );

    const date = new Date();
    const fileName = `${date.getTime()}.mp3`;
    const audioFilePath = path.join(__dirname, fileName);
    fs.writeFileSync(audioFilePath, response.data);

    res.send(fileName);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

/*
############################################
##                                        ##
##          Conversation ROUTES           ##
##                                        ##
############################################
*/

app.post('/conversation', (req, res) => {
  const conversationData = req.body;
  const chatName = conversationData.conversationName;

  if (!fs.existsSync(CONVERSATIONS_FOLDER)) {
      fs.mkdirSync(CONVERSATIONS_FOLDER);
  }
  const filePath = path.join(CONVERSATIONS_FOLDER, `${chatName}.json`);
  try {
      fs.writeFileSync(filePath, JSON.stringify(conversationData));
      res.status(200).json({ status: 'success' });
  } catch (e) {
      console.error(`Error saving conversation: ${e.toString()}`);
      res.status(500).json({ status: 'error', message: 'An error occurred while saving the conversation.' });
  }
});

app.get('/conversations', (req, res) => {
  if (!fs.existsSync(CONVERSATIONS_FOLDER)) {
      res.json({ conversations: [] });
      return;
  }
  const conversationFiles = fs.readdirSync(CONVERSATIONS_FOLDER);
  const conversationNames = conversationFiles.map(file => path.parse(file).name);
  res.json({ conversations: conversationNames });
});

app.route('/conversation/:conversation_name')
  .get((req, res) => {
      const convoPath = path.join(CONVERSATIONS_FOLDER, `${req.params.conversation_name}.json`);
      try {
          const convoData = JSON.parse(fs.readFileSync(convoPath));
          res.json(convoData);
      } catch (e) {
          if (e.code === 'ENOENT') {
              res.status(404).json({ error: 'Conversation not found' });
          } else {
              res.status(500).json({ error: 'An error occurred while reading the conversation.' });
          }
      }
  })
  .delete((req, res) => {
      const convoPath = path.join(CONVERSATIONS_FOLDER, `${req.params.conversation_name}.json`);
      try {
          fs.unlinkSync(convoPath);
          res.json({ message: 'Conversation deleted successfully' });
      } catch (e) {
          if (e.code === 'ENOENT') {
              res.status(404).json({ error: 'Conversation not found' });
          } else {
              res.status(500).json({ error: 'An error occurred while deleting the conversation.' });
          }
      }
  });

/*
############################################
##                                        ##
##        Advanced Character ROUTES       ##
##                                        ##
############################################
*/

app.delete('/advanced-character/:char_id/:emotion', (req, res) => {
    const { char_id, emotion } = req.params;
    const emotion_path = path.join(CHARACTER_ADVANCED_FOLDER, char_id, `${emotion}.png`);
    const default_path = path.join(CHARACTER_ADVANCED_FOLDER, char_id, 'default.png');

    if (fs.existsSync(emotion_path)) {
        fs.unlinkSync(emotion_path);
        if (emotion === 'default' && fs.existsSync(default_path)) {
            fs.unlinkSync(default_path);
        }
        res.json({ success: `Character emotion ${emotion} deleted.` });
    } else {
        res.status(404).json({ failure: `Character does not have an image for the ${emotion} emotion.` });
    }
});

app.get('/advanced-character/:char_id/:emotion', (req, res) => {
    const { char_id, emotion } = req.params;
    const emotion_path = path.join(CHARACTER_ADVANCED_FOLDER, char_id, `${emotion}.png`);
    const default_path = path.join(CHARACTER_ADVANCED_FOLDER, char_id, 'default.png');

    if (fs.existsSync(emotion_path)) {
        const imagePath = path.join(CHARACTER_ADVANCED_FOLDER, char_id, `${emotion}.png`);
        res.json({ success: 'Character emotion found', path: imagePath });
    } else if (fs.existsSync(default_path)) {
        const imagePath = path.join(CHARACTER_ADVANCED_FOLDER, char_id, 'default.png');
        res.json({ failure: 'Character emotion not found, reverting to default', path: imagePath });
    } else {
        res.status(404).json({ failure: 'Character does not have an image for this emotion.' });
    }
});

app.post('/advanced-character/:char_id/:emotion', (req, res) => {
    const { char_id, emotion } = req.params;
    const char_folder = path.join(CHARACTER_ADVANCED_FOLDER, char_id);
    if (!fs.existsSync(char_folder)) {
        fs.mkdirSync(char_folder);
    }
    const emotion_file = req.files?.emotion;
    if (!emotion_file) {
        res.status(500).json({ error: 'No emotion image file found' });
        return;
    }
    const emotion_file_name = `${emotion}.png`;
    emotion_file.mv(path.join(char_folder, emotion_file_name), err => {
        if (err) {
            res.status(500).json({ error: 'An error occurred while saving the emotion image file.' });
        } else {
            const imagePath = path.join(CHARACTER_ADVANCED_FOLDER, char_id, emotion_file_name);
            res.json({ path: imagePath });
        }
    });
});

app.get('/advanced-character/:char_id', (req, res) => {
    const char_folder = path.join(CHARACTER_ADVANCED_FOLDER, req.params.char_id);
    if (fs.existsSync(char_folder)) {
        const emotions_with_ext = fs.readdirSync(char_folder);
        const emotions = emotions_with_ext.map(emotion => path.parse(emotion).name);
        res.json({ success: 'Character emotions found', emotions });
    } else {
        res.status(404).json({ failure: 'Character does not have any emotions.' });
    }
});

app.post('/character-speech/:char_id', (req, res) => {
  const { char_id } = req.params;
  const character_speech = req.body;
  if (!character_speech) {
      res.status(500).json({ error: 'No character speech data found' });
      return;
  }
  const char_folder = path.join(CHARACTER_ADVANCED_FOLDER, char_id);
  if (!fs.existsSync(char_folder)) {
      fs.mkdirSync(char_folder);
  }
  fs.writeFile(path.join(char_folder, 'character_speech.json'), JSON.stringify(character_speech), err => {
      if (err) {
          res.status(500).json({ error: 'An error occurred while saving the character speech data.' });
      } else {
          res.send('Character speech saved successfully!');
      }
  });
});

/*
############################################
##                                        ##
##             Speech ROUTES              ##
##                                        ##
############################################
*/
app.get('/character-speech/:char_id', (req, res) => {
  const { char_id } = req.params;
  const char_folder = path.join(CHARACTER_ADVANCED_FOLDER, char_id);
  if (!fs.existsSync(char_folder)) {
      res.status(404).json({ error: 'Character folder not found' });
      return;
  }
  const speech_file = path.join(char_folder, 'character_speech.json');
  if (!fs.existsSync(speech_file)) {
      res.status(404).json({ error: 'Speech file not found' });
      return;
  }
  fs.readFile(speech_file, (err, data) => {
      if (err) {
          res.status(500).json({ error: 'An error occurred while reading the character speech data.' });
      } else {
          res.json(JSON.parse(data));
      }
  });
});

app.post('/synthesize_speech', async (req, res) => {
  const { ssml, speech_key, service_region } = req.body;
  if (ssml && speech_key && service_region) {
    try {
      const fileName = await synthesizeSpeech(ssml, speech_key, service_region);
      console.log('Speech synthesized successfully.');
      res.status(200).json({ status: 'success', message: 'Speech synthesized successfully.', audio: fileName });
    } catch (error) {
      console.log('Speech synthesis failed.');
      res.status(500).json({ status: 'error', message: 'Speech synthesis failed.' });
    }
  } else {
    console.log('Invalid input.');
    res.status(500).json({ status: 'error', message: 'Invalid input.' });
  }
});


async function synthesizeSpeech(ssmlString, speechKey, serviceRegion) {
  var speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, serviceRegion);
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm;
  const files = fs.readdirSync(AUDIO_OUTPUT);
  files.forEach(file => {
    fs.unlinkSync(`${AUDIO_OUTPUT}/${file}`);
    console.log(`File ${file} deleted from ${AUDIO_OUTPUT} directory.`);
  });
  var timestamp = new Date().toISOString().replace(/:/g, '-');
  var fileName = `${AUDIO_OUTPUT}${timestamp}.wav`;
  var audioConfig = sdk.AudioConfig.fromAudioFileOutput(fileName);
  var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  try {
    await new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssmlString,
        result => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log("Speech synthesis succeeded.");
            resolve();
          } else {
            console.error("Speech synthesis failed: " + result.errorDetails);
            reject(new Error(result.errorDetails));
          }
          synthesizer.close();
        },
        error => {
          console.error("Speech synthesis failed: " + error);
          reject(error);
          synthesizer.close();
        }
      );
    });
    return `${timestamp}.wav`;
  } catch (error) {
    console.log('Speech synthesis failed.');
    return null;
  }
}

/*
############################################
##                                        ##
##           Background ROUTES            ##
##                                        ##
############################################
*/
app.post('/backgrounds', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0 || !req.files.background) {
    res.status(400).json({ error: 'No background file uploaded.' });
    return;
  }

  const file = req.files.background;
  const ext = '.' + file.name.split('.').pop();
  const filename = uuidv4() + ext;
  const filepath = join(BACKGROUNDS_FOLDER, filename);
  const stream = createWriteStream(filepath);

  file.mv(stream.path, err => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while uploading the file.' });
    } else {
      res.status(200).json({ filename });
    }
  });
});

app.get('/backgrounds', (req, res) => {
  const backgrounds = [];
  const files = fs.readdirSync(BACKGROUNDS_FOLDER);
  files.forEach(file => {
    const ext = path.extname(file);
    if (ext === '.jpg' || ext === '.png') {
      backgrounds.push(file);
    }
  });
  res.json({ backgrounds });
});

app.delete('/backgrounds/:filename', (req, res) => {
  const { filename } = req.params;
  if (!filename) {
    res.status(400).json({ error: 'No filename provided.' });
    return;
  }

  const filepath = join(BACKGROUNDS_FOLDER, filename);
  if (!fs.existsSync(filepath)) {
    res.status(404).json({ error: `File ${filename} not found.` });
    return;
  }

  fs.unlink(filepath, err => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while deleting the file.' });
    } else {
      res.status(200).json({ success: `File ${filename} deleted.` });
    }
  });
});

/*
############################################
##                                        ##
##              USER ROUTES               ##
##                                        ##
############################################
*/
app.post('/user-avatar', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0 || !req.files.avatar) {
    res.status(400).send('No avatar file provided');
    return;
  }

  const avatar = req.files.avatar;
  const ext = '.' + avatar.name.split('.').pop();
  const filename = Date.now() + ext;
  const filepath = join(USER_IMAGES_FOLDER, filename);
  const stream = createWriteStream(filepath);

  avatar.mv(stream.path, err => {
    if (err) {
      res.status(500).send('An error occurred while uploading the file.');
    } else {
      res.status(200).json({ avatar: filename });
    }
  });
});

app.get('/user-avatar', (req, res) => {
  const avatars = [];
  const files = fs.readdirSync(USER_IMAGES_FOLDER);
  files.forEach(file => {
    const ext = path.extname(file);
    if (ext === '.png') {
      avatars.push(file);
    }
  });
  res.json({ avatars });
});