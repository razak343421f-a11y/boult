// Appwrite Configuration
const APPWRITE_CONFIG = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: 'sgp-6946adbc002212210938',
    databaseId: '694937e500031d1a5ddf',
    collections: {
        callLogs: 'call_logs',
        deviceStatus: 'device_status',
        locations: 'locations'
    }
};

const { Client, Databases, Query } = Appwrite;

const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

console.log('Appwrite configured successfully');
console.log('Project:', APPWRITE_CONFIG.projectId);
console.log('Database:', APPWRITE_CONFIG.databaseId);
