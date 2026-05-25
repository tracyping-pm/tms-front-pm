import { File as File_2, GoogleGenAI, createPartFromUri } from '@google/genai';
import { fileToBlob } from './fileSupport';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export type IFile_2 = File_2;
export const getGenAIFileInfo = async (file: File) => {
  // https://github.com/googleapis/js-genai/blob/main/sdk-samples/generate_content_with_file_upload.ts
  const blobFile = await fileToBlob(file);
  // Upload the file.
  const file_2 = await ai.files.upload({
    file: blobFile,
    config: {
      displayName: file.name,
    },
  });

  // Wait for the file to be processed.
  let getFile = await ai.files.get({ name: file_2.name as string });
  while (getFile.state === 'PROCESSING') {
    getFile = await ai.files.get({ name: file_2.name as string });
    console.log(`current file status: ${getFile.state}`);
    console.log('File is still processing, retrying in 5 seconds');

    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  }

  return new Promise((resolve, reject) => {
    if (file_2.state === 'ACTIVE') {
      resolve(getFile);
    }

    if (file_2.state === 'FAILED') {
      reject();
    }
  });
};

export const getPartByUri = async (uri: string, mimeType: string) => {
  const part = await createPartFromUri(uri, mimeType);
  return part;
};

export const extractJson: any = (str: string) => {
  try {
    // 如果失败，尝试清理后解析
    const cleaned = str
      ?.replace?.(/^```(json)?/gm, '') // 移除开头的```json
      ?.replace?.(/```$/gm, '') // 移除结尾的```
      ?.trim?.();
    // 尝试直接解析（如果已经是纯JSON）
    return JSON.parse(cleaned);
  } catch {
    return str;
  }
};
