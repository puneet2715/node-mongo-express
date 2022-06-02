import * as httpContext from 'express-http-context';
import { Stores } from 'database/models/stores';
import { Users } from 'database/models/users';
import message from 'utils/i18n/message';
import { ownershipBasedAccessControl } from 'middlewares/auth/ownershipBasedAccessControl';

describe('ownershipBasedAccessControl tests', () => {
    let mockingoose;
    beforeEach(() => {
        mockingoose = require('mockingoose');
    });
    const mockResource = {
        _id: '62861b5be1897fc8b1d82360',
        name: 'Reliance',
        address: 'Andheri East',
        admin: [
            {
                firstName: 'Sourav',
                lastName: 'Sharma',
                email: 'sharma@yopmail.com',
                authId: 'auth|654321aerty',
                role: 'STORE_ADMIN'
            }
        ]
    };
    it('return true if the requester is the owner of resource', async () => {
        mockingoose(Stores).toReturn(mockResource, 'findOne');
        const requestorEmail = mockResource.admin[0].email;
        const configObj = {
            condition: { 'admin.email': requestorEmail },
            ownerKey: 'admin'
        };
        const result = await ownershipBasedAccessControl(
            requestorEmail,
            Stores,
            configObj
        );
        expect(result).toBe(true);
    });
    it('return true if the requester is the resource owner ', async () => {
        const mockUser = {
            _id: '62861b5be1897fc8b1d82360',
            firstName: 'Sourav',
            lastName: 'Sharma',
            email: 'sharma@yopmail.com',
            authId: 'auth|654321aerty',
            role: 'STORE_ADMIN'
        };
        mockingoose(Users).toReturn(mockUser, 'findOne');
        const requestorEmail = mockUser.email;
        const configObj = {
            condition: { email: requestorEmail },
            ownerKey: 'email'
        };
        const result = await ownershipBasedAccessControl(
            requestorEmail,
            Users,
            configObj
        );
        expect(result).toBe(true);
    });

    it('return true and set findAll condition if the requester is the owner of resource', async () => {
        mockingoose(Stores).toReturn(mockResource, 'findOne');
        const requestorEmail = mockResource.admin[0].email;
        const configObj = {
            condition: { 'admin.email': requestorEmail },
            ownerKey: 'admin',
            findAll: { key: '_id', value: null },
            resourceOwnershipPath: '_id'
        };
        const setSpy = jest.spyOn(httpContext.default, 'set');
        const result = await ownershipBasedAccessControl(
            requestorEmail,
            Stores,
            configObj
        );
        expect(setSpy).toBeCalledTimes(1);
        expect(result).toBe(true);
    });

    it('should return false if the requestor is not the owner of resource', async () => {
        mockingoose(Stores).toReturn(mockResource, 'findOne');
        const requestorEmail = 'ramesh@yopmail.com';
        const configObj = {
            condition: { 'admin.email': requestorEmail },
            ownerKey: 'admin'
        };
        const result = await ownershipBasedAccessControl(
            requestorEmail,
            Stores,
            configObj
        );
        expect(result).toBe(false);
    });

    it('should throw error if resource is not found', async () => {
        mockingoose(Stores).toReturn(undefined, 'findOne');
        const requestorEmail = mockResource.admin[0].email;
        const configObj = {
            condition: { 'admin.email': requestorEmail },
            ownerKey: 'admin'
        };
        expect(async () => {
            await ownershipBasedAccessControl(
                requestorEmail,
                Stores,
                configObj
            );
        }).rejects.toThrowError(message.RESOURCE_NOT_FOUND);
    });
});
