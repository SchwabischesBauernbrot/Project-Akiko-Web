# Project Akiko
 Making an Open Source Twitch VTuber with TTS and Language Model processing, and creating a universal Chat Platform for LLMs like Pygmalion, LLaMA and others.
# Credit to other repos/creators:
- SillyLossy (Cohee) and his gracious sharing of his code for https://github.com/SillyLossy/TavernAI-extras and also his Misaka Chara Card and sprites.
- henk717 and his creation of the start runtime for Project Akiko.
- Trappu for both Mobius and the Akiko Chara Cards.
- AliCat for Harry Potter Characard.
- AVAKSon for Gilgamesh and his sprites.

## Quick Links:
- Suggestions Form: https://forms.gle/pahKwy73D6DzCaJV8
- Trello Board (Check here for what's being worked on): https://trello.com/b/muwhUyM9/main-app
- Discord Server: https://discord.gg/Pdhd7dEqHp
# Basic Usage Guide (no image gen or emotion classification):
1. Clone the repo to your local machine.
2. Click the 'setup.bat' file and wait for the batch file to complete setting up your enviornment. After you run this once, just use Start.bat for startup.
3. Navigate to the link displayed on the Node CMD. usually it is 'http://localhost:5173/'.
4. Go to the 'Settings' tab and configure your Textgen Endpoint. 
5. Start chatting!
# Advanced User Guide
1. Clone the repo to your local machine. 
2. Go into the 'setup.bat' (and or 'setup.sh' on Linux).
For windows users change this:
```
start cmd /k "cd backend && pip install -r requirements.txt && python server.py"
```
to this
```
start cmd /k "cd backend && pip install -r full_requirements.txt && python server.py"
```
For Linux users change this:
```
cd backend && pip install -r requirements.txt && python server.py&
```
to this
```
cd backend && pip install -r full_requirements.txt && python server.py&
```
After running it should boot you into Akiko. 
### 3 Adding in modules.

## UI Extensions

| Name             | Description                      | Required [Modules](#modules) | Screenshot |
| ---------------- | ---------------------------------| ---------------------------- | ---------- |
| Image Captioning | Send a cute picture to your bot!<br><br>Picture select option will appear next to the text input box. | `caption`                    | <img src="https://user-images.githubusercontent.com/26259870/229362131-1344c4bd-2fd0-467c-a842-f115f7b2dc83.png" style="max-width:200px" />  |
| Character Expressions | See your character reacting to your messages!<br><br>**You need to provide your own character images!**<br><br>| `classify` | <img style="max-width:200px" alt="image" src="https://user-images.githubusercontent.com/26259870/229362238-beb65e82-ffb3-4756-8e36-7d66c1d39c86.png"> |


## Modules

| Name        | Description                       | Included in default requirements.txt       |
| ----------- | --------------------------------- | ------ |
| `caption`   | Image captioning                  | :x: No        |
| `classify`  | Text sentiment classification     | :x: No      |

## Additional options
| Flag                     | Description                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| `--enable-modules`       | **Required option**. Provide a list of enabled modules.<br>Expects a comma-separated list of module names. See [Modules](#modules)<br>Example: `--enable-modules=caption,sd` |
| `--port`                 | Specify the port on which the application is hosted. Default: **5100** |
| `--listen`               | Host the app on the local network                                      |
| `--share`                | Share the app on CloudFlare tunnel                                     |
| `--cpu`                  | Run the models on the CPU instead of CUDA                              |
| `--summarization-model`  | Load a custom summarization model.<br>Expects a HuggingFace model ID.<br>Default: [Qiliang/bart-large-cnn-samsum-ChatGPT_v3](https://huggingface.co/Qiliang/bart-large-cnn-samsum-ChatGPT_v3) |
| `--classification-model` | Load a custom sentiment classification model.<br>Expects a HuggingFace model ID.<br>Default (6 emotions): [bhadresh-savani/distilbert-base-uncased-emotion](https://huggingface.co/bhadresh-savani/distilbert-base-uncased-emotion)<br>Other solid option is (28 emotions): [joeddav/distilbert-base-uncased-go-emotions-student](https://huggingface.co/joeddav/distilbert-base-uncased-go-emotions-student) |
| `--captioning-model`     | Load a custom captioning model.<br>Expects a HuggingFace model ID.<br>Default: [Salesforce/blip-image-captioning-large](https://huggingface.co/Salesforce/blip-image-captioning-large) |
| `--keyphrase-model`      | Load a custom key phrase extraction model.<br>Expects a HuggingFace model ID.<br>Default: [ml6team/keyphrase-extraction-distilbert-inspec](https://huggingface.co/ml6team/keyphrase-extraction-distilbert-inspec) |

Add any of those arguments to the ``start.bat`` or ``start.sh`` like this:
```
python server.py --enable-modules=caption,classify --listen
```
To make your site public, use this in the same file:
```
npx vite --host
```
# Planned Features:
## Highlighted Features:
- Horde Support. **(Done)**
- Fully Color Custom UI. **(Done)**
- Good Character Creation Page. **(Done)**
## Backend Features:
- Connect to Kobold, Ooba, horde, or use Akiko's own backend. With Pygmalion and LLaMA support. **(Mostly Done)**
- Emotion Detection. **(Done)**
- Long-term and Short Term memory summarization.
- Image captioning. **(Done)**
- Stable Diffusion (probably).
## Full Guide to Language Model Config, Character Creation, and more:
- Character Creation 
- Character Card Import/Export
- Guide Page full of info for creating characters in every available style, AliChat, W++, and more.
## Chat with Characters:
- Character creation and character management with exports to Character Cards (TavernCardPNG). **(Done)**
- Chat with your favorite Character through a polished UI. **(Done)**
- Chat with multiple characters in character groups. **(Done)**
- Chat regeneration (swipes), Editable Messages, Impersonation, Branching Chats. **(75% Done)**
- Emotion detection with corresponding emotional display for set-characters (configuration required). **(Done)
- Send images to your character and have them recognize what the image is. **(Done)**
- Live2D models with emotion display. **(50% Done)**
- Text-to-speech with AzureTTS or (maybe) other alternatives. (this will also allow you to see lips moving on Live2D models.)
### Custom Chat Settings:
- Configure whether or not you want your bot to know what the current time of day is.
- Configure 'time since' to show your bot how long it has been since you last messaged them.
- Configure your relationship to the bot (Friend, Lover, Wife/Husband, Sibling, Custom Value, etc).
- Configure 'consent' for certain actions for more 'realism'.
## Multi-user Support:
This feature and it's components will be optional.
- User sign-on/sign-up.
- Allow authorized users to access application settings.
- Have a user profile custom to you and your other users.
- Be able to invite users to chat with you and your AI with user recognition.
- See other user's stats (how many messages they've sent, what their favorite Character is, etc.)
- See a Character's creator.
- Character sharing (or not).
## Twitch integration: 
- Create your own AI VTuber like Neurosama!
- See and manage Twitch Stats and Chats from inside Project Akiko UI.
- Manage AI output so it is Twitch filtered (no more holocaust jokes!).
## Discord Bot Integration:
- Chat with your bot through discord.
- Send images to the bot.
- Ask for images from the bot (spicy or not).
- Custom Chat Settings are also available on the discord bot.
# Current State of the UI (Obviously WIP submit suggestions to the form above):
## Character Page:
![image](https://user-images.githubusercontent.com/26259870/229264713-62bd4895-5c09-487c-a780-f295cca96950.png)
![image](https://user-images.githubusercontent.com/26259870/229264719-b3446bc5-31ac-4f09-9cc4-50255e3b1aa0.png)
![image](https://user-images.githubusercontent.com/26259870/229264730-275c191e-8013-4318-a445-ac9f2dbb6890.png)
## Chat Page:
![image](https://user-images.githubusercontent.com/26259870/229265249-09794bea-14c1-45cb-be69-d30fab848a88.png)
![image](https://user-images.githubusercontent.com/26259870/229264860-5632fe81-af11-4463-8e46-9707296b4d51.png)
![image](https://user-images.githubusercontent.com/26259870/229264957-f6e906ff-91a0-46c0-b6a3-fce8f5c61345.png)
![image](https://user-images.githubusercontent.com/26259870/229264971-8a2cbbf7-e433-4c13-9700-f268b8aad6c6.png)
![image](https://user-images.githubusercontent.com/26259870/229264989-9a3728fa-7adc-42d3-98b3-c5116a759b4e.png)
![image](https://user-images.githubusercontent.com/26259870/229265012-a8156186-652f-4571-871e-899124676ad3.png)
## Settings Page:
![image](https://user-images.githubusercontent.com/26259870/229264847-a79b1c15-3b49-41fb-b0fb-502a6f62aa67.png)
Custom Color Example:
![image](https://user-images.githubusercontent.com/26259870/229264937-d08567ff-c231-48b8-b5bb-45820112c30c.png)

