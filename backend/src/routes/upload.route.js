import { Router } from 'express';
import { uploadLocal } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/upload-temp', uploadLocal.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file để upload' });
    }

    return res.status(200).json({
      message: 'Upload file thành công',
      file: req.file,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error });
  }
});

export default router;