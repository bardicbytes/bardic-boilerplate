import fs from 'fs';
import https from 'https';
import path from 'path';
import cors from 'cors';
import express from 'express';
// import handlebars from 'handlebars';
// import hbs from 'hbs';
import helmet from 'helmet';
// eslint-disable-next-line import/no-extraneous-dependencies
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';
import addErrorHandler from './middleware/error-handler';
import registerRoutes from './routes';

const options = {
	key: fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.cert'),
};

export default class WebApp {
	public express: express.Application;

	public httpsServer: https.Server;

	public async init(): Promise<void> {
		this.express = express();
		this.httpsServer = https.createServer(options, this.express);
		// add all global middleware like cors
		this.middleware();

		// // register the all routes
		this.routes();

		// add the middleware to handle error, make sure to add if after registering routes method
		this.express.use(addErrorHandler);

		// In a development/test environment, Swagger will be enabled.
		if (environment.isDevEnvironment() || environment.isTestEnvironment()) {
			this.setupSwaggerDocs();
		}
	}

	private routes(): void {
		this.express.get('/', this.basePathRoute);
		this.express.use('/', registerRoutes());
	}

	private middleware(): void {
		this.express.use(helmet({ contentSecurityPolicy: false }));
		this.express.use(express.json({ limit: '100mb' }));
		this.express.use(
			express.urlencoded({ limit: '100mb', extended: true }),
		);

		// eslint-disable-next-line consistent-return
		this.express.use((req, res, next) => {
			if (!req.secure) {
				return res.redirect(
					['https://', req.get('Host'), req.url].join(''),
				);
			}
			next();
		});

		const corsOptions = {
			origin: [
				'http://localhost:80/',
				'https://localhost:443/',
				'https://127.0.0.1:443',
			],
		};
		this.express.use(cors(corsOptions));

		this.express.set('view engine', 'hbs');
		this.express.set('views', path.join(__dirname, 'views'));
	}

	private parseRequestHeader(
		req: express.Request,
		res: express.Response,
		next: () => void,
	): void {
		// parse request header
		// console.log(req.headers.access_token);
		next();
	}

	private basePathRoute(
		request: express.Request,
		response: express.Response,
	): void {
		const now = new Date();
		const status = 'OK';
		const data = {
			name: 'User',
			message: 'Welcome to the API',
			status,
			date: now.toISOString(),
			version: '1.0.0',
		};
		response.render('home', data);
	}

	private setupSwaggerDocs(): void {
		this.express.use(
			'/docs',
			swaggerUi.serve,
			swaggerUi.setup(swaggerDocument),
		);
	}
}
