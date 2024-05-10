import { FileHandler } from "src/utils/FileHandler";
import { Field } from "./field.entity";

export class EndPoint {

    private brand: string;

    private url: URL;

    private token: string;

    private urlFields: string;

    private fields: Field[];

    private skip: number;

    public endPoints: any;

    constructor(brand?: string, url?: URL, token?: string, urlFields?: string, fields?: Field[], skip?: number) {
        const fileHandler = new FileHandler(process.env.ENDPOINT_PATH || "endpoints.json");
        this.endPoints = fileHandler.readLocalFile();

        brand ? this.brand = brand : this.brand = this.brand;

        url ? this.url = url : this.url = this.url;

        token ? this.token = token : this.token = this.token;

        urlFields ? this.urlFields = urlFields : this.urlFields = this.urlFields;

        fields ? this.fields = fields : this.fields = this.fields;

        skip ? this.skip = skip : this.skip = this.skip;

    }

    findEndPointByBrandAndToken(brand: string = this.getBrand(), token: string = this.getToken()): EndPoint {
        if (Array.isArray(this.endPoints)) {
            this.endPoints.forEach((element: any) => {
            if (`${element.brand}`.toLowerCase() === brand.toLowerCase() && element.token === token) {
                this.setBrand(this.brand);
                this.setUrl(element.url);
                this.setToken(element.token);
                this.setUrlFields(element.urlFields);
                this.setFields(element.fields);
                this.setSkip(element.skip);

                return element;
            }
        });
        } else {
            if (`${this.endPoints.brand}`.toLowerCase() === brand.toLowerCase() && this.endPoints.token === token) {
                this.setBrand(this.brand);
                this.setUrl(this.endPoints.url);
                this.setToken(this.endPoints.token);
                this.setUrlFields(this.endPoints.urlFields);
                this.setFields(this.endPoints.fields);
                this.setSkip(this.endPoints.skip);

                return this.endPoints;
            }
        }
        return 
    }

    public getBrand(): string {
        this.brand[0].toUpperCase() + this.brand.slice(1)[0].toLowerCase() + this.brand.slice(1)[1]
        return this.brand;
    }

    public setBrand(brand: string) {
        this.brand[0].toUpperCase() + this.brand.slice(1)[0].toLowerCase() + this.brand.slice(1)[1]
        this.brand = brand;
    }

    public getUrl(): URL {
        return this.url;
    }

    public setUrl(url: URL) {
        this.url = url;
    }

    public getToken(): string {
        return this.token;
    }

    public setToken(token: string) {
        this.token = token;
    }

    public getUrlFields(): string {
        return this.urlFields;
    }

    public setUrlFields(urlFields: string) {
        this.urlFields = urlFields;
    }

    public getFields(): Field[] {
        return this.fields;
    }

    public setFields(fields: Field[]) {
        this.fields = fields;
    }

    public getSkip(): number {
        return this.skip;
    }

    public setSkip(skip: number) {
        this.skip = skip;
    }

}
