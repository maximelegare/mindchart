# Audio Upload Middleware

This middleware allows you to handle audio file uploads on any route in your Express application.

## Usage

### Basic Usage

```typescript
import { uploadSingleAudio } from "@/common/middleware/fileUpload";

// On any route, add the middleware
app.post("/your-route", uploadSingleAudio("audio"), (req, res) => {
  // Access the uploaded file via req.file
  if (req.file) {
    console.log("Audio file uploaded:", req.file.filename);
    console.log("File path:", req.file.path);
    // Process your audio file here
  }
});
```

### With Custom Field Name

```typescript
// Use a different field name
app.post("/record", uploadSingleAudio("recording"), (req, res) => {
  // Access via req.file
});
```

### Multiple Routes with Audio Upload

```typescript
// Route 1: Voice notes
app.post("/voice-notes", uploadSingleAudio("voice"), (req, res) => {
  // Handle voice note
});

// Route 2: Audio messages
app.post("/messages", uploadSingleAudio("message"), (req, res) => {
  // Handle audio message
});

// Route 3: Transcription
app.post("/transcribe", uploadSingleAudio("audio"), (req, res) => {
  // Handle transcription
});
```

## File Information

When a file is uploaded, you can access it via `req.file` with these properties:

```typescript
{
  fieldname: "audio",           // Field name used in form
  originalname: "recording.mp3", // Original filename
  encoding: "7bit",             // File encoding
  mimetype: "audio/mpeg",       // MIME type
  size: 2048576,               // File size in bytes
  buffer: Buffer,               // File data as Buffer - ready to send to external APIs
}
```

## Usage for API Forwarding

```typescript
app.post("/transcribe", uploadSingleAudio("audio"), async (req, res) => {
  if (req.file) {
    // Send the file buffer directly to an external API
    const response = await fetch(
      "https://api.transcription-service.com/transcribe",
      {
        method: "POST",
        headers: {
          "Content-Type": req.file.mimetype,
          Authorization: "Bearer your-api-key",
        },
        body: req.file.buffer, // Send the file data directly
      }
    );

    const result = await response.json();
    res.json({ transcription: result.text });
  }
});
```

## Supported Audio Formats

- MP3 (`audio/mpeg`, `audio/mp3`)
- WAV (`audio/wav`, `audio/wave`, `audio/x-wav`)
- M4A (`audio/mp4`, `audio/m4a`)
- AAC (`audio/aac`)
- OGG (`audio/ogg`)
- WebM (`audio/webm`)
- FLAC (`audio/flac`, `audio/x-flac`)
- 3GPP (`audio/3gpp`, `audio/3gp`)
- AMR (`audio/amr`)
- WMA (`audio/x-ms-wma`)

## File Limits

- **Max file size**: 50MB
- **Max files per request**: 1
- **Storage**: Files are stored in `uploads/` directory with unique filenames

## Error Handling

The middleware automatically handles:

- File type validation
- File size limits
- File count limits
- File upload errors

Errors are handled by the `handleUploadError` middleware in your server setup.
