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
2. Change the following lines on your Setup script (.bat || .sh)

For Windows users:
```
start cmd /k "cd frontend && npm install && npm run base"
```
to this
```
start cmd /k "cd frontend && npm install && npm run full"
```
For Linux users change this:
```
cd frontend && npm install && npm run base &
```
to this
```
cd frontend && npm install && npm run full &
```
After running it should boot you into Akiko.
 
3. Custom Scripts, Modules, and Arguments.

## Special Stuff

| Name             | Description                      | Required [Modules](#modules) | Screenshot |
| ---------------- | ---------------------------------| ---------------------------- | ---------- |
| Image Captioning | Send a cute picture to your bot!<br><br>Picture select option will appear next to the text input box. | `caption`                    | <img src="https://user-images.githubusercontent.com/26259870/229362131-1344c4bd-2fd0-467c-a842-f115f7b2dc83.png" style="max-width:200px" />  |
| Character Expressions | See your character reacting to your messages!<br><br>**You need to provide your own character images!**<br><br>| `classify` | <img style="max-width:200px" alt="image" src="https://user-images.githubusercontent.com/26259870/229362238-beb65e82-ffb3-4756-8e36-7d66c1d39c86.png"> |

| NPM Script Name| Description |
|------------------|-------------|
| base             |Runs the base version of Akiko, with server, frontend, and backend.|
| base-remote      |Runs the base version of Akiko, with remote access enabled for server and frontend, and backend.|
| caption          |Runs the caption module of Akiko, with server, frontend, and backend.|
| caption-remote   |Runs the caption module of Akiko, with remote access enabled for server, frontend, and backend.|
| classify         |Runs the classification module of Akiko, with server, frontend, and backend.|
| classify-remote  |Runs the classification module of Akiko, with remote access enabled for server, frontend, and backend.|
| full             |Runs the full Akiko feature list, with server, frontend, and backend, enabling both caption and classification.|
| full-remote      |Runs the full Akiko feature list, with remote access enabled for server, frontend, and backend, enabling both caption and classification.|
| custom |Runs the user's custom arguments from the cmd. ```--cpu --share --enable-modules=``` <-- those kind of args. **(WARNING, HOST IS ENABLED FOR FRONTEND FOR ALL CUSTOM ARGS. IF YOU DON'T WANT THIS, EDIT THE PACKAGE.JSON INSIDE OF THE FRONTEND DIRECTORY.)** |

To change which script you are running, edit your Start ( .bat || .sh )
Change the last section of the line from
```
npm run base
```
to 
```
npm run SCRIPT_NAME
```

Using Custom Arguments (example)
```
npm run custom --port --cpu --listen
```
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
# Planned Features:
## Highlighted Features:
- Horde Support. **(Done)**
- Fully Color Custom UI. **(Done)**
- Good Character Creation Page. **(Done)**
- Azure TTS with multiple voices for group chats. **(Done)**
- Multi-sprites/emotion detection for group chats. **(Done)**
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
- Character creation and character management with exports to Character Cards (CharaCardPNG), and JSON. **(Done)**
- Chat with your favorite Character through a polished UI. **(Done)**
- Chat with multiple characters in character groups. **(Done)**
- Chat regeneration (swipes), Editable Messages, Impersonation, Branching Chats. **(75% Done)**
- Emotion detection with corresponding emotional display for set-characters (configuration required). **(Done)
- Send images to your character and have them recognize what the image is. **(Done)**
- Live2D models with emotion display. **(50% Done)**
- Text-to-speech with AzureTTS or (maybe) other alternatives. (this will also allow you to see lips moving on Live2D models.) **(75% Done, Azure TTS with multi chara support is finished.)**
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
Ask for images from the bot (spicy or not).
- Custom Chat Settings are also available on the discord bot.
# Current State of the UI (Obviously WIP submit suggestions to the form above):
## Character Page:
![CharaPage](https://user-images.githubusercontent.com/26259870/233136083-3ca970d4-9f30-45cc-8ced-31ceba307a64.png)
![EditChara](https://user-images.githubusercontent.com/26259870/233136129-0e290bc0-1064-4812-9861-8b67d6b191d2.png)
## Adv. Character Page:
![AdvancedCharaPage](https://user-images.githubusercontent.com/26259870/233136320-246b45e2-3d2c-4da1-a3fc-dbccda9face4.png)
## Chat Page:
![Chat](https://user-images.githubusercontent.com/26259870/233136157-236bbc67-10c2-416e-82ec-9e9f7534cb10.png)
![Group](https://user-images.githubusercontent.com/26259870/233136167-03ee376f-5b26-4ed0-96c5-c07a6c1fc4ef.png)
## Settings Page:
![Settings](https://user-images.githubusercontent.com/26259870/233136194-8674e5ed-1173-4b9e-9147-87bc32727dc0.png)
![DiscordBotPage](https://user-images.githubusercontent.com/26259870/233136206-c61acba2-53aa-47d7-9ee2-9c419c41f55e.png)
Custom Color Example:
![image](https://user-images.githubusercontent.com/26259870/229264937-d08567ff-c231-48b8-b5bb-45820112c30c.png)

