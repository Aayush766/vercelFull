// controllers/materialController.js
const Content = require('../models/Content');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Helper function to extract public ID from Cloudinary URL
const getCloudinaryPublicId = (fileUrl) => {
    if (!fileUrl) return null;
    const parts = fileUrl.split('/');
    const uploadIndex = parts.indexOf('upload');

    if (uploadIndex === -1 || parts.length <= uploadIndex + 1) {
        return null; // 'upload' not found or URL too short
    }

    // Find the part that comes after the version number (e.g., 'v1716752000')
    let publicIdPath = parts.slice(uploadIndex + 2).join('/');

    // If there's a format transformation (e.g., /f_pdf/), remove it for the pure public ID
    const formatTransformMatch = publicIdPath.match(/f_([a-zA-Z0-9]+)\//);
    if (formatTransformMatch) {
        publicIdPath = publicIdPath.substring(publicIdPath.indexOf(formatTransformMatch[0]) + formatTransformMatch[0].length);
    }

    return publicIdPath.split('.')[0]; // Remove extension to get just the public ID
};

// Helper function to determine Cloudinary resource type from URL for signing
const getCloudinaryResourceType = (fileUrl) => {
    if (fileUrl.includes('/video/upload/')) {
        return 'video';
    }
    // If Cloudinary converted a document (ppt, docx) to PDF, it serves it as an 'image'
    // This is generally true for document conversions to PDF or JPG/PNG.
    if (fileUrl.includes('/image/upload/') && fileUrl.endsWith('.pdf')) {
        return 'image'; // Treat PDF delivery as 'image' for signing purposes
    }
    // Default for raw files, or other document types that might be stored as raw
    return 'raw';
};


// Upload Single Content
exports.uploadContent = async (req, res) => {
    try {
        const { title, type, grade, session, videoList } = req.body;

        let fileUrl = null;
        let uploadedVideoList = [];

        if (type === 'video') {
            if (!Array.isArray(videoList) || videoList.length === 0) {
                return res.status(400).json({ msg: 'Video content type requires a non-empty videoList array.' });
            }
            uploadedVideoList = videoList; // Assuming videoList comes as an array of {id, title, thumbnail}
        } else { // Handle 'ebook' and 'quiz' types
            if (!req.file) {
                return res.status(400).json({ msg: `No file uploaded for content type: ${type}.` });
            }

            const allowedFileExtensions = {
                'ebook': ['.ppt', '.pptx', '.pdf', '.doc', '.docx'],
                'quiz': ['.pdf', '.doc', '.docx']
            };
            const validExtensions = allowedFileExtensions[type];

            const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
            if (!validExtensions.includes(`.${fileExtension}`)) {
                fs.unlinkSync(req.file.path); // Clean up temp file
                return res.status(400).json({ msg: `Only ${validExtensions.join(', ')} files are allowed for ${type}.` });
            }

            // Generate a unique public ID for Cloudinary
            const cleanedFilename = req.file.originalname.split('.')[0].replace(/[^a-zA-Z0-9_-]/g, '');
            const publicIdPrefix = `course_content/${cleanedFilename}_${Date.now()}`;

            // Upload to Cloudinary, converting to PDF on the fly
            const uploadOptions = {
                resource_type: 'raw', // Upload original as raw, then convert
                folder: 'course_content', // Folder on Cloudinary
                public_id: publicIdPrefix, // Unique public ID for this file
                format: 'pdf', // CRITICAL: Tell Cloudinary to convert it to PDF
                // For 'pdf' format, Cloudinary will serve it as an image type if it's a document conversion.
                // It means you can apply image transformations (like width/height) if desired.
            };

            const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);

            fs.unlinkSync(req.file.path); // Delete local file after upload

            if (!result || !result.secure_url) {
                console.error('Cloudinary upload failed or returned no secure_url:', result);
                return res.status(500).json({ msg: 'Failed to upload file to Cloudinary.' });
            }

            fileUrl = result.secure_url; // This URL is now directly to the PDF version
            console.log('Uploaded file original format to Cloudinary. Result URL (PDF):', fileUrl);
        }

        const content = new Content({
            title,
            type,
            fileUrl,
            videoList: uploadedVideoList,
            grade: Number(grade),
            session: Number(session),
            uploadedBy: req.user.id
        });

        await content.save();
        res.status(201).json({ msg: 'Content uploaded successfully', content });

    } catch (err) {
        console.error('Error uploading content:', err);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ msg: 'Error uploading content', error: err.message });
    }
};

// NEW: Upload Multiple Content (specifically for presentations/documents)
exports.uploadMultipleContent = async (req, res) => {
    try {
        const { grade, session, type } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: 'No files uploaded.' });
        }
        if (!grade || !session || !type) {
            return res.status(400).json({ msg: 'Grade, session, and type are required for multiple file uploads.' });
        }
        // Ensure frontend sends 'presentation_multiple' or maps to 'ebook' or 'quiz'
        if (type !== 'ebook' && type !== 'quiz' && type !== 'presentation_multiple') {
            return res.status(400).json({ msg: 'Multi-file upload is supported only for "ebook", "quiz", or "presentation_multiple" types.' });
        }

        const uploadedContents = [];
        const failedUploads = [];

        for (const file of req.files) {
            try {
                const allowedFileExtensions = {
                    'ebook': ['.ppt', '.pptx', '.pdf', '.doc', '.docx'],
                    'quiz': ['.pdf', '.doc', '.docx'],
                    'presentation_multiple': ['.ppt', '.pptx', '.pdf', '.doc', '.docx']
                };
                const validExtensions = allowedFileExtensions[type];

                const fileExtension = file.originalname.split('.').pop().toLowerCase();
                if (!validExtensions.includes(`.${fileExtension}`)) {
                    fs.unlinkSync(file.path);
                    failedUploads.push({ filename: file.originalname, error: `Invalid file type. Only ${validExtensions.join(', ')} are allowed.` });
                    continue;
                }

                // Generate a unique public ID for Cloudinary
                const cleanedFilename = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9_-]/g, '');
                const publicIdPrefix = `course_content/${cleanedFilename}_${Date.now()}`;

                const uploadOptions = {
                    resource_type: 'raw', // Upload original as raw, then convert
                    folder: 'course_content', // Folder on Cloudinary
                    public_id: publicIdPrefix, // Unique public ID for this file
                    format: 'pdf', // CRITICAL: Tell Cloudinary to convert it to PDF
                };

                const result = await cloudinary.uploader.upload(file.path, uploadOptions);

                fs.unlinkSync(file.path); // Delete local file after upload

                if (!result || !result.secure_url) {
                    failedUploads.push({ filename: file.originalname, error: 'Failed to upload file to Cloudinary (no secure_url).' });
                    continue;
                }

                const content = new Content({
                    title: file.originalname.split('.')[0], // Use original filename as title
                    // Store as 'ebook' if the frontend sent 'presentation_multiple'
                    type: type === 'presentation_multiple' ? 'ebook' : type,
                    fileUrl: result.secure_url, // This URL is now directly to the PDF version
                    grade: Number(grade),
                    session: Number(session),
                    uploadedBy: req.user.id
                });
                await content.save();
                uploadedContents.push(content);

            } catch (fileErr) {
                console.error(`Error processing file ${file.originalname}:`, fileErr);
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                failedUploads.push({ filename: file.originalname, error: fileErr.message });
            }
        }

        if (uploadedContents.length > 0) {
            res.status(201).json({
                msg: 'Multiple contents uploaded successfully',
                contents: uploadedContents,
                failedUploads: failedUploads
            });
        } else {
            res.status(400).json({
                msg: 'No contents were uploaded successfully.',
                failedUploads: failedUploads
            });
        }

    } catch (err) {
        console.error('Server error during multiple content upload:', err);
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        res.status(500).json({ msg: 'Server error during multiple content upload', error: err.message });
    }
};

// Get All Content (Admin view)
exports.getAllContent = async (req, res) => {
    try {
        const content = await Content.find().populate('uploadedBy', 'name email');
        res.json(content);
    } catch (err) {
        console.error('Error fetching all content:', err);
        res.status(500).json({ msg: 'Error fetching content', error: err.message });
    }
};

// Get Content by Session and Grade (for students) - MODIFIED TO GENERATE SIGNED URLS
exports.getContentBySessionAndGrade = async (req, res) => {
    try {
        const { session, grade } = req.query;

        if (!session || !grade) {
            return res.status(400).json({ msg: 'Session and Grade query parameters are required.' });
        }
        const parsedSession = parseInt(session);
        const parsedGrade = parseInt(grade);

        if (isNaN(parsedSession) || isNaN(parsedGrade)) {
            return res.status(400).json({ msg: 'Session and Grade must be valid numbers.' });
        }

        const contents = await Content.find({
            session: parsedSession,
            grade: parsedGrade
        }).select('-__v');

        if (contents.length === 0) {
            return res.status(200).json([]);
        }

        const contentsWithSignedUrls = contents.map(content => {
            const contentObject = content.toObject();

            if ((contentObject.type === 'ebook' || contentObject.type === 'quiz') && contentObject.fileUrl) {
                const publicId = getCloudinaryPublicId(contentObject.fileUrl);
                const resourceTypeForSigning = getCloudinaryResourceType(contentObject.fileUrl);

                if (publicId) {
                    try {
                        const signedUrl = cloudinary.url(publicId, {
                            resource_type: resourceTypeForSigning, // 'image' for PDF, 'raw' for others
                            secure: true,
                            sign_url: true, // THIS IS THE KEY!
                            expires_at: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
                        });
                        return { ...contentObject, fileUrl: signedUrl };
                    } catch (signError) {
                        console.error(`Error signing URL for public ID ${publicId}:`, signError);
                        return { ...contentObject, fileUrl: null, error: 'Failed to generate signed URL' };
                    }
                }
            }
            return contentObject;
        });

        res.json(contentsWithSignedUrls);
    } catch (err) {
        console.error('Error fetching content by session and grade:', err);
        res.status(500).json({ msg: 'Server Error fetching content', error: err.message });
    }
};