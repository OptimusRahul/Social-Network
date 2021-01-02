import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { jwtConfig } from '../config';
import { decodeJWT } from '../helpers'
import { errorResponseHandler } from '../utils';
import { authMiddleWare } from '../errors';
import User from '../models/userModel';

const { 
    UNAUTHORIZED_USER, 
    UNAUTHORIZED_TOKEN, 
    PASSWORD_CHANGED_LOGIN_AGAIN,
    USER_LOGGED_IN } = authMiddleWare;

const { JWT_SECRET } = jwtConfig;

export const protect = async(req: Request, res: Response, next: NextFunction) => {
    // 1) Getting token and check if it's there
    let token: string = '';

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.jwt) {
        token = req.cookies.jwt;
    } 

    if(!token || token === 'null') {
        return errorResponseHandler(res, UNAUTHORIZED_USER, 401);
    }

    // 2) Verification token
    let currentUser;

    try{ 

        const decoded = decodeJWT(token);

        console.log(decoded);

        // 3) Check if user still exists
        currentUser = await User.findById(decoded.id);
        if(!currentUser) {
            console.log(UNAUTHORIZED_TOKEN);
            return errorResponseHandler(res, UNAUTHORIZED_TOKEN);
        }

        if(currentUser?.changedPasswordAfter(decoded.iat)) {
            return errorResponseHandler(res, PASSWORD_CHANGED_LOGIN_AGAIN);
        }
    } catch(error) {
        const { message } = JSON.parse(JSON.stringify(error));
        return errorResponseHandler(res, message);
    }

    req.user = currentUser || '';
    res.locals.user = currentUser;

    next();
}

export const isLoggedIn = async(req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.jwt) {
        const token = req.cookies.jwt;
        try {
            const decoded = decodeJWT(token);

            const currentUser = await User.findById(decoded.id);
            
            if(currentUser) {
                return errorResponseHandler(res, USER_LOGGED_IN)
            }

            // if(currentUser && currentUser.changedPasswordAfter(decoded.iat)){
                // return next();
            // }

            res.locals.user = currentUser;
            // return next();

        } catch(error) {
            const { message } = JSON.parse(JSON.stringify(error));
            return errorResponseHandler(res, message);
        }
    }
    next();
}