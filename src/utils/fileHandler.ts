import { Logger } from '@nestjs/common';
import * as fs from 'fs';

export class FileHandler {
  private path: string;

  private content: any;

  private fileLength: number;

  fileExists: boolean;

  constructor(path?: string) {
    path ? (this.path = path) : (this.path = this.path);

    this.fileExists = this.checkFileExists();

    this.content = [];
  }

  public checkFileExists(): boolean {
    try {
      
      const fileExist = fs.existsSync(this.path);

      Logger.log(`Checking file - ${this.path} | Exist : ${fileExist}`);
      return fileExist
    } catch (error) {
      Logger.error(`Error while checking file - ${this.path}: ${error.message}`);
    }
  }

  public readLocalFile(): any {
    try {
      if (this.fileExists == true) {
        Logger.log(`Reading file - ${this.path}`);
        this.content = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
  
        this.fileLength = this.content.length - 1;
  
        return this.content;
      } else {
        console.error(`File does not exist: ${this.path}`);
        return null;
      }
    } catch (error) {
      
      throw new Error(`Error while reading file - ${this.path}: ${error.message}`);
    }
  }

  public async writeLocalFile() {
    if (
      !this.content ||
      this.content.length === 0 ||
      this.content[0] === undefined
    ) {
      Logger.error(`No content to write: ${this.path}`);
      return;
    }
    const writeStream = fs.createWriteStream(this.path, { flags: 'w' });
    await writeStream.write(this.safeStringify(this.content));
    writeStream.end(() => {
      console.info('File saved');
    });
    return this.content;
  }

  public appendFile(): void {
    if (
      !this.content ||
      this.content.length === 0 ||
      this.content[0] === undefined
    ) {
      console.error(`No content to append: ${this.path}`);
      return;
    }

    const appendStream = fs.createWriteStream(this.path, { flags: 'a' });
    appendStream.write(this.safeStringify(this.content));
    appendStream.end(() => {
      console.info('File appended');
    });
  }

  public getFileContent(): any {
    return this.content;
  }

  public setFileContent(content: any): void {
    this.content = content;
  }

  public getFileLength(): number {
    return this.fileLength;
  }

  public appendContent(content: any): void {
    this.content.push(content);
  }

  public setFileLength(fileLength: number): void {
    this.fileLength = fileLength;
  }

  private safeStringify(obj: any): string {
    const cache = new Set();
    const result = JSON.stringify(
      obj,
      function (key, value) {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) {
            return;
          }
          cache.add(value);
        }
        return value;
      },
      2,
    );
    cache.clear();
    return result;
  }
}