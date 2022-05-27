import express from 'express';
import helmet from 'helmet';
import responseTime from 'response-time';
import cors from 'cors';
import bodyParser from 'body-parser';
import { apiSuccess } from 'utils/apiUtils';
import apis from 'api';
import { list } from 'server/routeLister';
import { isTestEnv } from 'utils';
import { initQueues } from 'utils/queue';
import injectRequestId from 'middlewares/injectRequestId';
import { middleware } from 'express-http-context';

/**
 * Connect to database
 */
// let db = mongoConnector();

/**
 * Create express server
 */
const app = express();
app.use(responseTime());
app.set('port', process.env.PORT || 9000);
app.use(helmet());
app.use(cors());
app.use(injectRequestId());
app.use(express.json());
// get information from html forms
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// used for getting and setting request-scoped context anywhere
app.use(middleware);

// setup database
apis(app);
/* istanbul ignore next */
if (!isTestEnv()) {
    initQueues();
}

app.get('/', (req, res) => {
    apiSuccess(res, 'node-parcel-express-mongo server at your service🖖');
});
list(app);

module.exports = app;
