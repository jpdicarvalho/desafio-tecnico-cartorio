import path from "path";
import multer from "multer";
import fs from "fs";

const uploadsRoot = path.resolve(__dirname, "..", "..", "uploads");
const receiptsFolder = path.join(uploadsRoot, "receipts");

// garante que a pasta exista
if (!fs.existsSync(receiptsFolder)) {
  fs.mkdirSync(receiptsFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, receiptsFolder);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const uniqueSuffix = `${timestamp}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "_");

    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "application/pdf"];
  if (!allowed.includes(file.mimetype)) {
    return cb(
      new Error("Tipo de arquivo inválido. Envie um PDF, PNG ou JPG/JPEG.")
    );
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});