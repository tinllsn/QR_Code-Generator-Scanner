# QR Code Generator & Scanner

Nguyễn Trí Dũng - 22IT050 -- 22GIT

A comprehensive web application for generating and scanning QR codes with full offline support and PWA capabilities.

## 🚀 Key Features

### 📱 QR Code Generation
- Generate QR codes from text, URLs, phone numbers, emails
- Customize colors (foreground/background)
- Adjust Error Correction Level
- Download QR codes as PNG files
- Copy content or share directly

### 📷 QR Code Scanning
- Scan QR codes using camera (front/back)
- Convenient camera on/off toggle buttons
- Upload and scan from image files
- Automatic camera shutdown when switching to upload mode
- Instant scan result display

### 📚 History Management
- Store all generated and scanned QR codes
- Search and filter by type (Generated/Scanned)
- Sort by time (newest/oldest)
- Copy or delete individual items
- Clear entire history
- Export/import JSON data

### ⚙️ Settings & Management
- Monitor storage usage
- Clear cache and data
- Auto-delete old history settings
- Manage offline storage

### 🌐 PWA & Offline Support
- Works completely offline
- Install as native app
- Automatic Service Worker caching
- Online/offline status indicator

## 🛠️ Technologies Used

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Framework**: Tailwind CSS, shadcn/ui
- **QR Libraries**: 
  - `react-qr-code` - QR code generation
  - `html5-qrcode` - QR code scanning
- **PWA**: Service Worker, Web App Manifest
- **Storage**: LocalStorage for offline data

## 📦 Installation & Setup

### System Requirements
- Node.js 18+ 
- npm 8+

### Install Dependencies
\`\`\`bash
# Clone repository
git clone <repository-url>
cd qr-code-app

# Install packages
npm install
\`\`\`

### Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production
\`\`\`bash
npm run build
npm start
\`\`\`

## 📱 Usage

### Generate QR Code
1. Select **"Generate"** tab
2. Enter text or URL to create QR code
3. Customize colors and error correction level
4. Click **"Generate QR Code"**
5. Download or share the QR code

### Scan QR Code
1. Select **"Scan"** tab
2. **Camera Scanner**:
   - Click **"Start Scanning"** to enable camera
   - Use toggle buttons to turn camera on/off
   - Switch between front/back cameras
3. **File Upload**:
   - Select **"Upload Image"**
   - Choose image file containing QR code
   - Results display instantly

### View History
1. Select **"History"** tab
2. Search by content
3. Filter by type (Generated/Scanned)
4. Sort by time
5. Export data or delete items

## 🔧 Configuration

### Environment Variables
No special environment variables required. The application runs entirely client-side.

### PWA Configuration
The `manifest.json` and Service Worker are pre-configured for:
- Offline caching
- App installation
- Background sync

## 📂 Project Structure

\`\`\`
qr-code-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── qr-generator.tsx  # QR code generator
│   ├── qr-scanner.tsx    # QR code scanner
│   ├── qr-history.tsx    # History management
│   └── qr-settings.tsx   # Settings panel
├── public/               # Static assets
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service worker
│   └── icons/           # App icons
└── lib/                 # Utilities
    └── utils.ts         # Helper functions
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.



## 🙏 Acknowledgments

- [html5-qrcode](https://github.com/mebjas/html5-qrcode) - QR code scanning library
- [react-qr-code](https://github.com/rosskhanas/react-qr-code) - QR code generation
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Next.js](https://nextjs.org/) - React framework


