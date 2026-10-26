import { fireDB } from '../firebase/FirebaseConfig';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { computeMinPrice, computeTotalStock } from './productUtils';

/**
 * Migration Script: Backfills minPrice and totalStock denormalized fields
 * on existing Firestore product documents.
 */
export async function migrateProductDenormFields() {
  try {
    const snap = await getDocs(collection(fireDB, 'products'));
    let updatedCount = 0;
    let batch = writeBatch(fireDB);
    let operationCount = 0;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const minPrice = computeMinPrice(data);
      const totalStock = computeTotalStock(data);

      if (data.minPrice !== minPrice || data.totalStock !== totalStock) {
        const docRef = doc(fireDB, 'products', docSnap.id);
        batch.update(docRef, { minPrice, totalStock });
        updatedCount++;
        operationCount++;

        // Commit in batches of 400 to respect Firestore limits
        if (operationCount >= 400) {
          await batch.commit();
          batch = writeBatch(fireDB);
          operationCount = 0;
        }
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }

    console.log(`Product denormalization migration complete. Updated ${updatedCount} products.`);
    return { success: true, updatedCount };
  } catch (err) {
    console.error("Migration error:", err);
    throw err;
  }
}
