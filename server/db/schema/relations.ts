import { relations } from 'drizzle-orm';
import { users, session } from './user.schema';

// Session table relations (standalone table for express-session)
export const sessionRelations = relations(session, () => ({}));
