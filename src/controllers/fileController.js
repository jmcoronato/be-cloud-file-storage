import { uploadFileToBox, deleteBoxFile } from '../services/box.js';
import { uploadFileToDropbox, deleteDropboxFile } from '../services/dropBox.js';
import db from '../db/sqlite.js';
import multer, { memoryStorage } from 'multer';

// Configuración de multer para manejar el archivo en memoria
const upload = multer({ storage: memoryStorage() }).single('file');

function insertFileRecord(fileId, fileName, userId, fileSize, sharedUrl, uploadedDate, service) {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO file (id, name, user_id, size, shared_url, uploaded_date, service) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [fileId, fileName, userId, fileSize, sharedUrl, uploadedDate, service],
            (err) => {
                if (err) {
                    console.error('Error inserting file into database:', err);
                    reject({ message: 'Error saving file to database', error: err });
                } else {
                    resolve({
                        id: fileId,
                        user_id: userId,
                        name: fileName,
                        size: fileSize,
                        shared_url: sharedUrl,
                        uploaded_date: uploadedDate,
                        service: service
                    });
                }
            }
        );
    });
}

// Función para subir archivo y manejar la inserción en la base de datos
export function uploadFile(req, res) {
    // Usar multer para manejar el archivo en memoria
    upload(req, res, (err) => {
        if (err) return res.status(400).json({ message: 'Error uploading file', error: err });

        // Verificar que se haya subido un archivo
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Obtener datos del archivo desde req.file
        const { buffer, originalname } = req.file;
        const userId = req.user.userId; // Obtener ID del usuario autenticado

        // Control de duplicados
        db.get('SELECT * FROM file WHERE name = ? AND user_id = ?', [originalname, userId], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            if (row) {
                // Si ya existe un archivo con el mismo nombre tiro error 409
                return res.status(409).json({ message: 'A file with the same name already exists', file_name: originalname });
            }

            // Intentar subir primero a Box
            uploadFileToBox(buffer, originalname)
                .then(async ({ fileId, fileName, fileSize, uploadedDate, sharedUrl }) => {
                    // Insertar en la base de datos
                    const fileRecord = await insertFileRecord(fileId, fileName, userId, fileSize, sharedUrl, uploadedDate, 'box');
                    res.status(200).json({
                        message: 'File uploaded and shared successfully via Box',
                        file: fileRecord
                    });
                })
                .catch((boxError) => {
                    console.error('Box upload failed, attempting upload to another cloud service...', boxError);

                    // Intentar subir a Dropbox si falla en Box
                    uploadFileToDropbox(buffer, originalname)
                        .then(async (dropboxFileDetails) => {
                            // Insertar los detalles en la base de datos
                            const fileRecord = await insertFileRecord(
                                dropboxFileDetails.fileId,
                                dropboxFileDetails.fileName,
                                userId,
                                dropboxFileDetails.fileSize,
                                dropboxFileDetails.sharedUrl,
                                dropboxFileDetails.uploadedDate,
                                'dropbox'
                            );
                            res.status(200).json({
                                message: 'File uploaded and shared successfully via Dropbox',
                                file: fileRecord
                            });
                        })
                        .catch((dropboxError) => {
                            console.error('Dropbox upload failed', dropboxError);
                            res.status(500).json({
                                message: 'Error uploading file to any cloud service',
                                dropbox_error: dropboxError,
                                box_error: boxError
                            });
                        });
                });
        });
    });
}

// Endpoint para eliminar archivo
export function deleteFile(req, res) {
    const { fileName } = req.params;
    const userId = req.user.userId;

    if (!fileName) {
        return res.status(400).json({ message: 'File name is required' });
    }

    // Buscar el archivo en la base de datos
    db.get('SELECT * FROM file WHERE name = ? AND user_id = ?', [fileName, userId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (!row) {
            return res.status(404).json({ message: 'File not found' });
        }

        const { id: fileId, service } = row;
        let deleteFileService;

        // Determinar el servicio según el proveedor
        if (service === 'box') {
            deleteFileService = deleteBoxFile;
        } else if (service === 'dropbox') {
            deleteFileService = deleteDropboxFile;
        } else {
            return res.status(400).json({ message: 'Invalid file storage service' });
        }

        // Llamar a la función de eliminación del archivo en el servicio
        deleteFileService(fileId)
            .then(() => {
                // Borrar el registro en la base de datos tras eliminar en el servicio
                db.run('DELETE FROM file WHERE id = ?', [fileId], (deleteErr) => {
                    if (deleteErr) {
                        console.error('Database deletion error:', deleteErr);
                        return res.status(500).json({ message: 'Error deleting file record', error: deleteErr });
                    }
                    res.status(200).json({ message: 'File deleted successfully' });
                });
            })
            .catch((error) => {
                console.error('Error deleting file from service:', error);
                res.status(500).json({ message: 'Error deleting file from service', error });
            });
    });
}