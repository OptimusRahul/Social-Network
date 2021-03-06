import { Request, Response, NextFunction } from 'express';

import { User } from '../../models';
import { decodeJWT, extractJWT } from '../../helpers'
import { errorResponseHandler } from '../../utils';
import { authError } from '../../response';

const { 
    UNAUTHORIZED_USER, 
    UNAUTHORIZED_TOKEN, 
    PASSWORD_CHANGED_LOGIN_AGAIN, 
    INVALID_USER,

} = authError;

const verifyUserState = async(decoded: any, error: string, res: Response, next: NextFunction) => {
    const { id, iat } = decoded;
    let currentUser;
    try {
        currentUser = await User.findById(id);
        
        if(!currentUser) {
            return errorResponseHandler(res, INVALID_USER, error);
        }

        if(currentUser?.changedPasswordAfter(iat)) {
            return errorResponseHandler(res, PASSWORD_CHANGED_LOGIN_AGAIN, '');
        }        
    } catch(error) {
        const { message } = JSON.parse(JSON.stringify(error));
        return errorResponseHandler(res, INVALID_USER, message);
    }

    res.locals.user = currentUser;
    res.locals.id = id;
    res.locals.decoded = decoded;
    next();
} 

const checkUserAuthentication = (type: string, decoded: any, res: Response, next: NextFunction) => {
    switch(type) {
        case 'protect':
            verifyUserState(decoded, UNAUTHORIZED_TOKEN, res, next);
            break;
        default:
            verifyUserState(decoded, INVALID_USER, res, next);
            break;
    }
}

export const protect = async(req: Request, res: Response, next: NextFunction) => {
    const decoded = decodeJWT(extractJWT(req));
    checkUserAuthentication('protect', decoded, res, next);
}

export const isLoggedIn = async(req: Request, res: Response, next: NextFunction) => {
    const { cookies: { jwt } } = req;
    console.log(jwt);
    if(jwt && jwt !== undefined) {
        const decoded = decodeJWT(jwt);
        checkUserAuthentication('', decoded, res, next);
    } else {
        return errorResponseHandler(res, UNAUTHORIZED_USER, '');
    }
}