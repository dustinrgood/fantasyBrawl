import { initializeApp, getApps, cert } from 'firebase-admin/app'

let initialized = false

export function initAdmin() {
  if (initialized) {
    return
  }
  
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    )
    
    if (!serviceAccount.project_id) {
      throw new Error('Firebase service account key is not configured properly')
    }
    
    initializeApp({
      credential: cert(serviceAccount)
    })
    
    console.log('Firebase Admin initialized')
  }
  
  initialized = true
} 