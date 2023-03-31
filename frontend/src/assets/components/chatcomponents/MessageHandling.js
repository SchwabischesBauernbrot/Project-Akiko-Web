import { getBase64 } from '../miscfunctions';
import { getCharacterImageUrl } from '../api';

export const createUserMessage = async (text, image, messageSender) => {
    const now = new Date();
    const newMessage = {
        sender: messageSender.name,
        text: text,
        image: image ? await getBase64(image) : null, // convert image to base64 string
        avatar: getCharacterImageUrl(messageSender.avatar),
        isIncoming: false,
        timestamp: now.getTime(),
    };
    return newMessage;
};