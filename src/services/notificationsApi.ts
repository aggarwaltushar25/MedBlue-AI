import { Router, Request, Response } from 'express';
import { Notification } from '../types';

let serverSideNotifications: Notification[] = [
  {
    notificationId: 'NOTIF-001',
    recipientOrg: 'Fortis Hospital Central Pharmacy',
    recipientRole: 'Pharmacist',
    type: 'NEW_SHIPMENT',
    title: 'New shipment dispatched',
    message: 'Wholesaler A has dispatched 400 units to your pharmacy.',
    status: 'CREATED',
    priority: 'normal',
    createdAt: new Date().toISOString(),
    readAt: null,
    actionedAt: null,
    relatedRoute: 'pharmacist',
  },
];

const router = Router();

// Middleware to "authorize" based on role/org in query (simulated session)
const authorizeContext = (req: Request, res: Response, next: Function) => {
  const { recipientOrg, recipientRole } = req.query;
  if (!recipientOrg || !recipientRole) {
    return res.status(401).json({ error: 'Unauthorized: Missing session context' });
  }
  next();
};

// Fetch notifications (role/org specific)
router.get('/', authorizeContext, (req: Request, res: Response) => {
  const { recipientOrg, recipientRole } = req.query;
  const filtered = serverSideNotifications.filter(
    (n) =>
      n.recipientOrg.trim().toLowerCase() === (recipientOrg as string).trim().toLowerCase() &&
      n.recipientRole === recipientRole
  );
  res.json(filtered);
});

// Trigger notification
router.post('/generate', (req: Request, res: Response) => {
  const {
    recipientOrg,
    recipientRole,
    type,
    title,
    message,
    shipmentId,
    batchId,
    priority = 'normal',
  } = req.body;

  if (!recipientOrg || !recipientRole || !title || !message) {
    return res.status(400).json({ error: 'Missing required notification fields' });
  }

  const newNotification: Notification = {
    notificationId: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
    recipientOrg,
    recipientRole,
    type,
    title,
    message,
    shipmentId,
    batchId,
    status: 'CREATED',
    priority,
    createdAt: new Date().toISOString(),
    readAt: null,
    actionedAt: null,
    relatedRoute: (recipientRole as string).toLowerCase(),
  };

  serverSideNotifications.unshift(newNotification);
  res.status(201).json(newNotification);
});

// Mark as read
router.post('/:notificationId/read', (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const notification = serverSideNotifications.find(n => n.notificationId === notificationId);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    
    notification.readAt = new Date().toISOString();
    res.json(notification);
});

// Mark as actioned
router.post('/:notificationId/action', (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const notification = serverSideNotifications.find(n => n.notificationId === notificationId);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    
    notification.actionedAt = new Date().toISOString();
    notification.status = 'ACTIONED';
    res.json(notification);
});

// ... (keep existing router/state)

export const addNotification = (notification: any) => {
    serverSideNotifications.unshift(notification);
};

export default router;
