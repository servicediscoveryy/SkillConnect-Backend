import express from 'express';
import { createService, getAllServices, getServiceById, getServicesByCategory, rateService, searchServices, updateService } from '../../controller/service/serviceController';
import { authuser } from '../../middleware/authMiddleware';
import { isServiceProvider } from '../../middleware/adminMiddleware';

const serviceRouter = express.Router();

// @ts-ignore
serviceRouter.get('/', authuser, isServiceProvider, getAllServices)
// @ts-ignore
serviceRouter.post('/', authuser, isServiceProvider, createService)
// @ts-ignore
serviceRouter.post('/update', authuser, isServiceProvider, updateService)
// @ts-ignore
serviceRouter.get('/:serviceId', authuser, isServiceProvider, getServiceById)
// @ts-ignore
serviceRouter.get('/:category', authuser, getServicesByCategory)
// @ts-ignore
serviceRouter.get('/?query', authuser, searchServices)
// @ts-ignore
serviceRouter.post('/rating', authuser, rateService)



export default serviceRouter;