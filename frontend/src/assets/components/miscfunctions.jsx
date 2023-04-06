import GPT3Tokenizer from 'gpt3-tokenizer';

const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });

export function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

export function getTokenCount(text){
  let tokenCount = 0;
  let encodedStr;
  try{
    encodedStr = tokenizer.encode(text);
    tokenCount = encodedStr.bpe.length;
  }catch(e){
    console.log(e);
  }
  return tokenCount;
}