'use server';

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function saveZipToDesktop(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file provided');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `mv_footage_${timestamp}.zip`;

    // Resolve Desktop path
    const desktopPath = path.join(os.homedir(), 'Desktop');
    const filePath = path.join(desktopPath, fileName);

    try {
        await fs.writeFile(filePath, buffer);
        return { success: true, path: filePath };
    } catch (error) {
        console.error('Error writing file:', error);
        return { success: false, error: String(error) };
    }
}
