import * as fs from 'fs';

export class FileHandler{

    private path: string = '../../..external-files/endpoints.json';

    private content: any;

    private fileLength: number;

    constructor(path?: string){
        path ? this.path = path : this.path = this.path;
    }

    public checkFileExists(): boolean {
        return fs.existsSync(this.path)
    }

    public readLocalFile(): any{

        if (this.checkFileExists()) {
            
            this.content = JSON.parse(fs.readFileSync(this.path, 'utf-8'));

            this.fileLength = this.content.length - 1;

            return this.content;

        } else {

            console.error('File not found');

            return null;

        }

    };
    
    public writeLocalFile(): void{
  
        if (!this.content) {
            console.error('No content to write');
            return;
        }
            fs.writeFileSync(this.path, JSON.stringify(this.content, null, 2));

            console.info('File saved');

    };
    
    public getFileContent(): any {
        return this.content;
    }

    public setFileContent(content: any): void {
        this.content = content;
    }

    public getFileLength(): number {
        return this.fileLength;
    }

    public setFileLength(fileLength: number): void {
        this.fileLength = fileLength;
    }
    

}