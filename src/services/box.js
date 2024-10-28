import BoxSDK from 'box-node-sdk';
const clientID = process.env.BOX_CLIENT_ID;
const clientSecret = process.env.BOX_CLIENT_SECRET;

const sdk = new BoxSDK({
    clientID: clientID,
    clientSecret: clientSecret
});

// Autenticacion usando un access token
const client = sdk.getBasicClient(process.env.BOX_ACCESS_TOKEN);

// Funcion para compartir archivo en Box y obtener el shared_url
const shareFileInBox = (fileId) => {
    return client.files.update(fileId, {
        shared_link: {
            access: 'open' // URL publica
        }
    }).then(response => {
        return response.shared_link.url; // Devuelve el shared_url
    }).catch(error => {
        console.error('Error generating shared link for file:', error);
        throw error;
    });
};

// Subir archivo a Box
export function uploadFileToBox(fileStream, fileName) {
    return new Promise((resolve, reject) => {
        // Subir archivo a la carpeta raíz de Box
        client.files.uploadFile('0', fileName, fileStream)
            .then(response => {
                const fileDetails = response.entries[0]; // Detalles del archivo subido
                const fileId = fileDetails.id;
                const fileSize = fileDetails.size;
                const uploadedDate = new Date().toISOString(); // Fecha actual

                // Compartir el archivo y obtener el shared_url
                return shareFileInBox(fileId).then(sharedUrl => {
                    // Devolver los detalles necesarios para la inserción en la BBDD
                    resolve({
                        fileId,
                        fileName,
                        fileSize,
                        uploadedDate,
                        sharedUrl
                    });
                });
            })
            .catch(error => {
                console.error('Error uploading file to Box:', error);
                reject({ message: 'Error uploading file to Box', error });
            });
    });
}

// Borrar archivo con el id
export async function deleteBoxFile(fileId) {
    try {
        await client.files.delete(fileId);
        console.log(`File with ID ${fileId} deleted from Box`);
    } catch (error) {
        console.error('Error deleting file from Box:', error);
        throw error;
    }
}