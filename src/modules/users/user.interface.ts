export interface IUser {
    name: string;
    email: string;
    password: string;
    role: "contributor" | "maintainer";
}

export interface IJwtUser {
    id: number;
    name: string;
    email: string;
    role: "contributor" | "maintainer";
}