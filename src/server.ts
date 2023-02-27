import { AddressInfo } from 'net';
import DataApp from './DataApp';
import WebApp from './WebApp';
import Environment from './environments/environment';
import { setGlobalEnvironment } from './global';
import logger from './lib/logger';

const env: Environment = new Environment();
setGlobalEnvironment(env);
const webApp: WebApp = new WebApp();
const dataApp: DataApp = new DataApp();

function webServerError(error: NodeJS.ErrnoException): void {
	if (error.syscall !== 'listen') {
		throw error;
	}
	// handle specific error codes here.
	throw error;
}

function webServerListening(): void {
	const addressInfo: AddressInfo = <AddressInfo>webApp.httpsServer.address();
	logger.info(`WebServer Listening on ${addressInfo.address}:${env.webPort}`);
}

function dataServerError(error: NodeJS.ErrnoException): void {
	if (error.syscall !== 'listen') {
		throw error;
	}
	// handle specific error codes here.
	throw error;
}

function dataServerListening(): void {
	const addressInfo: AddressInfo = <AddressInfo>dataApp.httpsServer.address();
	logger.info(
		`DataServer Listening on ${addressInfo.address}:${env.dataPort}`,
	);
}

webApp
	.init()
	.then(() => {
		webApp.express.set('port', env.webPort);

		webApp.httpsServer.on('error', webServerError);
		webApp.httpsServer.on('listening', webServerListening);
		webApp.httpsServer.listen(env.webPort);
	})
	.catch((err: Error) => {
		logger.info('webApp.init error');
		logger.error(err.name);
		logger.error(err.message);
		logger.error(err.stack);
	});

process.on('unhandledRejection', (reason: Error) => {
	logger.error('Unhandled Promise Rejection: reason:', reason.message);
	logger.error(reason.stack);
	// application specific logging, throwing an error, or other logic here
});

dataApp
	.init()
	.then(() => {
		dataApp.express.set('port', env.dataPort);

		dataApp.httpsServer.on('error', dataServerError);
		dataApp.httpsServer.on('listening', dataServerListening);
		dataApp.httpsServer.listen(env.dataPort);
	})
	.catch((err: Error) => {
		logger.info('dataApp.init error');
		logger.error(err.name);
		logger.error(err.message);
		logger.error(err.stack);
	});

process.on('unhandledRejection', (reason: Error) => {
	logger.error('Unhandled Promise Rejection: reason:', reason.message);
	logger.error(reason.stack);
	// application specific logging, throwing an error, or other logic here
});
