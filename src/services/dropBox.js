import { Dropbox } from 'dropbox';
import fetch from 'node-fetch';

const dbx = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    fetch: fetch
});

// Función para subir el archivo a Dropbox y obtener un enlace compartido
export function uploadFileToDropbox(fileBuffer, fileName) {
    return new Promise((resolve, reject) => {
        // Path donde se almacenará en Dropbox
        const filePath = `/${fileName}`;

        let fileId, fileSize, uploadedDate;

        // Subir archivo a Dropbox
        dbx.filesUpload({ path: filePath, contents: fileBuffer, mode: 'add', mute: false })
            .then(uploadResponse => {
                fileId = uploadResponse.result.id;
                fileSize = uploadResponse.result.size;
                uploadedDate = new Date().toISOString();

                // Generar enlace compartido
                return dbx.sharingCreateSharedLinkWithSettings({ path: filePath });
            })
            .then(linkResponse => {
                const sharedUrl = linkResponse.result.url;

                // Devolver los detalles necesarios para la inserción en la BBDD
                resolve({
                    fileId,
                    fileName,
                    fileSize,
                    uploadedDate,
                    sharedUrl
                });
            })
            .catch(error => {
                console.error('Error uploading file to Dropbox:', error);
                reject({ message: 'Error uploading file.', error });
            });
    });
}

// Borrar archivo con el id
export async function deleteDropboxFile(fileId) {
    try {
        await dbx.filesDeleteV2({ path: fileId });
        console.log(`File with ID ${fileId} deleted from Dropbox`);
    } catch (error) {
        console.error('Error deleting file from Dropbox:', error);
        throw error;
    }
}
