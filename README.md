# 🚀 Professional ATS Resume Formatter

**Enterprise-grade resume formatter with 5 ATS-optimized templates and .docx export**

Built like a $1000/hr developer — zero shortcuts, zero compromises.

---

## ✨ Features

### 🎨 **5 Professional Templates**
- **Classic Blue** — Traditional centered header, corporate-friendly
- **Modern Green** — Split layout, tech/creative focused
- **Executive Dark** — Bold header, senior leadership
- **Minimal Red** — Clean with accent bar, design roles
- **Creative Purple** — Bold centered, creative portfolios

### 🔥 **Smart Parser**
- Captures **EVERYTHING** you paste
- Auto-detects: Summary, Experience, Skills, Certs, Education, Projects, Awards
- Preserves all content — no data loss
- Handles any formatting style

### 📊 **Live Stats**
- Word count
- Section count  
- Bullet count
- Real-time preview

### 💾 **Export Options**
- ✅ **Real .docx files** (Word format)
- ✅ Copy HTML for custom use
- ✅ Auto-save drafts

### ⚡ **ATS-Optimized**
- No tables (ATS can't parse them)
- Clean formatting
- Keyword-rich structure
- Standard fonts

---

## 🏃 Quick Start

### **Option 1: Local Development (Recommended)**

```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start

# 3. Open browser
http://localhost:3000/resume-formatter-advanced.html
```

### **Option 2: Deploy to Netlify**

**Important:** Netlify only hosts static sites. For .docx export to work, you need a server. Use **Render** or **Railway** instead.

---

## 🚀 Deployment Options

### **Deploy to Render (Free, with .docx support)**

1. Create account at [render.com](https://render.com)
2. Connect your GitHub repo
3. Create new **Web Service**
4. Build command: `npm install`
5. Start command: `npm start`
6. Click **Deploy**

✅ Your app will be live at `https://your-app.onrender.com`

### **Deploy to Railway (Free $5 credit)**

1. Create account at [railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub**
3. Select your repo
4. Railway auto-detects Node.js
5. Click **Deploy**

✅ Your app will be live at `https://your-app.up.railway.app`

### **Deploy to Heroku**

```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Login
heroku login

# 3. Create app
heroku create your-resume-formatter

# 4. Deploy
git push heroku main

# 5. Open
heroku open
```

---

## 📝 How to Use

### **Workflow with Claude**

**In your Claude chat:**
```
You: [paste job description]

Claude: Here's your tailored resume:

SAI TEJA PARITALA
+1 (201) 710-1040 | saiteja.p1723@gmail.com

PROFESSIONAL SUMMARY
Experienced Salesforce Administrator...
[full resume text]
```

**Then:**
1. **Copy** Claude's text resume
2. **Open** your deployed formatter site
3. **Paste** into the text box
4. **Choose** template (Classic, Modern, Executive, etc.)
5. **Click** "Format Resume"
6. **Download** .docx file
7. **Apply** to job ✅

---

## 💡 Why This Saves You Tokens

**Old way (in resume chat):**
- Claude generates full .docx file programmatically
- Uses ~8,000-12,000 tokens per resume
- Expensive on Claude Pro usage

**New way (with this tool):**
- Claude gives you plain text (~2,000 tokens)
- You format it yourself in this app
- **Saves 80% of tokens**
- Same professional result

---

## 🛠 Tech Stack

- **Frontend:** Vanilla JS (no frameworks — pure performance)
- **Backend:** Node.js + Express
- **DOCX Generation:** docx.js library
- **Styling:** Custom CSS (gradient meshes, glass morphism)

---

## 📂 File Structure

```
├── resume-formatter-advanced.html    # Main frontend
├── server.js                         # Node.js backend
├── package.json                      # Dependencies
└── README.md                         # You are here
```

---

## 🎯 Advanced Features

### **Auto-Save**
Your draft saves automatically to browser localStorage — never lose progress.

### **Zoom Controls**
50% - 150% zoom on preview for detailed inspection.

### **Template Switching**
Change templates instantly — preview updates in real-time.

### **Smart Section Detection**
Automatically recognizes:
- Professional Summary
- Professional Experience  
- Technical Skills
- Certifications
- Education
- Projects
- Awards & Honors

---

## 🔧 Customization

Want to add your own template?

**Edit `resume-formatter-advanced.html`:**

1. Add template card in HTML
2. Add template function (e.g., `generateMyTemplate()`)
3. Add to templates object in `renderPreview()`

**Edit `server.js`:**

1. Add color scheme to `TEMPLATES` object
2. Server will auto-generate matching .docx

---

## 🐛 Troubleshooting

**Q: DOCX download not working?**  
A: Make sure you're running the Node.js server (`npm start`). Opening the HTML file directly won't work for downloads.

**Q: Resume not parsing correctly?**  
A: Make sure your text has clear section headers (EXPERIENCE, SKILLS, etc.) in all caps.

**Q: Zoom not working?**  
A: Some browsers limit CSS transforms. Try Chrome or Edge.

---

## 📧 Support

Having issues? Check:
1. Node.js installed? (`node --version`)
2. Dependencies installed? (`npm install`)
3. Server running? (`npm start`)

---

## 📄 License

MIT License — Use it, modify it, deploy it, sell it. No restrictions.

---

**Built with ⚡ by someone who actually uses Claude to get jobs**

*Because paying for tokens AND not getting interviews is a double loss.*
