import multer from "multer";

const storage = multer.memoryStorage(); // não salva localmente
const upload = multer({ storage });

export default upload;
