const express = require('express');
const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, LevelFormat } = require('docx');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

app.post('/generate-docx', async (req, res) => {
    try {
        const { resume } = req.body;
        
        console.log('\n📥 Received:');
        console.log('  Experience:', resume.experience?.length || 0, 'jobs');
        console.log('  Certifications:', resume.certifications?.length || 0);
        
        const doc = createResumeDocument(resume);
        const buffer = await Packer.toBuffer(doc);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${resume.name || 'Resume'}.docx"`);
        res.send(buffer);
        
        console.log('✅ Sent successfully\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

function createResumeDocument(resume) {
    const sections = [];

    // Name
    if (resume.name) {
        sections.push(new Paragraph({
            children: [new TextRun({ text: resume.name, bold: true, size: 32, font: 'Calibri' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 }
        }));
    }

    // Contact
    if (resume.contact) {
        sections.push(new Paragraph({
            children: [new TextRun({ text: resume.contact, size: 20, font: 'Calibri' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: '2563eb', space: 8 } }
        }));
    }

    // Summary
    if (resume.summary?.length) {
        sections.push(new Paragraph({
            children: [new TextRun({ text: 'PROFESSIONAL SUMMARY', bold: true, size: 22, font: 'Calibri' })],
            spacing: { before: 280, after: 140 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: '2563eb', space: 4 } }
        }));
        resume.summary.forEach(line => {
            sections.push(new Paragraph({
                children: [new TextRun({ text: line, size: 20, font: 'Calibri' })],
                spacing: { after: 100 }
            }));
        });
    }

    // Education
    if (resume.education?.length) {
        sections.push(new Paragraph({
            children: [new TextRun({ text: 'EDUCATION', bold: true, size: 22, font: 'Calibri' })],
            spacing: { before: 280, after: 140 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: '2563eb', space: 4 } }
        }));
        resume.education.forEach(edu => {
            sections.push(new Paragraph({
                children: [new TextRun({ text: edu, size: 20, font: 'Calibri' })],
                spacing: { after: 80 }
            }));
        });
    }

    // Skills
    if (resume.skills?.length) {
        sections.push(new Paragraph({
            children: [new TextRun({ text: 'TECHNICAL SKILLS', bold: true, size: 22, font: 'Calibri' })],
            spacing: { before: 280, after: 140 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: '2563eb', space: 4 } }
        }));
        resume.skills.forEach(skill => {
            const children = [];
            if (skill.category) {
                children.push(new TextRun({ text: skill.category + ': ', bold: true, size: 20, font: 'Calibri' }));
            }
            children.push(new TextRun({ text: skill.items, size: 20, font: 'Calibri' }));
            sections.push(new Paragraph({ children, spacing: { after: 100 } }));
        });
    }

    // Experience
    if (resume.experience?.length) {
        console.log(`  → Creating ${resume.experience.length} job entries`);
        sections.push(new Paragraph({
            children: [new TextRun({ text: 'PROFESSIONAL EXPERIENCE', bold: true, size: 22, font: 'Calibri' })],
            spacing: { before: 280, after: 140 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: '2563eb', space: 4 } }
        }));
        
        resume.experience.forEach((job, idx) => {
            console.log(`    Job ${idx + 1}: ${job.title}`);
            
            sections.push(new Paragraph({
                children: [new TextRun({ text: job.title || '', bold: true, size: 21, font: 'Calibri' })],
                spacing: { before: 140, after: 40 }
            }));
            
            sections.push(new Paragraph({
                children: [new TextRun({ text: job.raw || '', size: 20, font: 'Calibri', italics: true })],
                spacing: { after: 80 }
            }));

            if (job.bullets?.length) {
                job.bullets.forEach(bullet => {
                    sections.push(new Paragraph({
                        children: [new TextRun({ text: bullet, size: 20, font: 'Calibri' })],
                        numbering: { reference: 'bullets', level: 0 },
                        spacing: { after: 80 }
                    }));
                });
            }
        });
    }

    // Certifications
    if (resume.certifications?.length) {
        console.log(`  → Creating ${resume.certifications.length} certification entries`);
        sections.push(new Paragraph({
            children: [new TextRun({ text: 'CERTIFICATIONS & ACHIEVEMENTS', bold: true, size: 22, font: 'Calibri' })],
            spacing: { before: 280, after: 140 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: '2563eb', space: 4 } }
        }));
        resume.certifications.forEach(cert => {
            sections.push(new Paragraph({
                children: [new TextRun({ text: cert, size: 20, font: 'Calibri' })],
                numbering: { reference: 'bullets', level: 0 },
                spacing: { after: 80 }
            }));
        });
    }

    return new Document({
        numbering: {
            config: [{
                reference: 'bullets',
                levels: [{
                    level: 0,
                    format: LevelFormat.BULLET,
                    text: '•',
                    alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } }
                }]
            }]
        },
        sections: [{
            properties: {
                page: {
                    size: { width: 12240, height: 15840 },
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                }
            },
            children: sections
        }]
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running: http://localhost:${PORT}\n`);
});
