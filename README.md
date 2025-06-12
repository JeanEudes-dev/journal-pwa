# Journal PWA – Jean-Eudes Assogba

![Journal PWA Logo](./public/icon-192x192.png)

A beautiful, offline-first Progressive Web App (PWA) for journaling, built with React, TypeScript, and Tailwind CSS. Features a WhatsApp-inspired design with dark mode support, markdown editing, and seamless offline functionality.

🚀 **[Live Demo](https://jean-eudes.github.io/journal-pwa)**

## ✨ Features

### 🔥 Core Features

- **Offline-First Architecture** - Write and access your journal entries without internet
- **Progressive Web App** - Install on desktop and mobile devices
- **Real-time Markdown Editor** - Live preview with syntax highlighting
- **Auto-save Functionality** - Never lose your thoughts again
- **Beautiful UI/UX** - WhatsApp-inspired design with smooth animations
- **Dark Mode Support** - Easy on the eyes, day or night
- **Mobile-First Responsive** - Perfect experience on all devices

### 📝 Journal Features

- **Rich Markdown Support** - Full markdown syntax with live preview
- **Entry Management** - Create, edit, delete, and organize entries
- **Advanced Search** - Full-text search across all entries
- **Tags & Categories** - Organize entries with tags and categories
- **Mood Tracking** - Track your emotional state with entries
- **Location & Weather** - Add context to your entries
- **Favorites System** - Mark important entries as favorites
- **Word Count Tracking** - Monitor your writing progress

### 💾 Data & Export

- **IndexedDB Storage** - Local browser database for offline access
- **Multiple Export Formats** - PDF, Markdown, and JSON exports
- **Bulk Operations** - Export single entries or entire collections
- **Data Import/Export** - Backup and restore your journal data
- **Conflict Resolution** - Smart handling of concurrent editing

### 🎨 Design & Accessibility

- **WhatsApp Color Palette** - Professional green theme
- **Smooth Animations** - Framer Motion powered transitions
- **Keyboard Shortcuts** - Power user friendly
- **Touch Gestures** - Swipe actions on mobile
- **ARIA Compliant** - Full accessibility support
- **Print Friendly** - Clean printing layouts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jean-eudes/journal-pwa.git
cd journal-pwa

# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser to http://localhost:5173
```

### Building for Production

```bash
# Build the app
npm run build

# Preview the production build
npm run preview

# The built files will be in the `dist/` directory
```

## 🛠 Development

### Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **State Management**: React Context + useReducer
- **Database**: IndexedDB with IDB wrapper
- **PWA**: Workbox for service workers
- **Build Tool**: Vite
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Markdown**: ReactMarkdown with GFM support

### Project Structure

```
journal-pwa/
├── public/                 # Static assets
│   ├── manifest.json      # PWA manifest
│   ├── favicon.svg        # App icon
│   └── icons/             # PWA icons
├── src/
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── hooks/            # Custom hooks
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── scripts/              # Build scripts
└── .github/workflows/    # CI/CD configuration
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run preview` - Preview production build

## 🌐 Deployment

### GitHub Pages (Automatic)

The app automatically deploys to GitHub Pages on every push to the `main` branch.

1. Fork the repository
2. Enable GitHub Pages in repository settings
3. Push to main branch
4. Visit `https://yourusername.github.io/journal-pwa`

### Manual Deployment

```bash
# Build the app
npm run build

# Deploy the dist/ folder to your hosting provider
# The app is a static SPA that works with any web server
```

### PWA Installation

- **Desktop**: Click the install prompt in supported browsers
- **Mobile**: Add to home screen from browser menu
- **Offline**: Works completely offline after first visit

## 📱 Usage

### Creating Entries

1. Click the "New Entry" button
2. Add a title and start writing in markdown
3. Use the toolbar for formatting shortcuts
4. Add tags, categories, mood, and location
5. Auto-save keeps your work safe

### Organizing Entries

- **Search**: Use the search bar to find specific entries
- **Filter**: Filter by tags, categories, or favorites
- **Sort**: Sort by date, title, or word count
- **Categories**: Group related entries together

### Exporting Data

1. Go to Export section
2. Select entries to export
3. Choose format (PDF, Markdown, JSON)
4. Download your data

## 🎯 Career-Boosting Highlights

This project demonstrates advanced modern web development skills:

### 🏗 **Architecture & Performance**

- ✅ **Implemented offline-first PWA with Workbox & IndexedDB**
- ✅ **Built responsive SPA with React 19 + TypeScript**
- ✅ **Optimized bundle size with Vite and tree-shaking**
- ✅ **Implemented efficient state management with Context API**

### 🎨 **UI/UX Excellence**

- ✅ **Designed beautiful WhatsApp-inspired interface**
- ✅ **Created smooth animations with Framer Motion**
- ✅ **Built mobile-first responsive design**
- ✅ **Implemented comprehensive dark mode support**

### 💾 **Data Management**

- ✅ **Architected client-side database with IndexedDB**
- ✅ **Built real-time auto-save functionality**
- ✅ **Implemented conflict resolution for concurrent editing**
- ✅ **Created multiple export formats (PDF, Markdown, JSON)**

### 🛡 **Quality & Accessibility**

- ✅ **Wrote type-safe code with TypeScript strict mode**
- ✅ **Implemented comprehensive error handling**
- ✅ **Added full ARIA accessibility support**
- ✅ **Set up automated CI/CD with GitHub Actions**

### 🚀 **SEO & Distribution**

- ✅ **SEO-optimized static export featuring 'Jean-Eudes Assogba'**
- ✅ **Configured PWA manifest with proper metadata**
- ✅ **Implemented service worker caching strategies**
- ✅ **Set up automated GitHub Pages deployment**

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style (Prettier + ESLint)
- Add TypeScript types for new code
- Test on mobile and desktop
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Jean-Eudes Assogba**

- Website: [jean-eudes.dev](https://jean-eudes.dev) _(example)_
- GitHub: [@jean-eudes](https://github.com/jean-eudes)
- LinkedIn: [Jean-Eudes Assogba](https://linkedin.com/in/jean-eudes-assogba) _(example)_

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Fonts by [Google Fonts](https://fonts.google.com/)
- Color inspiration from [WhatsApp](https://whatsapp.com/)
- Animation library by [Framer Motion](https://www.framer.com/motion/)

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/jean-eudes/journal-pwa?style=social)
![GitHub forks](https://img.shields.io/github/forks/jean-eudes/journal-pwa?style=social)
![GitHub issues](https://img.shields.io/github/issues/jean-eudes/journal-pwa)
![GitHub license](https://img.shields.io/github/license/jean-eudes/journal-pwa)

---

<div align="center">
  <p>Made with ❤️ by Jean-Eudes Assogba</p>
  <p>
    <a href="https://jean-eudes.github.io/journal-pwa">View Live Demo</a> •
    <a href="https://github.com/jean-eudes/journal-pwa/issues">Report Bug</a> •
    <a href="https://github.com/jean-eudes/journal-pwa/issues">Request Feature</a>
  </p>
</div>
