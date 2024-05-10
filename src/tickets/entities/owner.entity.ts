export class Owner {
    
    private id: string;

    private personType: number;

    private profileType: number;

    private businessName: string;

    private email: string;

    get getId(): string {
        return this.id;
    }

    set setId(id: string) {
        this.id = id;
    }

    get getPersonType(): number {
        return this.personType;
    }

    set setPersonType(personType: number) {
        this.personType = personType;
    }

    get getProfileType(): number {
        return this.profileType;
    }

    set setProfileType(profileType: number) {
        this.profileType = profileType;
    }

    get getBusinessName(): string {
        return this.businessName;
    }

    set setBusinessName(businessName: string) {
        this.businessName = businessName;
    }

    get getEmail(): string {
        return this.email;
    }

    set setEmail(email: string) {
        this.email = email;
    }

}