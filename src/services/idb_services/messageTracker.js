import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
const db = new KureDatabase();

export const getAllUnreadMessageCount = async () => {
    const unread_messages = await db.getAll(IDB_TABLES.unread_messages);
    console.log("unread_messages == ", unread_messages);
    let count = 0;
    unread_messages?.forEach(element => {
        count += parseInt(element.count);
    });

    return count;
}

export const setUnreadMessage = async (messages) => {
    console.log("messages == ", messages);
    if (!messages) {
        messages = [
            { type: 'draft', count: 0, entity_id: [] },
            { type: 'needs_processing', count: 0, entity_id: [] },
            { type: 'parked', count: 0, entity_id: [] },
            { type: 'completed', count: 0, entity_id: [] },
        ];
    }
    // await db.clear(IDB_TABLES.unread_messages);
    const unread_messages = await db.put(messages, IDB_TABLES.unread_messages);
    return unread_messages;
}

export const getUnreadMessage = async () => {
    const unread_messages = await db.getAll(IDB_TABLES.unread_messages);
    return unread_messages;
}