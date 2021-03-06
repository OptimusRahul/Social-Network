import { ObjectID } from 'mongodb';
import { Schema, model } from 'mongoose';

import { post, reaction } from '../../config';
import { IPost } from '../../types'

const { PUBLIC_POST, PRIVATE_POST } = post;
const { LIKE, LOVE, SAD, HAPPY, ANGRY } = reaction;

const postSchema: Schema<IPost> = new Schema({
    from: {
        type: ObjectID,
        ref: 'user',
        required: true,
    },
    to: {
        type: ObjectID,
        ref: 'user',
    },
    post: {
        type: String
    },
    scope: {
        type: String,
        enum: [PUBLIC_POST, PRIVATE_POST],
        default: PUBLIC_POST
    },
    reactions:[{
        reactionId: {
            type: ObjectID,
            ref: 'reaction',
            required: true
        }
    }],
    comments: [{
        commentID: {
            type: ObjectID,
            ref: 'comment',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Post = model<IPost>('post', postSchema);

export { Post };

/*

reactions:[{
        from: {
            type: ObjectID,
            ref: 'user',
            required: true
        },
        reaction: {
            type: String,
            enum: [LIKE, LOVE, HAPPY, SAD, ANGRY],
            required: true
        }
    }],
*/