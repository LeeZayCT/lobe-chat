import { clientDB } from '@/database/client/db';
import { FileModel } from '@/database/server/models/file';
import { FileItem, UploadFileParams } from '@/types/files';

import { IFileService } from './type';

export class ClientService implements IFileService {
  private fileModel: FileModel;

  constructor(userId: string) {
    this.fileModel = new FileModel(clientDB as any, userId);
  }

  async createFile(file: UploadFileParams) {
    // save to local storage
    // we may want to save to a remote server later
    const res = await this.fileModel.create({
      fileHash: file.hash,
      fileType: file.fileType,
      knowledgeBaseId: file.knowledgeBaseId,
      metadata: file.metadata,
      name: file.name,
      size: file.size,
      url: file.url!,
    });
    // arrayBuffer to url
    const base64 = Buffer.from(file.data!).toString('base64');

    return {
      id: res.id,
      url: `data:${file.fileType};base64,${base64}`,
    };
  }

  async getFile(id: string): Promise<FileItem> {
    const item = await this.fileModel.findById(id);
    if (!item) {
      throw new Error('file not found');
    }

    // arrayBuffer to url
    const url = URL.createObjectURL(new Blob([item.data!], { type: item.fileType }));

    return {
      createdAt: new Date(item.createdAt),
      id,
      name: item.name,
      size: item.size,
      type: item.fileType,
      updatedAt: new Date(item.updatedAt),
      url,
    };
  }

  async removeFile(id: string) {
    await this.fileModel.delete(id, false);
  }

  async removeFiles(ids: string[]) {
    await this.fileModel.deleteMany(ids, false);
  }

  async removeAllFiles() {
    return this.fileModel.clear();
  }
}
