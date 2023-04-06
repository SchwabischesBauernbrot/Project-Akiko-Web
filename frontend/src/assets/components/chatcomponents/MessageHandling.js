import { getBase64 } from '../miscfunctions';
import { getCharacterImageUrl, getUserImageUrl } from '../api';

export const createUserMessage = async (text, image, messageSender, activateImpersonation) => {
    const now = new Date();
    let avatarLink;
    if (activateImpersonation === true) {
        avatarLink = getCharacterImageUrl(messageSender.avatar);
    } else {
        avatarLink = getUserImageUrl(messageSender.avatar);
    }
    const newMessage = {
        sender: messageSender.name,
        text: text,
        image: image ? await getBase64(image) : null, // convert image to base64 string
        avatar: avatarLink,
        isIncoming: false,
        timestamp: now.getTime(),
    };
    return newMessage;
};