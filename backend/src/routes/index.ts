import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import projectsRouter from './projects';
import skillsRouter from './skills';
import experiencesRouter from './experiences';
import certificatesRouter from './certificates';
import documentsRouter from './documents';
import memoriesRouter from './memories';
import chatRouter from './chat';
import githubRouter from './github';
import linkedinRouter from './linkedin';
import analyticsRouter from './analytics';
import adminRouter from './admin';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/projects', projectsRouter);
router.use('/skills', skillsRouter);
router.use('/experiences', experiencesRouter);
router.use('/certificates', certificatesRouter);
router.use('/documents', documentsRouter);
router.use('/memories', memoriesRouter);
router.use('/chat', chatRouter);
router.use('/github', githubRouter);
router.use('/linkedin', linkedinRouter);
router.use('/analytics', analyticsRouter);
router.use('/admin', adminRouter);

export default router;
