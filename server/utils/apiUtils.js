import log from 'utils/logger';
export const apiSuccess = (res, data) => {
    log.info('apiSuccess', { data });
    return res.send({ data }).status(200);
};

export const apiFailure = (res, error, status = 500) => {
    log.info('apiFailure', { error });
    return res.status(status).send({ error });
};
