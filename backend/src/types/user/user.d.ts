import { Document } from "mongoose";

enum Gender {
    Male = 0,
    Female = 1
}

export interface IUser extends Document {
    id: string
    email: string
    password: string
    personalDetails: {
        firstName: string
        lastName: string
        photo: string
        gender: Gender
        DOB: Date
        location: Object
    }
    friends: any
    createdAt: Date
    passwordChangedAt: Date
    passwordResetToken: string
    passwordResetExpires: number
    active: boolean
}